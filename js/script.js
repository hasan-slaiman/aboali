// ===== أبو علي للبلاط — سكربت عام =====

const MOCKAPI_URL = 'https://6a9bbeb80ad174e139e8c97c.mockapi.io/abo/bbb';
const ADMIN_USERNAME = 'aboali';
const ADMIN_PASSWORD = 'admin1432';
const ADMIN_SESSION_KEY = 'aboaliAdmin';
const GALLERY_PAGE_SIZE = 5;

let editingWorkId = null;
let editingWorkImageUrl = '';
let editingTestimonialId = null;
let galleryWorksCache = [];
let galleryRevealCount = GALLERY_PAGE_SIZE;
let galleryShowDelete = false;

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initReveal();
  initCounters();
  initContactForm();
  initSplashAuth();
  initPublicGallery();
  initAdminDashboard();
  initPublicTestimonials();
  initTestimonialsAdmin();
  initGalleryLoadMore();
});

// تحميل تلقائي لباقي الصور عند التمرير لآخر المعرض
function initGalleryLoadMore() {
  const sentinel = document.getElementById('galleryScrollSentinel');
  if (!sentinel || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && galleryRevealCount < galleryWorksCache.length) {
          galleryRevealCount += GALLERY_PAGE_SIZE;
          renderGalleryBatch();
        }
      });
    },
    { rootMargin: '300px' }
  );

  observer.observe(sentinel);
}

// شاشة الدخول: أيقونة تسجيل دخول المدير بأعلى الصفحة
function initSplashAuth() {
  const iconBtn = document.getElementById('adminIconBtn');
  const modal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const cancelBtn = document.getElementById('loginCancelBtn');
  const errorEl = document.getElementById('loginError');
  if (!iconBtn || !modal || !loginForm) return;

  iconBtn.addEventListener('click', () => {
    errorEl.textContent = '';
    modal.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, '1');
      window.location.href = 'admin.html';
    } else {
      errorEl.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
  });
}

// فتح/إغلاق القائمة الجانبية على الجوال
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('overlay');
  if (!sidebar || !toggle || !overlay) return;

  const open = () => {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  };
  const close = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  };

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);
  sidebar.querySelectorAll('.nav-item').forEach((link) => {
    link.addEventListener('click', close);
  });
}

// ظهور العناصر تدريجيًا عند دخولها الشاشة
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

// عدّاد أرقام متحرك للإحصائيات
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => observer.observe(el));
}

// نموذج تواصل: يفتح واتساب برسالة جاهزة تحتوي بيانات الطلب
const WHATSAPP_NUMBER = '963937407221';

function initContactForm() {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const service = form.service ? form.service.value : '';
    const details = form.details.value.trim();

    const lines = [
      'طلب جديد من موقع أبو علي للبلاط',
      `الاسم: ${name}`,
      `رقم الهاتف: ${phone}`,
      service ? `نوع الخدمة: ${service}` : '',
      details ? `تفاصيل المشروع: ${details}` : ''
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;

    note.textContent = 'جاري تحويلك إلى واتساب لإتمام إرسال طلبك...';
    note.classList.add('success');

    window.open(url, '_blank', 'noopener');
    form.reset();
  });
}

// ===== معرض الأعمال: عرض عام (بدون تحكم) لصفحة gallery.html =====

function isAdmin() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

function initPublicGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid || document.getElementById('addWorkForm')) return; // ما تشتغل بصفحة admin.html
  loadGallery(false);
}

// ===== لوحة تحكم المدير (admin.html) =====

