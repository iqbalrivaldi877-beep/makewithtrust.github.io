document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.getElementById("mainProductImage");
  const thumbnails = document.querySelectorAll(".thumbnail");
  const colorButtons = document.querySelectorAll(".color-btn");
  const sizeButtons = document.querySelectorAll(".size-btn");
  const decreaseBtn = document.getElementById("decrease");
  const increaseBtn = document.getElementById("increase");
  const quantityInput = document.getElementById("quantity");
  const addToCartBtn = document.querySelector(".add-to-cart");
  const productName = document.querySelector(".product-name");
  const productPrice = document.querySelector(".product-price");
  const prevBtn = document.querySelector(".arrow.prev");
  const nextBtn = document.querySelector(".arrow.next");
  const zoomIcon = document.querySelector(".zoom-icon img");

  let currentIndex = 0;
  const images = Array.from(thumbnails).map((img) => img.dataset.image);

  // === Ambil produk dari localStorage ===
  const selected = JSON.parse(localStorage.getItem("selectedProduct"));
  if (selected) {
    productName.textContent = selected.name;
    productPrice.dataset.price = selected.basePrice;
    productPrice.textContent = formatCurrency(selected.basePrice);
    mainImage.src = selected.image;
  }

  function formatCurrency(amount) {
    return "Rp " + amount.toLocaleString("id-ID");
  }

  // === Ganti gambar utama ===
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      thumbnails.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.dataset.image;
      currentIndex = index;
    });
  });

  // === Navigasi panah ===
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      mainImage.src = images[currentIndex];
      thumbnails.forEach((t) => t.classList.remove("active"));
      thumbnails[currentIndex].classList.add("active");
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      mainImage.src = images[currentIndex];
      thumbnails.forEach((t) => t.classList.remove("active"));
      thumbnails[currentIndex].classList.add("active");
    });
  }

  // === ZOOM GAMBAR (Fullscreen + Scroll Zoom + Drag) ===
 if (zoomIcon) {
  zoomIcon.style.cursor = "zoom-in";

  zoomIcon.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.classList.add("fullscreen-zoom");

    const zoomImg = document.createElement("img");
    zoomImg.src = mainImage.src;
    zoomImg.classList.add("zoomed-image");

    // === Container tombol di tengah bawah ===
    const controls = document.createElement("div");
    controls.classList.add("zoom-controls");

    const prevArrow = document.createElement("div");
    prevArrow.classList.add("zoom-arrow", "prev");
    prevArrow.textContent = "‹";

    const closeBtn = document.createElement("div");
    closeBtn.classList.add("zoom-close");
    closeBtn.textContent = "×";

    const nextArrow = document.createElement("div");
    nextArrow.classList.add("zoom-arrow", "next");
    nextArrow.textContent = "›";

    controls.appendChild(prevArrow);
    controls.appendChild(closeBtn);
    controls.appendChild(nextArrow);

    overlay.appendChild(zoomImg);
    overlay.appendChild(controls);
    document.body.appendChild(overlay);

    let scale = 1;
    let isZoomed = false;
    let isDragging = false;
    let startX, startY, originX = 0, originY = 0;

    zoomImg.style.cursor = "zoom-in";
    zoomImg.style.transition = "transform 0.25s ease";

    function updateZoomedImage() {
      zoomImg.src = images[currentIndex];
      scale = 1;
      isZoomed = false;
      originX = 0;
      originY = 0;
      zoomImg.style.transform = "translate(0, 0) scale(1)";
      zoomImg.style.cursor = "zoom-in";
    }

    // === Scroll untuk zoom ===
    zoomImg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.min(Math.max(1, scale + delta), 3);
      zoomImg.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    });

    // === Klik toggle zoom ===
    zoomImg.addEventListener("click", (e) => {
      e.stopPropagation();
      isZoomed = !isZoomed;
      scale = isZoomed ? 2 : 1;
      originX = 0;
      originY = 0;
      zoomImg.style.transform = `translate(0, 0) scale(${scale})`;
      zoomImg.style.cursor = isZoomed ? "grab" : "zoom-in";
    });

    // === Drag gambar saat zoom ===
    zoomImg.addEventListener("mousedown", (e) => {
      if (!isZoomed) return;
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - originX;
      startY = e.clientY - originY;
      zoomImg.style.cursor = "grabbing";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        zoomImg.style.cursor = "grab";
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      originX = e.clientX - startX;
      originY = e.clientY - startY;
      zoomImg.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    });

    // === Swipe (Mobile) ===
    let touchStartX = 0;
    let touchEndX = 0;

    zoomImg.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    zoomImg.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) { // threshold minimal
        if (diff > 0) {
          // Geser kanan → foto sebelumnya
          currentIndex = (currentIndex - 1 + images.length) % images.length;
        } else {
          // Geser kiri → foto berikutnya
          currentIndex = (currentIndex + 1) % images.length;
        }
        updateZoomedImage();
      }
    }

    // === Navigasi tombol ===
    prevArrow.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateZoomedImage();
    });

    nextArrow.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      updateZoomedImage();
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      overlay.remove();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  });
}

  // === GANTI WARNA PRODUK ===
  colorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mainImage.src = btn.dataset.image;
    });
  });

  // === GANTI UKURAN PRODUK ===
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // === QUANTITY CONTROL ===
  if (increaseBtn && decreaseBtn && quantityInput) {
    increaseBtn.addEventListener("click", () => {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });
    decreaseBtn.addEventListener("click", () => {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });
  }

  // === ADD TO CART ===
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const name = productName.textContent;
      const basePrice = parseFloat(productPrice.dataset.price);
      const image = mainImage.src;
      const color = document.querySelector(".color-btn.active")?.dataset.color || "Default";
      const size = document.querySelector(".size-btn.active")?.textContent || "Default";
      const qty = parseInt(quantityInput.value);

      const item = { name, basePrice, image, color, size, qty };

      if (window.cartSystem) {
        window.cartSystem.addToCart(item);
        window.cartSystem.openCartSidebar();
      } else {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(item);
        localStorage.setItem("cart", JSON.stringify(cart));
      }

      addToCartBtn.textContent = "Added!";
      addToCartBtn.classList.add("added");
      setTimeout(() => {
        addToCartBtn.textContent = "Add to Cart";
        addToCartBtn.classList.remove("added");
      }, 1200);
    });
  }
});

window.addEventListener("cartUpdated", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach((el) => (el.textContent = count));
});

