window.document.addEventListener("DOMContentLoaded", () => {
  const api = "https://6973a4f4b5f46f8b5827ea6b.mockapi.io/nbk-bazar";
  const categoryEl = document.getElementById("categoryFilter");
  const productAreaEl = document.querySelector(".product-details-area");
  const cartBadge = document.querySelector(".cart-badge");
  const addTocart = document.querySelector(".add-to-cart");
  const cartDiplayWrapper = document.querySelector(".cart-items-list");
  const checkoutBtn = document.getElementById("checkout");
  const cartTotalUI = document.getElementById("cartTotal");
  const toastBox = document.getElementById("toast");

  let cartItems = JSON.parse(localStorage.getItem("userCart")) || [];
  const param = new URLSearchParams(window.location.search);
  const productID = param.get("id");
  let product = null;
  let toastTimer;

  async function init() {
    await getProduct();
    displayProduct();
  }
  init();

  // Fetch product
  async function getProduct() {
    try {
      productAreaEl.innerHTML = "Producet Loading ....";
      const res = await fetch(`${api}/${productID}`);
      if (!res.ok) {
        throw new Error("Something Wrong !");
      }
      const data = await res.json();

      product = data;
    } catch (error) {
      console.log("Error == " + error.message);
    }
  }

  // Display Product Details
  function displayProduct() {
    productAreaEl.innerHTML = `
              <div class="col-md-6">
            <div class="product-image">
              <img src="${product.image}" alt="" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="product-info">
              <h3 class="mb-3">${product.name}</h3>
              <h5 class="mb-2">
                Price: <span class="text-primary"> ${
                  product.newPrice > 0
                    ? `<span class="text-decoration-line-through text-danger ">${product.price}</span> ${product.newPrice} Tk`
                    : `${product.price} Tk`
                } ৳ </span>
              </h5>
              <div class="product-details">
                <p class="mb-1">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Temporibus aliquid laborum voluptate corporis sequi saepe et
                  iste tenetur molestias soluta, voluptates placeat fugit nam
                  iure obcaecati ipsa delectus, rem sit!
                </p>
                <ul class="list-unstyled">
                  <li>Lorem ipsum sit amet.</li>
                  <li>Lorem ipsum dolor sit amet.</li>
                  <li>Lorem sit amet.</li>
                  <li>Lorem ipsumor sit amet.</li>
                </ul>
              </div>
            </div>
          </div>
    `;
  }

  addTocart.addEventListener("click", (e) => {
    let productInCart = cartItems.find((p) => p.id == product.id);
    if (productInCart) {
      let productInCartIndex = cartItems.findIndex(
        (p) => p.id == productInCart.id,
      );
      cartItems.splice(productInCartIndex, 1);
      productInCart.quantity += 1;
      cartItems.unshift(productInCart);
    } else {
      product.quantity = 1;
      cartItems.unshift(product);
    }
    localStorage.setItem("userCart", JSON.stringify(cartItems));
    cartIconAnim.restart();
    displayCartItems();

    toast(`<img class="" src="${product.image}" width="60px" alt="">
               Added to cart. <br>
              ${product.name} 
            `);
  });

  document.querySelector(".cart-items-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("cart-item-remove")) {
      const itemId = e.target.closest(".cart-item").dataset.id;
      cartItems = cartItems.filter((p) => p.id != itemId);
      localStorage.setItem("userCart", JSON.stringify(cartItems));
      displayCartItems();
      toast("Item Removed from cart");
    }
  });

  // Display Cart Items
  async function displayCartItems() {
    let cartHtml = cartItems
      .map((p) => {
        let price = p.newPrice > 0 ? p.newPrice : p.price;
        return `
     <li data-id="${p.id}" class="cart-item row align-items-center">
      <div class="col-md-2">
        <img src="${p.image}" class="cart-item-img" alt="product" />
      </div>
      <div class="col-md-4">
        <span class="cart-item-name text-success fw-bold" ">${p.name}</span>
      </div>
      <div class="col-md-2 p-0">
          Q:
          <input
            class="quantity-input"
            data-id="${p.id}"
            style="width:45px; background: none; border: none; padding: 5px"
            min="1"
            max="99"
            value="${p.quantity}"
            type="number"
          />
      </div>
      <div class="col-md-4 d-flex  justify-content-between ">
        <span class="fw-bold cart-item-price">${p.quantity * price} /= </span>
        <button class="cart-item-remove  btn btn-close"></button>
      </div>
    </li>
      `;
      })
      .join("");

    cartDiplayWrapper.innerHTML = cartHtml;
    cartBadge.innerText = cartItems.length;
    cartTotalUI.innerText = cartTotal(cartItems);
  }
  displayCartItems();

  categoryEl.addEventListener("change", function (e) {
    const selectedValue = this.value;
    window.location.href = `index.html?category=${selectedValue}`;
  });

  // Update cart Item quantity
  document.querySelector(".cart-items-list").addEventListener("change", (e) => {
    if (e.target.classList.contains("quantity-input")) {
      let itemId = e.target.dataset.id;
      let newQuantity = Number(e.target.value);
      cartItems = cartItems.map((p) =>
        p.id == itemId ? { ...p, quantity: newQuantity } : p,
      );
      localStorage.setItem("userCart", JSON.stringify(cartItems));
      displayCartItems();
    }
  });

  // Cart Total
  function cartTotal(items) {
    let total = items.reduce((acc, p) => {
      p.newPrice
        ? (acc += Number(p.newPrice) * p.quantity)
        : (acc += Number(p.price) * p.quantity);
      return acc;
    }, 0);
    return total;
  }

  checkoutBtn.addEventListener("click", (e) => {
    if (cartItems.length > 0) {
      window.location.href = "checkout.html";
    } else {
      Swal.fire({
        title: "Empty Cart!",
        text: "You must add at least one item to your cart before proceeding to checkout.",
        icon: "warning",
        width: "400px",
      });
    }
  });

  function toast(msg) {
    clearTimeout(toastTimer);
    toastBox.classList.remove("show");
    toastBox.innerHTML = msg;
    setTimeout(() => {
      toastBox.classList.add("show");
    }, 10);
    toastTimer = setTimeout(() => {
      toastBox.classList.remove("show");
    }, 4000);
  }

  cartBadge.textContent = cartItems.length;

  //=======GSAP Animation ======
  let cartIconAnim = gsap.to(".fa-cart-shopping", {
    scale: 1.5,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    paused: true,
    ease: "power1.inOut",
  });
}); // Last Line
