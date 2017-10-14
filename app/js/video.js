const ipc = require('electron').ipcRenderer;
const baseUrl = "http://kissanime.ru";


ipc.on('video-link', function(e, link) {
	$.get(baseUrl + link, function(data) {
		
	});
	

$(function() {
});
