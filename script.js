// ===============================
// GLOBAL VARIABLES
// ===============================
let geojsonData = null;
let filteredLayer = null;
let selectedFeature = null;
let map = null;
let satelliteMap = null;
let satelliteMarker = null;

let currentKBLIData = [];
let kbliReference = {};

let kbliCacheAll = {};
let kbliCacheByKecamatan = {};

// ===============================
// LOAD KBLI REFERENCE
// ===============================
async function loadKBLIReference() {
  try {
    const res = await fetch("shapefile/kbli2025_filtered.json");
    kbliReference = await res.json();
    console.log("KBLI reference loaded");
  } catch (err) {
    console.error("Gagal load KBLI reference", err);
  }
}

// ===============================
// INIT MAP
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  map = L.map("map").setView([-2.5, 118], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  satelliteMap = L.map("satelliteMap", {
    zoomControl: false,
    attributionControl: false,
  }).setView([-0.7, 100.9], 11);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19 },
  ).addTo(satelliteMap);

  await loadKBLIReference();
  await loadData();

  document
    .getElementById("kecamatan-filter")
    .addEventListener("change", applyFilter);

  document
    .getElementById("reset-filter-btn")
    .addEventListener("click", resetFilter);

  // ===============================
  // LIVE SEARCH KBLI (DEBOUNCE)
  // ===============================
  let searchTimeout;
  document.getElementById("kbli-search").addEventListener("input", function () {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      const keyword = this.value.toLowerCase();

      const filtered = currentKBLIData.filter(
        (item) =>
          item.kode.includes(keyword) ||
          item.nama.toLowerCase().includes(keyword),
      );

      renderKBLITable(filtered);
    }, 300);
  });
});

// ===============================
// LOAD GEOJSON
// ===============================
async function loadData() {
  try {
    const res = await fetch("shapefile/DataDashboardFinal.geojson");
    geojsonData = await res.json();

    populateKecamatanFilter();
    precomputeKBLI(); // 🔥 cache KBLI sekali saja
    applyFilter();
  } catch (err) {
    console.error(err);
    alert("Gagal memuat DataDashboardFinal.geojson");
  }
}

// ===============================
// PRECOMPUTE KBLI CACHE (🔥 OPTIMASI TERBESAR)
// ===============================
function precomputeKBLI() {
  const globalAgg = {};
  const kecAgg = {};

  geojsonData.features.forEach((f) => {
    const kec = f.properties.wadmkc;

    if (!kecAgg[kec]) kecAgg[kec] = {};

    Object.keys(f.properties).forEach((key) => {
      if (/^\d{5}$/.test(key)) {
        const val = Number(f.properties[key]);
        if (!isNaN(val) && val > 0) {
          globalAgg[key] = (globalAgg[key] || 0) + val;
          kecAgg[kec][key] = (kecAgg[kec][key] || 0) + val;
        }
      }
    });
  });

  kbliCacheAll = globalAgg;
  kbliCacheByKecamatan = kecAgg;

  console.log("KBLI cache ready");
}

// ===============================
// POPULATE KECAMATAN FILTER
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
  requestAnimationFrame(() => {
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
    updateKPI(filteredFeatures);
    updateKBLIByKecamatan(selectedKec);
    updateDetailTable(null);
  });
}

// ===============================
// RESET FILTER
// ===============================
function resetFilter() {
  document.getElementById("kecamatan-filter").value = "";
  applyFilter();

  document.getElementById("selected-nagari-name").innerText =
    "Belum ada nagari dipilih";

  const instruction = document.getElementById("satellite-instruction");
  if (instruction) instruction.style.display = "block";
}

// ===============================
// UPDATE KPI
// ===============================
function updateKPI(features) {
  document.getElementById("kpi-desa").innerText = features.length;

  let totalUsaha = 0;
  features.forEach((f) => {
    const val = Number(f.properties.jumlah_usaha);
    if (!isNaN(val)) totalUsaha += val;
  });

  document.getElementById("kpi-usaha").innerText =
    totalUsaha.toLocaleString("id-ID");
}

// ===============================
// UPDATE KBLI (PAKAI CACHE)
// ===============================
function updateKBLIByKecamatan(selectedKec) {
  const sourceAgg = selectedKec
    ? kbliCacheByKecamatan[selectedKec] || {}
    : kbliCacheAll;

  const sortedKBLI = Object.entries(sourceAgg).sort((a, b) => b[1] - a[1]);

  currentKBLIData = sortedKBLI.map(([kode, total]) => ({
    kode,
    nama: kbliReference[kode] || "Deskripsi belum tersedia",
    total,
  }));

  renderKBLITable(currentKBLIData);
}

