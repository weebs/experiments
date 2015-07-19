var data = require('sdk/self').data;
var PageWorker = require('sdk/page-worker');

function MusicPlayer(vmTimeUpdate) {
    let isPlaying = false;

    let pageWorker = PageWorker.Page({
        contentScriptFile: data.url('music-player-worker.js'),
        contentURL: data.url('music-player.html')
    });

    pageWorker.port.on('timeUpdate', function(time) {
        vmTimeUpdate(time);
    });

    return {
        setFile: function(filePath) {
            console.log('===MusicPlayer::setFile()===');
            isPlaying = false;
            pageWorker.port.emit('setFileURL', 'file://' + filePath);
        },

        isPlaying: function() { return isPlaying; },

        seekTo: function(time) {
            console.log('MusicPlayer.seekTo(): '+time);
            pageWorker.port.emit('seekTo', time);
        },

        togglePlayback: function() {
            console.log('toggling playback');
            if (isPlaying) {
                pageWorker.port.emit('pause');
            } else {
                pageWorker.port.emit('play');
            }
            isPlaying = !isPlaying;
        }
    };
}

exports.MusicPlayer = MusicPlayer;