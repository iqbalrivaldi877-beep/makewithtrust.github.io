// === MAKEWITHTRUST JS MASTER SCRIPT ===
document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // === NAVBAR HANDLING ===
  // =========================
  const navbar = document.getElementById("navbar");
  const navbarCollapse = document.getElementById("navMenu");
  const navbarToggler = document.querySelector(".navbar-toggler");
  const cartIcons = document.querySelectorAll(".cart-icon");
  const categoryToggle = document.getElementById("categoryToggle");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const dropdownCustom = document.querySelector(".dropdown-custom");

  // === Navbar Scroll Effect & Cart Icon Color ===
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 50;
    navbar?.classList.toggle("scrolled", scrolled);
    cartIcons.forEach(icon => {
      if (window.innerWidth < 992) icon.classList.toggle("scrolled", scrolled);
      else icon.classList.remove("scrolled");
    });
  });

  // === Tutup Navbar Saat Klik di Luar ===
  document.addEventListener("click", (e) => {
    if (!navbarCollapse || !navbarToggler) return;
    const isInside = navbarCollapse.contains(e.target) || navbarToggler.contains(e.target);
    if (!isInside && navbarCollapse.classList.contains("show")) {
      const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
      bsCollapse.hide();
    }
  });

  // === Nav Link Active State ===
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      if (this.getAttribute("href") === "#") e.preventDefault();
      navLinks.forEach(nav => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // =========================
  // === CATEGORY DROPDOWN ===
  // =========================
  if (dropdownCustom && categoryDropdown && categoryToggle) {
    dropdownCustom.addEventListener("mouseenter", () => {
      if (window.innerWidth > 992) {
        categoryDropdown.classList.add("show");
        categoryToggle.classList.add("active");
      }
    });
    dropdownCustom.addEventListener("mouseleave", () => {
      if (window.innerWidth > 992) {
        categoryDropdown.classList.remove("show");
        categoryToggle.classList.remove("active");
      }
    });
    categoryToggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        categoryDropdown.classList.toggle("show");
        categoryToggle.classList.toggle("active");
      }
    });
  }

  // ======================
  // === SLIDER / HERO ===
  // ======================
  const carousel = document.getElementById("trustCarousel");
  if (carousel) {
    const loadingLogo = document.getElementById("loading-logo");
    const prevBtn = carousel.querySelector(".carousel-control-prev");
    const nextBtn = carousel.querySelector(".carousel-control-next");

    carousel.addEventListener("slide.bs.carousel", () => {
      loadingLogo?.classList.add("show");
      carousel.classList.add("loading");
    });
    carousel.addEventListener("slid.bs.carousel", () => {
      setTimeout(() => {
        loadingLogo?.classList.remove("show");
        carousel.classList.remove("loading");
      }, 400);
    });
    function addArrowEffect(button) {
      button.classList.add("clicked");
      setTimeout(() => button.classList.remove("clicked"), 250);
    }
    prevBtn?.addEventListener("click", () => addArrowEffect(prevBtn));
    nextBtn?.addEventListener("click", () => addArrowEffect(nextBtn));

    new bootstrap.Carousel(carousel, {
      interval: 7000,
      pause: false,
      touch: false,
      ride: "carousel"
    });
  }

  // ============================
  // === CART SIDEBAR SYSTEM ===
  // ============================
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCart = document.getElementById("closeCart");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const currencySelect = document.getElementById("currencySelect");
  const currencySelectMobile = document.getElementById("currencySelectMobile");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let currentCurrency = "IDR";

  const exchangeRates = { IDR: 1, USD: 0.000065, SGD: 0.000088, MYR: 0.00031 };
  const currencySymbols = { IDR: "Rp", USD: "$", SGD: "S$", MYR: "RM" };

  // === Buka / Tutup Cart ===
  function openCart() {
    cartSidebar?.classList.add("active");
    cartOverlay?.classList.add("active");
    document.body.style.overflow = "hidden";
    cartIcons.forEach(icon => icon.classList.add("active"));
  }
  function closeCartSidebar() {
    cartSidebar?.classList.remove("active");
    cartOverlay?.classList.remove("active");
    document.body.style.overflow = "";
    cartIcons.forEach(icon => icon.classList.remove("active"));
  }

  document.querySelectorAll(".cart-container").forEach(container => {
    container.addEventListener("click", () => {
      if (cartSidebar?.classList.contains("active")) closeCartSidebar();
      else openCart();
    });
  });
  closeCart?.addEventListener("click", closeCartSidebar);
  cartOverlay?.addEventListener("click", closeCartSidebar);

  // === Add to Cart Button (umum di list) ===
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const product = e.target.closest(".product");
      if (!product) return;
      const name = product.querySelector(".product-name")?.textContent || "Unknown";
      const basePrice = parseFloat(product.querySelector(".product-price")?.dataset.price) || 0;
      const image = product.querySelector("img")?.src || "";
      const existing = cart.find(item => item.name === name);
      if (existing) existing.qty++;
      else cart.push({ name, basePrice, image, qty: 1 });
      saveCart();
      updateCartUI();
      window.dispatchEvent(new Event("cartUpdated"));
    });
  });

  // === Update Cart UI ===
  function updateCartUI() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p class="empty-cart-text">No products in the cart.</p>`;
      cartTotal.textContent = "Rp 0";
      checkoutBtn && (checkoutBtn.disabled = true);
      updateCartCount(0);
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      const convertedPrice = item.basePrice * exchangeRates[currentCurrency];
      const itemTotal = convertedPrice * item.qty;
      total += itemTotal;

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${currencySymbols[currentCurrency]} ${convertedPrice.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-index="${index}" data-action="decrease">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
        </div>`;
      cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = `${currencySymbols[currentCurrency]} ${total.toFixed(2)}`;
    checkoutBtn && (checkoutBtn.disabled = false);
    updateCartCount(cart.reduce((sum, i) => sum + i.qty, 0));
  }

  // === Quantity Buttons ===
  cartItemsContainer?.addEventListener("click", (e) => {
    if (!e.target.classList.contains("qty-btn")) return;
    const index = e.target.dataset.index;
    const action = e.target.dataset.action;
    if (action === "increase") cart[index].qty++;
    else if (action === "decrease") {
      if (cart[index].qty > 1) cart[index].qty--;
      else cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  });

  // === LocalStorage Save ===
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // === Update Counter di Icon ===
  function updateCartCount(count) {
    document.querySelectorAll(".cart-count").forEach(el => (el.textContent = count));
  }

  // === Currency Handler ===
  function updateCurrency(value) {
    currentCurrency = value;
    updateCartUI();
  }

  [currencySelect, currencySelectMobile].forEach(select => {
    if (select) select.addEventListener("change", e => updateCurrency(e.target.value));
  });

  // === Init Cart ===
  updateCartUI();

  // ==========================
  // === SHOW MORE BUTTON ===
  // ==========================
  const items = document.querySelectorAll(".collection-list-item");
  const showMoreBtn = document.getElementById("showMoreBtn");
  if (showMoreBtn && items.length > 0) {
    const maxDesktop = 8;
    const maxMobile = 4;
    let isExpanded = false;

    function updateVisibleItems() {
      const limit = window.innerWidth <= 768 ? maxMobile : maxDesktop;
      if (!isExpanded) {
        items.forEach((item, i) => item.classList.toggle("hidden", i >= limit));
      }
    }
    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    showMoreBtn.addEventListener("click", () => {
      const limit = window.innerWidth <= 768 ? maxMobile : maxDesktop;
      if (!isExpanded) {
        items.forEach(i => i.classList.remove("hidden"));
        showMoreBtn.textContent = "Tutup";
        isExpanded = true;
      } else {
        items.forEach((i, idx) => i.classList.toggle("hidden", idx >= limit));
        showMoreBtn.textContent = "Lihat Selengkapnya";
        isExpanded = false;
      }
    });
  }

  // ============================
  // === GLOBAL CART SYNC ===
  // ============================
  window.addEventListener("cartUpdated", () => updateCartUI());

  window.cartSystem = {
    addToCart: (item) => {
      const existing = cart.find(p =>
        p.name === item.name && p.color === item.color && p.size === item.size
      );
      if (existing) existing.qty += item.qty;
      else cart.push(item);
      saveCart();
      updateCartUI();
      window.dispatchEvent(new Event("cartUpdated"));
    },
    openCartSidebar: openCart,
  };
});

