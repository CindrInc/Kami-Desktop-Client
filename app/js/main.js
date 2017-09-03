$(function() {

	let $response;
	let formattedShows = [];

	let $results = $('#results');
	let elements = {
		$result: $('<a href=""><div class="row result"><div class="three columns"><img class="thumbnail" src=""></div><div class="nine columns"><h3 class="title"></h3><div class="genres"></div><h5 class="views"></h5><div class="otherNames"></div><p class="description"></p></div></div></a>'),
		$complete: $('<i class="fa fa-check-circle green" title="Completed" aria-hidden="true"></i>'),
		$ongoing: $('<i class="fa fa-times-circle blue" title="Ongoing" aria-hidden="true"></i>'),
		$genre: $('<span class="genre"></span>'),
		$otherName: $('<h6 class="otherName"></h6>'),
		$bulletOtherName: $('<h6 class="otherName">&#9643;</h6>'),
		$breakline: $('<hr class="breakline">')
	}

	$('#noResults').hide();
	$('#loading').hide();

	$('#searchForm').submit((e) => {
		e.preventDefault();
		let search = $.trim($('#search').val());
		if(search.length > 1) {
			$results.empty();
			$('#search').val('');
			$('#noResults').hide();
			$('#loading').show();
			$.ajax({
				type: "POST",
				url: "http://kissanime.ru/Search/SearchSuggestx",
				data: "type=Anime" + '&keyword=' + search,
				success: function (message) {
					if(message) {
						$response = $(message);
						// console.log(message);
						
						for(let i = 0; i < $response.length; i++) {
							let info = {};

							info.url = $response[i].getAttribute('href');

							let $animePage;
							$.ajax({
								url: info.url,
								success: function(data) {
									// console.log(data);
									$animePage = $(data);
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
									formattedShows.push(info);

									let $entry = elements.$result.clone();
									$entry.attr("href", info.url);

									$entry.find('img').attr('src', info.image);

									info.complete ? $entry.find('.title').html(info.name + elements.$complete.html()) : $entry.find('.title').html(info.name + elements.$ongoing.html());

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

									$('loading').hide();
									$results.append($entry);
									$results.append(elements.$breakline.clone());
								}
							});

						}
					} else {
						console.log("Nothing");
						$('#noResults').show();
					}
					
				}
			});
		}
	});
	
});
