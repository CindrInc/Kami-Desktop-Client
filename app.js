'use strict';

const electron = require('electron');
const app = electron.app;
const {BrowserWindow} = electron;
const {session} = electron;
const ipc = electron.ipcMain;


console.log("Start!");



let mainWindow = null;

app.on('ready', function() {
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		backgroundColor: '#171A21'
	});

	mainWindow.loadURL('file://' + __dirname + '/app/index.html');
	
});

