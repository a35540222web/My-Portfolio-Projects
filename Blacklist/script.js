/**
 * -------------------------------------------------------------------------
 * ระบบการทำงาน (script.js) - เวอร์ชันสมบูรณ์แบบโดย Dev
 * -------------------------------------------------------------------------
 */

// --- 1. State Management (In-Memory) ---
let blacklistData = []; 
let appealData = [];    
let members = [];       
let currentUser = null; 

// --- 2. ฟังก์ชันหลักสำหรับ UI (ผูกกับ window เพื่อให้ HTML เรียกใช้ได้แน่นอน) ---

window.showPage = (pageId) => {
    // ระบบป้องกันสิทธิ์
    if (pageId === 'adminPage' && (!currentUser || !currentUser.isAdmin)) {
        alert("⚠️ เฉพาะแอดมินเท่านั้นที่มีสิทธิ์เข้าถึงหน้านี้");
        window.showPage('searchPage');
        return;
    }
    const restricted = ['reportPage', 'appealPage'];
    if (restricted.includes(pageId) && !currentUser) {
        alert("🔒 กรุณาเข้าสู่ระบบก่อนดำเนินการแจ้งโกงหรือแก้สถานะ");
        window.showPage('loginPage');
        return;
    }

    // จัดการการแสดงผลหน้า
    document.querySelectorAll('.page-section').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        updateNavUI(pageId);
        if (pageId === 'adminPage') window.renderAdminDashboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const updateNavUI = (pageId) => {
    const navIds = ['nav-search', 'nav-list', 'nav-report', 'nav-appeal', 'nav-admin', 'nav-login'];
    navIds.forEach(id => document.getElementById(id)?.classList.remove('active-nav'));
    
    let navSuffix = pageId.replace('Page', '');
    if (navSuffix === 'cases') navSuffix = 'list';
    if (navSuffix === 'admin') navSuffix = 'admin';
    
    const activeBtn = document.getElementById('nav-' + navSuffix);
    if (activeBtn) activeBtn.classList.add('active-nav');
};

/**
 * จัดการล็อกอิน / สมัครสมาชิก
 */
window.handleLogin = (e) => {
    if (e) e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    if (user === 'admin' && pass === 'Bosszaka123') {
        currentUser = { username: 'Admin Dev', isAdmin: true };
    } else {
        const found = members.find(m => m.username === user && m.password === pass);
        if (found) currentUser = { ...found, isAdmin: false };
        else return alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
    
    document.getElementById('display-name').innerText = "สวัสดี, " + currentUser.username;
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-info').classList.add('flex');
    document.getElementById('nav-login').classList.add('hidden');
    if (currentUser.isAdmin) document.getElementById('nav-admin').classList.remove('hidden');
    
    alert("เข้าสู่ระบบเรียบร้อย");
    window.showPage('searchPage');
};

window.handleRegister = (e) => {
    e.preventDefault();
    const u = document.getElementById('regUser').value;
    const p = document.getElementById('regPass').value;
    const em = document.getElementById('regEmail').value;
    if (members.some(m => m.username === u)) return alert("Username นี้มีคนใช้แล้ว");
    members.push({ username: u, email: em, password: p });
    alert("สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน");
    window.toggleAuth('login');
};

window.handleForgotPassword = (e) => {
    e.preventDefault();
    const val = document.getElementById('forgotUser').value;
    const u = members.find(m => m.username === val);
    if (u) alert(`📧 รหัสผ่านของคุณคือ: ${u.password} (ระบบจำลองการส่งข้อมูลไปที่เมล ${u.email})`);
    else alert("ไม่พบข้อมูลผู้ใช้");
    window.toggleAuth('login');
};

window.handleLogout = () => {
    currentUser = null;
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('user-info').classList.remove('flex');
    document.getElementById('nav-login').classList.remove('hidden');
    document.getElementById('nav-admin').classList.add('hidden');
    window.showPage('searchPage');
};

window.toggleAuth = (mode) => {
    document.getElementById('auth-login-box').classList.toggle('hidden', mode !== 'login');
    document.getElementById('auth-register-box').classList.toggle('hidden', mode !== 'register');
    document.getElementById('auth-forgot-box').classList.toggle('hidden', mode !== 'forgot');
};

/**
 * จัดการข้อมูล Blacklist
 */
window.handleReportSubmit = (e) => {
    e.preventDefault();
    const file = document.getElementById('reportFile').files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
        const newCase = {
            id: 'SCAM-' + Date.now(),
            date: new Date().toLocaleDateString('th-TH'),
            reportedBy: currentUser.username,
            name: document.getElementById('reportName').value,
            type: document.getElementById('reportType').value,
            detail: document.getElementById('reportDetail').value,
            status: 'รอตรวจสอบ',
            negotiation: '-',
            image: ev.target.result
        };
        blacklistData.unshift(newCase);
        alert("📢 บันทึกสำเร็จ! สถานะคือ 'รอตรวจสอบ'");
        e.target.reset();
        window.renderPublicCases();
        window.showPage('casesPage');
    };
    if (file) reader.readAsDataURL(file);
};

window.handleAppealSubmit = (e) => {
    e.preventDefault();
    const file = document.getElementById('appealFile').files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
        const newAppeal = {
            id: 'APP-' + Date.now(),
            date: new Date().toLocaleDateString('th-TH'),
            username: currentUser.username,
            targetId: document.getElementById('appealTarget').value,
            detail: document.getElementById('appealDetail').value,
            image: ev.target.result,
            isDone: false
        };
        appealData.unshift(newAppeal);
        alert("🛠️ ยื่นคำร้องสำเร็จ! แอดมินจะตรวจสอบการเจรจาครับ");
        e.target.reset();
        window.showPage('searchPage');
    };
    if (file) reader.readAsDataURL(file);
};

