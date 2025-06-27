// Menunggu sampai seluruh halaman HTML dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    console.log('Aplikasi Absensi Dimuat. Script berjalan!'); // PENANDA 1

    // --- Inisialisasi Data & Elemen DOM ---
    
    // Mengambil elemen-elemen dari HTML yang akan kita gunakan
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
    const formAbsensi = document.getElementById('formAbsensi');
    const pilihKaryawanSelect = document.getElementById('pilihKaryawan');
    const bodyTabelAbsensi = document.getElementById('bodyTabelAbsensi');
    const rekapContainer = document.getElementById('rekapContainer');

    // Pastikan semua elemen ditemukan
    if (!btnTambahKaryawan) {
        console.error('ERROR: Tombol dengan id "btnTambahKaryawan" tidak ditemukan!');
    }

    // Data Karyawan (bisa dimulai dengan data contoh)
    let karyawan = [
        { id: 1, nama: 'Bunga Citra' },
        { id: 2, nama: 'Dewi Lestari' },
        { id: 3, nama: 'Sari Puspita' }
    ];

    // Data Absensi (akan diisi oleh pengguna)
    let absensi = [];

    // --- Fungsi-Fungsi Aplikasi ---

    /**
     * Fungsi untuk merender (menampilkan) daftar karyawan di dropdown.
     */
    function renderKaryawanDropdown() {
        console.log('Fungsi renderKaryawanDropdown dijalankan.'); // PENANDA 4
        pilihKaryawanSelect.innerHTML = '<option value="">-- Pilih Karyawan --</option>'; // Reset dropdown
        karyawan.forEach(k => {
            const option = document.createElement('option');
            option.value = k.id;
            option.textContent = k.nama;
            pilihKaryawanSelect.appendChild(option);
        });
        console.log('Dropdown telah di-update.');
    }

    /**
     * Fungsi untuk menambahkan karyawan baru.
     */
    function tambahKaryawan() {
        console.log('Fungsi tambahKaryawan dijalankan!'); // PENANDA 3

        const namaBaru = namaKaryawanBaruInput.value.trim();
        console.log('Nama yang diinput:', namaBaru);

        if (namaBaru === '') {
            alert('Nama karyawan tidak boleh kosong!');
            return;
        }

        const karyawanBaru = {
            id: Date.now(),
            nama: namaBaru
        };

        karyawan.push(karyawanBaru);
        console.log('Array karyawan sekarang:', karyawan);
        
        namaKaryawanBaruInput.value = '';
        
        renderKaryawanDropdown(); // Memanggil fungsi untuk update dropdown
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }

    /**
     * Fungsi untuk merender (menampilkan) tabel log absensi.
     */
    function renderTabelAbsensi() {
        bodyTabelAbsensi.innerHTML = ''; 

        if (absensi.length === 0) {
            bodyTabelAbsensi.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada data absensi hari ini.</td></tr>';
            return;
        }

        absensi.forEach(absen => {
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

    /**
     * Fungsi untuk menghitung dan menampilkan rekapitulasi.
     */
    function renderRekapitulasi() {
        const rekap = {
            Hadir: absensi.filter(a => a.status === 'Hadir').length,
            Izin: absensi.filter(a => a.status === 'Izin').length,
            Sakit: absensi.filter(a => a.status === 'Sakit').length,
            Alpha: absensi.filter(a => a.status === 'Alpha').length,
        };

        rekapContainer.innerHTML = `
            <div class="rekap-item"><div class="count status-hadir">${rekap.Hadir}</div><div>Hadir</div></div>
            <div class="rekap-item"><div class="count status-izin">${rekap.Izin}</div><div>Izin</div></div>
            <div class="rekap-item"><div class="count status-sakit">${rekap.Sakit}</div><div>Sakit</div></div>
            <div class="rekap-item"><div class="count status-alpha">${rekap.Alpha}</div><div>Alpha</div></div>
        `;
    }

    /**
     * Fungsi untuk menangani proses pencatatan absensi.
     */
    function catatAbsensi(event) {
        event.preventDefault(); 

        const karyawanId = pilihKaryawanSelect.value;
        const statusTerpilih = document.querySelector('input[name="status"]:checked').value;

        if (karyawanId === '') {
            alert('Silakan pilih karyawan terlebih dahulu!');
            return;
        }
        
        const karyawanTerpilih = karyawan.find(k => k.id == karyawanId);
        const sekarang = new Date();
        
        const absenBaru = {
            idKaryawan: karyawanId,
            namaKaryawan: karyawanTerpilih.nama,
            tanggal: sekarang.toLocaleDateString('id-ID'),
            waktu: sekarang.toLocaleTimeString('id-ID'),
            status: statusTerpilih
        };

        absensi.push(absenBaru);
        
        renderTabelAbsensi();
        renderRekapitulasi();

        formAbsensi.reset();
    }

    // --- Event Listeners ---

    // Menjalankan fungsi tambahKaryawan saat tombol diklik
    if (btnTambahKaryawan) {
        console.log('Event listener untuk tombol Tambah Karyawan sedang ditambahkan.'); // PENANDA 2
        btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    }
    
    // Menjalankan fungsi catatAbsensi saat form di-submit
    formAbsensi.addEventListener('submit', catatAbsensi);

    // --- Inisialisasi Aplikasi Saat Pertama Kali Dimuat ---
    
    renderKaryawanDropdown();
    renderTabelAbsensi();
    renderRekapitulasi();
});
