'use strict';

const electron = require('electron');
const {app, BrowserWindow, session, Menu} = electron;
const {download} = require('electron-dl');
const ipc = electron.ipcMain;


console.log("Start!");

const appDirectory = 'file://' + __dirname + '/';
const baseUrl = "http://kissanime.ru";
let videoQuality = "720p";
function setQuality(menuItem, browserWindow, event) {
	videoQuality = menuItem.id;
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
				click (menuItem, browserWindow, event) {
					videoQuality = menuItem.label;
				}
			},
			{
				label: "480p",
				id: "medium",
				type: "radio",
				click (menuItem, browserWindow, event) {
					videoQuality = menuItem.label;
				}
			},
			{
				label: "360p",
				id: "low",
				type: "radio",
				click (menuItem, browserWindow, event) {
					videoQuality = menuItem.label;
				}
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
let captchaWindow = null;

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

ipc.on('get-episode-link', function(e, linkRequestObject) {
	if(captchaWindow) {
		captchaWindow.destroy();
	}
	captchaWindow = new BrowserWindow({
		// show: false,
		height: 600,
		width: 600
	});

	captchaWindow.loadURL(baseUrl + linkRequestObject.currentEpisode.link);
	captchaWindow.webContents.on('did-finish-load', function(e) {
		captchaWindow.webContents.executeJavaScript(
			`
			const ipc = require('electron').ipcRenderer;
			function sendCaptchaSolved(rapidVideoUrl) {
				let linkRequestObject = {
					purpose: "${linkRequestObject.purpose}",
					rapidVideoUrl: rapidVideoUrl
				}
				ipc.send('captcha-solved', linkRequestObject);
			}
			if(document.body.textContent.search("captcha") > -1) {
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
							console.log(rapidVideoUrl);
							sendCaptchaSolved(rapidVideoUrl);
						}
					});
				}
				tryPost();
			} else {
				let rapidVideoUrl = document.body.innerHTML.match(/https:\\/\\/www.rapidvideo\\.com.+?"/g)[0];
				rapidVideoUrl = rapidVideoUrl.substring(0, rapidVideoUrl.length - 1);
				sendCaptchaSolved(rapidVideoUrl);
			}

			`);
	});

});

/**
 * when captcha is solved
 * @param  {object} e                  event
 * @param  {object} linkRequestObject  multi-parameter object
 *      rapidVideoUrl  link to rapidVideo
 *      purpose        purpose of getting url
 * @return {[type]}                    none
 */
ipc.on('captcha-solved', function(e, linkRequestObject) {
	captchaWindow.destroy();
	captchaWindow = null;

	let link = linkRequestObject.rapidVideoUrl + "&q=" + videoQuality;

	mainWindow.webContents.send('video-link', {
		link: link,
		purpose: linkRequestObject.purpose
	});
});

ipc.on('download-episode', function(e, downloadLink) {
	console.log(downloadLink);
	download(BrowserWindow.getFocusedWindow(), downloadLink, {
		saveAs: true
	});
});

