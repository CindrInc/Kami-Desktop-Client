$(function() {

	let $response;
	let formattedShows = [];

	$('#searchForm').submit((e) => {
		e.preventDefault();
		let search = $.trim($('#search').val());
		if(search.length > 1) {
			$.ajax({
				type: "POST",
				url: "http://kissanime.ru/Search/SearchSuggestx",
				data: "type=Anime" + '&keyword=' + search,
				success: function (message) {
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
									info.summary = thePs[5].textContent;
								} else {
									statusAndViews = thePs[2].textContent;
									info.summary = thePs[4].textContent;
								}

								info.completed = statusAndViews[statusAndViews.indexOf("Status") + 8] === "C";

								let viewsIndex = statusAndViews.indexOf("Views");
								let views = statusAndViews.substring(viewsIndex + 7, viewsIndex + 20);
								views = views.replace(/,/g, "");
								info.views = parseInt(views, 10);

								info.image = $animePage.find('.barContent')[3].getElementsByTagName('img')[0].getAttribute('src');


								console.log(info);
								formattedShows.push(info);
							}
						});

					}
				}
			});
		}
	});
	
});
