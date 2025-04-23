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

// === Manage cartItems in localStorage ===
function addToCart(productId, quantity, event) {
  // 1. Update the cart count
  updateCartCount(cartCount + quantity);

  // 2. Read existing cartItems or start fresh
  const storageKey = "cartItems";
  const existing = JSON.parse(localStorage.getItem(storageKey)) || [];

  // 3. Gather product data
  const image = productImages[productId];
  const card = event.currentTarget.closest(".product-item");
  const name = card.querySelector(".product-name").textContent;
  const priceText = card.querySelector(".product-price").textContent;
  const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

  // 4. Add or update the item in cartItems
  const idx = existing.findIndex((item) => item.id === productId);
  if (idx > -1) {
    existing[idx].quantity += quantity;
  } else {
    existing.push({ id: productId, name, image, price, quantity });
  }

  // 5. Save back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(existing));
}

// === Product Grid Generation ===
const productImages = [
  "kitchen-paper-towels-30-pack.jpg",
  "countertop-blender-64-oz.jpg",
  "double-elongated-twist-french-wire-earrings.webp",
  "men-navigator-sunglasses-brown.jpg",
  "round-sunglasses-black.jpg",
  "non-stick-cooking-set-15-pieces.webp",
  "women-knit-ballet-flat-black.jpg",
  "6-piece-non-stick-baking-set.webp",
  "cotton-bath-towels-teal.webp",
  "6-piece-white-dinner-plate-set.jpg",
  "knit-athletic-sneakers-pink.webp",
  "women-beach-sandals.jpg",
  "blackout-curtain-set-beige.webp",
  "sky-flower-stud-earrings.webp",
  "trash-can-with-foot-pedal-50-liter.jpg",
  "men-chino-pants-beige.jpg",
  "electric-glass-and-steel-hot-water-kettle.webp",
  "women-chiffon-beachwear-coverup-black.jpg",
  "straw-sunhat.webp",
  "duvet-cover-set-blue-twin.jpg",
  "facial-tissue-2-ply-18-boxes.jpg",
  "men-golf-polo-t-shirt-blue.jpg",
  "men-slim-fit-summer-shorts-gray.jpg",
  "knit-athletic-sneakers-gray.jpg",
  "bathroom-rug.jpg",
  "floral-mixing-bowl-set.jpg",
  "women-french-terry-fleece-jogger-camo.jpg",
  "plain-hooded-fleece-sweatshirt-yellow.jpg",
  "round-airtight-food-storage-containers.jpg",
  "vanity-mirror-silver.jpg",
  "coffeemaker-with-glass-carafe-black.jpg",
  "black-2-slot-toaster.jpg",
  "liquid-laundry-detergent-plain.jpg",
  "women-chunky-beanie-gray.webp",
  "men-cozy-fleece-zip-up-hoodie-red.jpg",
  "blackout-curtains-black.jpg",
  "men-athletic-shoes-green.jpg",
  "adults-plain-cotton-tshirt-2-pack-teal.jpg",
  "athletic-cotton-socks-6-pairs.jpg",
  "umbrella.jpg",
  "luxury-tower-set-6-piece.jpg",
  "women-stretch-popover-hoodie-black.jpg",
  "backpack.jpg",
  "intermediate-composite-basketball.jpg",
];

const productList = document.getElementById("productList");

productImages.forEach((filename, idx) => {
  // 1) Card container
  const card = document.createElement("div");
  card.className = "product-item";

  // 2) Image wrapper + img
  const imgWrapper = document.createElement("div");
  imgWrapper.className = "product-img-wrapper";

  const img = new Image();
  img.className = "product-img";
  img.src = `assets/products/${filename}`;
  img.alt = filename
    .replace(/[-.]\w+$/, "")
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  imgWrapper.appendChild(img);
  card.appendChild(imgWrapper);

  // 3) Name & Price
  const nameEl = document.createElement("h3");
  nameEl.className = "product-name";
  nameEl.textContent = img.alt;
  card.appendChild(nameEl);

  const priceEl = document.createElement("p");
  priceEl.className = "product-price";
  priceEl.textContent = "$20"; // replace with real price
  card.appendChild(priceEl);

  // 4) Controls wrapper
  const controls = document.createElement("div");
  controls.className = "product-controls";

  const select = document.createElement("select");
  select.className = "quantity-select";
  [1, 2, 3, 4, 5].forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = `${n}`;
    select.appendChild(opt);
  });
  controls.appendChild(select);

  const btn = document.createElement("button");
  btn.className = "add-to-cart";
  btn.textContent = "Add to Cart";
  btn.addEventListener("click", (e) => addToCart(idx, +select.value, e));
  controls.appendChild(btn);

  card.appendChild(controls);

  // 5) Append card to grid
  productList.appendChild(card);
});

// ------ Simple search -------
// // 1. Grab the search field
// const searchInput = document.getElementById("searchInput");

// // 2. Listen for user input
// searchInput.addEventListener("input", () => {
//   const term = searchInput.value.toLowerCase(); // normalize case :contentReference[oaicite:0]{index=0}

//   // 3. For each product card, check name and toggle visibility
//   document.querySelectorAll(".product-item").forEach((card) => {
//     const name = card.querySelector(".product-name").textContent.toLowerCase();
//     card.style.display = name.includes(term) ? "" : "none"; // show/hide :contentReference[oaicite:1]{index=1}
//   });
// });

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
