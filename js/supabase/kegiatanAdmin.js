import { supabase } from "./supabaseClient.js";

const form = document.getElementById("kegiatanForm");
const statusBox = document.getElementById("statusMessage");

/* =========================
IMAGE COMPRESS FUNCTION
========================= */

async function compressImage(file, maxSizeMB = 1) {
  const maxSize = maxSizeMB * 1024 * 1024;

  // jika sudah kecil tidak perlu compress
  if (file.size <= maxSize) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const MAX_WIDTH = 1920;

      let width = img.width;
      let height = img.height;

      // resize jika terlalu besar
      if (width > MAX_WIDTH) {
        height = height * (MAX_WIDTH / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        "image/jpeg",
        0.8,
      );
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
FORM SUBMIT
========================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusBox.innerHTML = `
    <div class="alert alert-info">
      Mengupload kegiatan...
    </div>
  `;

  try {
    let file = document.getElementById("gambar").files[0];

    if (!file) {
      throw new Error("File gambar belum dipilih");
    }

    const waktuKegiatan = document.getElementById("tanggal").value;
    const namaKegiatan = document.getElementById("nama").value;
    const deskripsi = document.getElementById("deskripsi").value;

    const offsetX = parseFloat(document.getElementById("offsetX").value) || 0;
    const offsetY = parseFloat(document.getElementById("offsetY").value) || 0;

    /* =========================
    COMPRESS IMAGE
    ========================= */

    file = await compressImage(file, 1);

    const fileName = Date.now() + "_" + file.name;

    /* =========================
    UPLOAD STORAGE
    ========================= */

    const { error: uploadError } = await supabase.storage
      .from("kegiatan-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    /* =========================
    GET PUBLIC URL
    ========================= */

    const { data } = supabase.storage
      .from("kegiatan-images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    /* =========================
    INSERT DATABASE
    ========================= */

    const { error: insertError } = await supabase.from("Kegiatan").insert([
      {
        waktuKegiatan,
        namaKegiatan,
        deskripsi,
        url_gambar: imageUrl,
        offsetX,
        offsetY,
      },
    ]);

    if (insertError) throw insertError;

    statusBox.innerHTML = `
      <div class="alert alert-success">
        ✅ Kegiatan berhasil diupload
      </div>
    `;

    form.reset();

    setTimeout(() => {
      statusBox.innerHTML = "";
    }, 4000);
  } catch (err) {
    console.error(err);

    statusBox.innerHTML = `
      <div class="alert alert-danger">
        ❌ Upload gagal. Periksa koneksi atau konfigurasi Supabase.
      </div>
    `;
  }
});
