document
  .getElementById("categoryFilter")
  .addEventListener("change", function () {
    const selectedValue = this.value;

    // যদি ইউজার অন্য কোনো পেজে থাকে (যেমন Product Details পেজে)
    // আর সে হোম পেজের ক্যাটাগরিতে যেতে চায়:
    window.location.href = `index.html?category=${selectedValue}`;
  });
