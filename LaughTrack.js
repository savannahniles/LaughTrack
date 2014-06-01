var times = [];

window.onload = function() {

	// Video
	var video = document.getElementById("video");
	var videoContainer = document.getElementById("video-container");

	// Buttons
	var playButton = document.getElementById("play-pause");
	var muteButton = document.getElementById("mute");
	var fullScreenButton = document.getElementById("full-screen");

	// Sliders
	var seekBar = document.getElementById("seek-bar");
	var volumeBar = document.getElementById("volume-bar");

	// Meta
	var title = document.getElementById("title");
	var volumeHistory = document.getElementById("volumeHistory");
	var volumeMeter = document.getElementById("volumeMeterContainer");

// --------------------- vertically center ---------------------

	verticallyCenter ();
	window.onresize = verticallyCenter;

	function verticallyCenter()
	{
		//video container
		if ((window.innerHeight - videoContainer.clientHeight) > 0) {
			value = ((window.innerHeight - videoContainer.clientHeight)/2)
			videoContainer.setAttribute("style", "margin-top:" + value.toString() + "px");
			//set data canvas height
			volumeHistory.setAttribute("style", "height:" + value.toString() + "px");
		}
		//title
			value = ((videoContainer.clientHeight - title.offsetHeight)/2)
			title.setAttribute("style", "top:" + value.toString() + "px");
	}

// --------------------- controls ---------------------

	//play the thing by clicking the video itself
	title.addEventListener("click", function() {
		if (video.paused == true) {
			// Play the video
			video.play();

		} else {
			// Pause the video
			video.pause();
		}
		// console.log ("The current of the video is: " + video.currentTime);
	});

	video.addEventListener("play", function() {
		title.style.opacity = '0';
		volumeHistory.style.opacity = '1';
		volumeMeter.style.opacity = '1';

	});

	video.addEventListener("pause", function() {
		title.style.opacity = '1';
		volumeHistory.style.opacity = '0';
		volumeMeter.style.opacity = '0';

	});



// --------------------- get and output time ---------------------

	addEventListener("keydown", function(event){
		console.log ("The current of the video is: " + video.currentTime);
		times.push(video.currentTime);
  	});

	video.addEventListener("ended", function() {
		// Calculate the slider value
		// console.log (video.currentTime);
		console.log ("Ended!");
		title.style.opacity = '1';
		dataCanvas.style.opacity = '1';
		volumeMeter.style.opacity = '0';
		console.log(times);
	});




var volumeMeterCanvas;
var volumeMeterGradient;
var volumeMeterContext;
var volumeHistory;
var volumeHistoryGradient;
var volumeHistoryContext;
var volumeHistoryData = [];
var startDate;
var duration; //= video.duration*1000;

	video.addEventListener('loadedmetadata', function() {
	  var duration = video.duration;
	  console.log (duration);
	}, false);

var maximumVolume = 60;


// respond to events
document.addEventListener("microphoneConnected", updateConnectionStatus);
document.addEventListener("volumeCrossedAboveThreshold", logThresholdCross);
document.addEventListener("volumeCrossedBelowThreshold", logThresholdCross);

function updateConnectionStatus(e)
{
	console.log(e);

	//this is for changing microphone
	if (e.type === "microphoneConnected")
	{
	// 	if (supportsSourceSelection)
	// 	{
	// 		var sourceSelection = document.querySelector('#sourceSelection');
	// 		sourceSelection.style.visibility = "visible";
	// 		for (element in sourceSelection.options)
	// 		{
	// 			sourceSelection.remove(element);
	// 		}
	// 		var selectedIndex;
	// 		for (var i = 0; i < availableMicrophones.length; i++)
	// 		{
	// 			var option = document.createElement('option');
	// 			option.text = availableMicrophones[i].name;
	// 			sourceSelection.add(option);
	// 			if (availableMicrophones[i].id == selectedMicrophoneId)
	// 			{
	// 				selectedIndex = i;
	// 			}
	// 		}
	// 		sourceSelection.selectedIndex = selectedIndex;
	// 		document.querySelector('#sourceSelection').addEventListener('change', sourceSelectionChanged);
		// }
		//end changing microphone

		volumeMeterCanvas = document.querySelector('#volumeMeter');
		// volumeMeter.width = 50;
		// volumeMeter.height = 80;
		// volumeMeter.style.background = 'none';


		// create gradient
		volumeMeterContext = volumeMeterCanvas.getContext('2d');
		volumeMeterGradient = volumeMeterContext.createLinearGradient(0, 0, 0, volumeMeterCanvas.height);
		volumeMeterGradient.addColorStop(0, '#FF3300');
		volumeMeterGradient.addColorStop(1, '#ACACAC');
		volumeMeterContext.fillStyle = volumeMeterGradient;

		volumeHistory = document.querySelector('#volumeHistory');
		volumeHistory.width = videoContainer.clientWidth;
		volumeHistory.height = ((window.innerHeight - videoContainer.clientHeight)/2);
		volumeHistoryContext = volumeMeterCanvas.getContext('2d');
		volumeHistoryGradient = volumeHistoryContext.createLinearGradient(0,0,0,80);
		// volumeHistoryGradient.addColorStop(0, '#ef6730');
		// volumeHistoryGradient.addColorStop(1, '#68e5c2');
		volumeHistoryGradient.addColorStop(0, '#FF3300');
		volumeHistoryGradient.addColorStop(1, '#ACACAC');
		// startDate = new Date();

		drawVolumeMeter();
		//drawVolumeHistory();
	}
	else
	{
		statusDIV.style.background = '#b22222';
	}
}

function sourceSelectionChanged(e)
{
	var newMicrophoneID = availableMicrophones[document.querySelector('#sourceSelection').selectedIndex];
	connectWithMicrophone(newMicrophoneID);
}

function logThresholdCross(e)
{
	// var newDiv = document.createElement('div');
	// newDiv.innerText = e.detail.message + ' : ' + e.detail.time;
	// document.querySelector('#thresholdContainer').appendChild(newDiv);
	var above = false;
	if (e.type == "volumeCrossedAboveThreshold") {
		var above = true;
	}
	if (!video.paused && !video.ended) {
		console.log ("Playing!");
		times.push({"time": video.currentTime, "above": above});
	}
	
}

// requestAnimationFrame for volume meter
function drawVolumeMeter()
{
	volumeMeterContext.clearRect(0, 0, volumeMeterCanvas.width, volumeMeterCanvas.height);

	var heightRatio = volumeMeterCanvas.height / maximumVolume;

	volumeMeterContext.fillRect(0, (maximumVolume - currentVolume()) * heightRatio, volumeMeterCanvas.width, maximumVolume * heightRatio);
	requestAnimationFrame(drawVolumeMeter);
}


// setTimeout for scrolling log
function drawVolumeHistory()
{
	if (!video.paused && !video.ended) {
		volumeHistoryData.push({'volume':currentVolume(),'time' : video.currentTime});
	}

	if (volumeHistoryData.length == 0)
	{
		return;
	}

	var widthRatio = volumeHistory.width / duration;
	var heightRatio = volumeHistory.height / maximumVolume;


	var volumeHistoryContext = volumeHistory.getContext('2d');
	volumeHistoryContext.clearRect(0,0, volumeHistory.width, volumeHistory.height);

	volumeHistoryContext.fillStyle = volumeHistoryGradient;

	volumeHistoryContext.beginPath();
	volumeHistoryContext.moveTo(0, volumeHistory.height);

	for (var i = 0; i < volumeHistoryData.length; i++)
	{
		volumeHistoryContext.lineTo(volumeHistoryData[i].time * widthRatio, (maximumVolume - volumeHistoryData[i].volume) * heightRatio);
	}

	console.log(volumeHistoryData);

	volumeHistoryContext.lineTo(volumeHistoryData[volumeHistoryData.length - 1].time * widthRatio, volumeHistory.height);
	volumeHistoryContext.fill();

	setTimeout(drawVolumeHistory, video.duration / 10); // this will give us 10,000 data points
}






}