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
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
            .from('siswa')
            .select('*')
            .order('nama_panggilan', { ascending: true });
        
        if (error) throw error;
        
        // Transform kolom snake_case ke camelCase untuk konsistensi
        return data.map(siswa => ({
            id: siswa.id.toString(),
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
        const { data, error } = await supabase
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
 * Mendapatkan siswa berdasarkan nama panggilan dari Supabase
 * @param {string} nama - Nama panggilan siswa
 * @returns {Promise<Object|null>} Student object or null
 */
async function getSiswaByNama(nama) {
    try {
        const { data, error } = await supabase
            .from('siswa')
            .select('*')
            .ilike('nama_panggilan', nama)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // Data not found
            throw error;
        }
        
        return {
            id: data.id.toString(),
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
        const { error } = await supabase
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
        const { error } = await supabase
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
 * Update status absen siswa di Supabase
 * @param {string} id - ID siswa
 * @param {string} newStatus - Status baru (hadir, izin, sakit, alpa)
 * @returns {Promise<boolean>} Success status
 */
async function updateStatusAbsen(id, newStatus) {
    try {
        const { error } = await supabase
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

// ============================================
// 3. FUNGSI AUTENTIKASI
// ============================================

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const namaPilihan = document.getElementById('namaPanggilan').value;
    const passwordInput = document.getElementById('password').value;
    
    // Validasi input
    if (!namaPilihan || !passwordInput) {
        alert('❌ Harap isi semua field!');
        return;
    }
    
    // Cari siswa berdasarkan nama dari Supabase
    const siswa = await getSiswaByNama(namaPilihan);
    
    if (!siswa) {
        alert('❌ Siswa tidak ditemukan!');
        return;
    }
    
    // Cek password
    if (siswa.password !== passwordInput) {
        alert('❌ Password salah!');
        return;
    }
    
    // Login berhasil - simpan sesi
    sessionStorage.setItem('currentUser', JSON.stringify(siswa));
    
    // Redirect berdasarkan role
    if (siswa.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'siswa.html';
    }
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
 * Load opsi siswa ke dropdown login
 * Hanya menampilkan siswa dengan role 'siswa'
 * Menggunakan async/await untuk fetch dari Supabase
 */
async function loadSiswa() {
    const selectElement = document.getElementById('namaPanggilan');
    
    if (!selectElement) return;
    
    // Clear options except the first one
    selectElement.innerHTML = '<option value="">-- Pilih Nama --</option>';
    
    try {
        // Query langsung ke tabel siswa
        const { data, error } = await supabase.from('siswa').select('*');
        
        if (error) {
            console.error('❌ Error loading siswa:', error.message);
            return;
        }
        
        // Loop untuk memasukkan elemen <option> ke dropdown
        data.forEach(siswa => {
            // Hanya tampilkan siswa dengan role 'siswa'
            if (siswa.role === 'siswa') {
                const option = document.createElement('option');
                option.value = siswa.nama_panggilan;
                option.textContent = siswa.nama_panggilan;
                selectElement.appendChild(option);
            }
        });
        
        console.log(`✅ Berhasil memuat ${data.filter(s => s.role === 'siswa').length} siswa ke dropdown`);
    } catch (err) {
        console.error('❌ Error loading siswa options:', err.message);
    }
}

// ============================================
// 5. EVENT LISTENERS GLOBAL
// ============================================

/**
 * Auto-init ketika DOM loaded
 * Pastikan database terinisialisasi di semua halaman
 * Load daftar siswa ke dropdown login
 */
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    loadSiswa();
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
    console.log('Supabase Client:', supabase ? 'Connected' : 'Not Connected');
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
window.loadSiswa = loadSiswa;
window.loadSiswaOptions = loadSiswa; // Alias untuk kompatibilitas
window.debugMode = debugMode;
window.updatePasswordSiswa = updatePasswordSiswa;
window.resetPasswordSiswa = resetPasswordSiswa;
window.updateStatusAbsen = updateStatusAbsen;

console.log('✅ app.js loaded successfully - Connected to Supabase');
