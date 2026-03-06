import { supabase } from "./supabaseClient.js";

function formatTanggal(tanggal) {
  const date = new Date(tanggal);

  const hari = date.getDate();
  const bulan = date.toLocaleString("id-ID", { month: "short" }).toUpperCase();
  const tahun = date.getFullYear();

  return { hari, bulan, tahun };
}

async function loadEvents() {
  const wrapper = document.getElementById("eventsWrapper");

  const { data, error } = await supabase
    .from("Kegiatan")
    .select("*")
    .order("waktuKegiatan", { ascending: false });

  if (error) {
    console.error("Gagal mengambil kegiatan:", error);
    return;
  }

  wrapper.innerHTML = "";

  data.forEach((item) => {
    const { hari, bulan, tahun } = formatTanggal(item.waktuKegiatan);

    wrapper.innerHTML += `
      <div class="event-card">

        <div class="event-date">
          <h4>${hari} ${bulan}</h4>
          <span>${tahun}</span>
        </div>

        <img src="${item.url_gambar}" />

        <div class="event-info">
          <h5>${item.namaKegiatan}</h5>
          <p>${item.deskripsi || ""}</p>
        </div>

      </div>
    `;
  });
}

window.addEventListener("load", loadEvents);
