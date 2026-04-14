let isListening = false;

const btn = document.getElementById("toggleBtn");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

let seconds = 0;
let interval = null;

function updateTimer(){
    seconds++;
    let minutes = Math.floor(seconds/60);
    let secs = seconds%60;
    //make into text and 2 digits
    minutes = minutes.toString().padStart(2,"0");
    secs = seconds.toString().padStart(2,"0");
    document.getElementById("timer").textContent = `${minutes}:${secs}`;
}

//detections
function renderDetections(detections) {
    detectionList.innerHTML = "";
    detections.forEach(d => {
        const item = document.createElement("div");
        item.className = "detection-item";
        item.innerHTML = `
            <div class="bird-name">${d.name}</div>
            <div class="meta">
                Confidence: ${d.confidence}% • ${d.time}
            </div>
        `;
        detectionList.appendChild(item);
    });
}

function loadDetections() {
    fetch("/detections")
        .then(res => res.json())
        .then(data => renderDetections(data));
}

//start listening and stop listening
btn.addEventListener("click", () => {
    isListening = !isListening;

    if (isListening) {
        btn.textContent = "Stop Listening";
        btn.classList.remove("start");
        btn.classList.add("stop");

        statusText.textContent = "Listening...";
        statusDot.classList.remove("idle");
        statusDot.classList.add("active");
        
        seconds=0;
        interval=setInterval(updateTimer,1000);

        // later: call backend API
        // fetch("/start")

        fetch("/start").then(response => response.json()).then(data => console.log(data));

    } else {
        btn.textContent = "Start Listening";
        btn.classList.remove("stop");
        btn.classList.add("start");

        statusText.textContent = "Idle";
        statusDot.classList.remove("active");
        statusDot.classList.add("idle");

        clearInterval(interval);
        interval = null;

        fetch("/stop").then(response => response.json()).then(data => console.log(data));
    }
});

loadDetections();