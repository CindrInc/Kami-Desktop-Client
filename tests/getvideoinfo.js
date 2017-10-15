const ipc = require('electron').ipcRenderer;
if(document.body.textContent.search("under attack") > -1) {
	function tryPost() {
		$.post('/Special/AreYouHuman2', {
			reUrl: $('#formVerify input[name="reUrl"]').val(),
			answerCap: "2,3,"
		}, function(data, status) {
			// console.log(data);
			if(data.includes("Wrong answer.")) {
				var captchaUrl = data.split("'")[1];
				console.log(captchaUrl);
				$.get(captchaUrl);
				tryPost();
			} else {
				let rapidVideoUrl = data.match(/https:\/\/www.rapidvideo\.com.+?"/g)[0];
				rapidVideoUrl = rapidVideoUrl.substring(0, rapidVideoUrl.length - 1);
				ipc.send('captcha-solved', rapidVideoUrl);
			}
		});
	}
	tryPost();
} else {
	let rapidVideoUrl = document.body.innerHTML.match(/https:\/\/www.rapidvideo\.com.+?"/g)[0];
	rapidVideoUrl = rapidVideoUrl.substring(0, rapidVideoUrl.length - 1);
	ipc.send('captcha-solved', rapidVideoUrl);
}
