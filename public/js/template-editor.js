// Template Editor Controller (Custom Pertanyaan Kuesioner)

const TemplateEditor = {
  sections: [],
  isCustom: false,

  init() {
    this.bindTabEvents();
    this.bindActionEvents();
  },

  bindTabEvents() {
    const tabRiwayat = document.getElementById('tabBtnRiwayat');
    const tabTemplate = document.getElementById('tabBtnTemplate');
    const panelRiwayat = document.getElementById('ownerRiwayatTab');
    const panelTemplate = document.getElementById('ownerTemplateTab');

    if (tabRiwayat && tabTemplate) {
      tabRiwayat.addEventListener('click', () => {
        tabRiwayat.classList.add('active');
        tabTemplate.classList.remove('active');
        panelRiwayat.style.display = 'block';
        panelTemplate.style.display = 'none';
        Dashboard.fetchSubmissions();
      });

      tabTemplate.addEventListener('click', () => {
        tabTemplate.classList.add('active');
        tabRiwayat.classList.remove('active');
        panelRiwayat.style.display = 'none';
        panelTemplate.style.display = 'block';
        this.loadAndRender();
      });
    }
  },

  bindActionEvents() {
    const saveBtn = document.getElementById('btnSaveTemplate');
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveTemplate());

    const resetBtn = document.getElementById('btnResetTemplate');
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetTemplate());

    const addSecBtn = document.getElementById('btnAddSection');
    if (addSecBtn) addSecBtn.addEventListener('click', () => this.addNewSection());
  },

  async loadAndRender() {
    this.sections = JSON.parse(JSON.stringify(App.activeSections || window.FORM_SECTIONS || []));
    this.updateStatusBadge();
    this.renderSections();
  },

  updateStatusBadge() {
    const badge = document.getElementById('templateStatusBadge');
    if (!badge) return;

    if (this.isCustom || localStorage.getItem('custom_form_template')) {
      badge.className = 'template-status-badge custom';
      badge.textContent = '🎨 Template Kustom Aktif';
    } else {
      badge.className = 'template-status-badge default';
      badge.textContent = '✨ Template Bawaan (11 Bagian)';
    }
  },

  renderSections() {
    const container = document.getElementById('templateSectionsList');
    if (!container) return;

    if (!this.sections.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada bagian kuesioner. Klik "+ Tambah Bagian Baru" untuk membuat.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.sections.map((sec, secIdx) => {
      const qCount = (sec.questions || []).length;
      return `
        <div class="template-section-card" data-sec-idx="${secIdx}" id="sec_editor_${secIdx}">
          <div class="template-section-header" onclick="TemplateEditor.toggleSectionCollapse(${secIdx})">
            <h4>
              <span>📑 Bagian ${secIdx + 1}: ${escapeHtml(sec.title)}</span>
              <span style="font-size: 11.5px; font-weight: normal; color: var(--text-tertiary);">(${qCount} pertanyaan)</span>
            </h4>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="arrow_sec_${secIdx}" style="font-size: 12px; color: var(--text-secondary);">▼</span>
            </div>
          </div>

          <div class="template-section-body" id="body_sec_${secIdx}">
            <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
              <div>
                <label style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Judul Bagian:</label>
                <input 
                  type="text" 
                  class="form-input sec-title-input" 
                  value="${escapeHtml(sec.title || '')}" 
                  onchange="TemplateEditor.updateSectionField(${secIdx}, 'title', this.value)"
                  style="padding: 8px 12px; font-weight: 600;"
                />
              </div>
              <div>
                <label style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Deskripsi Singkat / Subtitle:</label>
                <input 
                  type="text" 
                  class="form-input sec-desc-input" 
                  value="${escapeHtml(sec.description || sec.subtitle || '')}" 
                  onchange="TemplateEditor.updateSectionField(${secIdx}, 'description', this.value)"
                  style="padding: 8px 12px; font-size: 13px;"
                />
              </div>
            </div>

            <div style="margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="font-size: 13px; font-weight: 700; color: var(--text-primary);">Daftar Pertanyaan:</label>
                <button class="btn btn-secondary" onclick="TemplateEditor.addQuestion(${secIdx})" style="padding: 4px 10px; font-size: 12px;">
                  ➕ Tambah Pertanyaan
                </button>
              </div>

              <div class="questions-builder-list" id="q_list_${secIdx}">
                ${(sec.questions || []).map((q, qIdx) => this.renderQuestionEditor(secIdx, qIdx, q)).join('')}
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <button class="btn-danger-text" onclick="TemplateEditor.deleteSection(${secIdx})">
                🗑️ Hapus Seluruh Bagian ${secIdx + 1}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderQuestionEditor(secIdx, qIdx, q) {
    const isRadio = q.type === 'radio' || q.type === 'radio_other';
    const options = q.options || [];

    return `
      <div class="template-q-card" style="margin-bottom: 12px;">
        <div class="template-q-top">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-accent);">No. ${qIdx + 1}</span>
          <button class="btn-danger-text" onclick="TemplateEditor.deleteQuestion(${secIdx}, ${qIdx})" title="Hapus Pertanyaan">
            ✕ Hapus
          </button>
        </div>

        <div>
          <input 
            type="text" 
            class="form-input template-q-title-input" 
            placeholder="Tuliskan pertanyaan di sini..." 
            value="${escapeHtml(q.title || '')}"
            onchange="TemplateEditor.updateQuestionField(${secIdx}, ${qIdx}, 'title', this.value)"
          />
        </div>

        <div class="template-q-meta-row">
          <label style="display: inline-flex; align-items: center; gap: 6px;">
            <span>Tipe:</span>
            <select onchange="TemplateEditor.changeQuestionType(${secIdx}, ${qIdx}, this.value)">
              <option value="textarea" ${q.type === 'textarea' ? 'selected' : ''}>Esai / Refleksi Mendalam</option>
              <option value="text" ${q.type === 'text' ? 'selected' : ''}>Jawaban Singkat (Text)</option>
              <option value="radio" ${isRadio ? 'selected' : ''}>Pilihan Ganda (Radio Card)</option>
            </select>
          </label>

          <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <input 
              type="checkbox" 
              ${q.required ? 'checked' : ''} 
              onchange="TemplateEditor.updateQuestionField(${secIdx}, ${qIdx}, 'required', this.checked)"
            />
            <span>Wajib diisi</span>
          </label>
        </div>

        ${isRadio ? `
          <div class="template-options-builder">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Opsi Pilihan Ganda:</span>
              <button class="btn btn-secondary" onclick="TemplateEditor.addOption(${secIdx}, ${qIdx})" style="padding: 3px 8px; font-size: 11px;">
                + Tambah Opsi
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
              ${options.map((opt, optIdx) => `
                <div class="template-option-row">
                  <input 
                    type="text" 
                    class="form-input" 
                    value="${escapeHtml(opt.label || opt.value || '')}"
                    placeholder="Teks opsi..."
                    onchange="TemplateEditor.updateOptionLabel(${secIdx}, ${qIdx}, ${optIdx}, this.value)"
                  />
                  <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: ${opt.isFlag ? '#f87171' : 'var(--text-tertiary)'}; cursor: pointer; white-space: nowrap;">
                    <input 
                      type="checkbox" 
                      ${opt.isFlag ? 'checked' : ''}
                      onchange="TemplateEditor.toggleOptionFlag(${secIdx}, ${qIdx}, ${optIdx}, this.checked)"
                    />
                    <span>Red Flag ⚠️</span>
                  </label>
                  <button class="btn-danger-text" onclick="TemplateEditor.deleteOption(${secIdx}, ${qIdx}, ${optIdx})" style="padding: 2px 6px;">✕</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  toggleSectionCollapse(secIdx) {
    const body = document.getElementById(`body_sec_${secIdx}`);
    const arrow = document.getElementById(`arrow_sec_${secIdx}`);
    if (body) {
      body.classList.toggle('collapsed');
      if (arrow) arrow.textContent = body.classList.contains('collapsed') ? '▶' : '▼';
    }
  },

  updateSectionField(secIdx, field, val) {
    if (this.sections[secIdx]) {
      this.sections[secIdx][field] = val;
    }
  },

  updateQuestionField(secIdx, qIdx, field, val) {
    if (this.sections[secIdx]?.questions?.[qIdx]) {
      this.sections[secIdx].questions[qIdx][field] = val;
    }
  },

  changeQuestionType(secIdx, qIdx, newType) {
    const q = this.sections[secIdx]?.questions?.[qIdx];
    if (!q) return;

    q.type = newType;
    if (newType === 'radio' && (!q.options || q.options.length === 0)) {
      q.options = [
        { value: 'Opsi 1', label: 'Opsi 1' },
        { value: 'Opsi 2', label: 'Opsi 2' }
      ];
    }
    this.renderSections();
  },

  addQuestion(secIdx) {
    if (!this.sections[secIdx]) return;
    const newId = `s${secIdx + 1}_q${Date.now().toString(36)}`;
    const newQ = {
      id: newId,
      title: 'Pertanyaan Baru',
      type: 'textarea',
      required: true,
      placeholder: 'Tuliskan jawaban...',
      hint: 'Jawab dengan jujur dan mendalam.'
    };
    this.sections[secIdx].questions.push(newQ);
    this.renderSections();
  },

  deleteQuestion(secIdx, qIdx) {
    if (confirm('Yakin ingin menghapus pertanyaan ini?')) {
      this.sections[secIdx].questions.splice(qIdx, 1);
      this.renderSections();
    }
  },

  addOption(secIdx, qIdx) {
    const q = this.sections[secIdx]?.questions?.[qIdx];
    if (!q) return;
    if (!q.options) q.options = [];
    const nextNum = q.options.length + 1;
    q.options.push({
      value: `Pilihan ${nextNum}`,
      label: `Pilihan ${nextNum}`,
      isFlag: false
    });
    this.renderSections();
  },

  updateOptionLabel(secIdx, qIdx, optIdx, val) {
    const opt = this.sections[secIdx]?.questions?.[qIdx]?.options?.[optIdx];
    if (opt) {
      opt.label = val;
      opt.value = val;
    }
  },

  toggleOptionFlag(secIdx, qIdx, optIdx, isFlag) {
    const opt = this.sections[secIdx]?.questions?.[qIdx]?.options?.[optIdx];
    if (opt) {
      opt.isFlag = isFlag;
      opt.flagMessage = isFlag ? 'Pilihan terindikasi perhatian khusus' : undefined;
      this.renderSections();
    }
  },

  deleteOption(secIdx, qIdx, optIdx) {
    const q = this.sections[secIdx]?.questions?.[qIdx];
    if (q && q.options) {
      q.options.splice(optIdx, 1);
      this.renderSections();
    }
  },

  addNewSection() {
    const nextNum = this.sections.length + 1;
    const newSec = {
      id: `sec_${nextNum}`,
      number: nextNum,
      title: `Bagian ${nextNum}: Topik Tambahan`,
      subtitle: 'Kustomisasi Tambahan',
      description: 'Bagian pertanyaan kustom baru.',
      questions: [
        {
          id: `s${nextNum}_q1`,
          title: 'Pertanyaan pertama di bagian ini',
          type: 'textarea',
          required: true
        }
      ]
    };
    this.sections.push(newSec);
    this.renderSections();
    showToast(`Bagian ${nextNum} berhasil ditambahkan! ➕`);
  },

  deleteSection(secIdx) {
    if (confirm(`Yakin ingin menghapus seluruh Bagian ${secIdx + 1}?`)) {
      this.sections.splice(secIdx, 1);
      // Re-index section numbers
      this.sections.forEach((sec, idx) => {
        sec.number = idx + 1;
      });
      this.renderSections();
    }
  },

  async saveTemplate() {
    const saveBtn = document.getElementById('btnSaveTemplate');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Menyimpan...';
    }

    try {
      const res = await fetch('/api/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: this.sections })
      });
      const data = await res.json();

      if (data.success) {
        this.isCustom = true;
        // Simpan ke local storage juga
        localStorage.setItem('custom_form_template', JSON.stringify(this.sections));
        App.activeSections = JSON.parse(JSON.stringify(this.sections));
        this.updateStatusBadge();
        showToast('Template kuesioner berhasil disimpan & langsung aktif! ✨');
      } else {
        throw new Error(data.message || 'Gagal menyimpan');
      }
    } catch (err) {
      console.warn('Simpan ke server gagal, menyimpan ke local storage:', err);
      localStorage.setItem('custom_form_template', JSON.stringify(this.sections));
      App.activeSections = JSON.parse(JSON.stringify(this.sections));
      this.isCustom = true;
      this.updateStatusBadge();
      showToast('Template disimpan secara lokal di perangkat! 💾');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Simpan Perubahan Template';
      }
    }
  },

  async resetTemplate() {
    if (!confirm('Yakin ingin mereset kembali ke Template Bawaan (11 Bagian komitmen asli)? Perubahan kustommu akan diganti.')) {
      return;
    }

    try {
      const res = await fetch('/api/template/reset', { method: 'POST' });
      const data = await res.json();
      localStorage.removeItem('custom_form_template');
      this.isCustom = false;
      this.sections = JSON.parse(JSON.stringify(data.data || window.FORM_SECTIONS));
      App.activeSections = JSON.parse(JSON.stringify(this.sections));
      this.updateStatusBadge();
      this.renderSections();
      showToast('Template berhasil di-reset ke template bawaan! 🔄');
    } catch (err) {
      console.warn('Reset error:', err);
      localStorage.removeItem('custom_form_template');
      this.isCustom = false;
      this.sections = JSON.parse(JSON.stringify(window.FORM_SECTIONS));
      App.activeSections = JSON.parse(JSON.stringify(this.sections));
      this.updateStatusBadge();
      this.renderSections();
      showToast('Berhasil kembali ke template bawaan! 🔄');
    }
  }
};
