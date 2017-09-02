$(function() {

	var $response;
	var formattedShows = [];

	$('#searchForm').submit((e) => {
		e.preventDefault();
		var search = $.trim($('#search').val());
		if(search.length > 1) {
			$.ajax({
				type: "POST",
				url: "http://kissanime.ru/Search/Anime",
				data: "type=Anime" + '&keyword=' + search,
				success: function (message) {
					$response = $(message);
					console.log(message);
					// console.log($response);
					// $('body').append($response);
					var shows = $response.find('tr');
					shows.each(function(i, show) {
						if(i > 1) {
							var info = {};
							var subelements = show.children;
							if(subelements[0].children.length == 3) {
								info.updated = true;
								info.popular = true;
							} else if(subelements[0].children.length == 2) {
								if(subelements[0].children[1].textContent.includes("update")) {
									info.updated = true;
									info.popular = false;
								} else {
									info.updated = false;
									info.popular = true;
								}
							} else {
								info.updated = false;
								info.popular = false;
							}
							info.name = subelements[0].children[0].textContent;
							info.link = subelements[0].children[0].getAttribute("href");

							console.log($response.find('a[href="' + info.link + '"]').length);
							// info.description = $response.find('a[href="' + info.link + '"]')[1].parentElement.children[1].textContent;
							// info.image = $response.find('a[href="' + info.link + '"]')[1].parentElement.parentElement.children[0].getAttribute('src');

							if(subelements[1].children.length > 0) {
								info.completed = false;
								info.latestEpisode = {};
								info.latestEpisode.number = parseInt(subelements[1].children[0].textContent.substring(8), 10);
								info.latestEpisode.link = subelements[1].children[0].getAttribute("href");
							} else {
								info.completed = true;
							}

							// console.log(info);
							formattedShows.push(info);
						}
					});
					// console.log(formattedShows);
				}
			});
		}
	});
	
});
