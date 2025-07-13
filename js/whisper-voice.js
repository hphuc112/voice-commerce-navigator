// js/whisper-voice.js
// OpenAI Whisper Voice Recognition Implementation

console.log("Whisper voice control script loaded");

// 1. UI references
const texts = document.querySelector(".texts");
const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");

// 2. Voice recognition state
let isListening = false;
let mediaRecorder = null;
let audioChunks = [];
let lastCommand = "";
let debounceTimer;
let silenceTimer;
let audioContext;
let analyser;
let dataArray;
let source;

// 3. Configuration
const WHISPER_CONFIG = {
  apiEndpoint: "/api/transcribe", // Your backend endpoint
  silenceThreshold: 0.01, // Adjust based on your needs
  silenceTimeout: 2000, // 2 seconds of silence before processing
  maxRecordingTime: 30000, // 30 seconds max recording
  sampleRate: 16000, // Whisper prefers 16kHz
};

// 4. Check for required APIs
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  texts.innerHTML = "<p>Your browser does not support audio recording.</p>";
  toggleVoiceBtn.disabled = true;
} else {
  initializeVoiceRecognition();
}

async function initializeVoiceRecognition() {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: WHISPER_CONFIG.sampleRate,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // Initialize audio context for silence detection
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Initialize MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];
        await processAudioWithWhisper(audioBlob);
      }
    };

    // Wire up toggle button
    toggleVoiceBtn.addEventListener("click", toggleVoiceRecognition);
  } catch (error) {
    console.error("Error initializing voice recognition:", error);
    texts.innerHTML =
      "<p>Error accessing microphone. Please check permissions.</p>";
    toggleVoiceBtn.disabled = true;
  }
}

function toggleVoiceRecognition() {
  if (isListening) {
    stopRecognition();
  } else {
    startRecognition();
  }
}

function startRecognition() {
  if (!mediaRecorder) return;

  isListening = true;
  toggleVoiceBtn.textContent = "Turn Off Voice";

  // Clear previous audio chunks
  audioChunks = [];

  // Start recording
  mediaRecorder.start();

  // Start silence detection
  detectSilence();

  // Set maximum recording time
  setTimeout(() => {
    if (isListening) {
      stopRecognition();
    }
  }, WHISPER_CONFIG.maxRecordingTime);

  console.log("Voice recognition started");
}

function stopRecognition() {
  isListening = false;
  toggleVoiceBtn.textContent = "Turn On Voice";

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  clearTimeout(silenceTimer);
  console.log("Voice recognition stopped");
}

function detectSilence() {
  if (!isListening) return;

  analyser.getByteFrequencyData(dataArray);

  // Calculate average volume
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const average = sum / dataArray.length / 255;

  if (average < WHISPER_CONFIG.silenceThreshold) {
    // Silence detected, start timer
    if (!silenceTimer) {
      silenceTimer = setTimeout(() => {
        if (isListening) {
          stopRecognition();
        }
      }, WHISPER_CONFIG.silenceTimeout);
    }
  } else {
    // Sound detected, clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  }

  // Continue monitoring if still listening
  if (isListening) {
    requestAnimationFrame(detectSilence);
  }
}

async function processAudioWithWhisper(audioBlob) {
  try {
    // Show processing indicator
    const processingP = document.createElement("p");
    processingP.className = "processing";
    processingP.textContent = "Processing audio...";
    texts.appendChild(processingP);

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");
    formData.append("language", "en"); // Specify language if needed

    // Send to your backend endpoint
    const response = await fetch(WHISPER_CONFIG.apiEndpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const transcript = result.text?.trim() || "";

    // Remove processing indicator
    if (processingP.parentNode) {
      processingP.parentNode.removeChild(processingP);
    }

    if (transcript) {
      // Display transcript
      texts.innerHTML = "";
      const p = document.createElement("p");
      p.textContent = transcript;
      texts.appendChild(p);

      // Process command if it's different from last command
      if (transcript !== lastCommand) {
        lastCommand = transcript;
        console.log("Processed command:", transcript);

        // Process the command
        processVoiceCommand(transcript);

        // Reset debounce timer
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          lastCommand = "";
        }, 1000);
      }
    }
  } catch (error) {
    console.error("Error processing audio:", error);

    // Remove processing indicator
    const processingP = texts.querySelector(".processing");
    if (processingP) {
      processingP.parentNode.removeChild(processingP);
    }

    // Show error message
    const errorP = document.createElement("p");
    errorP.className = "error";
    errorP.textContent = "Error processing audio. Please try again.";
    texts.appendChild(errorP);

    // Clear error after 3 seconds
    setTimeout(() => {
      if (errorP.parentNode) {
        errorP.parentNode.removeChild(errorP);
      }
    }, 3000);
  }
}

function processVoiceCommand(transcript) {
  const command = transcript.toLowerCase();

  // Clear command
  if (command === "clear") {
    texts.innerHTML = "";
    return;
  }

  // Navigation commands
  if (isNavigationCommand(command)) {
    return; // Navigation function handles the redirect
  }

  // Page-specific commands
  if (typeof processCartVoiceCommand === "function") {
    processCartVoiceCommand(transcript);
  }

  // Products page commands (if on products page)
  if (typeof processProductVoiceCommand === "function") {
    processProductVoiceCommand(transcript);
  }
}

// Navigation command processing
function isNavigationCommand(text) {
  return isProductCommand(text) || isCartCommand(text) || isHomeCommand(text);
}

function isProductCommand(text) {
  const triggers = [
    "show products",
    "open products",
    "products",
    "product page",
    "go to products",
    "view products",
    "see products",
    "browse products",
    "show me products",
    "take me to products",
    "where are products",
    "product list",
    "items list",
    "view items",
    "show items",
    "what do you sell",
    "show catalog",
    "view catalog",
  ];
  return checkCommand(text, triggers, "products.html");
}

function isCartCommand(text) {
  const triggers = [
    "cart",
    "my cart",
    "view cart",
    "open cart",
    "shopping cart",
    "go to cart",
    "show cart",
    "see my cart",
    "browse cart",
    "where is my cart",
    "shopping bag",
    "view my items",
    "what's in my cart",
    "checkout",
    "review cart",
  ];
  return checkCommand(text, triggers, "cart.html");
}

function isHomeCommand(text) {
  const triggers = [
    "home",
    "main page",
    "go home",
    "index",
    "return home",
    "back to home",
    "start over",
    "main menu",
    "home screen",
    "homepage",
    "go to main",
    "take me home",
  ];
  return checkCommand(text, triggers, "index.html");
}

function checkCommand(text, triggers, targetUrl) {
  const match = triggers.some(
    (trigger) =>
      text === trigger || text.includes(trigger) || trigger.includes(text)
  );

  if (match) {
    stopRecognition();
    const reply = document.createElement("p");
    reply.className = "replay";
    reply.textContent = `Navigating to ${targetUrl.replace(
      ".html",
      ""
    )} page...`;
    texts.appendChild(reply);
    console.log(`Navigating to ${targetUrl}`);

    // Add small delay to show feedback before navigation
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 500);

    return true;
  }
  return false;
}

// Export functions for use in other scripts
window.WhisperVoice = {
  startRecognition,
  stopRecognition,
  isListening: () => isListening,
  processVoiceCommand,
};
