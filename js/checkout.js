window.document.addEventListener("DOMContentLoaded", () => {
  const summaryItemEl = document.getElementById("summary-items");
  const subTotalEl = document.getElementById("sub-total");
  const shippingCostEl = document.getElementById("shipping-cost");
  const grandTotalEl = document.getElementById("grand-total");

  let cartData = JSON.parse(localStorage.getItem("userCart")) || [];
  const shippingCost = 120;

  cartData.forEach((p) => {
    summaryItemEl.innerHTML += `
    <li class="list-group-item d-flex row  justify-content-between align-items-center border-0 px-0"
     >
         <div class="d-flex col-7 align-items-center">
             <img 
                 src="${p.image}"
                style="width: 40px"
                class="me-2 col-2"
                 />
            <span class="" >${p.name}</span>
            </div>

            <span class="text-muted col-2">Qty: ${p.quantity}</span>
            <span class="fw-bold col-3 p-3 text-end">${(p.newPrice ? p.newPrice : p.price) * p.quantity} ৳</span>
        </li>
    `;
  });

  let subTotal = cartData.reduce((acc, p) => {
    Number(p.newPrice)
      ? (acc += Number(p.newPrice * p.quantity))
      : (acc += Number(p.price * p.quantity));
    return acc;
  }, 0);

  subTotalEl.innerText = subTotal + " ৳";
  shippingCostEl.innerHTML =
    subTotal >= 2000
      ? `<span class="text-success fw-bold"> Free </span>`
      : shippingCost + " ৳";
  grandTotalEl.innerText =
    shippingCostEl.innerText == "Free"
      ? " = " + Number(subTotal) + " ৳"
      : " = " + Number(subTotal + shippingCost) + " ৳";

  //Last Line ===================
});
