// Constants
const API_URL = "https://6973a4f4b5f46f8b5827ea6b.mockapi.io/nbk-bazar";

// DOM Elements
const productDisplayArea = document.querySelector(".product-container");
const productForm = document.getElementById("productForm");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sort");
const searchInput = document.getElementById("searchProduct");
const noProductFound = document.querySelector(".no-product-found");

// State
let allProducts = [];
let filteredProductsArr = [];
3
// API Functions
async function getAllProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    allProducts = products;
    filteredProductsArr = [...products];
    displayProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error.message);
  }
}

async function uploadProductToAPI(productData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error(`Failed to upload product: ${response.status}`);
    }
    const uploadedProductData = await response.json();
    return uploadedProductData;
  } catch (error) {
    console.error("Error uploading product:", error.message);
    throw error;
  }
}

async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// DOM Manipulation Functions
function displayProducts(products) {
  if (!products || products.length === 0) {
    productDisplayArea.innerHTML = `
      <div class="no-product-found">
        <p class="mt-3 me-3">No Product Found</p>
        <video src="img/sad.mp4" width="100px" autoplay muted loop></video>
      </div>
    `;
    return;
  }

  const html = products
    .map(
      (product) => `
    <div data-id="${product.id}" class="card-area col-md-3">
      <div class="card shadow">
        <div class="card-img">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="card-info p-3">
          <p class="category">${product.category}</p>
          <h5 class="product-name">${product.name}</h5>
          <div class="price-area mb-2 d-flex justify-content-between">
            <span class="price fw-bold">Price: ${product.price} TK</span>
            <span class="discount text-danger fw-bold">${product.discount ? "-" + product.discount + "%" : ""}</span>
          </div>
          <div class="d-flex justify-content-between flex-wrap mb-1">
            <div class="instock text-success fw-medium">${product.stock > 0 ? "In Stock" : "Out of Stock"}</div>
            <span class="size text-danger">${product.size ? "Size: " + product.size : ""}</span>
          </div>
          <div class="d-flex button-area justify-content-between gap-1">
            <button class="btn bg-dark-subtle fw-bolder">Add_cart</button>
            <button class="btn edit bg-info">
              <i class="fa-solid edit  text-white fa-edit fs-5"></i>
            </button>
            <button class="btn delete bg-warning">
              <i class="fa-solid delete text-danger fa-trash fs-5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  productDisplayArea.innerHTML = html;
}

// Event Handlers
function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(productForm);
  const data = Object.fromEntries(formData);
  data.createdAt = new Date().toISOString();

  uploadProduct(data)
    .then((responseData) => {
      allProducts.push(responseData);
      updateFilteredProducts();
      productForm.reset();
    })
    .catch((error) => {
      console.error("Failed to add product:", error);
    });
}

function handleProductDelete(e) {
  if (!e.target.classList.contains("delete")) return;

  const card = e.target.closest(".card-area");
  const productId = card.dataset.id;

  if (!confirm(`Are you sure to delete product ${productId}?`)) return;

  deleteProduct(productId)
    .then(() => {
      allProducts = allProducts.filter((p) => p.id != productId);
      card.remove();
      setTimeout(() => alert("Product Deleted"), 300);
      updateFilteredProducts();
    })
    .catch((error) => {
      console.error("Failed to delete product:", error);
    });
}

function handleCategoryFilter(e) {
  const selectedCategory = e.target.value;
  if (selectedCategory === "all" || selectedCategory === "") {
    filteredProductsArr = [...allProducts];
  } else {
    filteredProductsArr = allProducts.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }
  displayProducts(filteredProductsArr);
}

function handleSort(e) {
  const selectedOption = e.target.value;
  let sortedProducts = [...filteredProductsArr];

  switch (selectedOption) {
    case "default":
      displayProducts(filteredProductsArr);
      return;
    case "newest":
      sortedProducts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      break;
    case "oldest":
      sortedProducts.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      break;
    case "priceHtoL":
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case "priceLtoH":
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case "maxDiscount":
      sortedProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
    default:
      return;
  }

  displayProducts(sortedProducts);
}

function handleSearch(e) {
  const searchValue = e.target.value.toLowerCase();
  const searchResults = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue),
  );
  displayProducts(searchResults);
}

// Utility Functions
function updateFilteredProducts() {
  const currentCategory = categoryFilter.value;
  if (currentCategory === "all" || currentCategory === "") {
    filteredProductsArr = [...allProducts];
  } else {
    filteredProductsArr = allProducts.filter(
      (p) => p.category.toLowerCase() === currentCategory.toLowerCase(),
    );
  }
  displayProducts(filteredProductsArr);
}

// Initialization
function init() {
  // Attach event listeners
  productForm.addEventListener("submit", handleFormSubmit);
  productDisplayArea.addEventListener("click", handleProductDelete);
  categoryFilter.addEventListener("change", handleCategoryFilter);
  sortSelect.addEventListener("change", handleSort);
  searchInput.addEventListener("input", handleSearch);

  // Load initial data
  getAllProducts();
}

// Start the application
window.addEventListener("DOMContentLoaded", init);
