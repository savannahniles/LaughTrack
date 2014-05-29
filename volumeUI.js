// respond to events
document.addEventListener("microphoneConnected", updateConnectionStatus);
document.addEventListener("volumeCrossedAboveThreshold", logThresholdCross);
document.addEventListener("volumeCrossedBelowThreshold", logThresholdCross);
var volumeMeter;
var volumeMeterGradient;
var volumeMeterContext;

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
		volumeMeterGradient.addColorStop(0, '#FFFF00');
		volumeMeterGradient.addColorStop(1, '#500000');
		volumeMeterContext.fillStyle = volumeMeterGradient;


		drawVolumeMeter();
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

	var heightRatio = 80 / 200;

	volumeMeterContext.fillRect(0,(200 - currentVolume()) * heightRatio,50,200 * heightRatio);
	requestAnimationFrame(drawVolumeMeter);
}

// setTimeout for scrolling log
function drawVolumeHistory()
{


}

