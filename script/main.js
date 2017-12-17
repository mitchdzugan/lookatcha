window.buttonClick = function() {
}

var tracks = {
	introLoop: {
		url: "http://res.cloudinary.com/mitchdzugan/video/upload/v1513530889/IntroLoop_dfazzw.mp3",
		size: .499,
	},
	lookAtCha: {
		url: "http://res.cloudinary.com/mitchdzugan/video/upload/v1513530887/LookATCHA_zefff0.mp3",
		size: .014,
	},
	beatNoVocals: {
		url: "http://res.cloudinary.com/mitchdzugan/video/upload/v1513530893/BeatNoVocals_trq1nl.mp3",
		size: .539,
	},
	beatVocals: {
		url: "http://res.cloudinary.com/mitchdzugan/video/upload/v1513530889/BeatVocals_piovhr.mp3",
		size: .565,
	},
	songRest: {
		url: "http://res.cloudinary.com/mitchdzugan/video/upload/v1513530910/SongRest_j2apdn.mp3",
		size: 11.9,
	}
};

var playLookAtCha = function() {
	tracks.lookAtCha.player.play();
}

window.onload = function() {
	var loadStart = Date.now();
	var loadInterval = setInterval(function() {
		var total = Object.keys(tracks).reduce(function(sum, track) {
			return sum + tracks[track].size;
		}, 0);
		var loadedCount = Object.keys(tracks).reduce(function(sum, track) {
			if (tracks[track].player) {
				return sum + 1;
			}
			return sum;
		}, 0);
		var loadTimeRateSum = Object.keys(tracks).reduce(function(sum, track) {
			if (tracks[track].player) {
				return sum + (tracks[track].size / tracks[track].loadTime);
			}
			return sum;
		}, 0);
		var loadRate = 0;
		if (loadedCount) {
			loadRate = loadTimeRateSum / loadedCount;
		}
		console.log("loadRate", loadRate);
		var soFar = Object.keys(tracks).reduce(function(sum, track) {
			if (tracks[track].player) {
				return sum + tracks[track].size;
			} else {
				return sum + Math.min(
					tracks[track].size * 0.8,
					loadRate * (Date.now() - loadStart),
					);
			}
		}, 0);
		if (soFar == total) {
			clearInterval(loadInterval);
		}
		document.getElementById("loader").style.height = Math.round(100 * soFar / total) + "vh";
	}, 200);
	Object.keys(tracks).map(function(track) {
		var trackPlayer = new Howl({src: [tracks[track].url]});
		trackPlayer.on("load", function() {
			tracks[track].player = trackPlayer;
			tracks[track].loadTime = Date.now() - loadStart;
			if (Object.keys(tracks).every(function(track) { return tracks[track].player })) {
				var playStart = Date.now();
				tracks.introLoop.player.loop(true);
				tracks.introLoop.player.play();

				window.buttonClick = function() {
					var clickTime = Date.now();
					var timeSinceLoop = (clickTime - playStart) % 22147;
					var timeToNextBeat = (timeSinceLoop - 64) % 1381;
					var beatDropSeek = (timeToNextBeat + timeSinceLoop) / 1000;
					tracks.beatVocals.player.on("end", function() {
						tracks.songRest.player.play();
					});
					if (beatDropSeek > 19.8) {
						setTimeout(function() {
							tracks.beatVocals.player.seek(0.4);
							tracks.beatVocals.player.play();
						}, 400 + 22147 - timeSinceLoop);
						setTimeout(function() {
							tracks.introLoop.loop(false);
						}, 6000);
					} else {
						tracks.introLoop.player.loop(false);
						tracks.beatVocals.player.seek(beatDropSeek);
						setTimeout(function() {
							tracks.beatVocals.player.play();
						}, timeToNextBeat);
					}
					playLookAtCha();
					setTimeout(function() {
						playLookAtCha();
						setTimeout(function() {
							playLookAtCha();
						}, 1381 / 2);
					}, 1381 / 2);
					window.buttonClick = playLookAtCha;
				}
			}
		});
	});
}