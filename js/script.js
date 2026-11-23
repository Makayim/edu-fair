/* ==========================================================================
   Edu Fair & Career Expo 2026 — Main Application Logic
   ========================================================================== */

// --- CONFIGURATION ---
const SUPABASE_URL = "https://qneamvstcrphxdbrbrfw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xtdMAwAA7FRyVQBLyis1AA_sdifLH14";

// Initialize Supabase Client if CDN is loaded
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminTableBody')) {
    initAdminPanel();
  }
  
  if (document.getElementById('inviteHeaderName')) {
    initInvitationPage();
  }
});

/* ==========================================================================
1. ADMIN PANEL & WHATSAPP BLAST LOGIC (admin.html)
   ========================================================================== */
function initAdminPanel() {
  const uploadInput = document.getElementById('excelUpload');
  const uploadZone = document.getElementById('uploadZone');
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
  const tableBody = document.getElementById('adminTableBody');
  const totalTamuEl = document.getElementById('totalTamu');
  const alertBox = document.getElementById('adminAlert');

  if (uploadZone && uploadInput) {
    uploadZone.addEventListener('click', () => uploadInput.click());
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '#0284C7';
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = '#0EA5E9';
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '#0EA5E9';
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
    uploadInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });
  }

  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener('click', () => {
      window.location.href = 'assets/template_tamu.csv';
    });
  }

  function showAdminAlert(message, type = 'success') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 5000);
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (json.length === 0) {
          showAdminAlert("File yang diunggah kosong atau format tidak sesuai!", "error");
          return;
        }

        renderGuestTable(json);
        showAdminAlert(`Berhasil memuat ${json.length} data tamu!`);
      } catch (err) {
        console.error(err);
        showAdminAlert("Gagal membaca file. Pastikan format .xlsx, .xls, atau .csv benar.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function normalizePhone(phone) {
    if (!phone) return "";
    let cleaned = String(phone).replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }
    return cleaned;
  }

  function renderGuestTable(guests) {
    tableBody.innerHTML = "";
    if (totalTamuEl) totalTamuEl.textContent = guests.length;

    guests.forEach((guest, index) => {
      const nama = guest.nama_tamu || guest.Nama || guest.nama || "Tamu Undangan";
      const instansi = guest.instansi || guest.Instansi || "Mitra / Umum";
      const kategori = guest.kategori || guest.Kategori || "Umum";
      const rawWa = guest.nomor_wa || guest.No_WA || guest.whatsapp || guest.no_whatsapp || "";
      const nomorWa = normalizePhone(rawWa);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(nama)}</strong></td>
        <td>${escapeHtml(instansi)}</td>
        <td><span class="category-badge">${escapeHtml(kategori)}</span></td>
        <td>${escapeHtml(nomorWa)}</td>
        <td>
          <button class="btn btn-success" style="padding: 8px 14px; font-size: 0.85rem;" onclick="sendWhatsAppBlast(${index}, '${escapeQuote(nama)}', '${escapeQuote(instansi)}', '${escapeQuote(kategori)}', '${nomorWa}', this)">
            📤 Kirim WA
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
}

window.sendWhatsAppBlast = function(index, nama, instansi, kategori, nomorWa, btnElement) {
  if (!nomorWa) {
    alert("Nomor WhatsApp tidak valid atau kosong!");
    return;
  }

  const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
  const personalLink = `${baseUrl}?nama=${encodeURIComponent(nama)}&instansi=${encodeURIComponent(instansi)}&kategori=${encodeURIComponent(kategori)}`;

  const message = `Yth. *${nama}*
*${instansi}*

Assalamu'alaikum Wr. Wb. Dengan hormat, kami mengundang Bapak/Ibu pimpinan instansi/mitra untuk hadir dan berpartisipasi dalam ajang pameran tahunan:

🎓 *EDU FAIR & CAREER EXPO 2026*
"Connecting Competence to Future: Bekerja, Melanjutkan, Berwirausaha"

📅 *Hari, Tanggal:* Rabu, 25 November 2026
⏰ *Waktu:* 07.00 – 14.00 WIB
📍 *Lokasi:* SMKN 6 Kota Tangerang Selatan

Informasi lengkap dapat diakses secara eksklusif melalui tautan personal berikut:
${personalLink}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir memenuhi undangan ini.

Atas perhatian, waktu, dan kerja sama yang baik, kami ucapkan terima kasih.

*Hormat kami,*

*Panitia Edu Fair & Career Expo 2026*`;

  const waUrl = `https://wa.me/${nomorWa}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  if (btnElement) {
    btnElement.innerHTML = "✓ Terkirim";
    btnElement.style.backgroundColor = "#047857";
    btnElement.disabled = true;
  }
};


/* ==========================================================================
2. DIGITAL INVITATION & RSVP LOGIC (index.html)
   ========================================================================== */
function initInvitationPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const nama = urlParams.get('nama') || "Bapak/Ibu Pimpinan Instansi / Mitra";
  const instansi = urlParams.get('instansi') || "SMKN 6 Kota Tangerang Selatan";
  const kategori = urlParams.get('kategori') || "Tamu VIP";

  const nameEl = document.getElementById('inviteHeaderName');
  const instansiEl = document.getElementById('inviteInstansiName');
  const badgeEl = document.getElementById('inviteCategoryBadge');
  const formNama = document.getElementById('rsvpNama');
  const formInstansi = document.getElementById('rsvpInstansi');
  const formKategori = document.getElementById('rsvpKategori');

  if (nameEl) nameEl.textContent = nama;
  if (instansiEl) instansiEl.textContent = instansi;
  if (badgeEl) badgeEl.textContent = kategori;
  
  if (formNama) formNama.value = nama !== "Bapak/Ibu Pimpinan Instansi / Mitra" ? nama : "";
  if (formInstansi) formInstansi.value = instansi !== "SMKN 6 Kota Tangerang Selatan" ? instansi : "";
  if (formKategori) formKategori.value = kategori;

  initCountdown();
  loadPublicRsvpList();

  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', handleRsvpSubmit);
  }
}

function initCountdown() {
  const eventDate = new Date('2026-11-25T07:00:00').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

async function loadPublicRsvpList() {
  const listContainer = document.getElementById('publicRsvpList');
  if (!listContainer || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('rsvp_edufair')
    .select('nama_lengkap, asal_instansi, konfirmasi_kehadiran, jumlah_perwakilan, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal memuat daftar RSVP:', error.message);
    listContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Gagal memuat data: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    listContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Belum ada data konfirmasi kehadiran.</td></tr>`;
    return;
  }

  listContainer.innerHTML = data.map((item, index) => {
    let badgeColor = '#047857';
    const status = item.konfirmasi_kehadiran || 'Hadir';
    if (status.includes('Tidak')) badgeColor = '#DC2626';
    else if (status.includes('Berhalangan')) badgeColor = '#D97706';

    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(item.nama_lengkap || '-')}</strong></td>
        <td>${escapeHtml(item.asal_instansi || '-')}</td>
        <td><span style="background: ${badgeColor}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">${escapeHtml(status)}</span></td>
        <td>${item.jumlah_perwakilan || 1} Orang</td>
      </tr>
    `;
  }).join('');
}

async function handleRsvpSubmit(e) {
  e.preventDefault();

  const nama = document.getElementById('rsvpNama').value;
  const instansi = document.getElementById('rsvpInstansi').value;
  const kategori = document.getElementById('rsvpKategori').value;
  const nomorWa = document.getElementById('rsvpWa').value;
  const statusKehadiran = document.getElementById('rsvpStatus').value;
  const jumlahTamu = parseInt(document.getElementById('rsvpJumlah').value) || 1;
  const pesanUcapan = document.getElementById('rsvpPesan').value;
  const alertEl = document.getElementById('rsvpAlert');

  if (!nama || !nomorWa || !statusKehadiran) {
    showAlert(alertEl, "Mohon lengkapi Nama, Nomor WhatsApp, dan Status Kehadiran!", "error");
    return;
  }

  let savedToSupabase = false;
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('rsvp_edufair')
        .insert([
          {
            nama_lengkap: nama,
            asal_instansi: instansi,
            kategori_tamu: kategori,
            nomor_whatsapp: nomorWa,
            konfirmasi_kehadiran: statusKehadiran,
            jumlah_perwakilan: jumlahTamu,
            pesan: pesanUcapan
          }
        ]);

      if (error) {
        console.error("Supabase Error:", error);
      } else {
        savedToSupabase = true;
      }
    } catch (err) {
      console.error("Supabase Exception:", err);
    }
  }

  if (savedToSupabase) {
    document.getElementById('rsvpForm').reset();
    
    // Memunculkan dialog konfirmasi reload halaman
    const mauReload = confirm("Terima kasih! Konfirmasi kehadiran Anda berhasil tercatat.\n\nApakah Anda ingin memuat ulang (reload) halaman sekarang untuk melihat daftar kehadiran terbaru?");
    
    if (mauReload) {
      window.location.reload();
    } else {
      showAlert(alertEl, "Konfirmasi kehadiran Anda berhasil tercatat di sistem.", "success");
      loadPublicRsvpList();
    }
  } else {
    showAlert(alertEl, "Gagal menyimpan ke database. Coba periksa koneksi Anda.", "error");
  }
}

function showAlert(element, message, type = 'success') {
  if (!element) return;
  element.textContent = message;
  element.className = `alert alert-${type}`;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 6000);
}

// Utility Helpers
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuote(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}