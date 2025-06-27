// Menunggu sampai seluruh halaman HTML dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Data & Elemen DOM ---
    
    // Mengambil elemen-elemen dari HTML yang akan kita gunakan
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
    const formAbsensi = document.getElementById('formAbsensi');
    const pilihKaryawanSelect = document.getElementById('pilihKaryawan');
    const bodyTabelAbsensi = document.getElementById('bodyTabelAbsensi');
    const rekapContainer = document.getElementById('rekapContainer');

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
        pilihKaryawanSelect.innerHTML = '<option value="">-- Pilih Karyawan --</option>'; // Reset dropdown
        karyawan.forEach(k => {
            const option = document.createElement('option');
            option.value = k.id;
            option.textContent = k.nama;
            pilihKaryawanSelect.appendChild(option);
        });
    }

    /**
     * Fungsi untuk menambahkan karyawan baru.
     */
    function tambahKaryawan() {
        const namaBaru = namaKaryawanBaruInput.value.trim(); // Ambil nama dan hapus spasi berlebih
        if (namaBaru === '') {
            alert('Nama karyawan tidak boleh kosong!');
            return;
        }

        // Buat objek karyawan baru
        const karyawanBaru = {
            id: Date.now(), // Gunakan timestamp sebagai ID unik
            nama: namaBaru
        };

        // Tambahkan ke array karyawan
        karyawan.push(karyawanBaru);
        
        // Kosongkan input field
        namaKaryawanBaruInput.value = '';
        
        // Update tampilan dropdown
        renderKaryawanDropdown();
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }

    /**
     * Fungsi untuk merender (menampilkan) tabel log absensi.
     */
    function renderTabelAbsensi() {
        bodyTabelAbsensi.innerHTML = ''; // Kosongkan tabel sebelum diisi ulang

        if (absensi.length === 0) {
            bodyTabelAbsensi.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada data absensi hari ini.</td></tr>';
            return;
        }

        absensi.forEach(absen => {
            const tr = document.createElement('tr'); // Buat baris baru (table row)
            
            // Buat sel-sel tabel (table data)
            tr.innerHTML = `
                <td>${absen.namaKaryawan}</td>
                <td>${absen.tanggal}</td>
                <td>${absen.waktu}</td>
                <td class="status-${absen.status.toLowerCase()}">${absen.status}</td>
            `;
            
            bodyTabelAbsensi.appendChild(tr); // Tambahkan baris ke dalam tabel
        });
    }

    /**
     * Fungsi untuk menghitung dan menampilkan rekapitulasi.
     */
    function renderRekapitulasi() {
        // Hitung jumlah untuk setiap status
        const rekap = {
            Hadir: absensi.filter(a => a.status === 'Hadir').length,
            Izin: absensi.filter(a => a.status === 'Izin').length,
            Sakit: absensi.filter(a => a.status === 'Sakit').length,
            Alpha: absensi.filter(a => a.status === 'Alpha').length,
        };

        // Tampilkan hasil perhitungan ke HTML
        rekapContainer.innerHTML = `
            <div class="rekap-item">
                <div class="count status-hadir">${rekap.Hadir}</div>
                <div>Hadir</div>
            </div>
            <div class="rekap-item">
                <div class="count status-izin">${rekap.Izin}</div>
                <div>Izin</div>
            </div>
            <div class="rekap-item">
                <div class="count status-sakit">${rekap.Sakit}</div>
                <div>Sakit</div>
            </div>
            <div class="rekap-item">
                <div class="count status-alpha">${rekap.Alpha}</div>
                <div>Alpha</div>
            </div>
        `;
    }

    /**
     * Fungsi untuk menangani proses pencatatan absensi.
     * @param {Event} event - Objek event dari form submission.
     */
    function catatAbsensi(event) {
        event.preventDefault(); // Mencegah form mengirim data dan me-refresh halaman

        const karyawanId = pilihKaryawanSelect.value;
        const status terpilih = document.querySelector('input[name="status"]:checked').value;

        // Validasi: pastikan karyawan dipilih
        if (karyawanId === '') {
            alert('Silakan pilih karyawan terlebih dahulu!');
            return;
        }
        
        // Cari nama karyawan berdasarkan ID yang dipilih
        const karyawanTerpilih = karyawan.find(k => k.id == karyawanId);

        // Dapatkan waktu saat ini
        const sekarang = new Date();
        
        // Buat objek absensi baru
        const absenBaru = {
            idKaryawan: karyawanId,
            namaKaryawan: karyawanTerpilih.nama,
            tanggal: sekarang.toLocaleDateString('id-ID'), // Format tanggal Indonesia
            waktu: sekarang.toLocaleTimeString('id-ID'),   // Format waktu Indonesia
            status: status terpilih
        };

        // Tambahkan ke array absensi
        absensi.push(absenBaru);
        
        // Update tampilan tabel dan rekapitulasi
        renderTabelAbsensi();
        renderRekapitulasi();

        // Reset form setelah submit
        formAbsensi.reset();
    }

    // --- Event Listeners ---

    // Menjalankan fungsi tambahKaryawan saat tombol diklik
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    
    // Menjalankan fungsi catatAbsensi saat form di-submit
    formAbsensi.addEventListener('submit', catatAbsensi);


    // --- Inisialisasi Aplikasi Saat Pertama Kali Dimuat ---
    
    // Panggil fungsi-fungsi ini agar tampilan awal sudah siap
    renderKaryawanDropdown();
    renderTabelAbsensi();
    renderRekapitulasi();

});