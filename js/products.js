// === Cart Count Logic ===
const cartCountElement = document.getElementById("cartCount");
let cartCount = parseInt(localStorage.getItem("cartCount")) || 0;
updateCartCount(cartCount);

function updateCartCount(count) {
  cartCount = count;
  localStorage.setItem("cartCount", cartCount);
  cartCountElement.textContent = cartCount;
}

// Called when "Add to Cart" clicked
function addToCart(productId, quantity, event) {
  // event.currentTarget is the clicked button
  updateCartCount(cartCount + quantity);
  // e.g. show toast/alert here if desired
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
    .replace(/[-.]\w+$/, "") // strip extension
    .split("-")
    .join(" ") // hyphens → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case

  imgWrapper.appendChild(img);
  card.appendChild(imgWrapper);

  // 3) Name & Price
  const nameEl = document.createElement("h3");
  nameEl.className = "product-name";
  nameEl.textContent = img.alt;
  card.appendChild(nameEl);

  const priceEl = document.createElement("p");
  priceEl.className = "product-price";
  priceEl.textContent = "$0.00"; // replace with real price
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
