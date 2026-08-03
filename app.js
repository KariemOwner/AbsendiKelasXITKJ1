/**
 * app.js - Logika Database Supabase dan Interaksi UI
 * Sistem Absensi Kelas XI TKJ 1
 * 
 * File ini berisi:
 * 1. Inisialisasi klien Supabase
 * 2. Fungsi-fungsi untuk mengelola data siswa dari Supabase
 * 3. Fungsi autentikasi dan sesi login
 * 4. Utility functions
 */

// ============================================
// 1. KONFIGURASI SUPABASE
// ============================================

const SUPABASE_URL = "https://dxoiuulrotueudmnqfxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_iiTToUfJSZNfe18EErsBHw_SrAFX_Zs";

// Inisialisasi klien Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// 2. FUNGSI DATABASE SUPABASE
// ============================================

/**
 * Inisialisasi database - memastikan koneksi ke Supabase berjalan
 * Untuk prototype ini, kita tidak perlu init khusus karena data sudah ada di Supabase
 */
async function initDatabase() {
    try {
        // Test koneksi dengan fetch data sederhana
        const { data, error } = await supabaseClient
            .from('siswa')
            .select('id')
            .limit(1);
        
        if (error) {
            console.error('❌ Error koneksi ke Supabase:', error.message);
            alert('⚠️ Gagal terhubung ke database. Periksa koneksi internet Anda.');
            return false;
        }
        
        console.log('✅ Terhubung ke Supabase');
        return true;
    } catch (err) {
        console.error('❌ Error inisialisasi:', err.message);
        alert('⚠️ Terjadi kesalahan saat menghubungkan ke database.');
        return false;
    }
}

/**
 * Mendapatkan semua data siswa dari Supabase
 * @returns {Promise<Array>} Array of student objects
 */
async function getSiswa() {
    try {
        const { data, error } = await supabaseClient
            .from('siswa')
            .select('*')
            .eq('role', 'siswa')
            .order('nama_lengkap', { ascending: true });
        
        if (error) throw error;
        
        // Transform kolom snake_case ke camelCase untuk konsistensi
        return data.map(siswa => ({
            id: siswa.id.toString(),
            namaLengkap: siswa.nama_lengkap,
            namaPanggilan: siswa.nama_panggilan,
            password: siswa.password,
            role: siswa.role,
            statusAbsenHariIni: siswa.status_absen
        }));
    } catch (err) {
        console.error('❌ Error mengambil data siswa:', err.message);
        alert('⚠️ Gagal mengambil data siswa dari database.');
        return [];
    }
}

/**
 * Mendapatkan siswa berdasarkan ID dari Supabase
 * @param {string} id - ID siswa
 * @returns {Promise<Object|null>} Student object or null
 */
async function getSiswaById(id) {
    try {
        const { data, error } = await supabaseClient
            .from('siswa')
            .select('*')
            .eq('id', parseInt(id))
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // Data not found
            throw error;
        }
        
        return {
            id: data.id.toString(),
            namaLengkap: data.nama_lengkap,
            namaPanggilan: data.nama_panggilan,
            password: data.password,
            role: data.role,
            statusAbsenHariIni: data.status_absen
        };
    } catch (err) {
        console.error('❌ Error mengambil data siswa by ID:', err.message);
        return null;
    }
}

/**
 * Mendapatkan siswa berdasarkan nama panggilan dari Supabase (case-insensitive)
 * @param {string} nama - Nama panggilan siswa
 * @returns {Promise<Object|null>} Student object or null
 */
async function getSiswaByNama(nama) {
    try {
        // Gunakan ilike untuk pencarian case-insensitive
        const { data, error } = await supabaseClient
            .from('siswa')
            .select('*')
            .ilike('nama_panggilan', nama.trim())
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // Data not found
            throw error;
        }
        
        return {
            id: data.id.toString(),
            namaLengkap: data.nama_lengkap,
            namaPanggilan: data.nama_panggilan,
            password: data.password,
            role: data.role,
            statusAbsenHariIni: data.status_absen
        };
    } catch (err) {
        console.error('❌ Error mengambil data siswa by nama:', err.message);
        return null;
    }
}

/**
 * Update password siswa di Supabase
 * @param {string} id - ID siswa
 * @param {string} newPassword - Password baru
 * @returns {Promise<boolean>} Success status
 */
