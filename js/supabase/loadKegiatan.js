import { supabase } from "./supabaseClient.js";

async function loadKegiatan() {
  const container = document.getElementById("kegiatan-container");

  try {
    const { data, error } = await supabase
      .from("Kegiatan")
      .select("*")
      .order("waktuKegiatan", { ascending: false });

    if (error) {
      console.error("Error ambil data kegiatan:", error);
      container.innerHTML = "<p>Gagal memuat kegiatan.</p>";
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Belum ada kegiatan.</p>";
      return;
    }

    container.innerHTML = "";

    data.forEach((item) => {
      const tanggal = new Date(item.waktuKegiatan).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      container.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm h-100">
            <img src="${item.url_gambar}" class="card-img-top" style="height:200px;object-fit:cover;">
            
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${item.namaKegiatan}</h5>
              <small class="text-muted">${tanggal}</small>
              
              <p class="card-text mt-2">
                ${item.deskripsi || ""}
              </p>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    container.innerHTML = "<p>Terjadi kesalahan memuat data.</p>";
  }
}

window.addEventListener("load", loadKegiatan);
