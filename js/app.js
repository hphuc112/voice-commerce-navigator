// Select the container for displaying recognized text and the toggle button
// const texts = document.querySelector(".texts");
// const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");

// // Check for browser compatibility
// window.SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;

// if (!window.SpeechRecognition) {
//   texts.innerHTML = "<p>Your browser does not support Speech Recognition.</p>";
//   toggleVoiceBtn.disabled = true;
// } else {
//   const recognition = new SpeechRecognition();
//   recognition.interimResults = true;
//   recognition.continuous = true; // Continue listening until explicitly stopped

//   let isListening = false; // Track whether recognition is on
//   let p = document.createElement("p");

//   // Function to start voice recognition
//   function startRecognition() {
//     recognition.start();
//     toggleVoiceBtn.textContent = "Turn Off Voice";
//     isListening = true;
//   }

//   // Function to stop voice recognition
//   function stopRecognition() {
//     recognition.stop();
//     toggleVoiceBtn.textContent = "Turn On Voice";
//     isListening = false;
//   }

//   // Toggle button event listener
//   toggleVoiceBtn.addEventListener("click", () => {
//     if (isListening) {
//       stopRecognition();
//     } else {
//       startRecognition();
//     }
//   });

//   // Handle recognition results
//   recognition.addEventListener("result", (e) => {
//     // Append current paragraph to the texts container
//     texts.appendChild(p);
//     // Convert speech results to a single string
//     const text = Array.from(e.results)
//       .map((result) => result[0])
//       .map((result) => result.transcript)
//       .join("");
//     p.innerText = text;

//     if (e.results[0].isFinal) {
//       // Process a basic command: open item detail page
//       if (text.toLowerCase().includes("open item detail")) {
//         p = document.createElement("p");
//         p.classList.add("replay");
//         p.innerText = "Opening item detail page...";
//         texts.appendChild(p);
//         // Replace with actual navigation logic, for example:
//         // window.location.href = "products.html"; // Or specific item detail page
//         console.log("Navigating to item detail page");
//       }
//       // Process cart-related voice commands
//       processCartVoiceCommand(text);
//       // Prepare a new paragraph for the next result
//       p = document.createElement("p");
//     }
//   });

//   // Restart recognition on end (if still supposed to be listening)
//   recognition.addEventListener("end", () => {
//     if (isListening) recognition.start();
//   });

//   // Example function to process cart-related commands
//   function processCartVoiceCommand(text) {
//     text = text.toLowerCase();
//     if (text.includes("add to cart")) {
//       const p = document.createElement("p");
//       p.classList.add("replay");
//       p.innerText = "Adding item to cart...";
//       texts.appendChild(p);
//       console.log("Item added to cart");
//     }
//     // Extend this function to include other commands (e.g., "view cart", "remove from cart", etc.)
//   }
// }

//---------------------------------------------------------
// Set up SpeechRecognition
// window.SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;
// if (!window.SpeechRecognition) {
//   texts.innerHTML = "<p>Your browser does not support Speech Recognition.</p>";
// } else {
//   const recognition = new SpeechRecognition();
//   recognition.interimResults = true;
//   recognition.continuous = true; // Continuously listen

//   let p = document.createElement("p");
//   let lastCommand = ""; // Holds the last processed final command
//   let commandDebounceTimer; // Timer to reset the last processed command

//   recognition.addEventListener("result", (e) => {
//     texts.appendChild(p);
//     // Concatenate all parts of the result into one string
//     const transcript = Array.from(e.results)
//       .map((result) => result[0])
//       .map((result) => result.transcript)
//       .join("")
//       .trim();

//     // Update the text paragraph for feedback
//     p.innerText = transcript;

