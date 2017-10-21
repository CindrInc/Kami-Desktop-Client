$.ajax({
	type: "POST",
	url: "http://kissanime.ru/Search/SearchSuggestx",
	data: "type=Anime" + '&keyword=' + "Naruto the Move - Naruto ga Hokage ni Natta Hi (Dub)",
	success: function (message) {
		if(message) {
			$response = $(message);
			console.log(message);
		}
		console.log(!!message);
			
	},
	complete: function(jqObj, textStatus) {
		// console.log(jqObj);
		console.log(textStatus);
	}
});