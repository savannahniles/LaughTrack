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
	});

	video.addEventListener("pause", function() {
		title.style.opacity = '1';
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
		console.log(times);
	});


}