/**
 * app.js - Logika Simulasi Database dan Interaksi UI
 * Sistem Absensi Kelas XI TKJ 1
 * 
 * File ini berisi:
 * 1. Inisialisasi database localStorage
 * 2. Fungsi-fungsi untuk mengelola data siswa
 * 3. Fungsi autentikasi dan sesi login
 * 4. Utility functions
 */

// ============================================
// 1. DATA SISWA - Database Lokal
// ============================================

/**
 * Data default siswa XI TKJ 1
 * Minimal 5 nama panggilan untuk contoh
 */
const defaultSiswa = [
    {
        id: "admin001",
        namaPanggilan: "Admin",
        password: "admin123",
        role: "admin",
        statusAbsenHariIni: null
    },
    {
        id: "siswa001",
        namaPanggilan: "Rizky",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    },
    {
        id: "siswa002",
        namaPanggilan: "Amanda",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    },
    {
        id: "siswa003",
        namaPanggilan: "Budi",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    },
    {
        id: "siswa004",
        namaPanggilan: "Citra",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    },
    {
        id: "siswa005",
        namaPanggilan: "Dimas",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    },
    {
        id: "siswa006",
        namaPanggilan: "Eka",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    },
    {
        id: "siswa007",
        namaPanggilan: "Fajar",
        password: "12345",
        role: "siswa",
        statusAbsenHariIni: null
    }
];

// ============================================
// 2. FUNGSI DATABASE LOCALSTORAGE
// ============================================

/**
 * Inisialisasi database localStorage
 * Membuat data default jika belum ada
 */
function initDatabase() {
    // Cek apakah data sudah ada di localStorage
    const existingData = localStorage.getItem('xi_tkj_1_siswa');
    
    if (!existingData) {
        // Jika belum ada, simpan data default
        localStorage.setItem('xi_tkj_1_siswa', JSON.stringify(defaultSiswa));
        console.log('✅ Database initialized with default data');
    } else {
        console.log('✅ Database already exists');
    }
}

/**
 * Mendapatkan semua data siswa dari localStorage
 * @returns {Array} Array of student objects
 */
function getSiswa() {
    const data = localStorage.getItem('xi_tkj_1_siswa');
    return data ? JSON.parse(data) : [];
}

/**
 * Mendapatkan siswa berdasarkan ID
 * @param {string} id - ID siswa
 * @returns {Object|null} Student object or null
 */
function getSiswaById(id) {
    const students = getSiswa();
    return students.find(s => s.id === id) || null;
}

/**
 * Mendapatkan siswa berdasarkan nama panggilan
 * @param {string} nama - Nama panggilan siswa
 * @returns {Object|null} Student object or null
 */
function getSiswaByNama(nama) {
    const students = getSiswa();
    return students.find(s => s.namaPanggilan.toLowerCase() === nama.toLowerCase()) || null;
}

/**
 * Update data siswa
 * @param {string} id - ID siswa
 * @param {Object} newData - Data baru yang akan diupdate
 * @returns {boolean} Success status
 */
function updateSiswa(id, newData) {
    const students = getSiswa();
    const index = students.findIndex(s => s.id === id);
    
    if (index !== -1) {
        students[index] = { ...students[index], ...newData };
        localStorage.setItem('xi_tkj_1_siswa', JSON.stringify(students));
        return true;
    }
    return false;
}

// ============================================
// 3. FUNGSI AUTENTIKASI
// ============================================

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    const namaPilihan = document.getElementById('namaPanggilan').value;
    const passwordInput = document.getElementById('password').value;
    
    // Validasi input
    if (!namaPilihan || !passwordInput) {
        alert('❌ Harap isi semua field!');
        return;
    }
    
    // Cari siswa berdasarkan nama
    const siswa = getSiswaByNama(namaPilihan);
    
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
 */
function loadSiswaOptions() {
    const selectElement = document.getElementById('namaPanggilan');
    
    if (!selectElement) return;
    
    const students = getSiswa();
    
    // Clear options except the first one
    selectElement.innerHTML = '<option value="">-- Pilih Nama --</option>';
    
    // Add student options (exclude admin)
    students
        .filter(s => s.role === 'siswa')
        .forEach(siswa => {
            const option = document.createElement('option');
            option.value = siswa.namaPanggilan;
            option.textContent = siswa.namaPanggilan;
            selectElement.appendChild(option);
        });
}

/**
 * Reset database ke data default
 * Berguna untuk testing atau jika terjadi masalah
 */
function resetDatabase() {
    if (confirm('⚠️ PERINGATAN: Ini akan menghapus semua data absensi dan mengembalikan password ke default. Lanjutkan?')) {
        localStorage.removeItem('xi_tkj_1_siswa');
        
        // Hapus semua data absensi (format: absen_YYYY-MM-DD)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('absen_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Re-initialize
        initDatabase();
        
        alert('✅ Database berhasil direset!');
        location.reload();
    }
}

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
function debugMode() {
    console.log('=== DEBUG MODE ===');
    console.log('Current Session:', sessionStorage.getItem('currentUser'));
    console.log('All Students:', getSiswa());
    console.log('Today\'s Key:', getTodayString());
    console.log('All LocalStorage Keys:', Object.keys(localStorage));
    console.log('==================');
}

/**
 * Helper untuk mendapatkan data absensi hari ini
 * @returns {Object} Absensi data
 */
function getTodayAbsensi() {
    const today = getTodayString();
    const statusKey = `absen_${today}`;
    return JSON.parse(localStorage.getItem(statusKey)) || {};
}

/**
 * Export fungsi-fungsi utama agar bisa diakses dari halaman lain
 */
window.initDatabase = initDatabase;
window.getSiswa = getSiswa;
window.getSiswaById = getSiswaById;
window.handleLogin = handleLogin;
window.checkAuth = checkAuth;
window.logout = logout;
window.getTodayString = getTodayString;
window.loadSiswaOptions = loadSiswaOptions;
window.debugMode = debugMode;
window.getTodayAbsensi = getTodayAbsensi;
window.resetDatabase = resetDatabase;

console.log('✅ app.js loaded successfully');
