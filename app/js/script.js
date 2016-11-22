var isOnline = require('is-online');
var data = {};

// Called on window start
function Startup () {
    // CLick event for play button
    document.getElementById('play-btn').addEventListener("click", Play);

    isOnline(function(err, online) {
        if (online == true) {
            // Get data
            FetchData();
            // Update content
            UpdateChangelog(data.update.title, data.update.changelog);
            UpdateImage(data.update.image);
        }else {
            Offline();
        }
    });

}

function Play () {
    // Check for updates
    Update(LaunchGame);
}

function LaunchGame () {
    // TODO: Start game here
    UpdateProgress("0", "Starting game...");
}

// Call this when an update is available and play is clicked
function Update (callback) {
    UpdateProgress("0", "Checking for updates...");
    isOnline(function(err, online) {
        if (online == true){
            // Get data again just to be sure
            FetchData();
            // TODO: Check if there's a new version
            UpdateProgress("0", "Update found...");

            // TODO: Do all the downloading process
            UpdateProgress("0", "Downloading...");

            // Done updating, callback
            callback();
        }else {
            Offline();
            UpdateProgress("0", "Can't find updates.");
            // Offline, callback
            callback();
        }
    });
}

// Get the data from the server
function FetchData () {
    // For now just using test data
    data =  {
        update: {
            version: "1.0.0",
            title: "Test version",
            changelog: "Test changelog",
            image: "./assets/sf.png",
            url: "http://stuff"
        }
    };
}

function Offline () {
    UpdateChangelog("Offline", "Please connect to the internet...");
}

// Call this with two strings to update the values of the progress areas
function UpdateProgress (value, text) {
    document.getElementById('progress-bar').value = value;
    document.getElementById('progress-text').innerHTML = text;
}

// Call this with one string to update the image
function UpdateImage (url) {
    document.getElementById('changelog-image').src = url;
}

// Call this with two strings to update the changelog box
function UpdateChangelog (title, content) {
    document.getElementById('changelog-title').innerHTML = title;
    document.getElementById('changelog-content').innerHTML = content;
}


// Call startup
(function() {
    Startup();
})();
