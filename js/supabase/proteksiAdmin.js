/* =========================
ADMIN CREDENTIAL (STATIS)
========================= */

const ADMIN_USER = "bps1304";
const ADMIN_PASS = "gardase1304";

/* =========================
ELEMENT
========================= */

const overlay = document.getElementById("loginOverlay");
const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("loginError");

/* =========================
CHECK SESSION
========================= */

const isLoggedIn = sessionStorage.getItem("adminLogin");

if (isLoggedIn === "true") {
  overlay.style.display = "none";
}

/* =========================
LOGIN PROCESS
========================= */

loginBtn.addEventListener("click", () => {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem("adminLogin", "true");

    overlay.style.display = "none";
  } else {
    errorBox.innerText = "Username atau password salah";
  }
});
