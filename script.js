document.addEventListener('DOMContentLoaded', () => {

    // --- Inisialisasi Data & Elemen DOM ---
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const namaKaryawanBaruInput = document.getElementById('namaKaryawanBaru');
    const formAbsensi = document.getElementById('formAbsensi');
    const pilihKaryawanSelect = document.getElementById('pilihKaryawan');
    const bodyTabelAbsensi = document.getElementById('bodyTabelAbsensi');
    const rekapContainer = document.getElementById('rekapContainer');
    // BARU: Mengambil elemen tombol download
    const btnDownloadLaporan = document.getElementById('btnDownloadLaporan');

    let karyawan = [
        { id: 1, nama: 'Bunga Citra' },
        { id: 2, nama: 'Dewi Lestari' },
        { id: 3, nama: 'Sari Puspita' }
    ];
    let absensi = [];

    // --- Fungsi-Fungsi Aplikasi ---

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
        if (namaBaru === '') {
            alert('Nama karyawan tidak boleh kosong!');
            return;
        }
        const karyawanBaru = { id: Date.now(), nama: namaBaru };
        karyawan.push(karyawanBaru);
        namaKaryawanBaruInput.value = '';
        renderKaryawanDropdown();
        alert(`Karyawan "${namaBaru}" berhasil ditambahkan!`);
    }

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
            waktu: sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: statusTerpilih
        };
        absensi.push(absenBaru);
        renderTabelAbsensi();
        renderRekapitulasi();
        formAbsensi.reset();
    }

    // --- BARU: FUNGSI UNTUK DOWNLOAD LAPORAN ---
    /**
     * Mengubah data absensi menjadi format CSV dan mengunduhnya.
     */
    function downloadLaporan() {
        if (absensi.length === 0) {
            alert('Tidak ada data absensi untuk diunduh.');
            return;
        }

        // 1. Buat header untuk file CSV
        const header = ["Nama Karyawan", "Tanggal", "Waktu", "Status"];
        
        // 2. Ubah setiap objek absensi menjadi baris CSV
        const rows = absensi.map(absen => 
            [absen.namaKaryawan, absen.tanggal, absen.waktu, absen.status].join(',')
        );

        // 3. Gabungkan header dan semua baris data, dipisahkan oleh baris baru (\n)
        const csvContent = [header.join(','), ...rows].join('\n');

        // 4. Buat file virtual (Blob) dari konten CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // 5. Buat link sementara untuk memicu download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);

        // 6. Tentukan nama file download
        const tglHariIni = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
        link.setAttribute("download", `laporan-absensi-salon-${tglHariIni}.csv`);
        
        // 7. Sembunyikan link, tambahkan ke halaman, klik, lalu hapus
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Event Listeners ---
    btnTambahKaryawan.addEventListener('click', tambahKaryawan);
    formAbsensi.addEventListener('submit', catatAbsensi);
    // BARU: Menambahkan event listener untuk tombol download
    btnDownloadLaporan.addEventListener('click', downloadLaporan);

    // --- Inisialisasi Aplikasi ---
    renderKaryawanDropdown();
    renderTabelAbsensi();
    renderRekapitulasi();
});