// ===============================
// UPDATE MAP
// ===============================
function updateMap(geoJson) {
  if (filteredLayer) {
    map.removeLayer(filteredLayer);
    selectedFeature = null;
  }

  let maxUsaha = 0;
  geoJson.features.forEach((f) => {
    const val = Number(f.properties.jumlah_usaha) || 0;
    if (val > maxUsaha) maxUsaha = val;
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
      layer.bindTooltip(feature.properties.nmdesa);

      layer.on("click", function () {
        if (selectedFeature) {
          filteredLayer.resetStyle(selectedFeature);
        }

        layer.setStyle({
          weight: 3,
          color: "#000",
        });

        selectedFeature = layer;

        updateDetailTable(feature.properties);

        const bounds = layer.getBounds();
        const center = bounds.getCenter();

        map.fitBounds(bounds);
        satelliteMap.setView(center, 17);

        if (satelliteMarker) {
          satelliteMap.removeLayer(satelliteMarker);
        }

        satelliteMarker = L.marker(center).addTo(satelliteMap);

        document.getElementById("selected-nagari-name").innerText =
          feature.properties.nmdesa.toUpperCase();

        const instruction = document.getElementById("satellite-instruction");
        if (instruction) instruction.style.display = "none";
      });
    },
  }).addTo(map);

  if (filteredLayer.getLayers().length > 0) {
    map.fitBounds(filteredLayer.getBounds());
  }
}

// ===============================
// DETAIL TABLE
// ===============================
function updateDetailTable(properties) {
  const tableBody = document.getElementById("detail-table-body");
  tableBody.innerHTML = "";

  if (!properties) {
    tableBody.innerHTML =
      '<tr><td colspan="2">Klik nagari untuk melihat detail.</td></tr>';
    return;
  }

  const totalUsaha = Number(properties.jumlah_usaha) || 0;

  // 🔹 ambil data tambahan dari geojson
  const jumlahJorong = Number(properties.jml_jorong) || 0;
  const jumlahPenduduk = Number(properties.jml_pdd) || 0;
  const luasWilayah = Number(properties.luas) || 0;

  let kbliData = [];

  Object.keys(properties).forEach((key) => {
    if (/^\d{5}$/.test(key)) {
      const value = Number(properties[key]);
      if (!isNaN(value) && value > 0) {
        kbliData.push({ kode: key, nilai: value });
      }
    }
  });

  kbliData.sort((a, b) => b.nilai - a.nilai);
  const top5 = kbliData.slice(0, 5);

  tableBody.innerHTML += `
    <tr><td>Nama Nagari</td><td>${properties.nmdesa}</td></tr>
    <tr><td>Jumlah Usaha</td><td>${totalUsaha.toLocaleString("id-ID")}</td></tr>
    <tr><td>Jumlah Jorong</td><td>${jumlahJorong.toLocaleString("id-ID")}</td></tr>
    <tr><td>Jumlah Penduduk</td><td>${jumlahPenduduk.toLocaleString("id-ID")}</td></tr>
    <tr><td>Luas Wilayah</td><td>${luasWilayah.toLocaleString("id-ID")} km²</td></tr>
    <tr><td colspan="2"><strong>Top 5 KBLI</strong></td></tr>
  `;

  top5.forEach((item) => {
    const namaKBLI = kbliReference[item.kode] || "Deskripsi belum tersedia";

    tableBody.innerHTML += `
      <tr>
        <td>KBLI ${item.kode} - ${namaKBLI}</td>
        <td>${item.nilai.toLocaleString("id-ID")}</td>
      </tr>
    `;
  });
}

// ===============================
// RENDER KBLI TABLE
// ===============================
function renderKBLITable(data) {
  const tbody = document.getElementById("kbli-table-body");

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-muted">
          Data tidak ditemukan
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  data.forEach((item) => {
    html += `
      <tr>
        <td>
          <strong>${item.kode}</strong><br>
          <small class="text-muted">${item.nama}</small>
        </td>
        <td class="text-end fw-semibold">
          ${item.total.toLocaleString("id-ID")}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}
