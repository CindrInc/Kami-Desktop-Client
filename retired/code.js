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