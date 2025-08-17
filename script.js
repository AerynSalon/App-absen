function simpanAbsen() {
  const nama = document.getElementById("nama").value;
  const jamMasuk = document.getElementById("jamMasuk").value;
  const jamKeluar = document.getElementById("jamKeluar").value;

  fetch("https://script.google.com/macros/s/AKfycbyVQ_DY2BH39uIj9Bi11p12e4uTqELNIa41VnAZECSN2RHzDUa4_ZHmASnpZ_ASGbpo/exec", {
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
