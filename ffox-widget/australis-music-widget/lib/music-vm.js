var data = require('sdk/self').data;

var MusicPlayer = require('./music-player').MusicPlayer;
var MusicLibrary = require('./music-library').MusicLibrary;

const elementIds = {
    Container: "msu-music-vbox-container",
    SetLibrary: "msu-music-btn-set-library",
    Elapsed: "msu-music-playback-elapsed",
    Remaining: "msu-music-playback-remaining",
    ProgressSlider: "msu-music-playback-progress",
    Previous: "msu-music-btn-previous",
    PlayPause: "msu-music-btn-play-pause",
    Next: "msu-music-btn-next",
    Library: "msu-music-vbox-library",
    AlbumArtwork: "msu-music-img-album-artwork",
    Title: "msu-music-lbl-title",
    Album: "msu-music-lbl-album",
    Artist: "msu-music-lbl-artist",
    Filter: "msu-music-textbox-filter"
};

function ViewModel(initData) {
    console.log('===ViewModel Constructor===');
    let document = null;
    let view = null;

    let UI = {
        btnPrevious: null,
        btnNext: null,
        btnPlayPause: null,
        btnSetLibrary: null,
        lblTitle: null,
        lblAlbum: null,
        lblArtist: null,
        lblElapsed: null,
        lblRemaining: null,
        sliderPlaybackProgress: null,
        vLibrary: null,
        vContainer: null,
        imgAlbumArtwork: null,
        textboxFilter: null
    };

    let musicPlayer = new MusicPlayer(timeUpdate);
    let musicLibrary = new MusicLibrary(audioTagDataLoaded);

    // UI Functions and Variables
    let usingSlider = false;
    let currentTime = null;

    let currentSong = {};

    function updatePlaybackProgress() {
        // Set the time elapsed and the progress slider position

        let min = null;
        let sec = null;
        let totalSec = null;

        let totalRemaining = null;
        let remainingMinutes = null;
        let remainingSeconds = null;

        if (currentTime == null) {
            min = 0;
            sec = 0;
            totalSec = 0;

            totalRemaining = 0;
            remainingMinutes = 0;
            remainingSeconds = 0;
        } else {
            min = currentTime.Minutes;
            sec = currentTime.Seconds;
            totalSec = (min * 60) + sec;

            totalRemaining = Math.ceil(currentSong.Duration / 1000) - totalSec;
            remainingMinutes = Math.floor(totalRemaining / 60);
            remainingSeconds = Math.floor(totalRemaining - (remainingMinutes * 60));
        }

        if (remainingSeconds < 10) {
            remainingSeconds = String.concat('0', remainingSeconds);
        }

        if (sec < 10) {
            sec = String.concat('0', sec);
        }
        
        UI.lblElapsed.setAttribute('value', String.concat(min, ':', sec));
        UI.lblRemaining.setAttribute('value', String.concat('-', remainingMinutes, ':', remainingSeconds));
        UI.sliderPlaybackProgress.setAttribute('max', totalSec + totalRemaining);
        UI.sliderPlaybackProgress.setAttribute('value', totalSec);

        if (totalRemaining == 1) {
            nextClicked();
        }
    }

    function updateTagData() {
        // Set Title, Artist, Album Artwork, and Duration
        UI.lblTitle.setAttribute('value', currentSong.Title);
        UI.lblArtist.setAttribute('value', currentSong.Artist);
        UI.lblAlbum.setAttribute('value', currentSong.Album);

        console.log('Cover URL: ');
        console.log(currentSong);
        console.log(typeof(currentSong.CoverURL));

        if (typeof(currentSong.CoverURL) != 'undefined' && currentSong.CoverURL != null && currentSong.CoverURL != '') {
            UI.imgAlbumArtwork.setAttribute('src', currentSong.CoverURL);
        }

        if(UI.imgAlbumArtwork.src == '' || typeof(currentSong.CoverURL) == 'undefined')
        {
              UI.imgAlbumArtwork.src = data.url('defaultart.png');
              if(UI.lblTitle.value == 'undefined') { UI.lblTitle.setAttribute('value', 'Song Title');}
              if(UI.lblArtist.value == 'undefined') { UI.lblArtist.setAttribute('value', 'Artist');}
              if(UI.lblAlbum.value == 'undefined') { UI.lblAlbum.setAttribute('value', 'Album');}
        }

        UI.btnPlayPause.innerHTML = musicPlayer.isPlaying() ? 'Pause' : 'Play';
    }

    function audioTagDataLoaded(song, indexCounter) {
        if (document != null) {
            let trackId = indexCounter + '';

            let lbl = document.createElement('label');
            lbl.setAttribute('class','msu-library-label');
            lbl.setAttribute('value', String.concat(song.Artist, ' - ', song.Title));

            // lbl.addEventListener('mouseover', function() {
            //     lbl.setAttribute('style', 'background-color: #0066cc');
            // });

            // lbl.addEventListener('mouseout', function() {
            //     lbl.setAttribute('style', '');
            // });

            lbl.addEventListener('click', function() {
                let id = parseInt(trackId);
                currentSong = musicLibrary.getPlaylist().toSongAtIndex(id);
                console.log('Selected track #' + id);
                console.log(currentSong);

                musicPlayer.setFile(currentSong.FilePath);
                musicPlayer.togglePlayback();
                updateTagData();
                UI.btnPlayPause.innerHTML = 'Pause';
            });

            UI.vLibrary.appendChild(lbl);
        }
    }

    function fillLibrary() {
        // if (musicLibrary.isDoneReadingFiles()) {
            let indexCounter = 0;

            UI.vLibrary.innerHTML = '';

            for each (let song in musicLibrary.getPlaylist().getSongList()) {
                let trackId = indexCounter + '';

                let lbl = document.createElement('label');
                lbl.setAttribute('class','msu-library-label');
                lbl.setAttribute('value', String.concat(song.Artist, ' - ', song.Title));

                // lbl.addEventListener('mouseover', function() {
                //     lbl.setAttribute('style', 'background-color: #0066cc');
                // });

                // lbl.addEventListener('mouseout', function() {
                //     lbl.setAttribute('style', '');
                // });

                lbl.addEventListener('click', function() {
                    let id = parseInt(trackId);
                    currentSong = musicLibrary.getPlaylist().toSongAtIndex(id);
                    console.log('Selected track #' + id);
                    console.log(currentSong);

                    musicPlayer.setFile(currentSong.FilePath);
                    musicPlayer.togglePlayback();
                    updateTagData();
                    UI.btnPlayPause.innerHTML = 'Pause';
                });

                UI.vLibrary.appendChild(lbl);

                indexCounter++;
            }
        // }
    }

    function fillUI() {
        updatePlaybackProgress();
        updateTagData();
        fillLibrary();
        UI.btnPlayPause.innerHTML = musicPlayer.isPlaying() ? 'Pause' : 'Play';
    }

    // Callback Functions
    function timeUpdate(time) {
        currentTime = time;

        updatePlaybackProgress();

        if (!usingSlider) {
            // Update progress slider
        }
    }

    // Event Functions

    function playPauseClicked() {
        console.log('musicLibrary isDoneReadingFiles?');
        console.log(musicLibrary.isDoneReadingFiles());
        if (musicLibrary.isDoneReadingFiles()) {
            musicPlayer.togglePlayback();

            UI.btnPlayPause.innerHTML = musicPlayer.isPlaying() ? 'Pause' : 'Play';
        }
    }

    function nextClicked() {
        if (musicLibrary.isDoneReadingFiles()) {
            currentSong = musicLibrary.getPlaylist().toNext();
            musicPlayer.setFile(currentSong.FilePath);
            musicPlayer.togglePlayback();
            updateTagData();
        }
    }

    function previousClicked() {
        if (musicLibrary.isDoneReadingFiles()) {
            currentSong = musicLibrary.getPlaylist().toPrevious();
            musicPlayer.setFile(currentSong.FilePath);
            musicPlayer.togglePlayback();
            updateTagData();
        }
    }

    function sliderClicked() {
        if (musicLibrary.isDoneReadingFiles()) {
            usingSlider = true;

            if (musicPlayer.isPlaying()) {
                console.log('sliderClicked, pausing');
                musicPlayer.togglePlayback();
                wasPlaying = true;
            }
        }
    }

    function sliderReleased() {
        console.log('sliderReleased');
        usingSlider = false;
        if (musicLibrary.isDoneReadingFiles()) {
            // Change audio position
            console.log(UI.sliderPlaybackProgress);

            // Toggle playback
            console.log('play');
            musicPlayer.togglePlayback();
        }
    }

    function sliderChanged(event) {
        // If the user is causing the change, then seek the track
        // Otherwise, ignore the event
        if (usingSlider) {
            var newVal = UI.sliderPlaybackProgress.getAttribute('value');
            musicPlayer.seekTo(newVal);
        }
    }

    function filterSongs() {
        // Get filter string
        var val = UI.textboxFilter.value;
        console.log('filter: '+val);

        // Filter playlist
        musicLibrary.filterPlaylist(val);

        // Update UI
        fillUI();
    }

    function populateView() {
        console.log('===populateView()===');

        let xulToInject = data.load('music-player.xul');

        view.innerHTML = xulToInject;

        // Get XUL elements and assign them to local variables
        UI.btnPrevious = document.getElementById(elementIds.Previous);
        UI.btnNext = document.getElementById(elementIds.Next);
        UI.btnPlayPause = document.getElementById(elementIds.PlayPause);
        UI.btnSetLibrary = document.getElementById(elementIds.SetLibrary);
        UI.lblElapsed = document.getElementById(elementIds.Elapsed);
        UI.lblRemaining = document.getElementById(elementIds.Remaining);
        UI.sliderPlaybackProgress = document.getElementById(elementIds.ProgressSlider);
        UI.vLibrary = document.getElementById(elementIds.Library);
        UI.vContainer = document.getElementById(elementIds.Container);
        UI.imgAlbumArtwork = document.getElementById(elementIds.AlbumArtwork);
        UI.lblTitle = document.getElementById(elementIds.Title);
        UI.lblAlbum = document.getElementById(elementIds.Album);
        UI.lblArtist = document.getElementById(elementIds.Artist);
        UI.textboxFilter = document.getElementById(elementIds.Filter);

        // Add event listeners
        UI.btnPlayPause.addEventListener('click', playPauseClicked);
        UI.btnNext.addEventListener('click', nextClicked);
        UI.btnPrevious.addEventListener('click', previousClicked);
        UI.textboxFilter.addEventListener('change', filterSongs);
        UI.sliderPlaybackProgress.addEventListener('mousedown', sliderClicked);
        UI.sliderPlaybackProgress.addEventListener('change', sliderChanged);
        UI.vContainer.addEventListener('mouseup', function() {
            console.log('mouse up hehehehehe');
            if (usingSlider) {
                sliderReleased();
            }
        });

        UI.btnSetLibrary.addEventListener('click', function() {
            musicLibrary.resetLibrary();
        });


        // Fill in UI information
        fillUI();
    }

    return {
        injectUI: function(doc, theView) {
            document = doc;
            view = theView;
            populateView();
        },

        togglePlayback: function() {
            let btn = document.getElementById('msu-music-btn-play-pause');

            if (model.isPlaying) {
                btn.innerHTML = 'Play';
            } else {
                btn.innerHTML = 'Pause';
            }

            model.isPlaying = !model.isPlaying;
        }
    };
}

exports.ViewModel = ViewModel;