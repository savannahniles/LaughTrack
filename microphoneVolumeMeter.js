var supportsSourceSelection = false;
var availableMicrophones = [];
var selectedMicrophoneId = "";
var _currentVolume = 0;
var threshold = 0.8;
var aboveThreshold = false;
var pastData = [];

var mediaStreamSource
var analyserNode;
var scriptProcessorNode;

// event names
var microphoneConnectedEventName = "microphoneConnected";
var microphoneConnectFailedEventName = "microphoneConnectFailed";

// set getUserMedia to be cross platform
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// check if the browser supports getUserMedia
if (!navigator.getUserMedia)
{
	var event = new CustomEvent(microphoneConnectFailedEventName, {
			detail : {
				message : "Unfortunately this browser does not support the technology that we are using in this application.  We suggest using Chrome 21 or higher for this application to work properly."
			}
		});
	document.dispatchEvent(event);
}
else
{
	var constraints = {audio : true};

	// check to see if the browser supports selecting the microphone source
	if (MediaStreamTrack.getSources) // this is supported in Chrome 30 and higher
	{
		supportsSourceSelection = true;

		// get a list of the different available sources
		MediaStreamTrack.getSources(function(sources) {
			var audioSource = null;

			for (var i = 0; i < sources.length; i++)
			{
				var sourceDetails = sources[i];
				if (sourceDetails.kind === 'audio')
				{
					availableMicrophones.push({'id' : sourceDetails.id, 'name' : sourceDetails.label || 'microphone'});

					audioSource = sourceDetails.id;
				}
				
			}

			constraints = {audio : {optional : [{sourceId : audioSource}]}};

			selectedMicrophoneId = audioSource;
		});
	}

	// now we will actually try to get access to the mircrophone
	navigator.getUserMedia(constraints, mediaSuccessCallback, getMediaFailedFallback);
}

function connectWithMicrophone(microphoneID)
{
	if (selectedMicrophoneId != microphoneID)
	{
		var constraints = {audio : {optional : [{sourceId : microphoneID}]}};
		selectedMicrophoneId = microphoneID;
		navigator.getUserMedia(constraints, mediaSuccessCallback, getMediaFailedFallback);
	}
}

function mediaSuccessCallback(stream)
{
	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	// check to see if the Web Audio API is available
	if (!window.AudioContext)
	{
		var event = new CustomEvent(microphoneConnectFailedEventName, {
			detail : {
				message : "You're browser doesn't support all of the functionality that we need to make this awesome web app run.  Please use Chrome if you want to make sure that you can see all of the awesomeness!"
			}
		});
		document.dispatchEvent(event);
	}
	else
	{
		var audioContext = new AudioContext();

		// Create an audio node from the stream.
		mediaStreamSource = audioContext.createMediaStreamSource(stream);

		// set up a javascript node
		scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1); // called every 2048 frames
		scriptProcessorNode.onaudioprocess = function(e) {
			var currentDateAndTime = new Date();
			
			var array = Array.prototype.slice.call(e.inputBuffer.getChannelData(0)); // what is the zero for?
			var buffer = pastData.concat(array);
			pastData = array.slice(0);
			var sum = 0;

			for (var i = 0; i < buffer.length; i++)
			{
				sum += buffer[i] * buffer[i];
			}

			var rms = Math.sqrt(sum / buffer.length);
			var decibels = 20 * log10(rms);
			decibels += 60;
			if (decibels < 0)
			{
				decibels = 0;
			}
			_currentVolume = decibels;

			// check to see if event should fire
			if (aboveThreshold)
			{
				if (decibels < threshold)
				{
					aboveThreshold = false;
					var event = new CustomEvent("volumeCrossedBelowThreshold", {
						detail : {
							message : "The volume crossed below the threshold.",
							time : currentDateAndTime
						}
					});
					document.dispatchEvent(event);
				}
			}
			else
			{
				if (decibels > threshold)
				{
					aboveThreshold = true;
					var event = new CustomEvent("volumeCrossedAboveThreshold", {
						detail : {
							message : "The volume crossed above the threshold.",
							time : currentDateAndTime
						}
					});
					document.dispatchEvent(event);
				}
			}
		};

		// Connect up the nodes
		mediaStreamSource.connect(scriptProcessorNode);
		scriptProcessorNode.connect(audioContext.destination) // the scriptProcessorNode needs to be connected otherwise it won't be called
	
		// the microphone should now be properly connected.
		var event = new CustomEvent(microphoneConnectedEventName, {
			detail : {
				message : "Microphone connected successfully."
			}
		});
		document.dispatchEvent(event);
	}
}

function log10(value)
{
	var base = 10;
	var denominator = 1;
	denominator = Math.log(base);
	var answer = Math.log(value) / denominator;
	return answer;
}

function currentVolume()
{
	return _currentVolume;
}

function getMediaFailedFallback(e)
{
	console.log(e);
	if (e.code === 'PERMISSION DENIED') {
		var event = new CustomEvent(microphoneConnectFailedEventName, {
			detail : {
				message : "If you want to be able to use LaughTrack with it's full capability, you need to give this application permission to use the microphone.  When you're ready, just reload this page and allow the site to use the microphone."
			}
		});
		document.dispatchEvent(event);
	}
	else if (e.code === 'NOT_SUPPORTED_ERROR') {
		var event = new CustomEvent(microphoneConnectFailedEventName, {
			detail : {
				message : "You're browser doesn't support all of the awesome capabilities in this site.  In order for every thing to work properly, we recommend that you use the latest version of Chrome."
			}
		});
		document.dispatchEvent(event);
	}
	else if (e.code === 'MANDATORY_UNSATISFIED_ERROR') {
		var event = new CustomEvent(microphoneConnectFailedEventName, {
			detail : {
				message : "We could not find the proper input to record audio.  Make sure a microphone is connected and reload the page."
			}
		});
		document.dispatchEvent(event);
	}
	else {
		var event = new CustomEvent(microphoneConnectFailedEventName, {
			detail : {
				message : "There was an error while attempting to access the microphone.  Please try the following steps:\n1) Make sure that a microphone is connected to your computer.\n2) Use Chrome as your browser if you aren't currently.\n3) Reload the page.\n4) Allow this web app to access the microphone when you see the security prompt."
			}
		});
		document.dispatchEvent(event);
	}
}