async function updatePasswordSiswa(id, newPassword) {
    try {
        const { error } = await supabaseClient
            .from('siswa')
            .update({ password: newPassword })
            .eq('id', parseInt(id));
        
        if (error) throw error;
        
        console.log('✅ Password berhasil diupdate');
        return true;
    } catch (err) {
        console.error('❌ Error update password:', err.message);
        alert('⚠️ Gagal mengubah password.');
        return false;
    }
}

/**
 * Reset password siswa ke default di Supabase
 * @param {string} id - ID siswa
 * @returns {Promise<boolean>} Success status
 */
async function resetPasswordSiswa(id) {
    try {
        const { error } = await supabaseClient
            .from('siswa')
            .update({ password: '12345' })
            .eq('id', parseInt(id));
        
        if (error) throw error;
        
        console.log('✅ Password berhasil direset');
        return true;
    } catch (err) {
        console.error('❌ Error reset password:', err.message);
        alert('⚠️ Gagal mereset password.');
        return false;
    }
}

/**
 * Update status absen siswa di Supabase (untuk tabel siswa - login only)
 * @param {string} id - ID siswa
 * @param {string} newStatus - Status baru (hadir, izin, sakit, alpa)
 * @returns {Promise<boolean>} Success status
 */
async function updateStatusAbsen(id, newStatus) {
    try {
        const { error } = await supabaseClient
            .from('siswa')
            .update({ status_absen: newStatus })
            .eq('id', parseInt(id));
        
        if (error) throw error;
        
        console.log(`✅ Status absen berhasil diubah menjadi ${newStatus}`);
        return true;
    } catch (err) {
        console.error('❌ Error update status absen:', err.message);
        alert('⚠️ Gagal mengubah status absen.');
        return false;
    }
}

/**
 * Upsert data absensi ke tabel riwayat_absen
 * @param {string} namaPanggilan - Nama panggilan siswa
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @param {string} statusAbsen - Status absen (hadir, izin, sakit, alpa)
 * @param {string} alasan - Alasan absen (opsional, untuk sakit/izin)
 * @returns {Promise<boolean>} Success status
 */
async function upsertRiwayatAbsen(namaPanggilan, tanggal, statusAbsen, alasan = null) {
    try {
        // Tidak perlu mengirim waktu_absen karena database menggunakan DEFAULT CURRENT_TIMESTAMP
        const { data, error } = await supabaseClient
            .from('riwayat_absen')
            .upsert({ 
                nama_panggilan: namaPanggilan, 
                tanggal: tanggal, 
                status_absen: statusAbsen,
                alasan: alasan
            }, { 
                onConflict: 'nama_panggilan, tanggal' 
            });
        
        if (error) throw error;
        
        console.log(`✅ Riwayat absen berhasil di-upsert: ${namaPanggilan} - ${tanggal} - ${statusAbsen}`);
        return true;
    } catch (err) {
        console.error('❌ Error upsert riwayat absen:', err.message);
        alert('⚠️ Gagal menyimpan riwayat absen.');
        return false;
    }
}

/**
 * Ambil data riwayat absen berdasarkan tanggal
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @returns {Promise<Array>} Array of attendance records
 */
async function getRiwayatAbsenByTanggal(tanggal) {
    try {
        const { data, error } = await supabaseClient
            .from('riwayat_absen')
            .select('*')
            .eq('tanggal', tanggal);
        
        if (error) throw error;
        
        return data || [];
    } catch (err) {
        console.error('❌ Error mengambil riwayat absen:', err.message);
        return [];
    }
}

// ============================================
// 3. FUNGSI AUTENTIKASI
// ============================================

/**
 * Handle login form submission (deprecated - now handled in index.html)
 * Fungsi ini dipertahankan untuk kompatibilitas, tetapi tidak digunakan lagi
 * karena logika login sekarang di-handle langsung di index.html dengan UI error yang lebih baik
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    console.log('handleLogin() deprecated - gunakan logic di index.html');
}

/**
 * Cek autentikasi user
 * @param {string} requiredRole - Role yang diperlukan ('siswa' atau 'admin')
 * @returns {Object|null} Current user object or null
 */
function checkAuth(requiredRole) {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Tidak ada sesi, redirect ke login
        window.location.href = 'index.html';
        return null;
    }
    
    const user = JSON.parse(currentUser);
    
    // Cek role
    if (user.role !== requiredRole) {
        // Role tidak sesuai, redirect ke login
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
        return null;
    }
    
    return user;
}

/**
 * Logout user
 * Hapus sesi dan redirect ke halaman login
 */
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// ============================================
// 4. UTILITY FUNCTIONS
// ============================================

