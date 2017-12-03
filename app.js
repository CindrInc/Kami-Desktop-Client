'use strict';

const electron = require('electron');
const {app, BrowserWindow, session, Menu} = electron;
const ipc = electron.ipcMain;


console.log("Start!");

const appDirectory = 'file://' + __dirname + '/app/'
const baseUrl = "http://kissanime.ru";
let videoQuality = "high";
function setQuality(menuItem, browserWindow, event) {
	if(videoWindow) {
		videoWindow.webContents.send('change-quality', menuItem.id);
		videoQuality = menuItem.id;
	}
}
const menuTemplate = [
	{
    	label: 'View',
	    submenu: [
	    	{role: 'reload'},
	     	{role: 'forcereload'},
	    	{role: 'toggledevtools'},
	    	{type: 'separator'},
	    	{role: 'resetzoom'},
	    	{role: 'zoomin'},
	    	{role: 'zoomout'},
	    	{type: 'separator'},
	    	{role: 'togglefullscreen'}
	    ]
	},
	{
		label: "Quality",
		submenu: [
			{
				label: "720p",
				id: "high",
				type: "radio",
				click: setQuality
			},
			{
				label: "480p",
				id: "medium",
				type: "radio",
				click: setQuality
			},
			{
				label: "360p",
				id: "poor",
				type: "radio",
				click: setQuality
			}
		],
		click: function(){
			console.log("Quality control!");
		}
	}
];
if (process.platform === 'darwin') {
	menuTemplate.unshift({
		label: app.getName(),
	    submenu: [
			{role: 'about'},
			{type: 'separator'},
			{role: 'services', submenu: []},
			{type: 'separator'},
			{role: 'hide'},
			{role: 'hideothers'},
			{role: 'unhide'},
			{type: 'separator'},
	    	{role: 'quit'}
	    ]
	});
}

let mainWindow = null;
let episodeListWindow = null;
let captchaWindow = null;
let videoWindow = null;

app.on('ready', function() {
	// electron.session.defaultSession.clearStorageData([], function (data) {
	//     console.log(data);
	// });
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	mainWindow = new BrowserWindow({
		height: 600,
		width: 1100,
		backgroundColor: '#171A21'
	});

	mainWindow.loadURL(appDirectory + 'index.html');

	mainWindow.on('closed', function() {
		app.quit();
	});
	
});

ipc.on('selected-anime', function(e, info) {
	episodeListWindow = new BrowserWindow({
		height: 600,
		width: 300,
		backgroundColor: '#171A21'
	});

	episodeListWindow.loadURL(appDirectory + 'episodeList.html');
	episodeListWindow.webContents.on('dom-ready', function(e) {
		episodeListWindow.webContents.send('info', info);
	});
	episodeListWindow.on('closed', function() {
		episodeListWindow = null;
		if(videoWindow) {
			videoWindow.destroy();
			videoWindow = null;
		}
		if(captchaWindow) {
			captchaWindow.destroy();
			captchaWindow = null;
		}
	});

});

ipc.on('selected-episode', function(e, anime) {
	if(captchaWindow) {
		captchaWindow.destroy();
	}
	captchaWindow = new BrowserWindow({
		height: 100,
		width: 100,
		show: false,
		backgroundColor: '#171A21'
	});

	captchaWindow.loadURL(baseUrl + anime.link);
	captchaWindow.webContents.on('did-finish-load', function(e) {
		captchaWindow.webContents.executeJavaScript(
			`
			const ipc = require('electron').ipcRenderer;
			if(document.body.textContent.search("under attack") === -1) {
				function tryPost() {
					$.post('/Special/AreYouHuman2', {
						reUrl: $('#formVerify input[name="reUrl"]').val(),
						answerCap: "2,3,"
					}, function(data, status) {
						// console.log(data);
						if(data.includes("Wrong answer.")) {
							var captchaUrl = data.split("'")[1];
							console.log(captchaUrl);
							$.get(captchaUrl);
							tryPost();
						} else {
							let rapidVideoUrl = data.match(/https:\\/\\/www.rapidvideo\\.com.+?"/g)[0];
							rapidVideoUrl = rapidVideoUrl.substring(0, rapidVideoUrl.length - 1);
							ipc.send('captcha-solved', rapidVideoUrl);
						}
					});
				}
				tryPost();
			} else {
				let rapidVideoUrl = document.body.innerHTML.match(/https:\\/\\/www.rapidvideo\\.com.+?"/g)[0];
				rapidVideoUrl = rapidVideoUrl.substring(0, rapidVideoUrl.length - 1);
				ipc.send('captcha-solved', rapidVideoUrl);
			}

			`);
	});

	if(videoWindow) {
		videoWindow.destroy();
	}
	videoWindow = new BrowserWindow({
		height: 500,
		width: 900,
		backgroundColor: '#171A21'
	});
	videoWindow.loadURL(appDirectory + 'video.html');

	videoWindow.webContents.on('dom-ready', function(e) {
		videoWindow.webContents.send('episode-info', anime);
	});

});

ipc.on('captcha-solved', function(e, rapidVideoUrl) {
	captchaWindow.destroy();
	captchaWindow = null;
	if(!videoWindow.webContents.isLoading()) {
		videoWindow.webContents.send('video-link', {
			link: rapidVideoUrl,
			videoQuality: videoQuality
		});
	} else {
		videoWindow.webContents.on('dom-ready', function(e) {
			videoWindow.webContents.send('video-link', {
				link: rapidVideoUrl,
				videoQuality: videoQuality
			});
		});
	}
	
	
	videoWindow.on('closed', function() {
		videoWindow = null; //avoid null reference
	});
});

ipc.on('play-next-episode', function(e, nextEpisodeNumber) {
	console.log("Next episode number: " + nextEpisodeNumber);
	episodeListWindow.webContents.send('play-next-episode', nextEpisodeNumber);
});

