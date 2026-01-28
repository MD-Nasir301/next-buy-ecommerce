window.addEventListener("DOMContentLoaded", () => {
  let api_url = "https://6973a4f4b5f46f8b5827ea6b.mockapi.io/nbk-bazar";
  const addTocartBtn = document.getElementById("addToCart");
  const productDisplayArea = document.querySelector(".product-container");
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
  // const noProductFound = document.querySelector(".no-product-found ");

  let allProducts = [];
  let filteredProductsArr = [];
  let cartItems = [];
  let editId = null;
  let toastTimer;

  // Get Form Data and upload to API -----------------------------------***
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const data = Object.fromEntries(formData);
    data.createdAt = new Date().toISOString();
    try {
      const responseData = await uploadProduct(data);
      let editFilteredIndex = filteredProductsArr.findIndex(
        (p) => p.id == editId,
      );
      if (editId) {
        let editIndex = allProducts.findIndex((p) => p.id == editId);
        allProducts[editIndex] = responseData;
        filteredProductsArr[editFilteredIndex] = responseData;
        productForm.reset();
      } else {
        allProducts.push(responseData);
      }
      const currentCategory = document.getElementById("categoryFilter").value;
      if (currentCategory == "all" || currentCategory === "") {
        filteredProductsArr = [...allProducts];
        displayProducts(allProducts);
      } else if (
        currentCategory.toLowerCase() === data.category.toLowerCase()
      ) {
        !editId
          ? filteredProductsArr.push(responseData)
          : (filteredProductsArr[editFilteredIndex] = responseData);
        displayProducts(filteredProductsArr);
      }
      clearForm();
    } catch (error) {
      console.log(error.message);
    }
  });

  //Item Delete From API and UI ------------------------------------***
  productDisplayArea.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete")) {
      const card = e.target.closest(".card-area");
      const cardId = card.dataset.id;
      let confirmation = confirm("Are you sure to delete?" + cardId);
      if (!confirmation) return;
      try {
        const res = await fetch(`${api_url}/${cardId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          allProducts = allProducts.filter((p) => p.id != cardId);
          filteredProductsArr = allProducts.filter((p) => p.id != cardId);
          card.remove();
          let responseData = await res.json();
          toast(`<p style="color:yellow"> Delete Product </p> 
                <img style="margin-right: 10px" src="${responseData.image}" width="60px" alt="">
               Name: <i style="color:red">${responseData.name}</i> <br>
               
            `);
          clearForm();
          if (allProducts.length == 0) {
            displayProducts(allProducts);
          }
        }
      } catch (error) {
        console.error("Something Wrong", error);
      }
    }
  });

  // Edit data
  productDisplayArea.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit")) {
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

  // Get all products from API after page load -----------------------------------***
  async function getAllProducts() {
    try {
      showSkeletons();
      const res = await fetch(api_url);
      const products = await res.json();
      allProducts = products;
      filteredProductsArr = products;
      setTimeout(() => {
        displayProducts(allProducts);
      }, 50);
    } catch (error) {
      console.log(error.message);
    }
  }
  getAllProducts();
  // Add product to API -----------------------------------***
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
      const responseData = await res.json(); // সাকসেস হলে সার্ভার আবার সেই ডাটা পাঠাবে এখানে। সেটা আবার রিটার্ন করতে হবে।
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

  // Add to Cart
  productDisplayArea.addEventListener("click", (e) => {
    console.log(e);
    if (e.target.classList.contains("add-to-cart")) {
      const itemId = e.target.closest(".card-area").dataset.id;
      cartItems.push(allProducts.find((p) => p.id == itemId));
      localStorage.setItem("userCart", JSON.stringify(cartItems))
    }
  });
  // Display Add to cart 
  

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
                      <button id="addToCart" class="btn add-to-cart bg-dark-subtle fw-bolder"> Add to cart <span class="item-counter">2</span></button>
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
      filteredProductsArr = [...allProducts];
    } else {
      filteredProductsArr = allProducts.filter(
        (p) => p.category.toLowerCase() == selectedCategory.toLowerCase(),
      );
    }
    displayProducts(filteredProductsArr);
  });

  // Sort Products by date and price -----------------------------------***
  document.getElementById("sort").addEventListener("change", (e) => {
    const selectedOption = e.target.value;
    const copyForSortProducts = [...filteredProductsArr];

    if (selectedOption == "default") {
      displayProducts(filteredProductsArr);
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
    toast("Searching across all categories...");
    const searchProducts = allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
    displayProducts(searchProducts);
  });

  function clearForm() {
    productForm.reset();
    submitBtn.innerText = "Add Product";
    submitBtn.style.background = "";
    cancelBtn.style.display = "none";
    formArea.style.background = "";
    editId = null;
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
});
