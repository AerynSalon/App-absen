document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Elemen DOM ---
    // ... (semua elemen lama)
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
    
    // BARU: Elemen untuk daftar karyawan
    const daftarKaryawanContainer = document.getElementById('daftarKaryawanContainer');

    // --- Inisialisasi Data & Variabel ---
    // ... (tidak berubah)
    const KARYAWAN_STORAGE_KEY = 'aerynSalonKaryawan';
    const ABSENSI_STORAGE_KEY = 'aerynSalonAbsensi';
    const QR_CODE_CONTENT = "AERYN_SALON_ABSENSI";

    let karyawan = [];
    let absensi = [];
    let html5QrCodeScanner;

    // --- Fungsi Penyimpanan & Pemuatan Data ---
    // ... (tidak berubah)
    function saveData() { /* ... */ }
    function loadData() { /* ... */ }

    // --- Fungsi-Fungsi Aplikasi ---

    // BARU: Fungsi untuk menampilkan daftar karyawan dengan tombol hapus
    function renderDaftarKaryawan() {
        daftarKaryawanContainer.innerHTML = ''; // Kosongkan daftar
        if (karyawan.length === 0) {
            daftarKaryawanContainer.innerHTML = '<p>Belum ada karyawan yang ditambahkan.</p>';
            return;
        }
        karyawan.forEach(k => {
            const item = document.createElement('div');
            item.className = 'karyawan-item';
            
            const namaSpan = document.createElement('span');
            namaSpan.textContent = k.nama;
            
            const hapusButton = document.createElement('button');
            hapusButton.className = 'btn-hapus';
            hapusButton.textContent = 'Hapus';
            hapusButton.dataset.id = k.id; // Simpan ID di tombol untuk referensi
            
            item.appendChild(namaSpan);
            item.appendChild(hapusButton);
            daftarKaryawanContainer.appendChild(item);
        });
    }

    // BARU: Fungsi untuk menghapus karyawan
    function hapusKaryawan(event) {
        // Cek apakah yang diklik adalah tombol hapus
        if (event.target.classList.contains('btn-hapus')) {
            const idToDelete = event.target.dataset.id;
            const karyawanDihapus = karyawan.find(k => k.id == idToDelete);

            if (karyawanDihapus && confirm(`Anda yakin ingin menghapus karyawan "${karyawanDihapus.nama}"?\nRiwayat absensi karyawan ini akan tetap ada.`)) {
                // Filter array untuk membuat array baru tanpa karyawan yang dihapus
                karyawan = karyawan.filter(k => k.id != idToDelete);

                // Simpan perubahan dan update seluruh UI
                saveData();
                renderDaftarKaryawan();
                renderKaryawanDropdowns(); // Penting untuk update dropdown!
                alert(`Karyawan "${karyawanDihapus.nama}" berhasil dihapus.`);
            }
        }
    }

    function renderKaryawanDropdowns() { /* ... */ }
    function tambahKaryawan() {
        const namaBaru = namaKaryawanBaruInput.value.trim();
        if (namaBaru === '') { alert('Nama karyawan tidak boleh kosong!'); return; }
        const karyawanBaru = { id: Date.now(), nama: namaBaru };
        karyawan.push(karyawanBaru);
        namaKaryawanBaruInput.value = '';
        
        renderKaryawanDropdowns();
        renderDaftarKaryawan(); // Update daftar karyawan setelah menambah
        
        saveData();
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }
    
    // ... Sisa fungsi (renderTabelAbsensi, renderRekapitulasi, catatAbsensi, dll.) TIDAK BERUBAH ...
    // Salin dan tempel sisa fungsi dari script.js Anda sebelumnya ke sini.
    // Di bawah ini adalah salinan lengkap agar tidak bingung.
    
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

    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText === QR_CODE_CONTENT) {
            html5QrCodeScanner.clear().then(_ => {
                modalPilihKaryawan.style.display = 'block';
                qrReaderDiv.classList.add('hidden');
                btnBatalScan.classList.add('hidden');
                btnMulaiScan.classList.remove('hidden');
            }).catch(error => console.error("Gagal membersihkan scanner.", error));
        } else { alert("QR Code tidak valid!"); }
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
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${QR_CODE_CONTENT}`, '_blank');
    }

    // --- Event Listeners ---
    // ... (event listener lama)
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    formAbsensi.addEventListener('submit', (e) => { /* ... */ });
    btnMulaiScan.addEventListener('click', mulaiScan);
    btnBatalScan.addEventListener('click', batalScan);
    btnLihatQrUmum.addEventListener('click', tampilkanQrUmum);
    btnKonfirmasiAbsenModal.addEventListener('click', () => { /* ... */ });
    closePilihKaryawan.addEventListener('click', () => modalPilihKaryawan.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target == modalPilihKaryawan) { modalPilihKaryawan.style.display = 'none'; } });

    // BARU: Event listener untuk menghapus karyawan (menggunakan event delegation)
    daftarKaryawanContainer.addEventListener('click', hapusKaryawan);
    
    // --- Inisialisasi Aplikasi ---
    function init() {
        loadData();
        renderKaryawanDropdowns();
        renderDaftarKaryawan(); // Tampilkan daftar karyawan saat aplikasi dimuat
        renderTabelAbsensi();
        renderRekapitulasi();
    }
    
    init();

    // Di sini saya akan menulis ulang fungsi yang tidak berubah agar lengkap
    function saveData() { localStorage.setItem(KARYAWAN_STORAGE_KEY, JSON.stringify(karyawan)); localStorage.setItem(ABSENSI_STORAGE_KEY, JSON.stringify(absensi)); }
    function loadData() {
        const karyawanData = localStorage.getItem(KARYAWAN_STORAGE_KEY);
        if (karyawanData) { karyawan = JSON.parse(karyawanData); } else { karyawan = [{ id: 1672531200001, nama: 'Bunga Citra' }, { id: 1672531200002, nama: 'Dewi Lestari' }, { id: 1672531200003, nama: 'Sari Puspita' }]; }
        const absensiData = localStorage.getItem(ABSENSI_STORAGE_KEY);
        absensi = absensiData ? JSON.parse(absensiData) : [];
    }
    function renderKaryawanDropdowns() {
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
    formAbsensi.addEventListener('submit', (e) => {
        e.preventDefault();
        const karyawanId = pilihKaryawanSelect.value;
        const status = document.querySelector('input[name="status"]:checked').value;
        if (!karyawanId) { alert('Silakan pilih karyawan!'); return; }
        if (catatAbsensi(karyawanId, status)) { formAbsensi.reset(); }
    });
    btnKonfirmasiAbsenModal.addEventListener('click', () => {
        const karyawanId = pilihKaryawanModal.value;
        if (!karyawanId) { alert('Anda harus memilih nama Anda!'); return; }
        if (catatAbsensi(karyawanId, 'Hadir')) {
            alert(`Absensi untuk ${karyawan.find(k=>k.id==karyawanId).nama} berhasil dicatat!`);
            modalPilihKaryawan.style.display = 'none';
        }
    });
});