/**
 * Mendapatkan string tanggal hari ini dalam format YYYY-MM-DD
 * @returns {string} Date string
 */
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format waktu dari ISO string UTC ke waktu lokal WIB (HH:mm WIB)
 * @param {string} waktuUTC - Waktu dalam format ISO string dari database
 * @returns {string} Waktu dalam format HH:mm WIB
 */
function formatWaktu(waktuUTC) {
    if (!waktuUTC) return '-';
    const date = new Date(waktuUTC);
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    }) + ' WIB';
}

/**
 * Fungsi loadSiswa dihapus karena tidak lagi menggunakan dropdown
 * Diganti dengan input text yang memungkinkan user mengetik nama langsung
 * Fungsi ini dihapus sepenuhnya dari kode
 */

// ============================================
// 5. EVENT LISTENERS GLOBAL
// ============================================

/**
 * Auto-init ketika DOM loaded
 * Pastikan database terinisialisasi di semua halaman
 */
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
});

// ============================================
// 6. KONFIGURASI TAMBAHAN
// ============================================

/**
 * Debug mode - untuk development
 * Akses melalui console: debugMode()
 */
async function debugMode() {
    console.log('=== DEBUG MODE ===');
    console.log('Current Session:', sessionStorage.getItem('currentUser'));
    console.log('All Students:', await getSiswa());
    console.log('Today\'s Date:', getTodayString());
    console.log('Supabase Client:', supabaseClient ? 'Connected' : 'Not Connected');
    console.log('==================');
}

/**
 * Export fungsi-fungsi utama agar bisa diakses dari halaman lain
 */
window.initDatabase = initDatabase;
window.getSiswa = getSiswa;
window.getSiswaById = getSiswaById;
window.getSiswaByNama = getSiswaByNama;
window.handleLogin = handleLogin;
window.checkAuth = checkAuth;
window.logout = logout;
window.getTodayString = getTodayString;
window.supabaseClient = supabaseClient;
window.debugMode = debugMode;
window.updatePasswordSiswa = updatePasswordSiswa;
window.resetPasswordSiswa = resetPasswordSiswa;
window.updateStatusAbsen = updateStatusAbsen;
window.upsertRiwayatAbsen = upsertRiwayatAbsen;
window.getRiwayatAbsenByTanggal = getRiwayatAbsenByTanggal;
window.formatWaktu = formatWaktu;
window.exportToCSV = exportToCSV;
window.exportBulananToCSV = exportBulananToCSV;

// ============================================
// 7. FUNGSI EXPORT CSV
// ============================================

/**
 * Export data absensi harian ke CSV dengan delimiter titik koma (;) dan BOM
 * untuk kompatibilitas Excel di region Indonesia
 */
