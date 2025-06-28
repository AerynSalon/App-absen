document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Elemen DOM ---
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
    const formAbsensi = document.getElementById('formAbsensi');
    const pilihKaryawanSelect = document.getElementById('pilihKaryawan');
    const bodyTabelAbsensi = document.getElementById('bodyTabelAbsensi');
    const rekapContainer = document.getElementById('rekapContainer');
    const btnDownloadLaporan = document.getElementById('btnDownloadLaporan');
    const btnLihatQrUmum = document.getElementById('btnLihatQrUmum');
    const btnMulaiScan = document.getElementById('btnMulaiScan');
    const btnBatalScan = document.getElementById('btnBatalScan');
    const qrReaderDiv = document.getElementById('qr-reader');
    const modalPilihKaryawan = document.getElementById('modalPilihKaryawan');
    const closePilihKaryawan = document.getElementById('closePilihKaryawan');
    const pilihKaryawanModal = document.getElementById('pilihKaryawanModal');
    const btnKonfirmasiAbsenModal = document.getElementById('btnKonfirmasiAbsenModal');
    const daftarKaryawanContainer = document.getElementById('daftarKaryawanContainer');

    // --- Inisialisasi Data & Variabel ---
    const KARYAWAN_STORAGE_KEY = 'aerynSalonKaryawan';
    const ABSENSI_STORAGE_KEY = 'aerynSalonAbsensi';
    const QR_CODE_CONTENT = "AERYN_SALON_ABSENSI";
    let karyawan = [];
    let absensi = [];
    let html5QrCodeScanner;

    // --- Fungsi Penyimpanan & Pemuatan Data ---
    function saveData() {
        localStorage.setItem(KARYAWAN_STORAGE_KEY, JSON.stringify(karyawan));
        localStorage.setItem(ABSENSI_STORAGE_KEY, JSON.stringify(absensi));
    }

    function loadData() {
        const karyawanData = localStorage.getItem(KARYAWAN_STORAGE_KEY);
        if (karyawanData) {
            karyawan = JSON.parse(karyawanData);
        } else {
            karyawan = [{ id: 1672531200001, nama: 'Bunga Citra' }, { id: 1672531200002, nama: 'Dewi Lestari' }];
        }
        const absensiData = localStorage.getItem(ABSENSI_STORAGE_KEY);
        absensi = absensiData ? JSON.parse(absensiData) : [];
    }

    // --- Fungsi-Fungsi Render UI ---
    function renderDaftarKaryawan() {
        daftarKaryawanContainer.innerHTML = '';
        if (karyawan.length === 0) {
            daftarKaryawanContainer.innerHTML = '<p>Belum ada karyawan.</p>';
            return;
        }
        karyawan.forEach(k => {
            const item = document.createElement('div');
            item.className = 'karyawan-item';
            item.innerHTML = `<span>${k.nama}</span><button class="btn-hapus" data-id="${k.id}">Hapus</button>`;
            daftarKaryawanContainer.appendChild(item);
        });
    }

    function renderKaryawanDropdowns() {
        pilihKaryawanSelect.innerHTML = '<option value="">-- Pilih Karyawan --</option>';
        pilihKaryawanModal.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
        karyawan.forEach(k => {
            const option = `<option value="${k.id}">${k.nama}</option>`;
            pilihKaryawanSelect.innerHTML += option;
            pilihKaryawanModal.innerHTML += option;
        });
    }

    function renderTabelAbsensi() {
        bodyTabelAbsensi.innerHTML = '';
        if (absensi.length === 0) {
            bodyTabelAbsensi.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada data absensi.</td></tr>';
            return;
        }
        const absensiTerurut = absensi.slice().reverse();
        absensiTerurut.forEach(absen => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${absen.namaKaryawan}</td><td>${absen.tanggal}</td><td>${absen.waktu}</td><td class="status-${absen.status.toLowerCase()}">${absen.status}</td>`;
            bodyTabelAbsensi.appendChild(tr);
        });
    }

    function renderRekapitulasi() {
        const rekap = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
        absensi.forEach(a => rekap[a.status]++);
        rekapContainer.innerHTML = `<div class="rekap-item"><div class="count status-hadir">${rekap.Hadir}</div><div>Hadir</div></div><div class="rekap-item"><div class="count status-izin">${rekap.Izin}</div><div>Izin</div></div><div class="rekap-item"><div class="count status-sakit">${rekap.Sakit}</div><div>Sakit</div></div><div class="rekap-item"><div class="count status-alpha">${rekap.Alpha}</div><div>Alpha</div></div>`;
    }
    
    // --- (PEMBARUAN) Fungsi Download Laporan menjadi Tabel Excel (.xls) ---
    function downloadLaporanXLS() {
        if (absensi.length === 0) {
            alert('Tidak ada data absensi untuk diunduh.');
            return;
        }

        // 1. Buat template HTML dengan gaya (CSS) untuk tabel
        const styles = `
            <style>
                body { font-family: 'Arial', sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        `;

        // 2. Buat header tabel
        const header = `
            <tr>
                <th>Nama Karyawan</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Status</th>
            </tr>
        `;

        // 3. Buat baris-baris data dari array absensi
        const rows = absensi.map(absen => `
            <tr>
                <td>${absen.namaKaryawan}</td>
                <td>${absen.tanggal}</td>
                <td>'${absen.waktu}</td> <!-- Tambahkan petik satu agar Excel tidak mengubah format waktu -->
                <td>${absen.status}</td>
            </tr>
        `).join('');

        // 4. Gabungkan semua bagian menjadi satu dokumen HTML
        const tableHtml = `
            <html>
                <head>${styles}</head>
                <body>
                    <h2>Laporan Absensi Karyawan - Aeryn Salon</h2>
                    <table>
                        <thead>${header}</thead>
                        <tbody>${rows}</tbody>
                    </table>
                </body>
            </html>
        `;

        // 5. Buat Blob dengan tipe yang dikenali Excel
        const blob = new Blob([tableHtml], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        });

        // 6. Buat link dan picu download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        
        const tglHariIni = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `laporan-absensi-aeryn-salon-${tglHariIni}.xls`); // Simpan sebagai .xls
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // --- Fungsi Logika Inti ---
    function tambahKaryawan() {
        const namaBaru = namaKaryawanBaruInput.value.trim();
        if (namaBaru === '') { alert('Nama karyawan tidak boleh kosong!'); return; }
        const karyawanBaru = { id: Date.now(), nama: namaBaru };
        karyawan.push(karyawanBaru);
        namaKaryawanBaruInput.value = '';
        saveData();
        renderDaftarKaryawan();
        renderKaryawanDropdowns();
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }

    function hapusKaryawan(event) {
        if (event.target.classList.contains('btn-hapus')) {
            const idToDelete = event.target.dataset.id;
            const karyawanDihapus = karyawan.find(k => k.id == idToDelete);
            if (karyawanDihapus && confirm(`Anda yakin ingin menghapus karyawan "${karyawanDihapus.nama}"?`)) {
                karyawan = karyawan.filter(k => k.id != idToDelete);
                saveData();
                renderDaftarKaryawan();
                renderKaryawanDropdowns();
                alert(`Karyawan "${karyawanDihapus.nama}" berhasil dihapus.`);
            }
        }
    }

    function catatAbsensi(karyawanId, status = 'Hadir') {
        const karyawanTerpilih = karyawan.find(k => k.id == karyawanId);
        if (!karyawanTerpilih) { alert('Error: Karyawan tidak ditemukan!'); return false; }
        const hariIni = new Date().toLocaleDateString('id-ID');
        const sudahAbsen = absensi.find(a => a.idKaryawan == karyawanId && a.tanggal === hariIni);
        if (sudahAbsen) { alert(`${karyawanTerpilih.nama} sudah melakukan absensi hari ini.`); return false; }
        const sekarang = new Date();
        const absenBaru = { idKaryawan: karyawanId, namaKaryawan: karyawanTerpilih.nama, tanggal: hariIni, waktu: sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), status: status };
        absensi.push(absenBaru);
        saveData();
        renderTabelAbsensi();
        renderRekapitulasi();
        return true;
    }
    
    // ... Sisa fungsi untuk QR Code ...
    function onScanSuccess(decodedText) { if (decodedText === QR_CODE_CONTENT) { html5QrCodeScanner.clear().then(() => { modalPilihKaryawan.style.display = 'block'; qrReaderDiv.classList.add('hidden'); btnBatalScan.classList.add('hidden'); btnMulaiScan.classList.remove('hidden'); }); } else { alert("QR Code tidak valid!"); } }
    function onScanFailure(error) {}
    function mulaiScan() { btnMulaiScan.classList.add('hidden'); qrReaderDiv.classList.remove('hidden'); btnBatalScan.classList.remove('hidden'); if (!html5QrCodeScanner) { html5QrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false); } html5QrCodeScanner.render(onScanSuccess, onScanFailure); }
    function batalScan() { html5QrCodeScanner.clear().catch(err => {}); qrReaderDiv.classList.add('hidden'); btnBatalScan.classList.add('hidden'); btnMulaiScan.classList.remove('hidden'); }
    function tampilkanQrUmum() { window.open(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${QR_CODE_CONTENT}`, '_blank'); }

    // --- Event Listeners ---
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    daftarKaryawanContainer.addEventListener('click', hapusKaryawan);
    formAbsensi.addEventListener('submit', (e) => { e.preventDefault(); const id = pilihKaryawanSelect.value; const status = document.querySelector('input[name="status"]:checked').value; if (!id) { alert('Silakan pilih karyawan!'); return; } if (catatAbsensi(id, status)) formAbsensi.reset(); });
    
    // (PEMBARUAN) Pastikan event listener ini memanggil fungsi yang benar
    btnDownloadLaporan.addEventListener('click', downloadLaporanXLS);
    
    btnMulaiScan.addEventListener('click', mulaiScan);
    btnBatalScan.addEventListener('click', batalScan);
    btnLihatQrUmum.addEventListener('click', tampilkanQrUmum);
    btnKonfirmasiAbsenModal.addEventListener('click', () => { const id = pilihKaryawanModal.value; if (!id) { alert('Anda harus memilih nama Anda!'); return; } if (catatAbsensi(id, 'Hadir')) { alert(`Absensi untuk ${karyawan.find(k=>k.id==id).nama} berhasil dicatat!`); modalPilihKaryawan.style.display = 'none'; } });
    closePilihKaryawan.addEventListener('click', () => modalPilihKaryawan.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target == modalPilihKaryawan) { modalPilihKaryawan.style.display = 'none'; } });

    // --- Inisialisasi Aplikasi ---
    function init() {
        loadData();
        renderDaftarKaryawan();
        renderKaryawanDropdowns();
        renderTabelAbsensi();
        renderRekapitulasi();
    }
    
    init();
});
