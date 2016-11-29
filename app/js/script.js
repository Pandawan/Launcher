var isOnline = require('is-online');
var http = require('http');
var fs = require('fs');
var jsonfile = require('jsonfile');
var unzip = require('unzip');

var data = {};
var updating = false;

// Called on window start
function Startup() {
    // CLick event for play button
    document.getElementById('play-btn').addEventListener("click", Play);

    CreateJsonData();

    isOnline(function(err, online) {
        if (online == true) {
            // Get data
            FetchData();
            // Update content
            UpdateChangelog(data.update.title, data.update.changelog);
            UpdateImage(data.update.image);
        } else {
            Offline();
        }
    });
}

// Call this on Button click
function Play() {
    // Check for updates
    Update(LaunchGame);
}

// Start the application
function LaunchGame() {
    if (updating)
    return;

    UpdateProgress("100", "Starting game...");
    var exec = require('child_process').spawn;
    var start = function() {
        exec(AppPath());
    }
    start();
}

// Call this when an update is available and play is clicked
function Update(callback) {
    UpdateProgress("0", "Checking for updates...");
    isOnline(function(err, online) {
        if (online == true) {

            updating = true;

            // Get data again just to be sure
            FetchData();

            if (NeedsUpdate() == false) {
                UpdateProgress("0", "No update found...");
                updating = false;
                callback();
                return;
            }

            UpdateProgress("0", "Update found...");

            UpdateProgress("25", "Downloading...");

            if (!fs.existsSync('./download')) {
                fs.mkdirSync('./download');
            }

            // Download the file
            var file = fs.createWriteStream("./download/game.zip");
            var request = http.get(DownloadLink(), function(response) {
                response.pipe(file);
            });

            file.on('close', function() {
                UpdateProgress("50", "Successfully downloaded! Unzipping...");

                // Create folder if doesn't exist
                if (!fs.existsSync('./game')) {
                    fs.mkdirSync('./game');
                }

                var zip = fs.createReadStream('./download/game.zip').pipe(unzip.Extract({
                    path: './game'
                }).on('close', function() {
                    UpdateProgress("75", "Finished downloading! Cleaning things up...");
                    Clean('./download');
                    UpdateData({
                        version: data.update.version
                    });
                    UpdateProgress("100", "Done updating!");
                    updating = false;

                    // Done updating, callback
                    callback();
                    file.close();
                }));
            });
        } else {
            Offline();
            UpdateProgress("0", "Can't find updates.");

            updating = false;

            // Offline, callback
            callback();
        }
    });
}

// Whether or not it needs an update
function NeedsUpdate() {
    if (jsonfile.readFileSync('./launcher.json').version != data.update.version) {
        return true;
    }

    return false;
}

// Clean/Remove the download folder
function Clean(wantedPath) {
    var deleteFolderRecursive = function(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    deleteFolderRecursive(wantedPath);
}

// Link to download for platform
function DownloadLink() {
    var os = process.platform;
    if (os == 'darwin') {
        return data.update.mac_url;
    } else if (os == 'win32') {
        return data.update.win_url;
    } else {
        UpdateProgress("0", "Your platform isn't supported!");
    }
}

// Path to the application to run
function AppPath() {
    var os = process.platform;
    if (os == 'darwin') {
        return './game/WitchHunting.app/Contents/MacOS/Electron';
    } else if (os == 'win32') {
        return ".\\game\\WitchHunting.exe";
    } else {
        UpdateProgress("0", "Your platform isn't supported!");
    }
}

// Create launcher.json
function CreateJsonData() {
    // Create folder if doesn't exist
    if (!fs.existsSync('./launcher.json')) {
        UpdateData({
            version: "0"
        });
    }

    fs.readFile('./launcher.json', 'utf8', function(err, contents) {
        if (contents == ""){
            UpdateData({
                version: "0"
            });
        }
    });
}

// Change data in launcher.json
function UpdateData(obj) {
    var file = './launcher.json';
    jsonfile.writeFile(file, obj, function(err) {
        //console.error(err);
    });
}

// Get the data from the server
function FetchData() {
    // TODO: Make this fetch server data
    data = {
        update: {
            version: "1.0.0",
            title: "Test version",
            changelog: "Test changelog",
            image: "./assets/sf.png",
            mac_url: "http://www.colorado.edu/conflict/peace/download/peace_essay.ZIP",
            win_url: "http://www.colorado.edu/conflict/peace/download/peace_essay.ZIP"
        }
    };
}

// Use this if the computer is offline
function Offline() {
    UpdateChangelog("Offline", "Please connect to the internet...");
}

// Call this with two strings to update the values of the progress areas
function UpdateProgress(value, text) {
    document.getElementById('progress-bar').value = value;
    document.getElementById('progress-text').innerHTML = text;
}

// Call this with one string to update the image
function UpdateImage(url) {
    document.getElementById('changelog-image').src = url;
}

// Call this with two strings to update the changelog box
function UpdateChangelog(title, content) {
    document.getElementById('changelog-title').innerHTML = title;
    document.getElementById('changelog-content').innerHTML = content;
}

// Call startup
(function() {
    Startup();
})();
