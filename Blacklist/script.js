/**
 * ฟังก์ชันเปลี่ยนหน้า
 */
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    updateNavUI(pageId);
}

/**
 * อัปเดต UI ของ Navbar
 */
function updateNavUI(pageId) {
    const navSearch = document.getElementById('nav-search');
    const navReport = document.getElementById('nav-report');
    
    navSearch.classList.remove('active-nav');
    navReport.classList.remove('active-nav');

    if (pageId === 'searchPage') navSearch.classList.add('active-nav');
    if (pageId === 'reportPage') navReport.classList.add('active-nav');
}

/**
 * จัดการการค้นหา
 */
function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultList = document.getElementById('resultList');
    const resultArea = document.getElementById('searchResultArea');

    if (!query) {
        alert("กรุณากรอกข้อมูลก่อนค้นหา");
        return;
    }

    resultArea.classList.remove('hidden');
    resultList.innerHTML = `<div class="text-center py-10 text-slate-400">กำลังค้นหาข้อมูลของ "${query}"...</div>`;

    // ตัวอย่างการเชื่อมต่อ Database ในอนาคต
    // fetch(`/api/search?name=${query}`).then(res => res.json()).then(data => {...})
}

/**
 * จัดการการส่งฟอร์ม (Submit)
 */
function handleReportSubmit(e) {
    e.preventDefault();
    alert("ระบบบันทึกเบาะแสเรียบร้อยแล้ว (รอยืนยันจากแอดมิน)");
    e.target.reset();
    showPage('searchPage');
}

// เริ่มต้นหน้าแรก
window.onload = () => updateNavUI('searchPage');