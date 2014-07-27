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

	//canvas
	var volumeMeterCanvas;
	var volumeMeterGradient;
	var volumeMeterContext;
	var volumeHistory;
	var volumeHistoryGradient;
	var volumeHistoryContext;
	var volumeHistoryData = [];
	var startDate;

	var maximumVolume = 60;

// --------------------- vertically center ---------------------

	verticallyCenter;
	window.onresize = verticallyCenter;

	function verticallyCenter()
	{
		console.log ("resize");
		//set data canvas height
		volumeHistory.height = 40; 
		console.log (videoContainer.clientWidth);
		volumeHistory.width = videoContainer.clientWidth;
		//video container
		if ((window.innerHeight - videoContainer.clientHeight) > 0) {
			value = ((window.innerHeight - videoContainer.clientHeight)/2)
			videoContainer.setAttribute("style", "margin-top:" + value.toString() + "px");
			//set data canvas height
			if (value > 40) {
				volumeHistory.setAttribute("style", "height:" + value.toString() + "px");
				volumeHistory.height = value; //((window.innerHeight - videoContainer.clientHeight)/2);
			}
			console.log (volumeHistory.height);
		}
		//title
			value = ((videoContainer.clientHeight - title.offsetHeight)/2)
			title.setAttribute("style", "top:" + value.toString() + "px");

		volumeHistoryContext = volumeMeterCanvas.getContext('2d');
		volumeHistoryGradient = volumeHistoryContext.createLinearGradient(0,0,0,volumeHistory.height);
		// volumeHistoryGradient.addColorStop(0, '#ef6730');
		// volumeHistoryGradient.addColorStop(1, '#68e5c2');
		volumeHistoryGradient.addColorStop(0, '#FF3300');
		volumeHistoryGradient.addColorStop(1, '#ACACAC');
		// startDate = new Date();
		volumeHistoryContext.fillStyle = volumeHistoryGradient;
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
		// volumeHistory.style.opacity = '1';
		volumeMeter.style.opacity = '1';

	});

	video.addEventListener("pause", function() {
		title.style.opacity = '1';
		// volumeHistory.style.opacity = '0';
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
	if (video.paused || video.ended) {
		if (video.paused) {
			setTimeout(drawVolumeHistory, video.duration / 10); // this will give us 10,000 data points
			//may have to make bigger if tons of fucking data points at end
		}
		return;
	}

	volumeHistoryData.push({'volume':currentVolume(),'time' : video.currentTime});

	var widthRatio = volumeHistory.width / video.duration;
	var heightRatio = volumeHistory.height / maximumVolume;
	// console.log (widthRatio + " " + heightRatio);


	var volumeHistoryContext = volumeHistory.getContext('2d');
	volumeHistoryContext.clearRect(0,0, volumeHistory.width, volumeHistory.height);

	volumeHistoryContext.fillStyle = volumeHistoryGradient;


	volumeHistoryContext.beginPath();
	volumeHistoryContext.moveTo(0, volumeHistory.height);

	for (var i = 0; i < volumeHistoryData.length; i++)
	{
		volumeHistoryContext.lineTo(volumeHistoryData[i].time * widthRatio, (maximumVolume - volumeHistoryData[i].volume) * heightRatio);
	}

	// console.log(volumeHistoryData);

	volumeHistoryContext.lineTo(volumeHistoryData[volumeHistoryData.length - 1].time * widthRatio, volumeHistory.height);
	volumeHistoryContext.fill();

	setTimeout(drawVolumeHistory, video.duration / 10); // this will give us 10,000 data points
}






}