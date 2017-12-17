window.buttonClick = function() {
}

window.reupholster = function() {
}

window.onkeydown = function() {
}

var tracks = {
	introLoop: {
		url: "./tracks/IntroLoop.mp3",
		size: .499,
	},
	lookAtCha: {
		url: "./tracks/LookATCHA.mp3",
		size: .014,
	},
	beatNoVocals: {
		url: "./tracks/BeatNoVocals.mp3",
		size: .539,
	},
	beatVocals: {
		url: "./tracks/BeatVocals.mp3",
		size: .565,
	},
	songRest: {
		url: "./tracks/SongRest.mp3",
		size: 11.9,
	},
	reupholster: {
		url: "./tracks/reupholster.mp3",
		size: .03,
	},
	dontZone: {
		url: "./tracks/dontZone.mp3",
		size: .02,
	},
	inZone: {
		url: "./tracks/inZone.mp3",
		size: .021,
	}
};

var playLookAtCha = function() {
	tracks.lookAtCha.player.play();
}

function onResize() {
	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight;

	var scale = height / 1600;
	if (width / height > 2560 / 1600) {
		scale = width / 2560;
	}

	document.getElementById("reupholster").style.right = Math.round(scale * 1200) + "px";
	document.getElementById("reupholster").style.bottom = Math.round(scale * 450) + "px";
}

window.onresize = onResize;

window.onload = function() {
	onResize();
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

				setTimeout(function() {
					document.getElementById("loader").style.transition = "height 0s";
				},1000)

				window.reupholster = function() {
					tracks.reupholster.player.play();
				}

				var inARow = 0;
				var lastClickTime = null;
				window.onkeydown = function() {
					var now = Date.now();
					if (lastClickTime) {
						var diff = now - lastClickTime;
						if (diff > 10) {
							if (diff > 1231 && diff < 1531) {
								inARow++;
								if (inARow == 4) {
									tracks.dontZone.player.play();
								}
								if (inARow > 11) {
									tracks.inZone.player.play();
								}
							} else {
								inARow = 0;
							}
						}
					}
					lastClickTime = now;
				}

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