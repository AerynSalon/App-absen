document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Elemen DOM ---
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
    const formAbsensi = document.getElementById('formAbsensi');
    const pilihKaryawanSelect = document.getElementById('pilihKaryawan');
    const bodyTabelAbsensi = document.getElementById('bodyTabelAbsensi');
    const rekapContainer = document.getElementById('rekapContainer');
    const btnDownloadLaporan = document.getElementById('btnDownloadLaporan');
    
    // BARU: Elemen untuk fitur QR
    const btnLihatQr = document.getElementById('btnLihatQr');
    const modalQr = document.getElementById('modalQr');
    const closeButton = document.querySelector('.close-button');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const btnMulaiScan = document.getElementById('btnMulaiScan');
    const btnBatalScan = document.getElementById('btnBatalScan');
    const qrReaderDiv = document.getElementById('qr-reader');

    // --- Inisialisasi Data ---
    let karyawan = [
        { id: 1672531200001, nama: 'Bunga Citra' },
        { id: 1672531200002, nama: 'Dewi Lestari' },
        { id: 1672531200003, nama: 'Sari Puspita' }
    ];
    let absensi = [];
    let html5QrCodeScanner; // Variabel untuk menyimpan instance scanner

    // --- Fungsi-Fungsi Aplikasi ---

    // Fungsi yang sudah ada (tidak banyak berubah)
    function renderKaryawanDropdown() {
        pilihKaryawanSelect.innerHTML = '<option value="">-- Pilih Karyawan --</option>';
        karyawan.forEach(k => {
            const option = document.createElement('option');
            option.value = k.id;
            option.textContent = k.nama;
            pilihKaryawanSelect.appendChild(option);
        });
    }

    function tambahKaryawan() {
        const namaBaru = namaKaryawanBaruInput.value.trim();
        if (namaBaru === '') { alert('Nama karyawan tidak boleh kosong!'); return; }
        const karyawanBaru = { id: Date.now(), nama: namaBaru };
        karyawan.push(karyawanBaru);
        namaKaryawanBaruInput.value = '';
        renderKaryawanDropdown();
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }

    function renderTabelAbsensi() {
        bodyTabelAbsensi.innerHTML = '';
        if (absensi.length === 0) {
            bodyTabelAbsensi.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada data absensi.</td></tr>';
            return;
        }
        // Urutkan absensi dari yang terbaru
        const absensiTerurut = absensi.slice().reverse();
        absensiTerurut.forEach(absen => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${absen.namaKaryawan}</td>
                <td>${absen.tanggal}</td>
                <td>${absen.waktu}</td>
                <td class="status-${absen.status.toLowerCase()}">${absen.status}</td>
            `;
            bodyTabelAbsensi.appendChild(tr);
        });
    }

    function renderRekapitulasi() {
        const rekap = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
        absensi.forEach(a => rekap[a.status]++);
        rekapContainer.innerHTML = `
            <div class="rekap-item"><div class="count status-hadir">${rekap.Hadir}</div><div>Hadir</div></div>
            <div class="rekap-item"><div class="count status-izin">${rekap.Izin}</div><div>Izin</div></div>
            <div class="rekap-item"><div class="count status-sakit">${rekap.Sakit}</div><div>Sakit</div></div>
            <div class="rekap-item"><div class="count status-alpha">${rekap.Alpha}</div><div>Alpha</div></div>`;
    }

    function catatAbsensi(karyawanId, status = 'Hadir') {
        const karyawanTerpilih = karyawan.find(k => k.id == karyawanId);
        if (!karyawanTerpilih) {
            alert('Error: Karyawan tidak ditemukan!');
            return false;
        }

        // Cek apakah karyawan sudah absen hari ini
        const hariIni = new Date().toLocaleDateString('id-ID');
        const sudahAbsen = absensi.find(a => a.idKaryawan == karyawanId && a.tanggal === hariIni);
        if (sudahAbsen) {
            alert(`${karyawanTerpilih.nama} sudah melakukan absensi hari ini.`);
            return false;
        }

        const sekarang = new Date();
        const absenBaru = {
            idKaryawan: karyawanId,
            namaKaryawan: karyawanTerpilih.nama,
            tanggal: hariIni,
            waktu: sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: status
        };
        absensi.push(absenBaru);
        renderTabelAbsensi();
        renderRekapitulasi();
        return true;
    }

    function downloadLaporan() {
        if (absensi.length === 0) { alert('Tidak ada data absensi untuk diunduh.'); return; }
        const header = ["Nama Karyawan", "Tanggal", "Waktu", "Status"];
        const rows = absensi.map(absen => [absen.namaKaryawan, absen.tanggal, absen.waktu, absen.status].join(','));
        const csvContent = [header.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan-absensi-aeryn-salon-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // --- BARU: Fungsi untuk Fitur QR Code ---

    function tampilkanModalQr() {
        qrCodeContainer.innerHTML = ''; // Kosongkan container
        karyawan.forEach(k => {
            const qrItem = document.createElement('div');
            qrItem.className = 'qr-item';
            
            const nama = document.createElement('b');
            nama.textContent = k.nama;
            
            const qrImg = document.createElement('img');
            // Kita gunakan API gratis untuk membuat QR code
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${k.id}`;
            qrImg.alt = `QR Code for ${k.nama}`;

            qrItem.appendChild(qrImg);
            qrItem.appendChild(nama);
            qrCodeContainer.appendChild(qrItem);
        });
        modalQr.style.display = 'block';
    }

    function onScanSuccess(decodedText, decodedResult) {
        // Hentikan scanner setelah berhasil
        html5QrCodeScanner.clear().then(_ => {
            const berhasil = catatAbsensi(decodedText, 'Hadir');
            if (berhasil) {
                const karyawanTerpilih = karyawan.find(k => k.id == decodedText);
                alert(`Absensi untuk ${karyawanTerpilih.nama} berhasil dicatat!`);
            }
            // Sembunyikan lagi UI scanner
            qrReaderDiv.classList.add('hidden');
            btnBatalScan.classList.add('hidden');
            btnMulaiScan.classList.remove('hidden');
        }).catch(error => {
            console.error("Gagal membersihkan scanner.", error);
        });
    }

    function onScanFailure(error) {
        // Abaikan saja, fungsi ini akan terpanggil terus menerus jika tidak ada QR code
    }

    function mulaiScan() {
        // Tampilkan UI scanner
        btnMulaiScan.classList.add('hidden');
        qrReaderDiv.classList.remove('hidden');
        btnBatalScan.classList.remove('hidden');

        // Inisialisasi scanner jika belum ada
        if (!html5QrCodeScanner) {
            html5QrCodeScanner = new Html5QrcodeScanner(
                "qr-reader", // ID div tempat kamera akan tampil
                { fps: 10, qrbox: { width: 250, height: 250 } }, // Konfigurasi
                /* verbose= */ false
            );
        }
        // Mulai rendering kamera dan scanner
        html5QrCodeScanner.render(onScanSuccess, onScanFailure);
    }

    function batalScan() {
        html5QrCodeScanner.clear().catch(error => {
            console.error("Gagal membersihkan scanner.", error);
        });
        qrReaderDiv.classList.add('hidden');
        btnBatalScan.classList.add('hidden');
        btnMulaiScan.classList.remove('hidden');
    }

    // --- Event Listeners ---
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    formAbsensi.addEventListener('submit', (e) => {
        e.preventDefault();
        const karyawanId = pilihKaryawanSelect.value;
        const status = document.querySelector('input[name="status"]:checked').value;
        if (!karyawanId) { alert('Silakan pilih karyawan!'); return; }
        catatAbsensi(karyawanId, status);
        formAbsensi.reset();
    });
    btnDownloadLaporan.addEventListener('click', downloadLaporan);

    // BARU: Event listener untuk fitur QR
    btnLihatQr.addEventListener('click', tampilkanModalQr);
    closeButton.addEventListener('click', () => modalQr.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == modalQr) {
            modalQr.style.display = 'none';
        }
    });
    btnMulaiScan.addEventListener('click', mulaiScan);
    btnBatalScan.addEventListener('click', batalScan);


    // --- Inisialisasi Aplikasi ---
    renderKaryawanDropdown();
    renderTabelAbsensi();
    renderRekapitulasi();
});
