// ===============================
// GLOBAL VARIABLE
// ===============================
let geojsonData = null;
let filteredLayer = null;
let selectedFeature = null;
let map = null;

// REFERENSI NAMA KBLI (SAMPLE UTAMA)
// Tambahkan sesuai kebutuhan
// ===============================
const kbliReference = {
  "01135": "Perkebunan Tanaman Buah",
  "01262": "Perkebunan Kelapa Sawit",
  16101: "Industri Penggergajian Kayu",
  16221: "Industri Kayu Lapis",
  16292: "Industri Barang Anyaman",
  41000: "Konstruksi Gedung",
  42201: "Konstruksi Jalan",
  46100: "Perdagangan Besar",
  46202: "Perdagangan Hasil Pertanian",
  38302: "Daur Ulang Limbah",
};

// ===============================
// INIT MAP
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([-2.5, 118], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  loadData();

  document
    .getElementById("kecamatan-filter")
    .addEventListener("change", applyFilter);

  document
    .getElementById("reset-filter-btn")
    .addEventListener("click", resetFilter);
});

// ===============================
// LOAD GEOJSON
// ===============================
async function loadData() {
  try {
    const res = await fetch("shapefile/DataRef_Final.geojson");
    geojsonData = await res.json();

    populateKecamatanFilter();
    applyFilter();
  } catch (err) {
    console.error(err);
    alert("Gagal memuat DataRef_Final.geojson");
  }
}

// ===============================
// POPULATE KECAMATAN
// ===============================
function populateKecamatanFilter() {
  const select = document.getElementById("kecamatan-filter");

  const kecamatanSet = new Set();
  geojsonData.features.forEach((f) => {
    kecamatanSet.add(f.properties.wadmkc);
  });

  [...kecamatanSet].sort().forEach((kec) => {
    const option = document.createElement("option");
    option.value = kec;
    option.textContent = kec;
    select.appendChild(option);
  });
}

// ===============================
// APPLY FILTER
// ===============================
function applyFilter() {
  const selectedKec = document.getElementById("kecamatan-filter").value;

  let filteredFeatures = geojsonData.features;

  if (selectedKec) {
    filteredFeatures = filteredFeatures.filter(
      (f) => f.properties.wadmkc === selectedKec,
    );
  }

  const filteredGeoJson = {
    type: "FeatureCollection",
    features: filteredFeatures,
  };

  updateMap(filteredGeoJson);
  console.log("Filtered:", filteredFeatures.length);
  console.log(
    "Contoh jumlah_usaha:",
    filteredFeatures[0]?.properties?.jumlah_usaha,
  );
  updateKPI(filteredFeatures);
  updateDetailTable(null);
}

// ===============================
// RESET FILTER
// ===============================
function resetFilter() {
  document.getElementById("kecamatan-filter").value = "";
  applyFilter();
}

// ===============================
// UPDATE KPI (FINAL)
// ===============================
function updateKPI(features) {
  document.getElementById("kpi-desa").innerText = features.length;

  let totalUsaha = 0;

  features.forEach((f) => {
    const raw = f.properties["jumlah_usaha"];

    if (raw !== undefined && raw !== null) {
      const value = parseFloat(raw);

      if (!isNaN(value)) {
        totalUsaha += value;
      }
    }
  });

  document.getElementById("kpi-usaha").innerText =
    totalUsaha.toLocaleString("id-ID");
}

// ===============================
// HITUNG TOTAL USAHA (FINAL FIX)
// ===============================
function hitungTotalUsaha(props) {
  const value = props.jumlah_usaha;

  if (!isNaN(Number(value))) {
    return Number(value);
  }

  return 0;
}

// ===============================
// UPDATE MAP
// ===============================
// ===============================
// UPDATE MAP (CHOROPLETH FIXED)
// ===============================
function updateMap(geoJson) {
  if (filteredLayer) {
    map.removeLayer(filteredLayer);
    selectedFeature = null;
  }

  // Cari nilai maksimum
  let maxUsaha = 0;
  geoJson.features.forEach((f) => {
    const value = Number(f.properties.jumlah_usaha) || 0;
    if (value > maxUsaha) maxUsaha = value;
  });

  filteredLayer = L.geoJson(geoJson, {
    style: function (feature) {
      const total = Number(feature.properties.jumlah_usaha) || 0;

      const intensity = maxUsaha ? total / maxUsaha : 0;

      return {
        fillColor: "#f79039",
        fillOpacity: 0.2 + intensity * 0.8,
        weight: 1,
        color: "#555",
      };
    },

    onEachFeature: function (feature, layer) {
      layer.bindTooltip(feature.properties.nmdesa, {
        direction: "top",
      });

      layer.on("click", () => {
        if (selectedFeature) {
          filteredLayer.resetStyle(selectedFeature);
        }

        layer.setStyle({
          weight: 3,
          color: "#000",
        });

        selectedFeature = layer;
        updateDetailTable(feature.properties);
      });
    },
  }).addTo(map);

  if (filteredLayer.getLayers().length > 0) {
    map.fitBounds(filteredLayer.getBounds());
  }
}

// ===============================
// DETAIL TABLE (FINAL STABLE)
// ===============================
function updateDetailTable(properties) {
  const tableBody = document.getElementById("detail-table-body");
  tableBody.innerHTML = "";

  if (!properties) {
    tableBody.innerHTML =
      '<tr><td colspan="2">Klik desa untuk melihat detail.</td></tr>';
    return;
  }

  const totalUsaha = Number(properties.jumlah_usaha) || 0;

  let kbliData = [];

  Object.keys(properties).forEach((key) => {
    // Hanya kolom 6 digit angka
    if (/^\d{5}$/.test(key)) {
      const value = Number(properties[key]);

      if (!isNaN(value) && value > 0) {
        kbliData.push({
          kode: key,
          nilai: value,
        });
      }
    }
  });

  kbliData.sort((a, b) => b.nilai - a.nilai);
  const top5 = kbliData.slice(0, 5);

  // Nama Desa
  let row1 = tableBody.insertRow();
  row1.insertCell().textContent = "Nama Desa";
  row1.insertCell().textContent = properties.nmdesa;

  // Total Usaha
  let row2 = tableBody.insertRow();
  row2.insertCell().textContent = "Jumlah Usaha";
  row2.insertCell().textContent = totalUsaha.toLocaleString("id-ID");

  // Separator
  let separator = tableBody.insertRow();
  separator.insertCell().textContent = "Top 5 KBLI";
  separator.insertCell().textContent = "";

  top5.forEach((item) => {
    let row = tableBody.insertRow();

    const namaKBLI = kbliReference[item.kode] || "Deskripsi belum tersedia";

    row.insertCell().textContent = `KBLI ${item.kode} - ${namaKBLI}`;

    row.insertCell().textContent = item.nilai.toLocaleString("id-ID");
  });
}