//     // When the user stops speaking in this segment...
//     if (e.results[e.results.length - 1].isFinal) {
//       // Only process if this final transcript is different from the last processed command
//       if (transcript !== lastCommand) {
//         lastCommand = transcript;
//         // Process basic commands
//         if (transcript.toLowerCase().includes("open item detail")) {
//           let replayP = document.createElement("p");
//           replayP.classList.add("replay");
//           replayP.innerText = "Opening item detail page...";
//           texts.appendChild(replayP);
//           // Replace window.open with actual navigation logic as needed:
//           console.log("Navigating to item detail page");
//         }
//         // Process cart-related voice commands
//         processCartVoiceCommand(transcript);

//         // Set up a debounce timer to reset the lastCommand value
//         clearTimeout(commandDebounceTimer);
//         commandDebounceTimer = setTimeout(() => {
//           lastCommand = "";
//         }, 1000); // Reset after 1 second (adjust as needed)
//       }
//       // Prepare a new paragraph for the next result
//       p = document.createElement("p");
//     }
//   });

//   recognition.addEventListener("end", () => {
//     // Restart voice recognition if still intended to be active
//     recognition.start();
//   });

//   recognition.start();

//   // Example function for processing cart-related commands
//   function processCartVoiceCommand(text) {
//     text = text.toLowerCase();
//     if (text.includes("add to cart")) {
//       let replayP = document.createElement("p");
//       replayP.classList.add("replay");
//       replayP.innerText = "Adding item to cart...";
//       texts.appendChild(replayP);
//       console.log("Item added to cart");
//     }
//     // Add more command conditions here as needed.
//   }
// }

// Select the container for displaying recognized text and the toggle button
const texts = document.querySelector(".texts");
const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");

// Set up Speech Recognition API
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  texts.innerHTML = "<p>Your browser does not support Speech Recognition.</p>";
  toggleVoiceBtn.disabled = true;
} else {
  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true; // We'll restart recognition automatically only when enabled

  let isListening = false; // Track whether voice recognition is currently on
  let p = document.createElement("p");
  let lastCommand = ""; // For debouncing repeated commands
  let commandDebounceTimer;

  // Function to start voice recognition
  function startRecognition() {
    recognition.start();
    isListening = true;
    toggleVoiceBtn.textContent = "Turn Off Voice";
  }

  // Function to stop voice recognition
  function stopRecognition() {
    recognition.stop();
    isListening = false;
    toggleVoiceBtn.textContent = "Turn On Voice";
  }

  // Toggle the voice recognition when the button is clicked
  toggleVoiceBtn.addEventListener("click", () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  });

  // Process speech results
  recognition.addEventListener("result", (e) => {
    texts.appendChild(p);
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("")
      .trim();
    p.innerText = transcript;

    // When a final result is received, process commands if not already processed
    if (e.results[e.results.length - 1].isFinal) {
      if (transcript !== lastCommand) {
        lastCommand = transcript;
        // Process command to open item detail page
        if (transcript.toLowerCase().includes("open item detail")) {
          let replyP = document.createElement("p");
          replyP.classList.add("replay");
          replyP.innerText = "Opening item detail page...";
          texts.appendChild(replyP);
          console.log("Navigating to item detail page");
          // Replace the following with actual navigation logic:
          // window.location.href = "products.html"; // for example
        }
        // Process cart-related commands, such as "add to cart"
        processCartVoiceCommand(transcript);

        // Set up a debounce to reset the command after one second
        clearTimeout(commandDebounceTimer);
        commandDebounceTimer = setTimeout(() => {
          lastCommand = "";
        }, 1000);
      }
      // Prepare a new paragraph for the next result
      p = document.createElement("p");
    }
  });

  // Restart recognition only if the microphone is enabled
  recognition.addEventListener("end", () => {
    if (isListening) {
      recognition.start();
    }
  });

  // Example function to process cart-related commands
  function processCartVoiceCommand(text) {
    text = text.toLowerCase();
    if (text.includes("add to cart")) {
      let replyP = document.createElement("p");
      replyP.classList.add("replay");
      replyP.innerText = "Adding item to cart...";
      texts.appendChild(replyP);
      console.log("Item added to cart");
    }
    // Extend this function to handle more cart commands, like "remove from cart" or "view cart"
  }
}
