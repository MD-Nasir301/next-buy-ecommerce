window.addEventListener("DOMContentLoaded", () => {
  let api_url = "https://6973a4f4b5f46f8b5827ea6b.mockapi.io/nbk-bazar";

  const cartDiplayWrapper = document.querySelector(".cart-items-list");
  const productDisplayArea = document.querySelector(".product-container");
  const cartBadgeUI = document.getElementById("cartBadge");
  const cartTotalUI = document.getElementById("cartTotal");
  const productForm = document.getElementById("productForm");
  const formArea = document.getElementById("form-area");
  const nameInput = document.getElementById("product-name");
  const priceInput = document.getElementById("product-price");
  const discountInput = document.getElementById("product-discount");
  const categoryInput = document.getElementById("product-category");
  const stockInput = document.getElementById("product-stock");
  const sizeInput = document.getElementById("product-size");
  const imageInput = document.getElementById("product-image");
  const submitBtn = document.getElementById("submit");
  const cancelBtn = document.getElementById("cancel");
  const toastBox = document.getElementById("toast");

  let allProducts = [];
  let filteredArr = [];
  let cartItems = JSON.parse(localStorage.getItem("userCart") || "[]");
  let editId = null;
  let toastTimer;
  let allCardElements = [];

  async function init() {
    await getAllProducts();
    syncCart();
  }
  init();

  // Get all products from API after page load -----------------------------------***
  async function getAllProducts() {
    try {
      showSkeletons();
      const res = await fetch(api_url);
      const products = await res.json();
      allProducts = products;
      filteredArr = products;

      displayProducts(allProducts);
      gsap.fromTo(
        ".card-area",
        {
          x: 20,
          duration: 0.3,
          ease: "linear",
          opacity: 1,
          stagger: 0.1,
        },
        {
          x: 0,
          duration: 0.3,
          ease: "linear",
          stagger: 0.2,
        },
      );
    } catch (error) {
      console.log(error.message);
    }
  }
  // Get "Form_Data" and send to add new product and edit product to API -----------------------------------***
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.setAttribute("disabled", true);
    const formData = new FormData(productForm);
    const data = Object.fromEntries(formData);
    data.createdAt = new Date().toISOString();

    try {
      const responseData = await uploadProduct(data);
      let filterArrIndex = filteredArr.findIndex(
        (p) => p.id == editId,
      );

      if (editId) {
        let editIndex = allProducts.findIndex((p) => p.id == editId);
        allProducts[editIndex] = responseData;
        filteredArr[filterArrIndex] = responseData;
        productForm.reset();
        syncCart();
        //setTimeout(() => displayCartItems(), 5000);
      } else {
        allProducts.push(responseData);
      }

      const currentCategory = document.getElementById("categoryFilter").value;
      if (currentCategory == "all" || currentCategory === "") {
        filteredArr = [...allProducts];
        displayProducts(allProducts);
      } else if (
        currentCategory.toLowerCase() === data.category.toLowerCase()
      ) {
        !editId
          ? filteredArr.push(responseData)
          : (filteredArr[filterArrIndex] = responseData);
        displayProducts(filteredArr);
      }

      clearForm();
      submitBtn.removeAttribute("disabled");
    } catch (error) {
      console.log(error.message);
    }
  });

  // Add new product or update to API -----------------------------------***
  async function uploadProduct(data) {
    try {
      const res = await fetch(editId ? `${api_url}/${editId}` : api_url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to upload product====");
      }
      const responseData = await res.json();
      !editId
        ? toast(`<p style="color:yellow"> Added Successfully </p> 
                    <img style="margin-right: 10px" src="${responseData.image}" width="60px" alt="">
               <i>Category: ${responseData.category}</i>
        `)
        : toast(`<p style="color:yellow"> Update Product </p> 
                    <img style="margin-right: 10px" src="${responseData.image}" width="60px" alt="">
               <i>Name: ${responseData.name}</i>
        `);

      return responseData;
    } catch (error) {
      console.log("uploadProduct error", error.message);
    }
  }

  // Edit data --------------------------------------------***
  productDisplayArea.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit")) {
      const allCards = document.querySelectorAll(".card");
      allCardElements.push(...allCards);
      allCards.forEach((singleCard) => {
        singleCard.classList.remove("shadow");
        singleCard.style.opacity = 0.3;
      });
      card = e.target.closest(".card");
      card.style.boxShadow = "#f94007 3px 5px 30px 6px";
      card.style.opacity = 1;

      const cardId = e.target.closest(".card-area").dataset.id;
      const editProduct = allProducts.find((p) => p.id == cardId);
      const { name, price, discount, category, stock, size, image } =
        editProduct;
      nameInput.value = name;
      priceInput.value = price;
      discountInput.value = discount;
      categoryInput.value = category;
      stockInput.value = stock;
      sizeInput.value = size;
      imageInput.value = image;
      submitBtn.innerText = "Update Product";
      submitBtn.style.background = "blue";
      cancelBtn.style.display = "block";
      formArea.style.background = "skyblue";
      editId = cardId;
    }
  });

  //Item Delete From API and UI ------------------------------------***
  productDisplayArea.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete")) {
      const card = e.target.closest(".card-area");
      const cardId = card.dataset.id;
      const itemData = allProducts.find((p) => p.id == cardId);
      Swal.fire({
        title: "Are you sure to delete this product?",
        html: `<img style="border-radius: 10px" src="${itemData.image}" width="100px" alt=""> <br> <br> <b>${itemData.name}</b> <br> <b>Price: ${itemData.price}</b>`,
        text: "You won't be able to revert this!",
        width: "400px",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Deleting...",
            width: "300px",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          try {
            const res = await fetch(`${api_url}/${cardId}`, {
              method: "DELETE",
            });
            if (res.ok) {
              allProducts = allProducts.filter((p) => p.id != cardId);
              filteredArr = allProducts.filter((p) => p.id != cardId);
              card.remove();
              clearForm();
              allProducts.length == 0 && displayProducts(allProducts);

              let responseData = await res.json();
              toast(`<p style="color:yellow"> Delete Product </p> 
                <img style="margin-right: 10px" src="${responseData.image}" width="60px" alt="">
               Name: <i style="color:red">${responseData.name}</i> <br>
            `);

              Swal.fire({
                title: "Deleted!",
                icon: "success",
                width: "400px",
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
              });
            }
          } catch (error) {
            console.error("Something Wrong", error);
          }
        }
      });
    }
  });

  // Add to Cart --------------------------------------=======================================-----***
  productDisplayArea.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const itemId = e.target.closest(".card-area").dataset.id;

      let selectedProduct = allProducts.find((p) => p.id == itemId);
      let productInCart = cartItems.find((p) => p.id == selectedProduct.id);
      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        selectedProduct.quantity = 1;
        cartItems.push(selectedProduct);
      }
      localStorage.setItem("userCart", JSON.stringify(cartItems));
      displayCartItems();
    }
  });
  document.querySelector(".cart-items-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("cart-item-remove")) {
      const itemId = e.target.closest(".cart-item").dataset.id;
      cartItems = cartItems.filter((p) => p.id != itemId);
      localStorage.setItem("userCart", JSON.stringify(cartItems));
      displayCartItems();
    }
  });

  // Display Add to cart
  async function displayCartItems() {
    let cartHtml = cartItems
      .map((p) => {
        return `
           <li data-id=${p.id} class="cart-item d-flex align-items-center">
            <img
                  src="${p.image}"
                        class="cart-item-img"
                        alt="product"
                      />
                      <div class="cart-item-details d-flex justify-content-between w-100  d-flex">
                        <span class="cart-item-name">${p.name}</span>
                        <span class="fw-bold cart-item-name"> ${p.price} x <input class="quantity-input" data-id="${p.id}" style="width: 45px; background: none; border: none; padding: 5px" min="1" max="99" value="${p.quantity}" type="number"> = </span>
                        <span class="fw-bold cart-item-price">Tk.  ${p.quantity * p.price}</span>
                      </div>
                      <button class="cart-item-remove ms-4 btn btn-close"></button>
                    </li>
      `;
      })
      .join("");

    cartDiplayWrapper.innerHTML = cartHtml;
    cartBadgeUI.innerText = cartItems.length;
    cartTotalUI.innerText = cartTotal(cartItems);
  }
  displayCartItems();

  // Cart Total
  function cartTotal(items) {
    return items.reduce((acc, p) => acc + Number(p.price) * p.quantity, 0);
  }

  function syncCart() {
    cartItems = cartItems.map((item) => {
      const updatedProduct = allProducts.find((p) => p.id == item.id);
      if (updatedProduct) {
        return { ...updatedProduct, quantity: item.quantity };
      }
      return item;
    });
    localStorage.setItem("userCart", JSON.stringify(cartItems));
  }

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

  /**------------------------------------------------------------***
   * Displays all products in the product display area
   * @param {Array} products - An array of product objects @returns {void} - No return **/
  async function displayProducts(products) {
    let html = products
      .map((p) => {
        return `
                <div data-id=${p.id} class="card-area col-md-3">
                <div class="card shadow">
                  <div class="card-img">
                    <img src="${p.image}" alt="" />
                  </div>
                  <div class="card-info p-3">
                    <p class="category"> ${p.category} </p>
                    <h5 class="product-name">
                      ${p.name}
                    </h5>
                    <div class="price-area mb-2 d-flex justify-content-between">
                      <span class="price fw-bold">Price: ${p.price} TK</span>
                      <span
                        ><span class="discount text-danger fw-bold">${p.discount ? "-" + p.discount + "%" : ""}</span
                        ></span
                      >
                    </div>
                    <div class="d-flex justify-content-between flex-wrap mb-1">
                      <div class="instock text-success fw-medium"> ${p.stock > 0 ? "In Stock" : "Out of Stock"} </div>
                      <span class="size text-danger"> ${p.size ? "Size: " + p.size : ""}</span>
                    </div>
                    <div
                      class="d-flex button-area justify-content-between"
                    >
                      <button id="addToCart" class="btn add-to-cart bg-dark-subtle fw-bolder"> Add to cart </button>
                      <button class="btn edit bg-info">
                        <i class="fa-solid edit text-white fa-edit "></i>
                      </button>
                      <button class="btn  delete bg-warning">
                        <i class="fa-solid delete text-danger fa-trash "></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
      `;
      })
      .join("");
    productDisplayArea.innerHTML =
      html.length === 0
        ? `<div class="no-product-found"><p class="mt-3 me-3">
        No Product Found</p><video src="img/sad.mp4" width="100px"
        autoplay muted loop></video>
        </div>`
        : html;
  }

  // Filter products by category -----------------------------------***
  document.getElementById("categoryFilter").addEventListener("change", (e) => {
    const selectedCategory = e.target.value;
    toast(
      `Filtered by <b style="color:yellow">${selectedCategory.toUpperCase()}</b>`,
    );
    if (selectedCategory == "all") {
      filteredArr = [...allProducts];
    } else {
      filteredArr = allProducts.filter(
        (p) => p.category.toLowerCase() == selectedCategory.toLowerCase(),
      );
    }
    displayProducts(filteredArr);
  });

  // Sort Products by date and price -----------------------------------***
  document.getElementById("sort").addEventListener("change", (e) => {
    const selectedOption = e.target.value;
    const copyForSortProducts = [...filteredArr];

    if (selectedOption == "default") {
      displayProducts(filteredArr);
      return;
    }
    if (selectedOption == "newest") {
      const sortedProducts = copyForSortProducts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      displayProducts(sortedProducts);
    }
    if (selectedOption == "oldest") {
      const sortedProducts = copyForSortProducts.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      displayProducts(sortedProducts);
    }
    if (selectedOption == "priceHtoL") {
      const sortedProducts = copyForSortProducts.sort(
        (a, b) => b.price - a.price,
      );
      displayProducts(sortedProducts);
    }
    if (selectedOption == "priceLtoH") {
      const sortedProducts = copyForSortProducts.sort(
        (a, b) => a.price - b.price,
      );
      displayProducts(sortedProducts);
    }
    if (selectedOption == "maxDiscount") {
      const sortedProducts = copyForSortProducts.sort(
        (a, b) => b.discount - a.discount,
      );
      displayProducts(sortedProducts);
    }
  });

  // Search Products -----------------------------------***
  document.getElementById("searchProduct").addEventListener("input", (e) => {
    const searchValue = e.target.value;
    document.getElementById("categoryFilter").value = "all";
    const searchProducts = allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
    displayProducts(searchProducts);
  });
  document.getElementById("searchProduct").addEventListener("click", (e) => {
    toast("Searching across all categories...");
  });

  function clearForm() {
    productForm.reset();
    submitBtn.innerText = "Add Product";
    submitBtn.style.background = "";
    cancelBtn.style.display = "none";
    formArea.style.background = "";
    editId = null;
    allCardElements.forEach((singleCard) => {
      singleCard.classList.add("shadow");
      singleCard.style.opacity = 1;
    });
  }

  function showSkeletons() {
    productDisplayArea.innerHTML = ""; // আগের সব পরিষ্কার করুন
    let skeletonHTML = ""; // সব কোড এখানে জমাবো

    for (let i = 0; i < 8; i++) {
      skeletonHTML += `
      <div class="col-md-3 mb-4">
        <div class="skeleton-card shadow">
          <div class="skeleton-image"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    `;
    }
    productDisplayArea.innerHTML = skeletonHTML; // একবারে সব বসিয়ে দিন
  }

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

  cancelBtn.addEventListener("click", clearForm);

  //====================================
  // gsap animations here

  gsap.from(".logo", {
    scale: 0,
    duration: 1,
    ease: "power4.out",
    scale: 0,
  });
  gsap.from(".fa-cart-shopping", {
    y: "-200%",
    duration: 1,
    ease: "power4.out",
    scale: 0,
  });

  let cardAnimation = gsap.from(".card-area", {
    y: "-200%",
    duration: 2,
    ease: "power4.out",
    scale: 0,
    delay: 0.5,
    stagger: 0.5,
    paused: true,
  });

  //Last Line
});
