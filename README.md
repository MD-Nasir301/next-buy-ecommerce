# NextBuy - E-commerce Web Application

NextBuy is a dynamic, role-based e-commerce platform built with vanilla JavaScript. It demonstrates real-world features like API integration and local storage management.

## ✨ Key Features
* **Role-Based System:** Dynamic switching between **Admin** and **User** (persisted via LocalStorage).
* **Smooth Animations:** Integrated **GSAP** for high-quality UI transitions and effects.
* **Interactive Alerts:** Used **SweetAlert** for beautiful, user-friendly notifications.
* **Image Management:** All product images are hosted and fetched via **imgBB**.
* **Mock API Sync:** Real-time data fetching and order submission to a mock backend.
* **Persistent Cart:** Fully functional cart that stays updated using LocalStorage.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, **Bootstrap 5** (Responsive Layout)
* **Animation:** **GSAP** (GreenSock Animation Platform)
* **Interactions:** **SweetAlert2**
* **Database/API:** **MockAPI** & **LocalStorage**
* **Image Hosting:** **imgBB API**

## 📂 Project Structure
```text
├── index.html                # Home page (Product display & Role switch)
├── product-details.html      # Individual product view
├── checkout.html             # Cart management & Checkout flow
├── css/                      # Dedicated folder for styles
│   ├── style.css             # Home & Global styles
│   ├── product_details.css   # Styles for details page
│   └── checkout.css          # Styles for checkout page
├── js/                       # Business logic folder
│   ├── main.js               # Global logic, Product rendering & Role management
│   ├── product_details.js    # Logic for fetching & displaying specific products
│   └── checkout.js           # Logic for cart calculations & Mock API sync
├── img/                      # Assets & Icons
└── README.md                 # Documentation
```

## 🚀 How to Run Locally
1. Clone the repository: 
   `git clone https://github.com/MD-Nasir301/next-buy-ecommerce.git`
   
2. Open `index.html` in your browser.

## 📄 License
This project is open-source and available under the MIT License.
