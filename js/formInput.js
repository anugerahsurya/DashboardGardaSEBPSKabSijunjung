const inputFile = document.getElementById("gambar");
const previewImg = document.getElementById("previewImage");
const container = document.querySelector(".preview-container");

const offsetXInput = document.getElementById("offsetX");
const offsetYInput = document.getElementById("offsetY");

let posX = 0;
let posY = 0;

let startX = 0;
let startY = 0;

let isDragging = false;
let imageLoaded = false;

// =============================
// PREVIEW IMAGE
// =============================

inputFile.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  previewImg.src = url;

  posX = 0;
  posY = 0;

  previewImg.style.transform = "translate(0px,0px)";

  previewImg.onload = () => {
    imageLoaded = true;

    const imgW = previewImg.naturalWidth;
    const imgH = previewImg.naturalHeight;

    const boxW = container.clientWidth;
    const boxH = container.clientHeight;

    const imgRatio = imgW / imgH;
    const boxRatio = boxW / boxH;

    // =============================
    // AUTO FIT IMAGE
    // =============================

    if (imgRatio > boxRatio) {
      // gambar lebih lebar
      previewImg.style.height = boxH + "px";
      previewImg.style.width = "auto";
    } else {
      // gambar lebih tinggi
      previewImg.style.width = boxW + "px";
      previewImg.style.height = "auto";
    }

    previewImg.style.left = "0px";
    previewImg.style.top = "0px";
  };
});

// =============================
// START DRAG
// =============================

container.addEventListener("mousedown", (e) => {
  if (!imageLoaded) return;

  isDragging = true;

  startX = e.clientX - posX;
  startY = e.clientY - posY;

  container.style.cursor = "grabbing";
});

// =============================
// STOP DRAG
// =============================

document.addEventListener("mouseup", () => {
  isDragging = false;
  container.style.cursor = "grab";
});

// =============================
// DRAG MOVE
// =============================

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  posX = e.clientX - startX;
  posY = e.clientY - startY;

  previewImg.style.transform = `translate(${posX}px, ${posY}px)`;

  // simpan ke hidden input
  offsetXInput.value = posX;
  offsetYInput.value = posY;
});
