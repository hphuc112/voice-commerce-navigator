// Debug check
console.log("Voice control script loaded"); // Confirm script load

// 1. UI references
const texts = document.querySelector(".texts"); // Transcript output container :contentReference[oaicite:5]{index=5}
const toggleVoiceBtn = document.getElementById("toggleVoiceBtn"); // Start/stop button

// 2. Initialize Web Speech API
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  texts.innerHTML = "<p>Your browser does not support Speech Recognition.</p>";
  toggleVoiceBtn.disabled = true; // Disable toggle if unsupported
} else {
  const recognition = new SpeechRecognition(); // Create recognizer
  recognition.interimResults = true; // Allow interim results
  recognition.continuous = true; // Keep listening until stopped

  let isListening = false; // Mic state
  let lastCommand = ""; // Debounce storage
  let debounceTimer; // Debounce timeout ID

  // 3. Start/Stop functions
  function startRecognition() {
    recognition.start(); // Begin listening :contentReference[oaicite:10]{index=10}
    isListening = true;
    toggleVoiceBtn.textContent = "Turn Off Voice";
    console.log("Recognition started");
  }
  function stopRecognition() {
    recognition.stop(); // Cease listening :contentReference[oaicite:11]{index=11}
    isListening = false;
    toggleVoiceBtn.textContent = "Turn On Voice";
    console.log("Recognition stopped");
  }

  toggleVoiceBtn.addEventListener("click", () => {
    // Wire up toggle
    isListening ? stopRecognition() : startRecognition();
  });

  // 4. Handle recognition results
  // recognition.addEventListener("result", (e) => {
  //   const transcript = Array.from(e.results)
  //     .map((r) => r[0].transcript)
  //     .join("")
  //     .trim(); // Build full transcript

  //   texts.innerHTML = ""; // Clear previous text
  //   const p = document.createElement("p");
  //   p.textContent = transcript;
  //   texts.appendChild(p); // Display current transcript

  //   // Act only on final results and new commands
  //   if (e.results[e.results.length - 1].isFinal && transcript !== lastCommand) {
  //     lastCommand = transcript;
  //     console.log("Final command:", transcript);

  //     const cmd = transcript.toLowerCase();

  //     // 5. Navigation: “show products”
  //     if (isProductCommand(cmd)) {
  //       stopRecognition();
  //       const reply = document.createElement("p");
  //       reply.className = "replay";
  //       reply.textContent = "Opening products page...";
  //       texts.appendChild(reply);
  //       console.log("Navigating to products.html");
  //       window.location.href = "products.html";
  //     }

  //     // Debounce reset after 1s
  //     clearTimeout(debounceTimer);
  //     debounceTimer = setTimeout(() => {
  //       lastCommand = "";
  //     }, 1000); // Prevent immediate repeats
  //   }
  // });
  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join("")
      .trim();

    texts.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = transcript;
    texts.appendChild(p);

    if (e.results[e.results.length - 1].isFinal && transcript !== lastCommand) {
      lastCommand = transcript;
      console.log("Final command:", transcript);

      // Process all navigation commands
      if (!isNavigationCommand(transcript.toLowerCase())) {
        // Process other non-navigation commands here
        if (transcript.toLowerCase().includes("add to cart")) {
          processCartVoiceCommand(transcript);
        }
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        lastCommand = "";
      }, 1000);
    }
  });
  function isProductCommand(text) {
    const productTriggers = [
      // Exact matches
      "show products",
      "open products",
      "products",
      "product page",

      // New natural language variations
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

    // Check both exact and partial matches
    return productTriggers.some(
      (trigger) =>
        text === trigger || // Exact match
        text.includes(trigger) || // Partial match
        trigger.includes(text) // Even if user says just "products"
    );
  }
  function isNavigationCommand(text) {
    return isProductCommand(text) || isCartCommand(text) || isHomeCommand(text);
  }
  function isProductCommand(text) {
    const triggers = [
      // Exact matches
      "show products",
      "open products",
      "products",
      "product page",
      // Natural variations
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
      // Exact matches
      "cart",
      "my cart",
      "view cart",
      "open cart",
      "shopping cart",
      // Natural variations
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
      // Exact matches
      "home",
      "main page",
      "go home",
      "index",
      // Natural variations
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
      window.location.href = targetUrl;
      return true;
    }
    return false;
  }

  // 6. Auto-restart recognition if still listening
  recognition.addEventListener("end", () => {
    if (isListening) recognition.start(); // Resume on end
  });
}
