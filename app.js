'use strict';

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {session} = electron;
const ipc = electron.ipcMain;


console.log("Start!");



let mainWindow = null;
let episodeListWindow = null;
let episodeWindow = null;

app.on('ready', function() {
	// electron.session.defaultSession.clearStorageData([], function (data) {
	//     console.log(data);
	// });
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		backgroundColor: '#171A21'
	});

	mainWindow.loadURL('file://' + __dirname + '/app/index.html');
	
});

ipc.on('selectedAnime', function(e, info) {
	episodeListWindow = new BrowserWindow({
		height: 600,
		width: 300,
		backgroundColor: '#171A21'
	});

	episodeListWindow.loadURL('file://' + __dirname + '/app/episodeList.html');
	episodeListWindow.webContents.on('dom-ready', function(e) {
		episodeListWindow.webContents.send('info', info);
	});

});

ipc.on('selectedEpisode', function(e, link) {
	console.log("received");
	episodeListWindow = new BrowserWindow({
		height: 600,
		width: 800,
		backgroundColor: '#171A21'
	});

	episodeListWindow.loadURL(link);

});

