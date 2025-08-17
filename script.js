function simpanAbsen() {
  const nama = document.getElementById("nama").value;
  const jamMasuk = document.getElementById("jamMasuk").value;
  const jamKeluar = document.getElementById("jamKeluar").value;

  fetch("PASTE_URL_APPS_SCRIPT_HERE", {
    method: "POST",
    body: JSON.stringify({
      nama: nama,
      jamMasuk: jamMasuk,
      jamKeluar: jamKeluar
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    alert("Absen berhasil disimpan ke Google Sheets!");
  })
  .catch(err => {
    alert("Gagal menyimpan: " + err);
  });
}
