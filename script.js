
// Script.js - Versi terhubung ke Google Sheets

function simpanAbsensi(nama, status) {
  fetch("https://script.google.com/macros/s/AKfycbyVQ_DY2BH39uIj9Bi11p12e4uTqELNIa41VnAZECSN2RHzDUa4_ZHmASnpZ_ASGbpo/exec", {
    method: "POST",
    body: JSON.stringify({ nama: nama, status: status }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    alert("Absensi berhasil disimpan!");
  })
  .catch(err => {
    console.error("Error:", err);
    alert("Gagal menyimpan absensi!");
  });
}

// Contoh pemanggilan saat tombol ditekan
document.addEventListener("DOMContentLoaded", function() {
  const btnMasuk = document.getElementById("btnMasuk");
  const btnKeluar = document.getElementById("btnKeluar");
  const inputNama = document.getElementById("nama");

  if (btnMasuk) {
    btnMasuk.addEventListener("click", function() {
      const nama = inputNama.value;
      if (nama) simpanAbsensi(nama, "Masuk");
      else alert("Nama harus diisi!");
    });
  }

  if (btnKeluar) {
    btnKeluar.addEventListener("click", function() {
      const nama = inputNama.value;
      if (nama) simpanAbsensi(nama, "Keluar");
      else alert("Nama harus diisi!");
    });
  }
});
