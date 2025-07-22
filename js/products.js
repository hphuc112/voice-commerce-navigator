// Voice Navigation + Voice Commerce on Products Page
const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");
const texts = document.querySelector(".texts"); // optional feedback
const searchInput = document.getElementById("searchInput");
const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  // six: 6,
  // seven: 7,
  // eight: 8,
  // nine: 9,
  // ten: 10,
};

function parseSpokenNumber(input) {
  // Convert "three" to 3 or keep numeric value
  return numberWords[input.toLowerCase()] || parseInt(input, 10);
}

// Setup SpeechRecognition
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  toggleVoiceBtn.disabled = true;
  toggleVoiceBtn.textContent = "Voice Unsupported";
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;

  let isListening = false;
  let lastCommand = "";
  let debounceTimer;

  // Start/Stop toggle
  toggleVoiceBtn.addEventListener("click", () => {
    if (isListening) recognition.stop();
    else recognition.start();
  });

  recognition.addEventListener("start", () => {
    isListening = true;
    toggleVoiceBtn.textContent = "Turn Off Voice";
  });
  recognition.addEventListener("end", () => {
    isListening = false;
    toggleVoiceBtn.textContent = "Turn On Voice";
    // If you want auto-restart, uncomment:
    // if (isListening) recognition.start();
  });

  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join("")
      .trim();

    // Show what we heard
    if (texts) {
      texts.innerHTML = `<p>${transcript}</p>`;

      // NEW: Clear command
      if (lastCommand === "clear") {
        if (texts) texts.innerHTML = "";
        return;
      }
    }

    // Only on final, and avoid repeats
    if (e.results[e.results.length - 1].isFinal && transcript !== lastCommand) {
      lastCommand = transcript.toLowerCase();

      // 1. Navigation
      if (lastCommand.includes("home")) {
        recognition.stop();
        window.location.href = "index.html";
        return;
      }
      if (lastCommand.includes("cart")) {
        recognition.stop();
        window.location.href = "cart.html";
        return;
      }

      // 2. Search: "search for <term>"
      const searchMatch = lastCommand.match(/^search for (.+)$/);
      if (searchMatch) {
        const term = searchMatch[1];
        searchInput.value = term;
        searchInput.dispatchEvent(new Event("input")); // trigger your filter
        if (texts) texts.innerHTML += `<p>Filtering for "${term}"</p>`;
        return;
      }

      // NEW: A1Q1 style commands
      const aqMatch = lastCommand.match(
        /^(?:a|add)\s*(\d+)\s*(?:q|quantity)?\s*(\d+)$/i
      );
      if (aqMatch) {
        const productNumber = parseInt(aqMatch[1], 10);
        const qty = parseInt(aqMatch[2], 10) || 1;

        // Get all visible products
        const cards = Array.from(
          document.querySelectorAll(
            ".product-item:not([style*='display: none'])"
          )
        );

        const card = cards[productNumber - 1];

        if (card && qty >= 1 && qty <= 5) {
          const productId = card.dataset.productId;
          const select = card.querySelector(".quantity-select");
          select.value = qty;

          const product = {
            id: productId,
            name: card.querySelector(".product-name").textContent,
            image: card.querySelector("img").src,
            priceCents:
              parseFloat(
                card
                  .querySelector(".product-price")
                  .textContent.replace("$", "")
              ) * 100,
          };

          addToCart(productId, qty, product);

          if (texts) {
            texts.innerHTML += `<p>Added ${qty} × Product ${productNumber}</p>`;
          }
        } else {
          const totalProducts = cards.length;
          if (texts) {
            texts.innerHTML += `<p>Product ${productNumber} not found or Invalid quantities</p>`;
          }
        }
        return;
      }

      // 3. Add to cart: "add <product name> quantity <n>"
      //    Or just "add <product name>"

      const addMatch = lastCommand.match(
        /^adding product number (?:(\d+)|(one|two|three|four|five|six|seven|eight|nine|ten))(?:(?: quantity (?:(\d+)|(one|two|three|four|five))))?$/i
      );

      // 2. Create number word to digit mapper
      const numberWords = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
      };

      // Case-insensitive
      if (addMatch) {
        // Extract product number (either digit or word)
        const productNumberInput = addMatch[1] || addMatch[2];
        const productNumber =
          numberWords[productNumberInput.toLowerCase()] ||
          parseInt(productNumberInput, 10);

        // Extract quantity (default to 1)
        const qtyInput = addMatch[3] || addMatch[4];
        const qty = qtyInput
          ? numberWords[qtyInput.toLowerCase()] || parseInt(qtyInput, 10)
          : 1;
        // Get all visible products (including filtered ones)
        const cards = Array.from(
          document.querySelectorAll(
            ".product-item:not([style*='display: none'])"
          )
        );

        // Find product by visible index
        const card = cards[productNumber - 1]; // Convert to 0-based index

        if (card && qty >= 1 && qty <= 5) {
          const productId = card.dataset.productId;
          const select = card.querySelector(".quantity-select");
          select.value = qty;

          // Get product data from card
          const product = {
            id: productId,
            name: card.querySelector(".product-name").textContent,
            image: card.querySelector("img").src,
            priceCents:
              parseFloat(
                card
                  .querySelector(".product-price")
                  .textContent.replace("$", "")
              ) * 100,
          };

          // Add to cart
          addToCart(productId, qty, product);

          // Visual feedback
          card.classList.add("cart-pulse");
          setTimeout(() => card.classList.remove("cart-pulse"), 2000);

          if (texts)
            texts.innerHTML += `<p>Added ${qty} × Product ${productNumber}</p>`;
        } else {
          const totalProducts = cards.length;
          if (texts)
            texts.innerHTML += `<p>Product ${productNumber} not found or Invalid quantities</p>`;
        }
        return;
      }

      // Reset debounce
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => (lastCommand = ""), 1000);
    }
  });
}

// === Product Grid Generation ===
fetch("./backend/products.json") // ① Adjust path to match your folder structure
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((products) => {
    const productList = document.getElementById("productList");
    // Clear existing products
    productList.innerHTML = "";

    products.forEach((product, index) => {
      const card = document.createElement("div");
      card.className = "product-item";
      card.dataset.productId = product.id;
      card.dataset.visibleIndex = index + 1; // Track visible position

      // Number badge
      const numberBadge = document.createElement("div");
      numberBadge.className = "product-number";
      numberBadge.textContent = index + 1; // Show 1-based index
      card.appendChild(numberBadge);

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
function addToCart(productId, quantity, product) {
  // Remove event parameter since we're calling directly
  updateCartCount(cartCount + quantity);

  const storageKey = "cartItems";
  const existing = JSON.parse(localStorage.getItem(storageKey)) || [];

  const idx = existing.findIndex((item) => item.id === productId);

  if (idx > -1) {
    existing[idx].quantity += quantity;
  } else {
    existing.push({
      id: productId,
      name: product.name,
      image: product.image,
      price: product.priceCents / 100,
      quantity: quantity,
    });
  }

  localStorage.setItem(storageKey, JSON.stringify(existing));

  // Visual feedback
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  if (card) {
    card.classList.add("added-to-cart");
    setTimeout(() => card.classList.remove("added-to-cart"), 1000);
  }
}

// -------- Search with exactly word -----------
// 1. Helper to escape regex metacharacters in the search term
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape special chars :contentReference[oaicite:6]{index=6}
}

window.addEventListener("storage", (e) => {
  if (e.key === "cartItems" || e.key === "cartCount") {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
    updateCartCount(newCount);
  }
});
