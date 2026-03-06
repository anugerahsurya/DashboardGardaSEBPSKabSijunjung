import { supabase } from "./supabaseClient.js";

const form = document.getElementById("kegiatanForm");
const statusBox = document.getElementById("statusMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusBox.innerHTML = `
    <div class="alert alert-info">
      Mengupload kegiatan...
    </div>
  `;

  try {
    const file = document.getElementById("gambar").files[0];
    const waktuKegiatan = document.getElementById("tanggal").value;
    const namaKegiatan = document.getElementById("nama").value;
    const deskripsi = document.getElementById("deskripsi").value;

    const fileName = Date.now() + "_" + file.name;

    // Upload gambar ke storage
    const { error: uploadError } = await supabase.storage
      .from("kegiatan-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Ambil URL publik gambar
    const { data } = supabase.storage
      .from("kegiatan-images")
      .getPublicUrl(fileName);

    // Simpan ke tabel kegiatan
    const { error: insertError } = await supabase.from("Kegiatan").insert([
      {
        waktuKegiatan,
        namaKegiatan,
        deskripsi,
        url_gambar: data.publicUrl,
      },
    ]);

    if (insertError) throw insertError;

    statusBox.innerHTML = `
      <div class="alert alert-success">
        ✅ Kegiatan berhasil diupload
      </div>
    `;

    form.reset();
    document.getElementById("preview").style.display = "none";

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
