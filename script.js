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
