document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Elemen DOM ---
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
    const formAbsensi = document.getElementById('formAbsensi');
    const pilihKaryawanSelect = document.getElementById('pilihKaryawan');
    const bodyTabelAbsensi = document.getElementById('bodyTabelAbsensi');
    const rekapContainer = document.getElementById('rekapContainer');
    const btnDownloadLaporan = document.getElementById('btnDownloadLaporan');
    
    // BARU: Elemen untuk fitur QR Umum
    const btnLihatQrUmum = document.getElementById('btnLihatQrUmum');
    const btnMulaiScan = document.getElementById('btnMulaiScan');
    const btnBatalScan = document.getElementById('btnBatalScan');
    const qrReaderDiv = document.getElementById('qr-reader');
    const modalPilihKaryawan = document.getElementById('modalPilihKaryawan');
    const closePilihKaryawan = document.getElementById('closePilihKaryawan');
    const pilihKaryawanModal = document.getElementById('pilihKaryawanModal');
    const btnKonfirmasiAbsenModal = document.getElementById('btnKonfirmasiAbsenModal');
    
    // --- Inisialisasi Data ---
    const KARYAWAN_STORAGE_KEY = 'aerynSalonKaryawan';
    const ABSENSI_STORAGE_KEY = 'aerynSalonAbsensi';
    const QR_CODE_CONTENT = "AERYN_SALON_ABSENSI"; // Teks unik untuk QR Code Umum

    let karyawan = [];
    let absensi = [];
    let html5QrCodeScanner;

    function saveData() {
        localStorage.setItem(KARYAWAN_STORAGE_KEY, JSON.stringify(karyawan));
        localStorage.setItem(ABSENSI_STORAGE_KEY, JSON.stringify(absensi));
    }

    function loadData() {
        const karyawanData = localStorage.getItem(KARYAWAN_STORAGE_KEY);
        if (karyawanData) {
            karyawan = JSON.parse(karyawanData);
        } else {
            karyawan = [
                { id: 1672531200001, nama: 'Bunga Citra' },
                { id: 1672531200002, nama: 'Dewi Lestari' },
                { id: 1672531200003, nama: 'Sari Puspita' }
            ];
        }
        const absensiData = localStorage.getItem(ABSENSI_STORAGE_KEY);
        absensi = absensiData ? JSON.parse(absensiData) : [];
    }

    // --- Fungsi-Fungsi Aplikasi ---

    function renderKaryawanDropdowns() {
        // Fungsi ini sekarang mengisi DUA dropdown (manual & modal)
        pilihKaryawanSelect.innerHTML = '<option value="">-- Pilih Karyawan --</option>';
        pilihKaryawanModal.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
        karyawan.forEach(k => {
            const option = document.createElement('option');
            option.value = k.id;
            option.textContent = k.nama;
            pilihKaryawanSelect.appendChild(option.cloneNode(true));
            pilihKaryawanModal.appendChild(option.cloneNode(true));
        });
    }

    function tambahKaryawan() {
        const namaBaru = namaKaryawanBaruInput.value.trim();
        if (namaBaru === '') { alert('Nama karyawan tidak boleh kosong!'); return; }
        const karyawanBaru = { id: Date.now(), nama: namaBaru };
        karyawan.push(karyawanBaru);
        namaKaryawanBaruInput.value = '';
        renderKaryawanDropdowns(); // Update kedua dropdown
        saveData();
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }
    
    function renderTabelAbsensi() {
        // ... (Tidak berubah)
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
        // ... (Tidak berubah)
        const rekap = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
        absensi.forEach(a => rekap[a.status]++);
        rekapContainer.innerHTML = `<div class="rekap-item"><div class="count status-hadir">${rekap.Hadir}</div><div>Hadir</div></div><div class="rekap-item"><div class="count status-izin">${rekap.Izin}</div><div>Izin</div></div><div class="rekap-item"><div class="count status-sakit">${rekap.Sakit}</div><div>Sakit</div></div><div class="rekap-item"><div class="count status-alpha">${rekap.Alpha}</div><div>Alpha</div></div>`;
    }

    function catatAbsensi(karyawanId, status = 'Hadir') {
        const karyawanTerpilih = karyawan.find(k => k.id == karyawanId);
        if (!karyawanTerpilih) { alert('Error: Karyawan tidak ditemukan!'); return false; }
        const hariIni = new Date().toLocaleDateString('id-ID');
        const sudahAbsen = absensi.find(a => a.idKaryawan == karyawanId && a.tanggal === hariIni);
        if (sudahAbsen) { alert(`${karyawanTerpilih.nama} sudah melakukan absensi hari ini.`); return false; }
        const sekarang = new Date();
        const absenBaru = {
            idKaryawan: karyawanId,
            namaKaryawan: karyawanTerpilih.nama,
            tanggal: hariIni,
            waktu: sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: status
        };
        absensi.push(absenBaru);
        saveData();
        renderTabelAbsensi();
        renderRekapitulasi();
        return true;
    }

    // --- BARU: Logika untuk QR Code Umum ---

    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText === QR_CODE_CONTENT) {
            // Hentikan scanner
            html5QrCodeScanner.clear().then(_ => {
                // Tampilkan modal untuk memilih karyawan
                modalPilihKaryawan.style.display = 'block';
                // Sembunyikan UI scanner
                qrReaderDiv.classList.add('hidden');
                btnBatalScan.classList.add('hidden');
                btnMulaiScan.classList.remove('hidden');
            }).catch(error => console.error("Gagal membersihkan scanner.", error));
        } else {
            alert("QR Code tidak valid!");
        }
    }

    function onScanFailure(error) { /* Abaikan */ }

    function mulaiScan() {
        btnMulaiScan.classList.add('hidden');
        qrReaderDiv.classList.remove('hidden');
        btnBatalScan.classList.remove('hidden');
        if (!html5QrCodeScanner) {
            html5QrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        }
        html5QrCodeScanner.render(onScanSuccess, onScanFailure);
    }

    function batalScan() {
        html5QrCodeScanner.clear().catch(error => console.error("Gagal membersihkan scanner.", error));
        qrReaderDiv.classList.add('hidden');
        btnBatalScan.classList.add('hidden');
        btnMulaiScan.classList.remove('hidden');
    }

    function tampilkanQrUmum() {
        // Buka tab baru yang menampilkan gambar QR Code dari API
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${QR_CODE_CONTENT}`, '_blank');
    }


    // --- Event Listeners ---
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    formAbsensi.addEventListener('submit', (e) => {
        e.preventDefault();
        const karyawanId = pilihKaryawanSelect.value;
        const status = document.querySelector('input[name="status"]:checked').value;
        if (!karyawanId) { alert('Silakan pilih karyawan!'); return; }
        if (catatAbsensi(karyawanId, status)) {
            formAbsensi.reset();
        }
    });

    // Event Listener untuk fitur QR
    btnMulaiScan.addEventListener('click', mulaiScan);
    btnBatalScan.addEventListener('click', batalScan);
    btnLihatQrUmum.addEventListener('click', tampilkanQrUmum);
    
    // Event Listener untuk modal pilih karyawan
    btnKonfirmasiAbsenModal.addEventListener('click', () => {
        const karyawanId = pilihKaryawanModal.value;
        if (!karyawanId) {
            alert('Anda harus memilih nama Anda!');
            return;
        }
        if (catatAbsensi(karyawanId, 'Hadir')) {
            alert(`Absensi untuk ${karyawan.find(k=>k.id==karyawanId).nama} berhasil dicatat!`);
            modalPilihKaryawan.style.display = 'none';
        }
    });
    closePilihKaryawan.addEventListener('click', () => modalPilihKaryawan.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == modalPilihKaryawan) {
            modalPilihKaryawan.style.display = 'none';
        }
    });
    
    // --- Inisialisasi Aplikasi ---
    function init() {
        loadData();
        renderKaryawanDropdowns();
        renderTabelAbsensi();
        renderRekapitulasi();
    }
    
    init();

});
