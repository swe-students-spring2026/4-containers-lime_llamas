let isListening = false;

const btn = document.getElementById("toggleBtn");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const detectionList = document.getElementById("detectionList");
const currentBirdName = document.getElementById("currentBirdName");
const currentBirdMeta = document.getElementById("currentBirdMeta");
const currentResultCard = document.getElementById("currentResultCard");

let seconds = 0;
let timer_interval = null;
let record_interval = null;

let time_start = Date.now()
let record_ids = []

function updateTimer() {
    seconds++;
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    //make into text and 2 digits
    minutes = minutes.toString().padStart(2, "0");
    secs = secs.toString().padStart(2, "0");
    document.getElementById("timer").textContent = `${minutes}:${secs}`;
}



async function recordChunk() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, mimeType: 'audio/webm; codecs=opus' });

    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm; codecs=opus" });
        const res = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "audio/webm" },
            body: blob,
        });
        const detections = await res.json();
        console.log("Birds detected:", detections);

        renderCurrentResult(detections);
        loadDetections(); // refresh detections list after each recording
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 3000);
}

//detections
function renderDetections(detections) {
    detectionList.innerHTML = "";
    let d_counter = 0
    let d_max = 4

    // detections.forEach(d => {
    for (const d of detections) {
        const item = document.createElement("div");
        item.className = "detection-item";

        const confidencePercent =
            d.confidence !== null && d.confidence !== undefined
                ? (d.confidence * 100).toFixed(2)
                : "N/A";

        const createdAt = d.created_at
            ? new Date(d.created_at).toLocaleString()
            : "Unknown time";

        item.innerHTML = `
            <div class="bird-name">${d.species_name ?? "Unknown species"}</div>
            <div class="meta">
                Confidence: ${confidencePercent}% • ${createdAt}
            </div>
        `;

        detectionList.appendChild(item);

        if (++d_counter == d_max) {
            return
        }
    }
    // });
}

function loadDetections() {
    fetch("/detections")
        .then(res => res.json())
        .then(data => renderDetections(data));
}

//for our current detections card
function renderCurrentResult(apiResponse) {
    if (!apiResponse.detections || apiResponse.detections.length == 0) {
        currentBirdName.textContent = "No detection yet";
        currentBirdMeta.textContent = "Listening...";
        currentResultCard.classList.add("empty");
        return;
    }
    const top = apiResponse.detections[0];
    const confidencePercent = top.confidence !== null && top.confidence !== undefined ? (top.confidence * 100).toFixed(2) : "N/A";
    currentBirdName.textContent = top.species_name ?? "Unkown species";
    currentBirdMeta.textContent = `Confidence: ${confidencePercent}%`;
    currentResultCard.classList.remove("empty");
}

function saveSession(time_start, seconds, record_ids) {
    fetch('/save_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            time_start: time_start,
            seconds: seconds,
            record_ids: record_ids
        }),
    })
}

//start listening and stop listening
btn.addEventListener("click", () => {
    console.log("listening button clicked");
    isListening = !isListening;

    if (isListening) {
        btn.textContent = "Stop Listening";
        btn.classList.remove("start");
        btn.classList.add("stop");

        statusText.textContent = "Listening...";
        statusDot.classList.remove("idle");
        statusDot.classList.add("active");

        seconds = 0;
        time_start = Date.now()
        record_ids = []

        document.getElementById("timer").textContent = "00:00";
        timer_interval = setInterval(updateTimer, 1000); // update timer every second

        recordChunk();
        record_interval = setInterval(recordChunk, 3000); // new recorder every 3s
    } else {
        btn.textContent = "Start Listening";
        btn.classList.remove("stop");
        btn.classList.add("start");

        statusText.textContent = "Idle";
        statusDot.classList.remove("active");
        statusDot.classList.add("idle");

        clearInterval(timer_interval);
        clearInterval(record_interval);



    }
});

loadDetections();