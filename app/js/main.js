const baseUrl = "http://kissanime.ru";
$(function() {

	const ipc = require('electron').ipcRenderer;
	let $response;
	let formattedShows = [];
	let selectedAnimeInfo;
	
	/**
	 * To make sure results from the last search won't show up in the new search
	 * @type {Boolean}
	 */
	let run = true;

	const $results = $('#results');
	const $webview = document.getElementById('kissanime');
	const $search = $('#search');
	const elements = {
		$result: $('<a href=""><div class="row result"><div class="three columns"><img class="thumbnail" src=""></div><div class="nine columns"><h3 class="title"></h3><div class="genres"></div><h5 class="views"></h5><div class="otherNames"></div><p class="description"></p></div></div></a>'),
		$complete: $('<i class="fa fa-check-circle green" title="Completed" aria-hidden="true"></i>'),
		$ongoing: $('<i class="fa fa-times-circle blue" title="Ongoing" aria-hidden="true"></i>'),
		$genre: $('<span class="genre"></span>'),
		$otherName: $('<h6 class="otherName"></h6>'),
		$bulletOtherName: $('<h6 class="otherName">&#9643;</h6>'),
		$infoIndex: $('<input class="infoIndex" type="hidden" value="">'),
		$breakline: $('<hr class="breakline">'),
		$loading: $('<center><img id="loading" src="imgs/loading.gif"></center>'),
		$noResults: $('<center><h2 id="noResults">No results</h2></center>')
	}

	$webview.addEventListener('found-in-page', function enableSearch(e) {
		$search.prop('disabled', false);
		$search.css('cursor', 'text');
		$webview.stopFindInPage('clearSelection');
		$webview.removeEventListener('found-in-page', enableSearch);
	});
	$webview.addEventListener('dom-ready', function() {
		console.log("Found");
		$webview.findInPage('Home');
	});
	$('#videoDiv').on('click', function(e) {
		if(e.target == this) {
			$('#videoDiv').hide();
			let $video = $('video').get(0);
			$video.pause();
		}
	});



	$('#searchForm').submit((e) => {
		e.preventDefault();
		let search = $.trim($('#search').val());
		if(search.length > 1) {
			$results.empty();
			formattedShows.length = 0;//empty array
			$('#search').val('');
			$results.append(elements.$loading);
			$.ajax({
				type: "POST",
				url: baseUrl + "/Search/SearchSuggestx",
				data: "type=Anime" + '&keyword=' + search,
				success: function (message) {
					if(message) {
						let thisRun = run;
						run = !run;
						$response = $(message);
						// console.log(message);
						
						for(let i = 0; i < $response.length; i++) {
							let info = {};

							info.url = $response[i].getAttribute('href');

							$.ajax({
								url: info.url,
								success: function(data) {
									// console.log(data);
									if(thisRun !== run) {
										// console.log("Running!");
										let $animePage = $(data);
										let infoDiv = $animePage.find('.barContent')[0].getElementsByTagName('div')[1];

										info.name = infoDiv.getElementsByTagName('a')[0].textContent;



										let thePs = infoDiv.getElementsByTagName('p');


										info.otherNames = [];
										for(let x = 0; x < thePs[0].getElementsByTagName('a').length; x++) {
											info.otherNames.push(thePs[0].getElementsByTagName('a')[x].textContent);
										}


										info.genres = [];
										for(let x = 0; x < thePs[1].getElementsByTagName('a').length; x++) {
											info.genres.push(thePs[1].getElementsByTagName('a')[x].textContent);
										}


										let statusAndViews;
										if(thePs[2].textContent.includes("Date")) {
											statusAndViews =  thePs[3].textContent;
											info.description = thePs[5].textContent;
										} else {
											statusAndViews = thePs[2].textContent;
											info.description = thePs[4].textContent;
										}

										info.complete = statusAndViews[statusAndViews.indexOf("Status") + 8] === "C";

										let viewsIndex = statusAndViews.indexOf("Views");
										let views = statusAndViews.substring(viewsIndex + 7, viewsIndex + 20);
										views = views.replace(/,/g, "");
										info.views = parseInt(views, 10);

										info.image = $animePage.find('.barContent')[3].getElementsByTagName('img')[0].getAttribute('src');


										// console.log(info);
										let infoIndex = formattedShows.push(info) - 1;

										let $entry = elements.$result.clone();
										$entry.attr("href", info.url);
										let $infoIndex = elements.$infoIndex.clone();
										$infoIndex.val(infoIndex);
										$entry.append($infoIndex);

										$entry.find('img').attr('src', info.image);

										info.complete ? $entry.find('.title').html(info.name + " " + elements.$complete[0].outerHTML) : $entry.find('.title').html(info.name + " " + elements.$ongoing[0].outerHTML);
										for(let x = 0; x < info.genres.length; x++) {
											let $tempGenre = elements.$genre.clone();
											$tempGenre.text(info.genres[x]);
											$entry.find('.genres').append($tempGenre);
										}

										$entry.find('.views').text(info.views + " views");

										for(let x = 0; x < info.otherNames.length; x++) {
											let $tempGenre = elements.$otherName.clone();
											$tempGenre.text(info.otherNames[x]);
											$entry.find('.otherNames').append($tempGenre);
											if(x != info.otherNames.length - 1) {
											 $entry.find('.otherNames').append(elements.$bulletOtherName.clone());
											}
										}

										info.description.length > 270 ? $entry.find('.description').text(info.description.substring(0, 300) + "...") : $entry.find('.description').text(info.description);
										$entry.find('.description').attr("title", info.description);

										$entry.click(selectAnime);
										if($results.has('#loading')) {
											$('#loading').remove();
										}
										$results.append($entry);
										$results.append(elements.$breakline.clone());
									}
								}
									
							});

						}
					} else {
						console.log("Nothing");
						$results.empty();
						$results.append(elements.$noResults);
					}
					
				}
			});
		}
	});

	function selectAnime(e) {
		e.preventDefault();
		let infoIndex = $("input",this).val();
		selectedAnimeInfo = formattedShows[infoIndex];


		$('#episode').css('background-image', 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.9)), url("' + selectedAnimeInfo.image +'")');
		$('#episode').css('background-position', 'top center');
		$('#episode').css('background-size', 'cover');
		$('#animeTitle').text(selectedAnimeInfo.name);
		$('#summary').html(selectedAnimeInfo.description.length > 270 ? selectedAnimeInfo.description.substring(0, 270) + ' <span title="More info" id="moreinfo">...</span>' : selectedAnimeInfo.description);
		$('.episodes').empty();

		$('#moreinfo').click(function(e) {
			$('#summary').html(selectedAnimeInfo.description);
		});

		$.get(selectedAnimeInfo.url, function(data){
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
		    	$('.episodes')[0].append(anchor);
		    	$('.episodes')[0].append(document.createElement('hr'));
		    }
		});
	}
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
			name: selectedAnimeInfo.name,
			link: link,
			episodeNumber: episodeNumber,
			episodeName: episodeName
		};
		ipc.send('selected-episode', anime);
		$('#episodeTitle').text(anime.name);
		$('#episodeNumber').text("Episode #: " + anime.episodeNumber);
		$('#videoDiv').show();
	}

	ipc.on('video-link', function(e, videoInfo) {
		let link = videoInfo.link + "&q=";
		switch(videoInfo.videoQuality) {
			case 'high':
				link += "720p";
				break;
			case 'medium':
				link += "480p";
				break;
			case 'low':
				link += "360p";
				break;
			default:
				console.log("Crap. Not a possible quality. What the hell went wrong???");
		}

		$.get(link, function(data){
			$('video').remove();
			let $data = $(data);
			let videoLink = $data.find('video source').attr('src');
			let $video = $('<video>', {
				src: videoLink
			});
			$video.prop("controls", true);
			$video.prop("autoplay", true);
			// nextVideoListener($video.get(0));
			$('#videoDiv').append($video);
		});
	});

	// function nextVideoListener(video) {
	// 	video.addEventListener('ended', function(e) {
	// 		$('body').html('<center><h1 class="blue">Starting next video...</h1></center>');
	// 		console.log(anime.episodeNumber);
	// 		let nextEpisodeNumber = parseInt(anime.episodeNumber) + 1;
	// 		ipc.send('play-next-episode', nextEpisodeNumber);
	// 	});
	// }

	
});
