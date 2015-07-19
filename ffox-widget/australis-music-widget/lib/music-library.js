var { Cc, Ci, Cu, Cr, Cm, components } = require('chrome');

const DEBUG = true;

var WindowUtils = require("sdk/window/utils");

var data = require('sdk/self').data;
var io = require('sdk/io/file');
var ss = require('sdk/simple-storage');

var PageWorker = require('sdk/page-worker');

var Folder = require('./file-tree').Folder;

function Playlist() {
    let current = null;
    let songList = [];

    return {
        addSong: function(track) {
            songList.push(track);
            return songList.length - 1;
        },

        getSongList: function() { return songList; },

        toSongAtIndex: function(index) {
            if (DEBUG) { console.log('\tcurrent = ' + current); }
            current = index;
            if (DEBUG) { console.log('\tcurrent = ' + current); }
            return songList[index];
        },

        toNext: function() {
            if (DEBUG) { console.log('\tcurrent = ' + current); }
            current = (current + 1) % songList.length;
            if (DEBUG) { console.log('\tcurrent = ' + current); }
            return songList[current];
        },

        toPrevious: function() {
            if (DEBUG) { console.log('\tcurrent = ' + current); }
            if (current == -1) {
                current = songList.length - 1;
            } else {
                current = (current - 1) % songList.length;
            }
            if (current < 0) {
                current = songList.length + current;
            }
            if (DEBUG) { console.log('\tcurrent = ' + current); }
            return songList[current];
        },

        clearSongs: function() {
            songList.length = 0;
            current = -1;
        }
    }
}

// TODO: Actually implement this method
function isAudioFile(file) {
    console.log('\t\t\t====isAudioFile===');
    console.log(file);
    return file.ContentType == 'audio/mpeg';
}

function MusicLibrary(vmCallback) {
    function selectRootFolder() {
        let filePicker = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
        filePicker.init(WindowUtils.getMostRecentBrowserWindow(), 'Select a Music Folder', Ci.nsIFilePicker.modeGetFolder);
        filePicker.show();

        rootPath = filePicker.fileURL.path;
        ss.storage.msuMusicPlayerLibraryPathVideo = rootPath;

        isDoneReadingFiles = false;
        rootFolder = new Folder(rootPath);
        fileList = rootFolder.getFileList();
        readTracks();
    }

    // TODO: Clean up this method, no longer using List.pop()
    function readTracks() {
        let file = fileList[fileIndex];
        fileIndex++;
        if (typeof(file) == 'undefined') {
            isDoneReadingFiles = true;
            fileIndex = 0;
            return;
        }

        while (!isAudioFile(file)) {
            file = fileList[fileIndex];
            fileIndex++;

            // Once the index is out of range, file will be undefined
            if (typeof(file) == 'undefined') {
                isDoneReadingFiles = true;
                fileIndex = 0;
                return;
            }
        }

        pageWorker.port.emit('readAudioTags', {
            Bytes: file.getBytes(),
            ContentType: file.ContentType,
            FilePath: file.getPath()
        });
    }

    let rootPath = null;
    let rootFolder = null;
    let audioTracks = [];

    let isDoneReadingFiles = false;

    let fileIndex = 0;
    let fileList = [];

    let playlist = new Playlist();
    let songFilter = '';

    let pageWorker = PageWorker.Page({
        contentScriptFile: [data.url('aurora.js'), data.url('mp3.js'), data.url('tag-fetcher-worker.js')],
        contentURL: data.url('tag-fetcher.html')
    });

    pageWorker.port.on('audioTagDataLoaded', function(audioTagData) {
        audioTracks.push(audioTagData);

        if (DEBUG) { console.log('\t===MusicLibrary: audioTagDataLoaded==='); }

        if (audioTagData.Artist.toLowerCase().contains(songFilter.toLowerCase()) || audioTagData.Title.toLowerCase().contains(songFilter.toLowerCase()) || audioTagData.Album.toLowerCase().contains(songFilter.toLowerCase())) {
            if (DEBUG) { console.log('\tadding song to playlist'); }
            if (DEBUG) { console.log(audioTagData); }
            let _index = playlist.addSong(audioTagData);
            vmCallback(audioTagData, _index);
        }

        readTracks();
    });

    pageWorker.port.on('dbInitialized', function() {
        if (DEBUG) { console.log('\t===MusicLibrary: Received message of dbInitialized==='); }

        if (typeof(ss.storage.msuMusicPlayerLibraryPathVideo) == 'undefined') {
            selectRootFolder();
        } else {
            rootPath = ss.storage.msuMusicPlayerLibraryPathVideo;
            rootFolder = new Folder(rootPath);
            fileList = rootFolder.getFileList();
            readTracks();
        }
    });

    return {
        resetLibrary: function() {
            audioTracks.length = 0;
            playlist.clearSongs();
            selectRootFolder();
        },
        isDoneReadingFiles: function() {
            return isDoneReadingFiles;
        },
        
        getPlaylist: function() {
            return playlist;
        },

        filterPlaylist: function (songFilter) {
            playlist.clearSongs();
            for each (let tagData in audioTracks) {
                if (tagData.Artist.toLowerCase().contains(songFilter.toLowerCase()) || tagData.Title.toLowerCase().contains(songFilter.toLowerCase()) || tagData.Album.toLowerCase().contains(songFilter.toLowerCase())) {
                    playlist.addSong(tagData);
                }
            }
        }
    };
}



exports.MusicLibrary = MusicLibrary;