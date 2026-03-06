import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://hvpiiivizknbmxfhlbjo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cGlpaXZpemtuYm14ZmhsYmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3ODI2OTAsImV4cCI6MjA4ODM1ODY5MH0.jAw-_DnhAKyRQNAnISJzG3lT3MnYBxE6U-80jVf1QfE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document
  .getElementById("kegiatanForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("gambar").files[0];
    const tanggal = document.getElementById("tanggal").value;
    const nama = document.getElementById("nama").value;
    const deskripsi = document.getElementById("deskripsi").value;

    try {
      // Upload gambar
      const fileName = Date.now() + "_" + file.name;

      const { error: uploadError } = await supabase.storage
        .from("kegiatan-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Ambil public URL
      const { data } = supabase.storage
        .from("kegiatan-images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // Insert ke database
      const { error: insertError } = await supabase.from("kegiatan").insert([
        {
          waktuKegiatan: tanggal,
          namaKegiatan: nama,
          deskripsi: deskripsi,
          url_gambar: imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      alert("Kegiatan berhasil ditambahkan!");
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("Upload gagal");
    }
  });
