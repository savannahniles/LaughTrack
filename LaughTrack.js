var volumeMeter;
var volumeMeterGradient;
var volumeMeterContext;
var volumeHistory;
var volumeHistoryGradient;
var volumeHistoryContext;
var volumeHistoryData = [];
var startDate;
var duration = 150000;
var maximumVolume = 60;


// respond to events
document.addEventListener("microphoneConnected", updateConnectionStatus);
document.addEventListener("volumeCrossedAboveThreshold", logThresholdCross);
document.addEventListener("volumeCrossedBelowThreshold", logThresholdCross);

function updateConnectionStatus(e)
{
	var statusDIV = document.querySelector('#connectStatus');
	statusDIV.innerText = e.detail.message || 'error';
	console.log(e);

	if (e.type === "microphoneConnected")
	{
		statusDIV.style.background = '#32cd32';

		if (supportsSourceSelection)
		{
			var sourceSelection = document.querySelector('#sourceSelection');
			sourceSelection.style.visibility = "visible";
			for (element in sourceSelection.options)
			{
				sourceSelection.remove(element);
			}
			var selectedIndex;
			for (var i = 0; i < availableMicrophones.length; i++)
			{
				var option = document.createElement('option');
				option.text = availableMicrophones[i].name;
				sourceSelection.add(option);
				if (availableMicrophones[i].id == selectedMicrophoneId)
				{
					selectedIndex = i;
				}
			}
			sourceSelection.selectedIndex = selectedIndex;
			document.querySelector('#sourceSelection').addEventListener('change', sourceSelectionChanged);
		}

		volumeMeter = document.querySelector('#volumeMeter');
		volumeMeter.width = 50;
		volumeMeter.height = 80;
		volumeMeter.style.background = '#888';


		// create gradient
		volumeMeterContext = volumeMeter.getContext('2d');
		volumeMeterGradient = volumeMeterContext.createLinearGradient(0, 0, 0, 80);
		volumeMeterGradient.addColorStop(0, '#FF3300');
		volumeMeterGradient.addColorStop(1, '#ACACAC');
		volumeMeterContext.fillStyle = volumeMeterGradient;

		volumeHistory = document.querySelector('#volumeHistory');
		volumeHistory.width = 1210;
		volumeHistory.height = 80;
		volumeHistoryContext = volumeMeter.getContext('2d');
		volumeHistoryGradient = volumeHistoryContext.createLinearGradient(0,0,0,80);
		// volumeHistoryGradient.addColorStop(0, '#ef6730');
		// volumeHistoryGradient.addColorStop(1, '#68e5c2');
		volumeHistoryGradient.addColorStop(0, '#FF3300');
		volumeHistoryGradient.addColorStop(1, '#ACACAC');
		startDate = new Date();

		drawVolumeMeter();
		drawVolumeHistory();
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
	var newDiv = document.createElement('div');
	newDiv.innerText = e.detail.message + ' : ' + e.detail.time;
	document.querySelector('#thresholdContainer').appendChild(newDiv);
}

// requestAnimationFrame for volume meter
function drawVolumeMeter()
{
	volumeMeterContext.clearRect(0, 0, 50, 80);

	var heightRatio = 80 / maximumVolume;

	volumeMeterContext.fillRect(0, (maximumVolume - currentVolume()) * heightRatio, 50, maximumVolume * heightRatio);
	requestAnimationFrame(drawVolumeMeter);
}


// setTimeout for scrolling log
function drawVolumeHistory()
{
	volumeHistoryData.push({'volume':currentVolume(),'time' : new Date() - startDate});

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

	volumeHistoryContext.lineTo(volumeHistoryData[volumeHistoryData.length - 1].time * widthRatio, volumeHistory.height);
	volumeHistoryContext.fill();

	setTimeout(drawVolumeHistory, 500);
}






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
	var dataCanvas = document.getElementById("canvas");

	var times = [];

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
			dataCanvas.setAttribute("style", "height:" + value.toString() + "px");
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
		dataCanvas.style.opacity = '1';
	});

	video.addEventListener("pause", function() {
		title.style.opacity = '1';
		dataCanvas.style.opacity = '0';
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
		console.log(times);
	});


}