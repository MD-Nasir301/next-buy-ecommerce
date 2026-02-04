window.document.addEventListener("DOMContentLoaded", () => {
  const categoryEl = document.getElementById("categoryFilter");


  

  categoryEl.addEventListener("change", function () {
    const selectedValue = this.value;
    window.location.href = `index.html?category=${selectedValue}`;
  });
}); // Last Line
