const electron = require('electron');
const ipc = electron.ipcRenderer;
const {remote} = electron;
const {Menu, MenuItem} = remote;

let menu = Menu.getApplicationMenu();

const baseUrl = "http://kissanime.ru";

let videoLinks = {};
let anime;

ipc.on('episode-info', function(e, episodeInfo) {
	anime = episodeInfo;
	document.title = episodeInfo.episodeName;
	//episodeInfo.name + " | " + 
});

ipc.on('video-link', function(e, videoInfo) {
	let link = videoInfo.link + "&q=";
	$.get(link + "720p", function(data){
		$.get(link + "480p", function(data2){
			$.get(link + "360p", function(data3){
				let $data = $(data3);
				videoLinks.low = $data.find('video source').attr('src');
				let $video = $('<video>', {
					src: videoLinks[videoInfo.videoQuality],
					height: "100%",
					width: "100%"
				});
				$video.prop("controls", true);
				$video.prop("autoplay", true);
				nextVideoListener($video.get(0));
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
	$video = $('video').get(0);
	$video.currentTime = currentTime;
	$video.play();
	nextVideoListener($video);
});

function nextVideoListener(video) {
	video.addEventListener('ended', function(e) {
		$('body').html('<center><h1 class="blue">Starting next video...</h1></center>');
		console.log(anime.episodeNumber);
		let nextEpisodeNumber = parseInt(anime.episodeNumber) + 1;
		ipc.send('play-next-episode', nextEpisodeNumber);
	});
}

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
