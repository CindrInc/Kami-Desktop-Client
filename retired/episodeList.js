const baseUrl = "http://kissanime.ru";
const ipc = require('electron').ipcRenderer;

let animeInfo;

ipc.on('info', function(e, info) {
	animeInfo = info;
	$('body').css('background-image', 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.9)), url("' + info.image +'")');
	$('body').css('background-repeat', 'no-repeat');
	$('body').css('background-position', 'top center');
	$('body').css('background-attachment', 'fixed');
	$('#title').text(info.name);
	$('#summary').html(info.description.length > 270 ? info.description.substring(0, 270) + ' <span title="More info" id="moreinfo">...</span>' : info.description);

	$('#moreinfo').click(function(e) {
		$('#summary').html(info.description);
	});

	$.get(info.url, function(data){
	    let $episodeList = $('.listing tbody', data)[0];
	    let episodeList = $episodeList.getElementsByTagName('tr');

	    for(let i = 2; i < episodeList.length; i++) {
	    	let anchor = episodeList[i].getElementsByTagName('td')[0].getElementsByTagName('a')[0];
	    	anchor.addEventListener('click', function(e) {
	    		e.preventDefault();
	    		let episode = $(this);
	    		playEpisode(episode);
	    	});
	    	anchor.setAttribute("index", episodeList.length - i);
	    	anchor.classList.add("episode");
	    	$('.content')[0].append(anchor);
	    	$('.content')[0].append(document.createElement('hr'));
	    }
	});
});

ipc.on('play-next-episode', function(e, nextEpisodeNumber) {
	let episode = $('a[index="' + nextEpisodeNumber + '"]');
	playEpisode(episode);
});

function playEpisode(episode) {
	let link = episode.attr('href');
	let episodeNumber = episode.attr('index');
	let episodeName = episode.text();
	/**
	 * Anime object to send to official video page
	 * @param name = Anime Name
	 * @param episodeNumber = Episode Number
	 * @param link = Episode link
	 * @param episodeName = Episode Name
	 * @type {Object}
	 */
	let anime = {
		name: animeInfo.name,
		link: link,
		episodeNumber: episodeNumber,
		episodeName: episodeName
	};
	ipc.send('selected-episode', anime);
}

$(function() {
});
