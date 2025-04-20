// Grab the <span id="cartCount">
const countEl = document.getElementById("cartCount");

// Load the cart count from localStorage (default to 0)
let cartCount = parseInt(localStorage.getItem("cartCount")) || 0;

// Display it
countEl.textContent = cartCount;

// (Optional) If you plan to allow modifying the cart on this page,
// you can expose a function to update:
// function updateCart(newCount) {
//   cartCount = newCount;
//   localStorage.setItem("cartCount", cartCount);
//   countEl.textContent = cartCount;
// }
