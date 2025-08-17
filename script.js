document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Elemen DOM ---
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
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
    const daftarKaryawanContainer = document.getElementById('daftarKaryawanContainer');
    const manualActionButtons = document.getElementById('manualActionButtons');
    const modalActionButtons = document.getElementById('modalActionButtons');

    // --- Inisialisasi Data & Variabel ---
    const KARYAWAN_STORAGE_KEY = 'aerynSalonKaryawan';
    const ABSENSI_STORAGE_KEY = 'aerynSalonAbsensi';
    const QR_CODE_CONTENT = "AERYN_SALON_ABSENSI";
    let karyawan = [];
    let absensi = [];
    let html5QrCodeScanner;

    // --- Fungsi Penyimpanan & Pemuatan Data ---
    function saveData() { localStorage.setItem(KARYAWAN_STORAGE_KEY, JSON.stringify(karyawan)); localStorage.setItem(ABSENSI_STORAGE_KEY, JSON.stringify(absensi)); }
    function loadData() {
        const karyawanData = localStorage.getItem(KARYAWAN_STORAGE_KEY);
        karyawan = karyawanData ? JSON.parse(karyawanData) : [{ id: 1672531200001, nama: 'Bunga Citra' }, { id: 1672531200002, nama: 'Dewi Lestari' }];
        const absensiData = localStorage.getItem(ABSENSI_STORAGE_KEY);
        absensi = absensiData ? JSON.parse(absensiData) : [];
    }

    // --- (PERUBAHAN UTAMA) Fungsi Logika Inti & Validasi ---
    function catatAksi(karyawanId, tipeAksi) {
        const karyawanTerpilih = karyawan.find(k => k.id == karyawanId);
        if (!karyawanTerpilih) { alert('Error: Karyawan tidak ditemukan!'); return false; }
        
        const hariIni = new Date().toLocaleDateString('id-ID');
        const absensiHariIni = absensi.filter(a => a.idKaryawan == karyawanId && a.tanggal === hariIni);
        
        // --- Validasi Cerdas ---
        const sudahMasuk = absensiHariIni.some(a => a.tipe_aksi === 'Masuk');
        const sudahKeluar = absensiHariIni.some(a => a.tipe_aksi === 'Keluar');
        const sudahMulaiLembur = absensiHariIni.some(a => a.tipe_aksi === 'Mulai Lembur');
        const sudahSelesaiLembur = absensiHariIni.some(a => a.tipe_aksi === 'Selesai Lembur');
        const sudahIzinSakit = absensiHariIni.some(a => a.tipe_aksi === 'Izin' || a.tipe_aksi === 'Sakit');

        if (sudahIzinSakit) {
            alert(`${karyawanTerpilih.nama} sudah tercatat Izin/Sakit hari ini dan tidak dapat melakukan aksi lain.`);
            return false;
        }

        switch (tipeAksi) {
            case 'Masuk':
                if (sudahMasuk) { alert(`${karyawanTerpilih.nama} sudah melakukan absen Masuk hari ini.`); return false; }
                break;
            case 'Keluar':
                if (!sudahMasuk) { alert(`${karyawanTerpilih.nama} harus absen Masuk terlebih dahulu.`); return false; }
                if (sudahKeluar) { alert(`${karyawanTerpilih.nama} sudah melakukan absen Keluar hari ini.`); return false; }
                break;
            case 'Mulai Lembur':
                if (!sudahMasuk) { alert(`${karyawanTerpilih.nama} harus absen Masuk terlebih dahulu.`); return false; }
                if (sudahMulaiLembur) { alert(`${karyawanTerpilih.nama} sudah memulai lembur.`); return false; }
                break;
            case 'Selesai Lembur':
                if (!sudahMulaiLembur) { alert(`${karyawanTerpilih.nama} belum memulai lembur.`); return false; }
                if (sudahSelesaiLembur) { alert(`${karyawanTerpilih.nama} sudah menyelesaikan lembur hari ini.`); return false; }
                break;
            case 'Izin':
            case 'Sakit':
                if (sudahMasuk) { alert(`${karyawanTerpilih.nama} sudah tercatat Masuk dan tidak bisa Izin/Sakit.`); return false; }
                if (absensiHariIni.length > 0) { alert('Aksi tidak dapat dilakukan karena sudah ada catatan lain hari ini.'); return false; }
                break;
        }

        // Jika lolos validasi, catat aksi
        const sekarang = new Date();
        const aksiBaru = {
            id: Date.now(),
            idKaryawan: karyawanId,
            namaKaryawan: karyawanTerpilih.nama,
            tanggal: hariIni,
            waktu: sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            tipe_aksi: tipeAksi // Menggunakan properti baru
        };
        absensi.push(aksiBaru);
        saveData();
        renderTabelAbsensi();
        renderRekapitulasi();
        alert(`Aksi "${tipeAksi}" untuk ${karyawanTerpilih.nama} berhasil dicatat!`);
        return true;
    }

    // --- Fungsi-Fungsi Render UI ---
    function renderTabelAbsensi() {
        bodyTabelAbsensi.innerHTML = '';
        if (absensi.length === 0) {
            bodyTabelAbsensi.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada aktivitas.</td></tr>';
            return;
        }
        const absensiTerurut = absensi.slice().sort((a, b) => b.id - a.id); // Urutkan berdasarkan waktu pencatatan
        absensiTerurut.forEach(absen => {
            const tr = document.createElement('tr');
            // Ganti 'status' menjadi 'tipe_aksi'
            tr.innerHTML = `<td>${absen.namaKaryawan}</td><td>${absen.tanggal}</td><td>${absen.waktu}</td><td>${absen.tipe_aksi}</td>`;
            bodyTabelAbsensi.appendChild(tr);
        });
    }

    function renderRekapitulasi() {
        const hariIni = new Date().toLocaleDateString('id-ID');
        const absensiHariIni = absensi.filter(a => a.tanggal === hariIni);
        
        // Hitung Hadir berdasarkan aksi 'Masuk' yang unik per karyawan
        const idKaryawanHadir = [...new Set(absensiHariIni.filter(a => a.tipe_aksi === 'Masuk').map(a => a.idKaryawan))];
        const hadirCount = idKaryawanHadir.length;

        const izinCount = [...new Set(absensiHariIni.filter(a => a.tipe_aksi === 'Izin').map(a => a.idKaryawan))].length;
        const sakitCount = [...new Set(absensiHariIni.filter(a => a.tipe_aksi === 'Sakit').map(a => a.idKaryawan))].length;

        rekapContainer.innerHTML = `<div class="rekap-item"><div class="count status-hadir">${hadirCount}</div><div>Hadir</div></div><div class="rekap-item"><div class="count status-izin">${izinCount}</div><div>Izin</div></div><div class="rekap-item"><div class="count status-sakit">${sakitCount}</div><div>Sakit</div></div>`;
    }

    function downloadLaporanXLS() {
        if (absensi.length === 0) { alert('Tidak ada data untuk diunduh.'); return; }
        const styles = `<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; }</style>`;
        const header = `<tr><th>Nama Karyawan</th><th>Tanggal</th><th>Waktu</th><th>Aksi</th></tr>`;
        const rows = absensi.map(absen => `<tr><td>${absen.namaKaryawan}</td><td>${absen.tanggal}</td><td>'${absen.waktu}</td><td>${absen.tipe_aksi}</td></tr>`).join('');
        const tableHtml = `<html><head>${styles}</head><body><h2>Laporan Aktivitas Karyawan</h2><table><thead>${header}</thead><tbody>${rows}</tbody></table></body></html>`;
        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `laporan-aktivitas-aeryn-salon-${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Sisa fungsi (Manajemen Karyawan, QR Scan, dll) ---
    function renderDaftarKaryawan() { /* ... tidak berubah ... */ }
    function renderKaryawanDropdowns() { /* ... tidak berubah ... */ }
    function tambahKaryawan() { /* ... tidak berubah ... */ }
    function hapusKaryawan(event) { /* ... tidak berubah ... */ }
    function onScanSuccess(decodedText) { /* ... tidak berubah ... */ }
    function onScanFailure(error) { /* ... tidak berubah ... */ }
    function mulaiScan() { /* ... tidak berubah ... */ }
    function batalScan() { /* ... tidak berubah ... */ }
    function tampilkanQrUmum() { /* ... tidak berubah ... */ }
    
    // --- Event Listeners (dengan perubahan) ---
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    daftarKaryawanContainer.addEventListener('click', hapusKaryawan);
    btnDownloadLaporan.addEventListener('click', downloadLaporanXLS);
    btnMulaiScan.addEventListener('click', mulaiScan);
    btnBatalScan.addEventListener('click', batalScan);
    btnLihatQrUmum.addEventListener('click', tampilkanQrUmum);
    
    // (PERUBAHAN UTAMA) Menggunakan event delegation untuk tombol aksi
    manualActionButtons.addEventListener('click', (event) => {
        const button = event.target.closest('.btn-aksi');
        if (button) {
            const karyawanId = pilihKaryawanSelect.value;
            if (!karyawanId) {
                alert('Silakan pilih karyawan terlebih dahulu!');
                return;
            }
            const action = button.dataset.action;
            catatAksi(karyawanId, action);
        }
    });

    modalActionButtons.addEventListener('click', (event) => {
        const button = event.target.closest('.btn-aksi');
        if (button) {
            const karyawanId = pilihKaryawanModal.value;
            if (!karyawanId) {
                alert('Anda harus memilih nama Anda!');
                return;
            }
            const action = button.dataset.action;
            if (catatAksi(karyawanId, action)) {
                modalPilihKaryawan.style.display = 'none'; // Tutup modal jika berhasil
            }
        }
    });

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

    // Salinan fungsi yang tidak berubah agar lengkap
    function renderDaftarKaryawan() { daftarKaryawanContainer.innerHTML = ''; if (karyawan.length === 0) { daftarKaryawanContainer.innerHTML = '<p>Belum ada karyawan.</p>'; return; } karyawan.forEach(k => { const item = document.createElement('div'); item.className = 'karyawan-item'; item.innerHTML = `<span>${k.nama}</span><button class="btn-hapus" data-id="${k.id}">Hapus</button>`; daftarKaryawanContainer.appendChild(item); }); }
    function renderKaryawanDropdowns() { pilihKaryawanSelect.innerHTML = '<option value="">-- Pilih Karyawan --</option>'; pilihKaryawanModal.innerHTML = '<option value="">-- Pilih Nama Anda --</option>'; karyawan.forEach(k => { const option = `<option value="${k.id}">${k.nama}</option>`; pilihKaryawanSelect.innerHTML += option; pilihKaryawanModal.innerHTML += option; }); }
    function tambahKaryawan() { const namaBaru = namaKaryawanBaruInput.value.trim(); if (namaBaru === '') { alert('Nama karyawan tidak boleh kosong!'); return; } const karyawanBaru = { id: Date.now(), nama: namaBaru }; karyawan.push(karyawanBaru); namaKaryawanBaruInput.value = ''; saveData(); renderDaftarKaryawan(); renderKaryawanDropdowns(); alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`); }
    function hapusKaryawan(event) { if (event.target.classList.contains('btn-hapus')) { const idToDelete = event.target.dataset.id; const karyawanDihapus = karyawan.find(k => k.id == idToDelete); if (karyawanDihapus && confirm(`Anda yakin ingin menghapus karyawan "${karyawanDihapus.nama}"?`)) { karyawan = karyawan.filter(k => k.id != idToDelete); saveData(); renderDaftarKaryawan(); renderKaryawanDropdowns(); alert(`Karyawan "${karyawanDihapus.nama}" berhasil dihapus.`); } } }
    function onScanSuccess(decodedText) { if (decodedText === QR_CODE_CONTENT) { html5QrCodeScanner.clear().then(() => { modalPilihKaryawan.style.display = 'block'; qrReaderDiv.classList.add('hidden'); btnBatalScan.classList.add('hidden'); btnMulaiScan.classList.remove('hidden'); }); } else { alert("QR Code tidak valid!"); } }
    function onScanFailure(error) {}
    function mulaiScan() { btnMulaiScan.classList.add('hidden'); qrReaderDiv.classList.remove('hidden'); btnBatalScan.classList.remove('hidden'); if (!html5QrCodeScanner) { html5QrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false); } html5QrCodeScanner.render(onScanSuccess, onScanFailure); }
    function batalScan() { html5QrCodeScanner.clear().catch(err => {}); qrReaderDiv.classList.add('hidden'); btnBatalScan.classList.add('hidden'); btnMulaiScan.classList.remove('hidden'); }
    function tampilkanQrUmum() { window.open(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${QR_CODE_CONTENT}`, '_blank'); }
});