function initAdminDashboard() {
  const form = document.getElementById('addWorkForm');
  if (!form) return; // هاي الصفحة بس admin.html

  if (!isAdmin()) {
    window.location.href = 'index.html';
    return;
  }

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.href = 'index.html';
    });
  }

  const note = document.getElementById('addWorkNote');
  const cancelEditBtn = document.getElementById('workCancelEditBtn');
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEditWork);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('workTitle').value.trim();
    const descEl = document.getElementById('workDesc');
    const description = descEl ? descEl.value.trim() : '';
    const file = document.getElementById('workImage').files[0];

    if (!editingWorkId && !file) {
      note.classList.remove('success');
      note.textContent = 'لازم تختار صورة عشان تنشر العمل';
      return;
    }

    note.classList.remove('success');
    note.textContent = editingWorkId ? 'جاري حفظ التعديل...' : 'جاري رفع الصورة...';

    const save = (imageUrl) => {
      const isEdit = !!editingWorkId;
      const url = isEdit ? `${MOCKAPI_URL}/${editingWorkId}` : MOCKAPI_URL;
      const method = isEdit ? 'PUT' : 'POST';
      const payload = { type: 'work', title, description, imageUrl };
      if (!isEdit) payload.publishedAt = new Date().toISOString();

      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then((res) => {
        if (!res.ok) throw new Error('save failed');
        note.textContent = isEdit ? 'تم حفظ التعديل بنجاح' : 'تم نشر العمل بنجاح';
        note.classList.add('success');
        cancelEditWork();
        loadGallery(true);
      });
    };

    (file ? compressImage(file) : Promise.resolve(editingWorkImageUrl))
      .then(save)
      .catch(() => {
        note.classList.remove('success');
        note.textContent = 'صار خطأ، جرّب صورة أصغر حجمًا أو حاول لاحقًا';
      });
  });

  loadGallery(true);
}

