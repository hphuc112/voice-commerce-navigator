// === Voice Navigation on Products Page ===
const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");
const texts = document.querySelector(".texts"); // optional feedback

// Polyfill for cross-browser support
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  toggleVoiceBtn.disabled = true;
  toggleVoiceBtn.textContent = "Voice Not Supported";
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;

  let isListening = false;

  // Start/stop toggle
  toggleVoiceBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  recognition.addEventListener("start", () => {
    isListening = true;
    toggleVoiceBtn.textContent = "Turn Off Voice";
  });

  recognition.addEventListener("end", () => {
    isListening = false;
    toggleVoiceBtn.textContent = "Turn On Voice";
    // auto-restart only if user still wants it
    if (isListening) recognition.start();
  });

  recognition.addEventListener("result", (e) => {
    // build transcript
    const transcript = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join("")
      .trim()
      .toLowerCase();

    // optional UI feedback
    if (texts) {
      texts.innerHTML = `<p>${transcript}</p>`;
    }

    // only act on final result
    if (e.results[e.results.length - 1].isFinal) {
      if (transcript.includes("home")) {
        recognition.stop(); // stop before navigating
        window.location.href = "index.html";
      } else if (transcript.includes("cart")) {
        recognition.stop();
        window.location.href = "cart.html";
      }
    }
  });
}

// === Product Grid Generation ===
fetch("./backend/products.json") // ① Adjust path to match your folder structure :contentReference[oaicite:3]{index=3}
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((products) => {
    const productList = document.getElementById("productList");

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-item";

      // — Image Wrapper + <img> —
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "product-img-wrapper";

      const img = new Image(); // same as document.createElement('img') :contentReference[oaicite:4]{index=4}
      img.className = "product-img";
      img.src = product.image; // ② Use JSON’s image path directly :contentReference[oaicite:5]{index=5}
      img.alt = product.name; // good alt text for accessibility :contentReference[oaicite:6]{index=6}

      imgWrapper.appendChild(img);
      card.appendChild(imgWrapper);

      // — Name & Price —
      const nameEl = document.createElement("h3");
      nameEl.className = "product-name";
      nameEl.textContent = product.name;
      card.appendChild(nameEl);

      const priceEl = document.createElement("p");
      priceEl.className = "product-price";
      priceEl.textContent = `$${(product.priceCents / 100).toFixed(2)}`;
      card.appendChild(priceEl);

      // — Quantity & Add to Cart —
      const controls = document.createElement("div");
      controls.className = "product-controls";

      const select = document.createElement("select");
      select.className = "quantity-select";
      [1, 2, 3, 4, 5].forEach((n) => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n;
        select.appendChild(opt);
      });
      controls.appendChild(select);

      const btn = document.createElement("button");
      btn.className = "add-to-cart";
      btn.textContent = "Add to Cart";
      btn.addEventListener("click", (e) =>
        addToCart(product.id, +select.value, product, e)
      );
      controls.appendChild(btn);

      card.appendChild(controls);

      productList.appendChild(card);
    });

    // Initialize search now that products exist in the DOM
    initSearch();
  })
  .catch((err) => console.error("Error loading products:", err));

// === Enhanced Search Function ===
function initSearch(products) {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();

    document.querySelectorAll(".product-item").forEach((card) => {
      const searchContent = [
        card.dataset.keywords,
        card.querySelector(".product-name").textContent,
      ]
        .join(" ")
        .toLowerCase();

      card.style.display = searchContent.includes(term) ? "" : "none";
    });
  });
}

// === Cart Count Logic ===
const cartCountElement = document.getElementById("cartCount");
// Read initial count (default 0)
let cartCount = parseInt(localStorage.getItem("cartCount"), 10) || 0;
updateCartCount(cartCount);

function updateCartCount(count) {
  cartCount = count;
  localStorage.setItem("cartCount", cartCount);
  cartCountElement.textContent = cartCount;
}

// Listen for external changes to cartCount (from other pages/tabs)
window.addEventListener("storage", (e) => {
  if (e.key === "cartCount") {
    updateCartCount(parseInt(e.newValue, 10) || 0);
  }
});

// === Updated Add to Cart Function ===
function addToCart(productId, quantity, product, event) {
  // 1. Update the cart count
  updateCartCount(cartCount + quantity);

  // 2. Read existing cartItems or start fresh
  const storageKey = "cartItems";
  const existing = JSON.parse(localStorage.getItem(storageKey)) || [];

  // 3. Find existing item index
  const idx = existing.findIndex((item) => item.id === productId);

  if (idx > -1) {
    existing[idx].quantity += quantity;
  } else {
    existing.push({
      id: productId,
      name: product.name,
      image: product.image,
      price: product.priceCents / 100, // Store as dollars
      quantity: quantity,
    });
  }

  // 4. Save back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(existing));
}

// -------- Search with exactly word -----------
// 1. Helper to escape regex metacharacters in the search term
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape special chars :contentReference[oaicite:6]{index=6}
}

// 2. Grab the search input (ensure it has id="searchInput")
const searchInput = document.getElementById("searchInput");

// 3. Listen for input events
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    // If empty, show all products
    document.querySelectorAll(".product-item").forEach((card) => {
      card.style.display = "";
    });
    return;
  }

  // 4. Create a word-boundary regex: \bterm\b
  const escapedTerm = escapeRegex(term);
  const regex = new RegExp(`\\b${escapedTerm}\\b`, "i"); // i = case-insensitive :contentReference[oaicite:7]{index=7}

  // 5. Filter products
  document.querySelectorAll(".product-item").forEach((card) => {
    const name = card.querySelector(".product-name").textContent;
    // Show only if name tests true
    card.style.display = regex.test(name) ? "" : "none";
  });
});

window.addEventListener("storage", (e) => {
  if (e.key === "cartItems" || e.key === "cartCount") {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
    updateCartCount(newCount);
  }
});
