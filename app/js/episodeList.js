const ipc = require('electron').ipcRenderer;

ipc.on('info', function(e, info) {
	$('body').css('background-image', 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.9)), url("' + info.image +'")');
	$('body').css('background-repeat', 'no-repeat');
	$('body').css('background-position', 'top center');
	$('body').css('background-attachment', 'fixed');
	$('#title').text(info.name);
	$('#summary').html(info.description.length > 270 ? info.description.substring(0, 270) + ' <span title="More info" id="moreinfo">...</span>' : info.description);

	$('#moreinfo').click(function(e) {
		$('#summary').html(info.description);
	});

	$.get('http://kissanime.ru/Anime/Cowboy-Bebop', function(data){
	    let $episodeList = $('.listing tbody', data)[0];
	    let episodeList = $episodeList.getElementsByTagName('tr');

	    for(let i = 2; i < episodeList.length; i++) {
	    	let anchor = episodeList[i].getElementsByTagName('td')[0].getElementsByTagName('a')[0];
	    	anchor.setAttribute('href', 'http://kissanime.ru' + anchor.getAttribute('href'));
	    	anchor.addEventListener('click', selectEpisode);
	    	$('.content')[0].append(anchor);
	    	$('.content')[0].append(document.createElement('hr'));
	    }
	});

	function selectEpisode(e) {
		e.preventDefault();
		var link = $(this).attr('href');
		console.log(link);
		ipc.send('selectedEpisode', link);
	}
});

$(function() {
});
