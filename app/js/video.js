const electron = require('electron');
const ipc = electron.ipcRenderer;
const {remote} = electron;
const {Menu, MenuItem} = remote;

let menu = Menu.getApplicationMenu();

const baseUrl = "http://kissanime.ru";

let videoLinks = {};

ipc.on('episode-info', function(e, anime) {
	document.title = anime.name + " | " + anime.episode;
});

ipc.on('video-link', function(e, videoInfo) {
	let link = videoInfo.link + "&q=";
	$.get(link + "720p", function(data){
		$.get(link + "480p", function(data2){
			$.get(link + "360p", function(data3){
				let $data = $(data3);
				videoLinks.poor = $data.find('video source').attr('src');
				let $video = $('<video>', {
					src: videoLinks[videoInfo.videoQuality],
					height: "100%",
					width: "100%"
				});
				$video.prop("controls", true);
				$video.prop("autoplay", true);
				$('body').html("");
				$('body').append($video);
			});
			let $data = $(data2);
			videoLinks.medium = $data.find('video source').attr('src');
		});
		let $data = $(data);
		videoLinks.high = $data.find('video source').attr('src');
	});
	
});

ipc.on('change-quality', function(e, videoQuality) {
	let currentTime = $('video').get(0).currentTime;
	let $video = $('<video>', {
		src: videoLinks[videoQuality],
		height: "100%",
		width: "100%"
	});
	$video.prop("controls", true);
	$('body').html("");
	$('body').append($video);
	$('video').get(0).currentTime = currentTime;
	$('video').get(0).play();
});

$(function() {

	$(document).on('keypress', function(e) {
		if(e.keyCode == 32) {
			let $video = $('video').get(0);
			if($video.paused) {
				$video.play();
			} else {
				$video.pause();
			}
		}
	});
});
