// === Nilai tukar (bisa disesuaikan) ===
const exchangeRates = {
  IDR: 1,
  USD: 0.000063,
  SGD: 0.000085,
  MYR: 0.00030
};

// === Bendera tiap mata uang ===
const flags = {
  IDR: "https://flagcdn.com/w20/id.png",
  USD: "https://flagcdn.com/w20/us.png",
  SGD: "https://flagcdn.com/w20/sg.png",
  MYR: "https://flagcdn.com/w20/my.png"
};

// === Format tampilan mata uang ===
function formatCurrency(value, currency) {
  switch (currency) {
    case "USD":
      return `$${value.toFixed(2)}`;
    case "SGD":
      return `S$${value.toFixed(2)}`;
    case "MYR":
      return `RM ${value.toFixed(2)}`;
    default:
      return `Rp ${value.toLocaleString("id-ID")}`;
  }
}

// === Ubah semua harga di halaman ===
function updatePrices(currency) {
  const prices = document.querySelectorAll(".product-price");

  prices.forEach((priceEl) => {
    if (!priceEl.dataset.original) {
      const cleanPrice = priceEl.innerText.replace(/[^\d]/g, "");
      priceEl.dataset.original = cleanPrice;
    }

    const originalPrice = parseFloat(priceEl.dataset.original);
    const rate = exchangeRates[currency];
    const converted = originalPrice * rate;

    priceEl.innerText = formatCurrency(converted, currency);
  });

  // Ubah icon bendera jika ada
  const flagEl = document.getElementById("currencyFlag");
  if (flagEl) flagEl.src = flags[currency];
}

// === Sinkronisasi dua dropdown (desktop & mobile) ===
document.addEventListener("DOMContentLoaded", function () {
  const desktopSelect = document.getElementById("currencySelect");
  const mobileSelect = document.getElementById("currencySelectMobile");
  const navMenu = document.getElementById("navMenu");

  // Ambil currency terakhir atau default
  const savedCurrency = localStorage.getItem("selectedCurrency") || desktopSelect.value;
  desktopSelect.value = savedCurrency;
  if (mobileSelect) mobileSelect.value = savedCurrency;
  updatePrices(savedCurrency);

  // Fungsi sinkronisasi antar dropdown
  function syncCurrency(source, value) {
    if (source === "desktop" && mobileSelect) mobileSelect.value = value;
    if (source === "mobile") desktopSelect.value = value;
    localStorage.setItem("selectedCurrency", value);
    updatePrices(value);
  }

  // Event: ganti dari desktop
  desktopSelect.addEventListener("change", (e) => {
    syncCurrency("desktop", e.target.value);
  });

  // Event: ganti dari mobile
  if (mobileSelect) {
    mobileSelect.addEventListener("change", (e) => {
      syncCurrency("mobile", e.target.value);
    });
  }

  // Saat navbar mobile dibuka (biar dropdown mobile update)
  if (navMenu) {
    navMenu.addEventListener("shown.bs.collapse", () => {
      const saved = localStorage.getItem("selectedCurrency") || "IDR";
      if (mobileSelect) mobileSelect.value = saved;
      desktopSelect.value = saved;
    });
  }
});

// === Sinkronisasi tambahan (backup event handler) ===
document.addEventListener("DOMContentLoaded", function () {
  const currencyDesktop = document.getElementById("currencySelect");

  function getMobileSelect() {
    return document.getElementById("currencySelectMobile");
  }

  function syncCurrency(from, to) {
    if (to) {
      to.value = from.value;
      localStorage.setItem("selectedCurrency", from.value);
    }
  }

  // Desktop → Mobile
  currencyDesktop.addEventListener("change", () => {
    const mobile = getMobileSelect();
    syncCurrency(currencyDesktop, mobile);
  });

  // Simpan pilihan terakhir
  const saved = localStorage.getItem("selectedCurrency");
  if (saved) {
    currencyDesktop.value = saved;
    const mobile = getMobileSelect();
    if (mobile) mobile.value = saved;
  }

  // Saat hamburger dibuka
  const navMenu = document.getElementById("navMenu");
  if (navMenu) {
    navMenu.addEventListener("shown.bs.collapse", function () {
      const mobile = getMobileSelect();
      if (mobile) {
        const saved = localStorage.getItem("selectedCurrency") || currencyDesktop.value;
        mobile.value = saved;
        mobile.addEventListener("change", () => syncCurrency(mobile, currencyDesktop));
      }
    });
  }
});