/**
 * แอดมินจัดการหลังบ้าน
 */
window.renderAdminDashboard = () => {
    const scamsTable = document.getElementById('admin-pending-scams');
    const appealsTable = document.getElementById('admin-pending-appeals');
    const pScams = blacklistData.filter(s => s.status === 'รอตรวจสอบ');
    const pAppeals = appealData.filter(a => !a.isDone);

    document.getElementById('admin-pending-count').innerText = pScams.length;
    document.getElementById('admin-appeal-count').innerText = pAppeals.length;
    document.getElementById('admin-success-count').innerText = blacklistData.filter(s => s.status.includes('คืนเงิน')).length;

    scamsTable.innerHTML = pScams.length === 0 ? '<tr><td colspan="6" class="py-4 text-center">ไม่มีรายการ</td></tr>' :
    pScams.map(s => `<tr><td class="p-4">${s.date}</td><td class="p-4">${s.reportedBy}</td><td class="p-4 font-bold text-red-600">${s.name}</td><td class="p-4 max-w-xs truncate">${s.detail}</td><td class="p-4 text-center"><button onclick="window.viewEvidence('${s.image}')" class="text-blue-500 underline text-xs">ดูรูป</button></td><td class="p-4 flex gap-1"><button onclick="window.approveScam('${s.id}')" class="bg-green-600 text-white p-1 rounded font-bold">อนุมัติ</button><button onclick="window.deleteDocById('${s.id}')" class="bg-red-50 text-red-400 p-1 rounded font-bold">ลบ</button></td></tr>`).join('');

    appealsTable.innerHTML = pAppeals.length === 0 ? '<tr><td colspan="6" class="py-4 text-center">ไม่มีรายการ</td></tr>' :
    pAppeals.map(a => `<tr><td class="p-4">${a.date}</td><td class="p-4 font-medium">${a.username}</td><td class="p-4 font-bold text-blue-600">${a.targetId}</td><td class="p-4 max-w-xs truncate">${a.detail}</td><td class="p-4 text-center"><button onclick="window.viewEvidence('${a.image}')" class="text-blue-500 underline text-xs">ดูรูป</button></td><td class="p-4 text-center"><button onclick="window.approveAppeal('${a.id}', '${a.targetId}', '${a.detail}')" class="bg-blue-600 text-white p-1 px-3 rounded-lg font-bold">ยืนยัน</button></td></tr>`).join('');
};

