const STORAGE_KEY = 'relationship_questionnaire_draft';
const THEME_KEY = 'relationship_questionnaire_theme';
const PIN_KEY = 'relationship_questionnaire_pin';
const AUTH_KEY = 'relationship_questionnaire_authed';

const App = {
  currentSectionIndex: 0,
  answers: {},
  startTime: null,
  pendingPinCallback: null,
  activeSections: [],

  async init() {
    this.initTheme();
    await this.loadActiveTemplate();
    this.loadDraft();
    this.bindGlobalEvents();
    this.bindPinEvents();
    this.renderDrawerList();
    Dashboard.init();
    TemplateEditor.init();

    // Check if owner is accessing via /riwayat or ?admin=true
    const params = new URLSearchParams(window.location.search);
    const isRiwayatPath = window.location.pathname.toLowerCase().includes('/riwayat') ||
                          params.get('view') === 'riwayat' || 
                          params.get('admin') === 'true';

    if (isRiwayatPath) {
      if (this.isOwnerAuthenticated()) {
        this.unlockOwnerMode();
      } else {
        this.promptPinAccess(() => this.unlockOwnerMode());
      }
    } else if (this.isOwnerAuthenticated()) {
      // If already authenticated in this session, keep the toggle visible
      document.getElementById('viewModeToggleBtn').style.display = 'inline-flex';
    }
  },

  async loadActiveTemplate() {
    // 1. Coba baca dari server /api/template
    try {
      const res = await fetch('/api/template');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        this.activeSections = data.data;
        if (data.isCustom && typeof TemplateEditor !== 'undefined') {
          TemplateEditor.isCustom = true;
        }
        return;
      }
    } catch (e) {
      console.warn('Gagal memuat template dari server, mengecek cache lokal:', e);
    }

    // 2. Coba baca dari cache local storage
    const cached = localStorage.getItem('custom_form_template');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.activeSections = parsed;
          if (typeof TemplateEditor !== 'undefined') TemplateEditor.isCustom = true;
          return;
        }
      } catch (e) {}
    }

    // 3. Fallback ke DEFAULT FORM_SECTIONS
    this.activeSections = JSON.parse(JSON.stringify(window.FORM_SECTIONS || []));
  },

  isOwnerAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  },

  unlockOwnerMode() {
    sessionStorage.setItem(AUTH_KEY, 'true');
    const toggleBtn = document.getElementById('viewModeToggleBtn');
    if (toggleBtn) toggleBtn.style.display = 'inline-flex';
    this.switchView('dashboard');
    showToast('Akses Riwayat Terbuka 🔓');
  },

  initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon(theme) {
    const iconEl = document.getElementById('themeIcon');
    if (iconEl) iconEl.textContent = theme === 'dark' ? '🌙' : '☀️';
  },

  loadDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.answers = parsed.answers || {};
        this.currentSectionIndex = parsed.currentSectionIndex || 0;

        const resumeBtn = document.getElementById('btnResumeForm');
        if (resumeBtn && Object.keys(this.answers).length > 0) {
          resumeBtn.style.display = 'inline-flex';
          resumeBtn.addEventListener('click', () => {
            this.startForm(true);
          });
        }
      }
    } catch (e) {
      console.warn('Error reading draft:', e);
    }
  },

  saveDraft() {
    try {
      const payload = {
        answers: this.answers,
        currentSectionIndex: this.currentSectionIndex,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.pulseAutoSave();
    } catch (e) {
      console.warn('Error writing draft:', e);
    }
  },

  pulseAutoSave() {
    const label = document.getElementById('autosaveLabel');
    if (label) {
      label.textContent = 'Menyimpan...';
      setTimeout(() => {
        label.textContent = 'Tersimpan otomatis';
      }, 600);
    }
  },

  bindGlobalEvents() {
    // Theme toggle
    document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());

    // View mode switch button (Form <-> Dashboard)
    document.getElementById('viewModeToggleBtn').addEventListener('click', () => {
      const isDashboard = document.getElementById('viewDashboard').classList.contains('active');
      if (isDashboard) {
        this.switchView('welcome');
      } else {
        this.switchView('dashboard');
      }
    });

    // Secret 3-tap on brand icon to unlock Riwayat without typing URL
    let brandTaps = 0;
    let brandTapTimer = null;
    const brandBtn = document.getElementById('brandBtn');
    if (brandBtn) {
      brandBtn.addEventListener('click', () => {
        brandTaps++;
        clearTimeout(brandTapTimer);
        brandTapTimer = setTimeout(() => { brandTaps = 0; }, 1200);

        if (brandTaps >= 3) {
          brandTaps = 0;
          this.promptPinAccess(() => this.unlockOwnerMode());
        }
      });
    }

    // Start Form
    document.getElementById('btnStartForm').addEventListener('click', () => {
      this.startForm(false);
    });

    // Stepper navigation buttons
    document.getElementById('btnPrevSection').addEventListener('click', () => this.prevSection());
    document.getElementById('btnNextSection').addEventListener('click', () => this.nextSection());

    // Drawer handlers
    document.getElementById('btnOpenDrawer').addEventListener('click', () => this.openDrawer());
    document.getElementById('btnCloseDrawer').addEventListener('click', () => this.closeDrawer());
    document.getElementById('drawerBackdrop').addEventListener('click', () => this.closeDrawer());

    // Success screen actions
    const waBtn = document.getElementById('btnNotifyWhatsapp');
    if (waBtn) waBtn.addEventListener('click', () => this.openWhatsAppNotify());

    const dlBtn = document.getElementById('btnDownloadSummary');
    if (dlBtn) dlBtn.addEventListener('click', () => this.downloadAnswersSummary());

    const reviewBtn = document.getElementById('btnReviewMyAnswers');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        this.currentSectionIndex = 0;
        this.switchView('form');
      });
    }
  },

  bindPinEvents() {
    const pinInput = document.getElementById('pinInput');
    const submitBtn = document.getElementById('btnSubmitPin');
    const cancelBtn = document.getElementById('btnCancelPin');
    const closeBtn = document.getElementById('btnClosePinModal');

    if (submitBtn) submitBtn.addEventListener('click', () => this.verifyPin());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closePinModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closePinModal());

    if (pinInput) {
      pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.verifyPin();
        if (e.key === 'Escape') this.closePinModal();
      });
    }
  },

  promptPinAccess(onSuccess) {
    this.pendingPinCallback = onSuccess;
    const modal = document.getElementById('pinModal');
    const input = document.getElementById('pinInput');
    if (modal) modal.classList.add('active');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
  },

  closePinModal() {
    const modal = document.getElementById('pinModal');
    if (modal) modal.classList.remove('active');
    this.pendingPinCallback = null;
  },

  verifyPin() {
    const input = document.getElementById('pinInput');
    const entered = (input?.value || '').trim();
    const savedPin = localStorage.getItem(PIN_KEY) || '1234';

    if (entered === savedPin) {
      this.closePinModal();
      if (typeof this.pendingPinCallback === 'function') {
        this.pendingPinCallback();
      } else {
        this.unlockOwnerMode();
      }
    } else {
      showToast('PIN salah! Coba lagi.');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  changePin() {
    const currentSaved = localStorage.getItem(PIN_KEY) || '1234';
    const oldPin = prompt('Masukkan PIN lama:');
    if (oldPin === null) return;
    if (oldPin !== currentSaved) {
      alert('PIN lama salah!');
      return;
    }
    const newPin = prompt('Masukkan PIN baru (4-6 angka):');
    if (!newPin || newPin.trim().length < 4) {
      alert('PIN baru harus minimal 4 angka!');
      return;
    }
    localStorage.setItem(PIN_KEY, newPin.trim());
    showToast('PIN berhasil diperbarui! 🔑');
  },

  startForm(isResume) {
    if (!this.startTime) this.startTime = Date.now();
    if (!isResume) {
      this.currentSectionIndex = 0;
    }
    this.switchView('form');
    this.renderCurrentSection();
  },

  switchView(viewName) {
    const views = {
      welcome: document.getElementById('viewWelcome'),
      form: document.getElementById('viewForm'),
      success: document.getElementById('viewSuccess'),
      dashboard: document.getElementById('viewDashboard')
    };

    Object.values(views).forEach(v => v.classList.remove('active'));

    const progressWrapper = document.getElementById('progressWrapper');
    const bottomBar = document.getElementById('formBottomBar');
    const viewSwitchText = document.getElementById('viewModeText');
    const viewSwitchIcon = document.getElementById('viewModeIcon');

    if (viewName === 'form') {
      views.form.classList.add('active');
      progressWrapper.style.display = 'block';
      bottomBar.style.display = 'flex';
      viewSwitchText.textContent = 'Riwayat';
      viewSwitchIcon.textContent = '📜';
      this.updateProgressIndicator();
    } else if (viewName === 'dashboard') {
      views.dashboard.classList.add('active');
      progressWrapper.style.display = 'none';
      bottomBar.style.display = 'none';
      viewSwitchText.textContent = 'Isi Form';
      viewSwitchIcon.textContent = '✍️';
      Dashboard.fetchSubmissions();
    } else if (viewName === 'success') {
      views.success.classList.add('active');
      progressWrapper.style.display = 'none';
      bottomBar.style.display = 'none';
      viewSwitchText.textContent = 'Riwayat';
      viewSwitchIcon.textContent = '📜';
    } else {
      // Welcome
      views.welcome.classList.add('active');
      progressWrapper.style.display = 'none';
      bottomBar.style.display = 'none';
      viewSwitchText.textContent = 'Riwayat';
      viewSwitchIcon.textContent = '📜';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCurrentSection() {
    const sec = this.activeSections[this.currentSectionIndex];
    if (!sec) return;

    // Update banner
    document.getElementById('sectionTag').textContent = `SECTION ${sec.number} OF ${this.activeSections.length}`;
    document.getElementById('sectionHeading').textContent = sec.title;
    document.getElementById('sectionSummary').textContent = sec.description || sec.subtitle;

    // Render questions
    const container = document.getElementById('questionsContainer');
    container.innerHTML = (sec.questions || []).map((q, idx) => this.renderQuestionCard(q, idx)).join('');

    // Wire inputs to state & autosave
    this.attachQuestionEventListeners(sec);

    // Update bottom nav labels
    this.updateNavButtons();
    this.updateProgressIndicator();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderQuestionCard(q, idx) {
    const currentVal = this.answers[q.id] || '';
    const isOtherChecked = q.type === 'radio_other' && currentVal === 'other';
    const isYaChecked = q.type === 'radio_other' && currentVal === 'Ya';
    const extraVal = this.answers[`${q.id}_other`] || '';

    let inputHtml = '';

    if (q.type === 'text') {
      inputHtml = `
        <input 
          type="text" 
          class="form-input q-field" 
          id="${q.id}" 
          name="${q.id}" 
          placeholder="${q.placeholder || ''}" 
          value="${escapeHtml(currentVal)}"
          enterkeyhint="next"
        />
      `;
    } else if (q.type === 'textarea') {
      const charCount = currentVal.length;
      inputHtml = `
        <textarea 
          class="form-textarea q-field" 
          id="${q.id}" 
          name="${q.id}" 
          placeholder="${q.placeholder || ''}"
          enterkeyhint="enter"
        >${escapeHtml(currentVal)}</textarea>
        <div class="textarea-footer">
          <span>Tuliskan jawaban yang jujur & mendalam</span>
          <span id="${q.id}_counter">${charCount} karakter</span>
        </div>
      `;
    } else if (q.type === 'radio' || q.type === 'radio_other') {
      const optionsHtml = (q.options || []).map((opt, optIdx) => {
        const isChecked = currentVal === opt.value;
        return `
          <label class="card-option ${isChecked ? 'checked' : ''}" data-qid="${q.id}" data-val="${escapeHtml(opt.value)}">
            <input 
              type="radio" 
              name="${q.id}" 
              value="${escapeHtml(opt.value)}" 
              ${isChecked ? 'checked' : ''} 
            />
            <span class="option-radio-dot"></span>
            <span class="option-label">${escapeHtml(opt.label)}</span>
          </label>
        `;
      }).join('');

      let extraInputHtml = '';
      if (q.type === 'radio_other') {
        const hasExtraOption = (q.options || []).find(o => o.hasInput);
        const shouldShow = (currentVal === 'other' || currentVal === 'Ya');
        extraInputHtml = `
          <div class="option-other-input-container" id="${q.id}_other_wrap" style="display: ${shouldShow ? 'block' : 'none'};">
            <input 
              type="text" 
              class="form-input q-other-field" 
              id="${q.id}_other" 
              placeholder="${hasExtraOption?.placeholder || 'Ketik rincian di sini...'}" 
              value="${escapeHtml(extraVal)}"
            />
          </div>
        `;
      }

      inputHtml = `<div class="options-group">${optionsHtml}</div>${extraInputHtml}`;
    }

    return `
      <div class="question-card" id="card_${q.id}">
        <div class="question-header">
          <span class="q-num">${idx + 1}</span>
          <div class="q-title">
            ${escapeHtml(q.title)}
            ${q.required ? '<span class="q-required">*</span>' : ''}
            ${q.hint ? `<div class="q-hint">${escapeHtml(q.hint)}</div>` : ''}
          </div>
        </div>
        ${inputHtml}
      </div>
    `;
  },

  attachQuestionEventListeners(sec) {
    (sec.questions || []).forEach(q => {
      if (q.type === 'text') {
        const input = document.getElementById(q.id);
        if (input) {
          input.addEventListener('input', (e) => {
            this.answers[q.id] = e.target.value.trim();
            this.saveDraft();
          });
        }
      } else if (q.type === 'textarea') {
        const textarea = document.getElementById(q.id);
        const counter = document.getElementById(`${q.id}_counter`);
        if (textarea) {
          textarea.addEventListener('input', (e) => {
            this.answers[q.id] = e.target.value;
            if (counter) counter.textContent = `${e.target.value.length} karakter`;
            this.saveDraft();
          });
        }
      } else if (q.type === 'radio' || q.type === 'radio_other') {
        const cardOptions = document.querySelectorAll(`.card-option[data-qid="${q.id}"]`);
        cardOptions.forEach(card => {
          card.addEventListener('click', () => {
            const val = card.dataset.val;
            this.answers[q.id] = val;

            // Update UI class
            cardOptions.forEach(c => c.classList.remove('checked'));
            card.classList.add('checked');

            // Handle optional extra input
            const otherWrap = document.getElementById(`${q.id}_other_wrap`);
            if (otherWrap) {
              if (val === 'other' || val === 'Ya') {
                otherWrap.style.display = 'block';
                const extraInput = document.getElementById(`${q.id}_other`);
                if (extraInput) extraInput.focus();
              } else {
                otherWrap.style.display = 'none';
              }
            }

            this.saveDraft();
          });
        });

        const extraField = document.getElementById(`${q.id}_other`);
        if (extraField) {
          extraField.addEventListener('input', (e) => {
            this.answers[`${q.id}_other`] = e.target.value.trim();
            this.saveDraft();
          });
        }
      }
    });
  },

  updateNavButtons() {
    const prevBtn = document.getElementById('btnPrevSection');
    const nextBtn = document.getElementById('btnNextSection');
    const nextLabel = document.getElementById('btnNextLabel');

    if (this.currentSectionIndex === 0) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    if (this.currentSectionIndex === this.activeSections.length - 1) {
      nextLabel.textContent = 'Selesai & Kirim Jawaban 💌';
      nextBtn.classList.remove('btn-primary');
      nextBtn.classList.add('btn-primary');
    } else {
      const nextNum = this.currentSectionIndex + 2;
      nextLabel.textContent = `Lanjut ke Bagian ${nextNum}`;
    }
  },

  updateProgressIndicator() {
    const total = this.activeSections.length || 1;
    const current = this.currentSectionIndex + 1;
    const percentage = Math.round((current / total) * 100);

    const sec = this.activeSections[this.currentSectionIndex];
    const textEl = document.getElementById('sectionIndicatorText');
    const fillEl = document.getElementById('progressFill');

    if (textEl && sec) {
      textEl.textContent = `Bagian ${current} dari ${total}: ${sec.title}`;
    }
    if (fillEl) {
      fillEl.style.width = `${percentage}%`;
    }
  },

  validateCurrentSection() {
    const sec = this.activeSections[this.currentSectionIndex];
    if (!sec) return true;
    for (const q of (sec.questions || [])) {
      if (q.required) {
        const val = this.answers[q.id];
        if (!val || (typeof val === 'string' && val.trim() === '')) {
          const card = document.getElementById(`card_${q.id}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.borderColor = 'var(--accent-primary)';
            setTimeout(() => { card.style.borderColor = ''; }, 2000);
          }
          showToast(`Mohon lengkapi: ${q.title}`);
          return false;
        }

        if (q.type === 'radio_other' && (val === 'other' || val === 'Ya')) {
          const extra = this.answers[`${q.id}_other`];
          if (!extra || extra.trim() === '') {
            showToast(`Mohon isi rincian keterangan untuk: ${q.title}`);
            return false;
          }
        }
      }
    }
    return true;
  },

  prevSection() {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.renderCurrentSection();
      this.saveDraft();
    }
  },

  nextSection() {
    if (!this.validateCurrentSection()) return;

    if (this.currentSectionIndex < this.activeSections.length - 1) {
      this.currentSectionIndex++;
      this.renderCurrentSection();
      this.saveDraft();
    } else {
      // Final Submit
      this.submitForm();
    }
  },

  async submitForm() {
    const nextBtn = document.getElementById('btnNextSection');
    nextBtn.disabled = true;
    nextBtn.innerHTML = '<span>Mengirim jawaban...</span>';

    const completionTimeSeconds = this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0;
    const candidateName = this.answers['s1_q1'] || 'Anonim';
    const flags = Dashboard.scanRedFlags(this.answers);

    const payload = {
      candidateName,
      answers: this.answers,
      redFlagsFound: flags,
      completionTimeSeconds
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        // Clear local draft upon successful submission
        localStorage.removeItem(STORAGE_KEY);

        // Catat ke riwayat browser lokal
        const localHist = JSON.parse(localStorage.getItem('relationship_questionnaire_history') || '[]');
        localHist.unshift(data.data || {
          id: 'sub_' + Date.now(),
          submittedAt: new Date().toISOString(),
          candidateName,
          answers: this.answers,
          redFlagsFound: flags
        });
        localStorage.setItem('relationship_questionnaire_history', JSON.stringify(localHist));

        this.switchView('success');
        showToast('Jawaban berhasil dikirim dan masuk ke riwayat! 🎉');
      } else {
        throw new Error(data.message || 'Gagal mengirim');
      }
    } catch (err) {
      console.error('Submission error:', err);
      // Backup ke riwayat lokal saat offline
      const localHist = JSON.parse(localStorage.getItem('relationship_questionnaire_history') || '[]');
      localHist.unshift({
        id: 'sub_' + Date.now(),
        submittedAt: new Date().toISOString(),
        candidateName,
        answers: this.answers,
        redFlagsFound: flags
      });
      localStorage.setItem('relationship_questionnaire_history', JSON.stringify(localHist));
      localStorage.removeItem(STORAGE_KEY);

      showToast('Jawaban tersimpan aman di riwayat perangkat! 💾');
      this.switchView('success');
    } finally {
      nextBtn.disabled = false;
      this.updateNavButtons();
    }
  },

  // Drawer Section Jump
  renderDrawerList() {
    const listEl = document.getElementById('drawerList');
    if (!listEl) return;

    listEl.innerHTML = (this.activeSections || []).map((sec, idx) => {
      const isCurrent = idx === this.currentSectionIndex;
      return `
        <div class="sheet-item ${isCurrent ? 'current' : ''}" data-idx="${idx}">
          <div class="sheet-item-info">
            <span class="sheet-item-num">${sec.number}</span>
            <div>
              <div class="sheet-item-title">${escapeHtml(sec.title)}</div>
              <div class="sheet-item-subtitle">${escapeHtml(sec.subtitle)}</div>
            </div>
          </div>
          <span class="sheet-item-status">${isCurrent ? 'Sedang diisi' : ''}</span>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.sheet-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        this.currentSectionIndex = idx;
        this.closeDrawer();
        this.renderCurrentSection();
      });
    });
  },

  openDrawer() {
    this.renderDrawerList();
    document.getElementById('drawerBackdrop').classList.add('active');
    document.getElementById('drawerSheet').classList.add('active');
  },

  closeDrawer() {
    document.getElementById('drawerBackdrop').classList.remove('active');
    document.getElementById('drawerSheet').classList.remove('active');
  },

  openWhatsAppNotify() {
    const candidateName = this.answers['s1_q1'] || 'Aku';
    const text = encodeURIComponent(
      `Hai sayang ❤️, aku sudah selesai mengisi seluruh pertanyaan di kuesioner hubungan & masa depan kita! Semoga jawaban jujurku bisa jadi langkah awal yang berkah buat rencana kita ke depan ya. Kamu bisa cek hasilnya di dashboardmu ✨`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  },

  downloadAnswersSummary() {
    const candidateName = this.answers['s1_q1'] || 'Kandidat';
    let content = `SALINAN JAWABAN KUESIONER HUBUNGAN\n`;
    content += `Nama: ${candidateName}\n`;
    content += `Waktu: ${new Date().toLocaleString('id-ID')}\n\n`;
    content += `=========================================\n\n`;

    (this.activeSections || []).forEach(sec => {
      content += `[SECTION ${sec.number}: ${sec.title}]\n`;
      (sec.questions || []).forEach((q, idx) => {
        let a = this.answers[q.id] || '-';
        if (q.type === 'radio_other' && this.answers[`${q.id}_other`]) {
          a += ` (${this.answers[`${q.id}_other`]})`;
        }
        content += `${idx + 1}. ${q.title}\n   Jawaban: ${a}\n\n`;
      });
      content += `-----------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jawaban_Kuesioner_${candidateName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Salinan berhasil diunduh! 📄');
  }
};

// Global Toast helper
function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// Kickstart App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
