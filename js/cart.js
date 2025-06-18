// js/cart.js

const STORAGE_KEY = "cartItems";

// Utility to read/write cart
function getCartItems() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function setCartItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// DOM containers
const itemsContainer = document.querySelector(".cart-items");
const summaryContainer = document.querySelector(".cart-summary");

// Main render function
function renderCart() {
  const cartItems = getCartItems();
  itemsContainer.innerHTML = "";
  summaryContainer.innerHTML = "";

  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `<p class="empty">Your cart is empty.</p>`;
    summaryContainer.innerHTML = `<p class="empty">Add items to your cart to see summary.</p>`;
    // Sync cartCount = 0
    // updateCartCountInStorage(0);
    localStorage.setItem("cartCount", 0);
    return;
  }

  // ——— Render each cart item ———
  cartItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    // Image
    const img = new Image();
    img.className = "cart-item-img";
    img.src = item.image; // JSON already holds "assets/products/…"
    img.alt = item.name;

    // Details
    const details = document.createElement("div");
    details.className = "cart-item-details";
    details.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-price">$${(item.price * item.quantity).toFixed(
        2
      )}</div>
    `;

    // Actions: decrease, qty display, increase, delete
    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const btnDec = document.createElement("button");
    btnDec.className = "qty-btn decrease";
    btnDec.textContent = "−";
    btnDec.addEventListener("click", () => changeQuantity(item.id, -1));

    const qtySpan = document.createElement("span");
    qtySpan.className = "item-qty";
    qtySpan.textContent = item.quantity;

    const btnInc = document.createElement("button");
    btnInc.className = "qty-btn increase";
    btnInc.textContent = "+";
    btnInc.addEventListener("click", () => changeQuantity(item.id, +1));

    const btnDel = document.createElement("button");
    btnDel.className = "delete-btn";
    btnDel.textContent = "Delete";
    btnDel.addEventListener("click", () => removeItem(item.id));

    actions.append(btnDec, qtySpan, btnInc, btnDel);

    row.append(img, details, actions);
    itemsContainer.appendChild(row);
  });

  // ——— Render summary ———
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);

  summaryContainer.innerHTML = `
    <h3>Order Summary</h3>
    <div>Total Items: <strong>${totalQty}</strong></div>
    <div class="total">Total Price: $${totalPrice}</div>
    <button class="clear-cart-btn">Clear Cart</button>
    <button class="proceed-button">Proceed to Checkout</button>
  `;

  // Hook up clear cart button
  summaryContainer
    .querySelector(".clear-cart-btn")
    .addEventListener("click", clearCart);

  // Hook up proceed to checkout button
  summaryContainer
    .querySelector(".proceed-button")
    .addEventListener("click", proceedToCheckout);
}

// Increase or decrease quantity (delta = ±1)
function changeQuantity(productId, delta) {
  const items = getCartItems();
  const idx = items.findIndex((i) => i.id === productId);
  if (idx === -1) return;

  items[idx].quantity += delta;
  if (items[idx].quantity < 1) {
    // Remove if goes below 1
    items.splice(idx, 1);
  }
  setCartItems(items);
  updateCartCount();
  renderCart();
}

// Remove an item entirely
function removeItem(productId) {
  let items = getCartItems();
  items = items.filter((i) => i.id !== productId);
  setCartItems(items);
  updateCartCount();
  renderCart();
}

// Clear the whole cart
function clearCart() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem("cartCount", 0);
  renderCart();
}

// Initial render
document.addEventListener("DOMContentLoaded", renderCart);

function updateCartCount() {
  const cartItems = getCartItems();
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  localStorage.setItem("cartCount", totalQty);
}

// Add this new function here:
function proceedToCheckout() {
  const cartItems = getCartItems();
  if (cartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  // Redirect to checkout page
  window.location.href = "checkout.html";
}
