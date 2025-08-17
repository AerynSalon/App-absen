function simpanAbsen() {
  const nama = document.getElementById("nama").value;
  const jamMasuk = document.getElementById("jamMasuk").value;
  const jamKeluar = document.getElementById("jamKeluar").value;

  fetch("https://script.google.com/macros/s/AKfycbzPBv3Lo7wSjdy41jdMuYwS1u-UG_BX0LfcPlGBa_lNUQAKJKSEOASIM7cExt3ZOD3b/exec", {
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