function startEditWork(w) {
  if (!w) return;
  editingWorkId = w.id;
  editingWorkImageUrl = w.imageUrl;

  document.getElementById('workTitle').value = w.title || '';
  const descEl = document.getElementById('workDesc');
  if (descEl) descEl.value = w.description || '';
  document.getElementById('workImage').value = '';

  const imgNote = document.getElementById('workImageNote');
  if (imgNote) imgNote.style.display = 'block';

  document.getElementById('workFormTitle').textContent = 'تعديل العمل';
  document.getElementById('workSubmitBtn').textContent = 'حفظ التعديل';
  document.getElementById('workCancelEditBtn').style.display = 'inline-flex';

  document.getElementById('addWorkForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEditWork() {
  editingWorkId = null;
  editingWorkImageUrl = '';

  const form = document.getElementById('addWorkForm');
  if (form) form.reset();

  const imgNote = document.getElementById('workImageNote');
  if (imgNote) imgNote.style.display = 'none';

  const formTitle = document.getElementById('workFormTitle');
  const submitBtn = document.getElementById('workSubmitBtn');
  const cancelBtn = document.getElementById('workCancelEditBtn');
  if (formTitle) formTitle.textContent = 'إضافة عمل جديد';
  if (submitBtn) submitBtn.textContent = 'نشر العمل';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// ===== مشتركة: تحميل الأعمال من MockAPI وعرضها على دفعات =====

function loadGallery(showDelete) {
  const grid = document.getElementById('galleryGrid');
  const emptyMsg = document.getElementById('galleryEmpty');
  const loadingMsg = document.getElementById('galleryLoading');
  if (!grid) return;

  galleryShowDelete = showDelete;
  grid.innerHTML = '';
  if (emptyMsg) emptyMsg.style.display = 'none';
  if (loadingMsg) { loadingMsg.textContent = 'جاري تحميل الصور...'; loadingMsg.style.display = 'block'; }

  fetch(MOCKAPI_URL)
    .then((res) => {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then((items) => {
      galleryWorksCache = (items || [])
        .filter((it) => (it.type === 'work' || !it.type) && it.imageUrl)
        .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
      galleryRevealCount = GALLERY_PAGE_SIZE;

      if (loadingMsg) loadingMsg.style.display = 'none';

      if (!galleryWorksCache.length) {
        if (emptyMsg) { emptyMsg.textContent = 'لسا ما في أعمال مضافة، تابعونا قريبًا!'; emptyMsg.style.display = 'block'; }
        return;
      }

      renderGalleryBatch();
    })
    .catch(() => {
      if (loadingMsg) loadingMsg.style.display = 'none';
      if (emptyMsg) { emptyMsg.textContent = 'صار خطأ بتحميل الأعمال، حاول تحدّث الصفحة'; emptyMsg.style.display = 'block'; }
    });
}

function renderGalleryBatch() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const showDelete = galleryShowDelete;
  const visible = galleryWorksCache.slice(0, galleryRevealCount);

  grid.innerHTML = visible.map((w) => `
    <div class="card work-card reveal in-view">
      <div class="thumb-wrap">
        <img class="thumb" src="${w.imageUrl}" alt="${escapeHtml(w.title || 'عمل من أعمال أبو علي للبلاط')}" loading="lazy">
        ${showDelete ? `<div class="card-actions">
          <button class="icon-action edit-btn" data-id="${w.id}" type="button" aria-label="تعديل">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>
          </button>
          <button class="icon-action del-btn" data-id="${w.id}" type="button" aria-label="حذف">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>` : ''}
      </div>
      <div class="cap">
        ${w.title ? `<div class="title">${escapeHtml(w.title)}</div>` : ''}
        <div class="date">${formatArabicDate(w.publishedAt || w.createdAt)}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.work-card').forEach((card, i) => {
    card.addEventListener('click', () => showDetailsModal(visible[i]));
  });

  if (showDelete) {
    grid.querySelectorAll('.edit-btn').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        startEditWork(visible[i]);
      });
    });
    grid.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('متأكد بدك تحذف هالعمل؟')) deleteWork(btn.getAttribute('data-id'), showDelete);
      });
    });
  }
}

function deleteWork(id, showDelete) {
  fetch(`${MOCKAPI_URL}/${id}`, { method: 'DELETE' })
    .then(() => loadGallery(showDelete))
    .catch(() => alert('صار خطأ أثناء الحذف'));
}

// ===== آراء العملاء: عرض عام لصفحة testimonials.html =====

function initPublicTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid || document.getElementById('addTestimonialForm')) return; // ما تشتغل بصفحة admin-testimonials.html
  loadTestimonials(false);
}

// ===== لوحة تحكم آراء العملاء (admin-testimonials.html) =====

function initTestimonialsAdmin() {
  const form = document.getElementById('addTestimonialForm');
  if (!form) return; // هاي الصفحة بس admin-testimonials.html

  if (!isAdmin()) {
    window.location.href = 'index.html';
    return;
  }

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.href = 'index.html';
    });
  }

  const cancelEditBtn = document.getElementById('testiCancelEditBtn');
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEditTestimonial);

  const note = document.getElementById('addTestimonialNote');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('testiName').value.trim();
    const location = document.getElementById('testiLocation').value.trim();
    const rating = Number(document.getElementById('testiRating').value);
    const quote = document.getElementById('testiQuote').value.trim();
    if (!name || !quote) return;

    note.classList.remove('success');
    note.textContent = editingTestimonialId ? 'جاري حفظ التعديل...' : 'جاري النشر...';

    const isEdit = !!editingTestimonialId;
    const url = isEdit ? `${MOCKAPI_URL}/${editingTestimonialId}` : MOCKAPI_URL;
    const method = isEdit ? 'PUT' : 'POST';
    const payload = { type: 'testimonial', name, location, rating, quote };
    if (!isEdit) payload.publishedAt = new Date().toISOString();

    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((res) => {
        if (!res.ok) throw new Error('save failed');
        note.textContent = isEdit ? 'تم حفظ التعديل بنجاح' : 'تم نشر الرأي بنجاح';
        note.classList.add('success');
        cancelEditTestimonial();
        loadTestimonials(true);
      })
      .catch(() => {
        note.classList.remove('success');
        note.textContent = 'صار خطأ، حاول مرة ثانية';
      });
  });

  loadTestimonials(true);
}

function startEditTestimonial(t) {
  if (!t) return;
  editingTestimonialId = t.id;

  document.getElementById('testiName').value = t.name || '';
  document.getElementById('testiLocation').value = t.location || '';
  document.getElementById('testiRating').value = t.rating || 5;
  document.getElementById('testiQuote').value = t.quote || '';

  document.getElementById('testiFormTitle').textContent = 'تعديل رأي العميل';
  document.getElementById('testiSubmitBtn').textContent = 'حفظ التعديل';
  document.getElementById('testiCancelEditBtn').style.display = 'inline-flex';

  document.getElementById('addTestimonialForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEditTestimonial() {
  editingTestimonialId = null;

  const form = document.getElementById('addTestimonialForm');
  if (form) form.reset();

  const formTitle = document.getElementById('testiFormTitle');
  const submitBtn = document.getElementById('testiSubmitBtn');
  const cancelBtn = document.getElementById('testiCancelEditBtn');
  if (formTitle) formTitle.textContent = 'إضافة رأي عميل';
  if (submitBtn) submitBtn.textContent = 'نشر الرأي';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function loadTestimonials(editable) {
  const grid = document.getElementById('testimonialsGrid');
  const emptyMsg = document.getElementById('testimonialsEmpty');
  if (!grid) return;

  fetch(MOCKAPI_URL)
    .then((res) => {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then((items) => {
      const list = (items || [])
        .filter((it) => it.type === 'testimonial' && it.quote && it.name)
        .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));

      if (!list.length) {
        grid.innerHTML = '';
        if (emptyMsg) {
          emptyMsg.textContent = editable ? 'لسا ما في آراء مضافة' : 'لسا ما في آراء عملاء، تابعونا قريبًا!';
          emptyMsg.style.display = 'block';
        }
        return;
      }
      if (emptyMsg) emptyMsg.style.display = 'none';

      grid.innerHTML = list.map((t) => `
        <div class="testi-card reveal in-view">
          <div class="stars">${renderStars(t.rating)}</div>
          <p class="quote">"${escapeHtml(t.quote)}"</p>
          <div class="name">${escapeHtml(t.name)}</div>
          <div class="loc">${escapeHtml(t.location || '')}</div>
          ${editable ? `<div style="display:flex; gap:8px; margin-top:16px;">
            <button class="btn btn-outline testi-edit-btn" data-id="${t.id}" type="button" style="padding:8px 16px; font-size:0.8rem;">تعديل</button>
            <button class="btn btn-outline testi-del-btn" data-id="${t.id}" type="button" style="padding:8px 16px; font-size:0.8rem; color:#B4231E; border-color:#B4231E;">حذف</button>
          </div>` : ''}
        </div>
      `).join('');

      if (editable) {
        grid.querySelectorAll('.testi-edit-btn').forEach((btn, i) => {
          btn.addEventListener('click', () => startEditTestimonial(list[i]));
        });
        grid.querySelectorAll('.testi-del-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (confirm('متأكد بدك تحذف هالرأي؟')) deleteTestimonial(btn.getAttribute('data-id'));
          });
        });
      }
    })
    .catch(() => {
      if (emptyMsg) { emptyMsg.textContent = 'صار خطأ بتحميل الآراء، حاول تحدّث الصفحة'; emptyMsg.style.display = 'block'; }
    });
}

function deleteTestimonial(id) {
  fetch(`${MOCKAPI_URL}/${id}`, { method: 'DELETE' })
    .then(() => loadTestimonials(true))
    .catch(() => alert('صار خطأ أثناء الحذف'));
}

function renderStars(rating) {
  const n = Math.max(0, Math.min(5, parseInt(rating, 10) || 5));
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" style="fill:var(--accent);" opacity="${i < n ? 1 : 0.25}"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7z"></path></svg>`;
  }
  return html;
}

// ===== نافذة تفاصيل العمل (تفتح عند الضغط على أي بطاقة) =====

function ensureDetailsModal() {
  if (document.getElementById('detailsModal')) return;

  const div = document.createElement('div');
  div.id = 'detailsModal';
  div.className = 'modal-overlay';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="modal-box details-box">
      <button id="detailsCloseBtn" class="details-close" type="button" aria-label="إغلاق">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
      </button>
      <img id="detailsImage" class="details-image" src="" alt="">
      <div class="details-body">
        <h3 id="detailsTitle"></h3>
        <div id="detailsDate" class="details-date"></div>
        <p id="detailsDesc" class="details-desc"></p>
      </div>
    </div>
  `;
  document.body.appendChild(div);

  div.addEventListener('click', (e) => { if (e.target === div) hideDetailsModal(); });
  document.getElementById('detailsCloseBtn').addEventListener('click', hideDetailsModal);
}

function showDetailsModal(work) {
  if (!work) return;
  ensureDetailsModal();

  document.getElementById('detailsImage').src = work.imageUrl;
  document.getElementById('detailsImage').alt = work.title || '';
  document.getElementById('detailsTitle').textContent = work.title || '';
  document.getElementById('detailsDate').textContent = formatArabicDate(work.publishedAt || work.createdAt);

  const descEl = document.getElementById('detailsDesc');
  descEl.textContent = work.description || '';
  descEl.style.display = work.description ? 'block' : 'none';

  document.getElementById('detailsModal').style.display = 'flex';
}

function hideDetailsModal() {
  const modal = document.getElementById('detailsModal');
  if (modal) modal.style.display = 'none';
}

function compressImage(file, maxDim, quality) {
  maxDim = maxDim || 1000;
  quality = quality || 0.72;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatArabicDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