window.approveScam = (id) => {
    const target = blacklistData.find(s => s.id === id);
    if (target) target.status = 'อันตราย';
    alert("✅ อนุมัติสถานะเรียบร้อย");
    window.renderAdminDashboard();
    window.renderPublicCases();
};

window.approveAppeal = (id, targetName, negotiation) => {
    const scam = blacklistData.find(s => s.name === targetName);
    if (scam) {
        scam.status = 'คืนเงินแล้ว/อื่นๆ/โปรดระวัง';
        scam.negotiation = negotiation;
    }
    const app = appealData.find(a => a.id === id);
    if (app) app.isDone = true;
    alert("✅ เปลี่ยนสถานะเรียบร้อย");
    window.renderAdminDashboard();
    window.renderPublicCases();
};

window.deleteDocById = (id) => {
    if (confirm('ลบข้อมูลถาวร?')) {
        blacklistData = blacklistData.filter(s => s.id !== id);
        window.renderAdminDashboard();
        window.renderPublicCases();
    }
};

/**
 * ค้นหาและตารางหน้าบ้าน
 */
window.handleSearch = () => {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const list = document.getElementById('resultList');
    if (!q) return;
    document.getElementById('searchResultArea').classList.remove('hidden');
    const found = blacklistData.filter(s => s.name.toLowerCase().includes(q));
    list.innerHTML = found.length > 0 ? found.map(s => `<div class="bg-red-50 p-6 rounded-3xl border border-red-100 flex justify-between items-center mb-4"><div><p class="font-bold text-red-600">${s.status}</p><p class="text-slate-800 font-bold">ไอดี: ${s.name}</p><p class="text-xs text-slate-500">โดย: ${s.reportedBy}</p></div><button onclick="window.viewEvidence('${s.image}')" class="bg-white text-blue-500 border border-blue-100 p-2 rounded-xl text-sm font-bold shadow-sm">ดูรูป</button></div>`).join('') : '<div class="p-10 text-center font-bold">✅ ไม่พบประวัติการโกงในระบบ</div>';
};

window.renderPublicCases = () => {
    const tbody = document.getElementById('caseTableBody');
    if (!tbody) return;
    document.getElementById('caseCount').innerText = `${blacklistData.length} รายการ`;
    tbody.innerHTML = blacklistData.length === 0 ? '<tr><td colspan="8" class="py-20 text-center italic text-slate-300">ยังไม่มีข้อมูล</td></tr>' :
    blacklistData.map(s => `<tr class="border-b text-sm hover:bg-slate-100 transition"><td class="p-5 text-slate-400 text-xs">${s.date}</td><td class="p-5 text-slate-600 font-medium">${s.reportedBy}</td><td class="p-5 font-bold text-red-600">${s.name}</td><td class="p-5 text-center"><button onclick="window.viewEvidence('${s.image}')" class="text-blue-500 underline text-xs">🖼️ ดูรูป</button></td><td class="p-5">${s.type}</td><td class="p-5 text-slate-500 max-w-xs truncate" title="${s.detail}">${s.detail}</td><td class="p-5 text-orange-600 italic font-medium max-w-xs truncate" title="${s.negotiation}">${s.negotiation}</td><td class="p-5 text-center"><span class="px-2 py-1 rounded-full text-[9px] font-bold ${getStatusClass(s.status)}">${s.status}</span></td></tr>`).join('');
};

function getStatusClass(status) {
    if (status === 'อันตราย') return 'bg-red-100 text-red-600';
    if (status.includes('คืนเงิน')) return 'bg-orange-100 text-orange-600';
    return 'bg-yellow-100 text-yellow-600';
}

window.viewEvidence = (img) => {
    document.getElementById('modalImage').src = img;
    document.getElementById('evidenceModal').classList.remove('hidden');
};

window.closeModal = () => document.getElementById('evidenceModal').classList.add('hidden');

// Start
window.onload = () => window.showPage('searchPage');