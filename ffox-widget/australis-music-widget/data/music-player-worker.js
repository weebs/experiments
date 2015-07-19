var audio = document.getElementById('sound-player');
var foo = 0;

audio.ontimeupdate = function(time) {
    foo = audio.currentTime;
    let totalSeconds = Math.round(audio.currentTime);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.round(totalSeconds - (minutes * 60));
    self.port.emit('timeUpdate', { TotalSeconds: totalSeconds, Minutes: minutes, Seconds: seconds});
};

self.port.on('setFileURL', function(fileURL) {
    foo = 0;
    console.log('setFileURL inside worker');
    console.log(fileURL);
    audio.src = fileURL;
    audio.load();
});

self.port.on('play', function() {
    console.log('play!');
	audio.play();
    audio.currentTime = foo;
});

self.port.on('pause', function() {
    console.log('pause!');
	audio.pause();
});

self.port.on('seekTo', function(time) {
    audio.pause();
    console.log('currentTime: '+audio.currentTime);
    console.log('newTime: '+time);
    audio.currentTime = time;
    console.log(' new currentTime: '+audio.currentTime);
    foo = time;
    audio.play();
});