'use strict';

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {session} = electron;
const ipc = electron.ipcMain;


console.log("Start!");

const appDirectory = 'file://' + __dirname + '/app/'
const baseUrl = "http://kissanime.ru";

let mainWindow = null;
let episodeListWindow = null;
let captchaWindow = null;
let videoWindow = null;

app.on('ready', function() {
	electron.session.defaultSession.clearStorageData([], function (data) {
	    console.log(data);
	});
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		backgroundColor: '#171A21'
	});

	mainWindow.loadURL(appDirectory + 'index.html');
	
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

});

ipc.on('selected-episode', function(e, link) {
	captchaWindow = new BrowserWindow({
		height: 700,
		width: 900,
		backgroundColor: '#171A21'
	});

	captchaWindow.loadURL(baseUrl + link);
	captchaWindow.webContents.on('did-finish-load', function(e) {
		captchaWindow.webContents.executeJavaScript(
			`
			const ipc = require('electron').ipcRenderer;
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
			`);
	});

});

ipc.on('captcha-solved', function(e, rapidVideoUrl) {
	videoWindow = new BrowserWindow({
		height: 700,
		width: 900,
		backgroundColor: '#171A21'
	});

	videoWindow.loadURL(appDirectory + 'video.html');
	videoWindow.webContents.on('dom-ready', function(e) {
		videoWindow.webContents.send('video-link', rapidVideoUrl);
	});
});