function exportToCSV() {
    // Ambil data dari tabel yang sedang tampil
    const students = window.siswaData || [];
    const riwayatData = window.riwayatData || [];
    
    // Tambahkan BOM untuk Excel dan gunakan delimiter titik koma (;)
    const bom = "\uFEFF";
    
    // CSV Header (gunakan titik koma sebagai delimiter)
    let csvContent = "No;Nama Siswa;Status;Waktu;Alasan\n";
    
    // Gabungkan data seperti di renderTabel
    const mergedData = students.map(siswa => {
        const riwayat = riwayatData.find(r => r.nama_panggilan === siswa.namaPanggilan);
        
        // Format waktu menggunakan fungsi formatWaktu untuk konversi UTC ke WIB
        let waktuDisplay = '-';
        if (riwayat && riwayat.waktu_absen) {
            waktuDisplay = formatWaktu(riwayat.waktu_absen);
        }
        
        return {
            no: '',
            nama: siswa.namaLengkap,
            status: riwayat ? riwayat.status_absen : 'belum',
            waktu: waktuDisplay,
            alasan: riwayat ? (riwayat.alasan || '-') : '-'
        };
    });
    
    // Add data rows (gunakan titik koma sebagai delimiter)
    mergedData.forEach((row, index) => {
        row.no = index + 1;
        csvContent += `${row.no};"${row.nama}";${row.status};${row.waktu};"${row.alasan}"\n`;
    });
    
    // Tambahkan BOM di awal agar Excel membaca UTF-8 dengan benar
    csvContent = bom + csvContent;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Format filename: Absensi_TKJ1_[Tanggal].csv
    const formattedDate = selectedDate.replace(/-/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `Absensi_TKJ1_${formattedDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ Data berhasil diexport sebagai CSV!');
}

/**
 * Export data absensi bulanan ke CSV dengan format matriks
 * Kolom: No; Nama Siswa; 1; 2; 3; ...; Total Hadir; Total Izin; Total Sakit; Total Alpa
 */
async function exportBulananToCSV() {
    // Ambil bulan dan tahun dari input tanggal yang dipilih
    const tanggalInput = document.getElementById('tanggalFilter').value;
    if (!tanggalInput) {
        alert('⚠️ Pilih tanggal terlebih dahulu!');
        return;
    }
    
    const dateObj = new Date(tanggalInput + 'T00:00:00');
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-11
    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long' });
    
    // Tentukan tanggal awal dan akhir bulan
    const tglAwalBulan = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const tglAkhirBulan = new Date(year, month + 1, 0);
    const lastDay = tglAkhirBulan.getDate();
    const tglAkhirBulanStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    // Fetch semua siswa
    const students = await getSiswa();
    
    // Fetch semua data riwayat absen pada bulan tersebut
    const { data: riwayatData, error } = await supabaseClient
        .from('riwayat_absen')
        .select('*')
        .gte('tanggal', tglAwalBulan)
        .lte('tanggal', tglAkhirBulanStr);
    
    if (error) {
        console.error('❌ Error mengambil data bulanan:', error.message);
        alert('⚠️ Gagal mengambil data absensi bulan ini.');
        return;
    }
    
    // Tambahkan BOM untuk Excel dan gunakan delimiter titik koma (;)
    const bom = "\uFEFF";
    
    // Buat header CSV: No; Nama Siswa; 1; 2; 3; ...; Total Hadir; Total Izin; Total Sakit; Total Alpa
    let header = "No;Nama Siswa";
    for (let day = 1; day <= lastDay; day++) {
        header += `;${day}`;
    }
    header += ";Total Hadir;Total Izin;Total Sakit;Total Alpa";
    
    let csvContent = header + "\n";
    
    // Looping data siswa
    students.forEach((siswa, index) => {
        let row = `${index + 1};"${siswa.namaLengkap}"`;
        
        let totalHadir = 0;
        let totalIzin = 0;
        let totalSakit = 0;
        let totalAlpa = 0;
        
        // Loop setiap hari dalam bulan
        for (let day = 1; day <= lastDay; day++) {
            const currentTgl = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Cari data absen untuk siswa ini pada tanggal ini
            const riwayat = riwayatData.find(r => 
                r.nama_panggilan === siswa.namaPanggilan && r.tanggal === currentTgl
            );
            
            if (riwayat) {
                const status = riwayat.status_absen;
                row += `;${status.toUpperCase().charAt(0)}`;
                
                // Hitung total
                if (status === 'hadir') totalHadir++;
                else if (status === 'izin') totalIzin++;
                else if (status === 'sakit') totalSakit++;
                else if (status === 'alpa') totalAlpa++;
            } else {
                // Jika belum ada data, isi dengan strip
                row += ';-';
            }
        }
        
        // Tambahkan total di kolom paling kanan
        row += `;${totalHadir};${totalIzin};${totalSakit};${totalAlpa}`;
        
        csvContent += row + "\n";
    });
    
    // Tambahkan BOM di awal
    csvContent = bom + csvContent;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Format filename: Rekap_Absensi_TKJ1_Bulan_[Bulan]-[Tahun].csv
    const monthNum = String(month + 1).padStart(2, '0');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Absensi_TKJ1_Bulan_${monthNum}-${year}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Rekap absensi bulan ${monthName} ${year} berhasil diexport!`);
}

// ============================================
// 8. FUNGSI CHATBOT AI ASSISTANT
// ============================================

/**
 * Toggle chat window visibility
 */
function toggleChatWindow() {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    chatWindow.classList.toggle('hidden');
    
    // Focus ke input saat dibuka
    if (!chatWindow.classList.contains('hidden')) {
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 100);
    }
}

