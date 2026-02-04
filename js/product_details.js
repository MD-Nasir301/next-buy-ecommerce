window.document.addEventListener("DOMContentLoaded", () => {
  const api = "https://6973a4f4b5f46f8b5827ea6b.mockapi.io/nbk-bazar";
  const categoryEl = document.getElementById("categoryFilter");
  const productAreaEl = document.querySelector(".product-details-area");

  const cartData = JSON.parse(localStorage.getItem("userCart")) || [];
  const param = new URLSearchParams(window.location.search);
  const productID = param.get("id");
  let productData = null;

  async function init() {
    await getProduct();
    displayProduct();
  }
  init();

  // Fetch product
  async function getProduct() {
    try {
      const res = await fetch(`${api}/${productID}`);
      if (!res.ok) {
        throw new Error("Something Wrong !");
      }
      const data = await res.json();
      productData = data;
    } catch (error) {
      console.log("Error == " + error.message);
    }
  }

  // Display Product Details
  function displayProduct() {
    productAreaEl.innerHTML = `
              <div class="col-md-6">
            <div class="product-image">
              <img src="${productData.image}" alt="" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="product-info">
              <h3 class="mb-3">${productData.name}</h3>
              <h5 class="mb-2">
                Price: <span class="text-primary"> ${productData.price} ৳ </span>
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

  categoryEl.addEventListener("change", function (e) {
    const selectedValue = this.value;
    window.location.href = `index.html?category=${selectedValue}`;
  });
}); // Last Line
