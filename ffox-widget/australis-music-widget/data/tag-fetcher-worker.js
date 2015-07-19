const DEBUG = true;

var audio = document.getElementById('sound-player');

function initDb() {
    let initRequest = indexedDB.open('msuAustralsMusicData', 1);

    initRequest.onupgradeneeded = function(e) {
        db = e.target.result;

        if (!db.objectStoreNames.contains('audioTagData')) {
            if (DEBUG) { console.log('\t===TagFetcher: Creating audioTagData Store==='); }
            let store = db.createObjectStore('audioTagData', {
                keyPath: 'FilePath'
            });
            if (DEBUG) { console.log('\t===TagFetcher: Created audioTagData Store==='); }
        } else {
            if (DEBUG) { console.log('\t===TagFetcher: Already contains audioTagData object store==='); }
        }

        if (!db.objectStoreNames.contains('audioAlbumData')) {
            if (DEBUG) { console.log('\t===TagFetcher: Creating audioAlbumData Store==='); }
            let store = db.createObjectStore('audioAlbumData');
            if (DEBUG) { console.log('\t===TagFetcher: Created audioAlbumData Store==='); }
        } else {
            if (DEBUG) { console.log('\t===TagFetcher: Already contains audioAlbumData object store==='); }    
        }
    };

    initRequest.onsuccess = function(e) {
        if (DEBUG) { console.log('\t===TagFetcher: openDbRequest was successful==='); }

        db = e.target.result;

        self.port.emit('dbInitialized', {});
    };
}

function createDataURIFromInfo(fileInfo) {
    let encodedData = btoa(fileInfo.Bytes);

    let dataURI = 'data:';
    dataURI += fileInfo.ContentType;
    dataURI += ';base64,';
    dataURI += encodedData;

    return dataURI;
}

function createSanitizedaudioTagData(meta) {
    let title = meta.title || '';
    let album = meta.album || '';
    let artist = meta.artist || '';
    let trackNo = meta.trackNumber || '0';
    let year = meta.year || '';

    // Removes awkward UTF characters
    // -- Weird square symbols appear if you don't in some tracks
    let data = {
        Title: title.replace('\u0000', ''),
        Album: album.replace('\u0000', ''),
        Artist: artist.replace('\u0000', ''),
        TrackNumber: trackNo.replace('\u0000', ''),
        Year: year.replace('\u0000', '')
    };

    // TODO: Check some shit about the cover art n stuff y'kno
    return data;
}

function audioTagDataToAlbumId(audioTagData) {
    return String.concat(audioTagData.Album, '-', audioTagData.Artist, '-', audioTagData.Year);
}

let db = null;
// TODO: Make sure things don't load until the db is initalized
initDb();

self.port.on('readAudioTags', function(fileInfo) {
    if (DEBUG) { console.log('\t===TagFetcher: Inside of readAudioTags with: ' + fileInfo.FilePath); }

    // Request to see if the file is already read into in the DB
    console.log(db);
    let trans = db.transaction(['audioTagData'], 'readwrite');
    let store = trans.objectStore('audioTagData');
    let req = store.get(fileInfo.FilePath);
    let audioTagData = null;

    req.onsuccess = function(e) {
        audioTagData = e.target.result;
        let albumArtBlob = null;
        let albumArtId = null;

        if (audioTagData) {
            if (DEBUG) { console.log('\t===TagFetcher: Already contains entry for file==='); }
            console.log(audioTagData);

            let albumTrans = db.transaction(['audioAlbumData'], 'readwrite');
            let albumStore = albumTrans.objectStore('audioAlbumData');
            let id = audioTagDataToAlbumId(audioTagData);

            let albumImg = albumStore.get(id).onsuccess = function(e) {
                console.log('\t===TagFetcher: Retrieving album art===');
                let albumImg = e.target.result;
                if (albumImg) {
                    let URL = window.URL;
                    audioTagData.CoverURL = URL.createObjectURL(albumImg);
                    console.log('\t===TagFetcher: Created album URL: ' + audioTagData.CoverURL);
                }

                self.port.emit('audioTagDataLoaded', audioTagData);
            };

            
        } else {
            // Must read the audio file's tag data with Aurora.js
            if (DEBUG) { console.log('\t===TagFetcher: No entry, using Aurora.js==='); }

            audioTagData = {};

            let dataURI = createDataURIFromInfo(fileInfo);
            let asset = AV.Asset.fromURL(dataURI);

            asset.on('metadata', function(meta) {
                if (DEBUG) { console.log('\t===TagFetcher: Received metadata==='); }

                audioTagData = createSanitizedaudioTagData(meta);
                audioTagData.FilePath = fileInfo.FilePath;

                if (typeof(meta.coverArt) != 'undefined') {
                    audioTagData.CoverURL = meta.coverArt.toBlobURL();
                    albumArtBlob = meta.coverArt.toBlob();
                    albumArtId = audioTagDataToAlbumId(audioTagData);
                }
            });

            asset.get('duration', function(msec) {
                if (DEBUG) { console.log('\t===TagFetcher: Duration fetched: ' + msec); }
                audioTagData.Duration = msec;
                asset.stop();

                // TODO: Implement saving the blob n shit
                if (DEBUG) { console.log('\t===TagFetcher: Storing data into indexedDB==='); }
                let trans = db.transaction(['audioTagData'], 'readwrite');
                let store = trans.objectStore('audioTagData');
                let saveRequest = store.put(audioTagData);

                if (albumArtBlob) {
                    if (DEBUG) { console.log('\t===TagFetcher: Storing album blob into indexedDB==='); }
                    let albumTrans = db.transaction(['audioAlbumData'], 'readwrite');
                    let albumStore = albumTrans.objectStore('audioAlbumData');
                    let albumRequest = albumStore.put(albumArtBlob, albumArtId);
                }

                // Notify playlist that audioTagData is loaded
                self.port.emit('audioTagDataLoaded', audioTagData);
            });

            asset.start();
        }
    };
});