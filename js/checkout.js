window.document.addEventListener("DOMContentLoaded", () => {
  const api = "https://6973a4f4b5f46f8b5827ea6b.mockapi.io/orders_list";
  const customerForm = document.getElementById("customerInfoForm");
  const summaryItemEl = document.getElementById("summary-items");
  const countBadge = document.getElementById("item-count-badge");
  const subTotalEl = document.getElementById("sub-total");
  const shippingCostEl = document.getElementById("shipping-cost");
  const grandTotalEl = document.getElementById("grand-total");
  const submitBtn = document.getElementById("submit");

  const cartData = JSON.parse(localStorage.getItem("userCart")) || [];
  const subTotal = cartData.reduce((acc, p) => {
    Number(p.newPrice)
      ? (acc += Number(p.newPrice * p.quantity))
      : (acc += Number(p.price * p.quantity));
    return acc;
  }, 0);
  const shippingCost = subTotal >= 2000 ? 0 : 120;
  const grandTotal = subTotal > 0 ? subTotal + shippingCost : 0;

  // Handle Order Submission: Collect user data
  customerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (subTotal <= 0) {
      alert("Your cart is empty!");
      return;
    }
    const formData = new FormData(customerForm);
    const data = Object.fromEntries(formData);
    data.orderDate = new Date().toISOString();
    data.cartItems = cartData;
    data.subTotal = subTotal;
    data.shippingCost = shippingCost;
    data.grandTotal = grandTotal;

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = "Processing...";
      const resData = await uploadCustomerData(data);
      if (resData) {
        resetCheckoutStatus();
        await Swal.fire({
          title: `Thank you, <span class="text-success">${resData.firstName}!</span>`,
          text: "Your order has been received and is being processed.",
          icon: "success",
          width: "400px",
          confirmButtonText: "Back to Home",
          confirmButtonColor: "#6f7af5",
          allowOutsideClick: false, 
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "index.html";
          }
        });
      } else {
        throw new Error("Upload failed to server");
      }
    } catch (error) {
      console.log("Catch Block Error" + error.message);
      Swal.fire(
        "Error",
        "Something went wrong. Please check your internet.",
        "error",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Place Order";
    }
  });

  // Send Customer Data to API
  async function uploadCustomerData(data) {
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const resData = await res.json();

      return resData;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  // Cart Data Displaly -------
  function displayOrderSummary() {
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
            <span class="fw-bold text-success" >${p.name}</span>
            </div>
            <span class="text-muted col-2">Qty: ${p.quantity}</span>
            <span class="fw-bold col-3  text-end">${(p.newPrice ? p.newPrice : p.price) * p.quantity} ৳</span>
        </li>
    `;
    });
  }
  displayOrderSummary();
  // UI text content
  countBadge.innerText = cartData.reduce((acc, p) => acc + p.quantity, 0);
  subTotalEl.innerHTML = `<span class="text-danger pe-2 fw-bold"> ${subTotal} ৳</span>`;

  if (subTotal > 0) {
    shippingCostEl.innerHTML =
      shippingCost == 0
        ? `<span class="text-success pe-2 fw-bold"> Free </span>`
        : shippingCost + " ৳";
  } else {
    shippingCostEl.innerText = "0 ৳";
    grandTotalEl.innerText = "0 ৳";
  }

  grandTotalEl.innerText = " = " + grandTotal + " ৳";

  // Helper Function :

  // Resets the checkout form, clears local storage, and updates the UI after a successful order.
  function resetCheckoutStatus() {
    submitBtn.disabled = false;
    submitBtn.innerText = "Place Order";
    summaryItemEl.innerText = "Your order has been processed.";
    subTotalEl.innerText = "0" + "৳";
    shippingCostEl.innerText = "0" + "৳";
    grandTotalEl.innerText = "0৳";
    countBadge.innerText = "0";
    customerForm.reset();
    localStorage.removeItem("userCart");
  }

  // Get Time
  // async function getTime() {
  //   try {
  //     const response = await fetch(
  //       "http://worldtimeapi.org/api/timezone/Asia/Dhaka", // স্লো...
  //     );
  //     if (!response.ok) {
  //       throw Error("Failed to fetch time api");
  //     }
  //     const data = await response.json();
  //     console.log(data.datetime);
  //     return data.datetime;
  //   } catch (error) {
  //     console.log(error.message);
  //     return new Date().toISOString();
  //   }
  // }

  // getTime();

  //Last Line ===================
});
