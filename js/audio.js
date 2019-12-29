//Global Variables:
const canvas = document.getElementById("canvas"),
    audioCtx = new (window.AudioContext || window.webkitAudioContext),
    audioElem = document.querySelector("audio"),
    playButton = document.querySelector("button");

let drawVisual,
    WIDTH = canvas.width;
    HEIGHT = canvas.height,
    analyser = audioCtx.createAnalyser();

/**
 * minDecibels and maxDecibels are double values to scale FFT data
 * 0 dB is loudest possible sound. 
 * -100dB is the default value for mindB -30dB is the default value for maxdB
 * smoothingTimeConstraint represents an average between the current buffer and the last buffer 
 * the AnalyserNode processed, rsulting in a smoother set of value changes. Default: 0.8
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
 */

analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstraint = 0.85;

//Create canvas
const canvasCtx = canvas.getContext('2d');
canvasCtx.fillStyle = 'rgb(0, 0, 0)';
canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

const source = audioCtx.createMediaElementSource(audioElem);
source.connect(analyser);
analyser.connect(audioCtx.destination);


function visualize() {
    
    //Create Analyser Node to extract data from Audio Source
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const draw = () => {
        drawVisual = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        console.log(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        let barWidth = (WIDTH/bufferLength) * 2.5,
            barHeight,
            x = 0;
        
        for(let i = 0; i<bufferLength; i++) {
            barHeight = dataArray[i];
            
            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ', 50, 50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight/2, barWidth, barHeight/2);
            
            x += barWidth + 1;
        }
    };

    draw();
}


//Add the Play/Pause Functionality
playButton.addEventListener('click', ()=>{

    //Chrome policy: suspended state = Autoplay is denied
    //Need to resume audioCtx initially
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    //PLAY/PAUSE based on current state
    if (playButton.dataset.playing === 'false') {
        audioElem.play();
        playButton.dataset.playing =  'true';
        visualize()
    }
    else if (playButton.dataset.playing === 'true') {
        audioElem.pause();
        playButton.dataset.playing =  'false';  
    }
}, false);


audioElem.addEventListener('ended', ()=> {
    playButton.dataset.playing = 'false';
}, false);