/**
 * Escape HTML untuk mencegah XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Kirim pesan ke API chatbot backend
 */
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Tampilkan pesan user
    const userBubble = document.createElement('div');
    userBubble.className = 'flex justify-end mb-3';
    userBubble.innerHTML = `
        <div class="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-xs break-words shadow-md">
            ${escapeHtml(message)}
        </div>
    `;
    chatMessages.appendChild(userBubble);
    
    // Clear input
    input.value = '';
    
    // Auto-scroll ke bawah
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Tampilkan indikator "mengetik..."
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typingIndicator';
    typingIndicator.className = 'flex justify-start mb-3';
    typingIndicator.innerHTML = `
        <div class="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-none max-w-xs shadow-md">
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // DEBUG: Mulai mengirim pesan
        console.log("Mulai mengirim pesan...", message);
        
        // Fetch ke backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        // DEBUG: Response diterima
        console.log("Response diterima:", response.status);
        
        // Hapus indikator mengetik
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
        
        // Coba parse response JSON untuk error handling yang lebih baik
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Jika response bukan JSON, lempar error dengan status
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!response.ok) {
            // Simpan responseData di error object untuk digunakan di catch block
            const error = new Error(data.error || `HTTP error! status: ${response.status}`);
            error.responseData = data;
            throw error;
        }
        
        const aiReply = data.reply || 'Maaf, terjadi kesalahan.';
        
        // --- LOGIKA AI AGENT & DEBUGGING ---
        console.log("Raw balasan AI:", aiReply); // INTIP BALASAN ASLI AI

        let displayText = aiReply;
        const commandRegex = /\|\|\|(.*?)\|\|\|/;
        const commandMatch = aiReply.match(commandRegex);

        if (commandMatch) {
            console.log("✅ Hidden command terdeteksi:", commandMatch[1]);
            try {
                const cmd = JSON.parse(commandMatch[1]);
                displayText = aiReply.replace(commandRegex, '').trim(); // Sembunyikan dari layar
                
                const tglInput = document.getElementById('tanggalInput') || document.querySelector('input[type="date"]');
                const selectedDate = tglInput ? tglInput.value : new Date().toISOString().split('T')[0];
                const jamSekarang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

                // Update database Supabase
                (async () => {
                    const { data: siswa } = await supabaseClient
                        .from('siswa')
                        .select('nama_panggilan')
                        .ilike('nama_panggilan', `%${cmd.nama}%`)
                        .single();

                    if (siswa) {
                        const { error } = await supabaseClient.from('riwayat_absen').upsert({
                            nama_panggilan: siswa.nama_panggilan,
                            tanggal: selectedDate,
                            status_absen: cmd.status.toLowerCase(),
                            alasan: cmd.alasan || '-',
                            waktu: jamSekarang
                        }, { onConflict: 'nama_panggilan, tanggal' });
                        
                        if (error) {
                            console.error("❌ Gagal update Supabase:", error);
                        } else {
                            console.log("🚀 Supabase SUKSES diupdate untuk:", siswa.nama_panggilan);
                            setTimeout(() => { window.location.reload(); }, 1500); // Auto-refresh 1.5 detik
                        }
                    } else {
                        console.warn("⚠️ Siswa tidak ditemukan di DB untuk query:", cmd.nama);
                    }
                })();
            } catch (e) {
                console.error("❌ JSON Parse error pada hidden command:", e);
            }
        } else {
            console.log("⚠️ Tidak ada hidden command dalam balasan AI.");
        }
        // ----------------------------------------
        
        // Tampilkan balasan AI
        const aiBubble = document.createElement('div');
        aiBubble.className = 'flex justify-start mb-3';
        aiBubble.innerHTML = `
            <div class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-2xl rounded-tl-none max-w-xs break-words shadow-md">
                ${escapeHtml(displayText)}
            </div>
        `;
        chatMessages.appendChild(aiBubble);
        
    } catch (error) {
        // DEBUG: Tangkap error secara eksplisit
        console.error("Gagal melakukan fetch:", error);
        
        console.error('Error sending message:', error);
        
        // Hapus indikator mengetik jika ada
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
        
        // Coba ambil pesan error dari response jika ada
        let errorMessage = '⚠️ Maaf, gagal menghubungi AI. Silakan coba lagi.';
        
        // Jika error memiliki response JSON (dari backend)
        if (error.responseData && typeof error.responseData === 'object') {
            // Gunakan pesan error dari backend jika tersedia
            errorMessage = error.responseData.error || errorMessage;
            // Tambahkan emoji jika belum ada
            if (!errorMessage.startsWith('⚠️') && !errorMessage.startsWith('❌')) {
                errorMessage = '⚠️ ' + errorMessage;
            }
        }
        
        // Tampilkan pesan error
        const errorBubble = document.createElement('div');
        errorBubble.className = 'flex justify-start mb-3';
        errorBubble.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-2xl rounded-tl-none max-w-xs break-words shadow-md">
                ${escapeHtml(errorMessage)}
            </div>
        `;
        chatMessages.appendChild(errorBubble);
    }
    
    // Auto-scroll ke bawah
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Handle Enter key pada chat input
 */
function handleChatKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Event Listener untuk tombol kirim dan input chat
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');

    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

console.log('✅ app.js loaded successfully - Connected to Supabase with supabaseClient');
