// Dashboard & Reviewer Controller
const Dashboard = {
  submissions: [],
  selectedSubmission: null,
  serverInfo: null,

  async init() {
    this.bindEvents();
    await this.fetchServerInfo();
    await this.fetchSubmissions();
  },

  bindEvents() {
    const refreshBtn = document.getElementById('btnRefreshSubmissions');
    if (refreshBtn) refreshBtn.addEventListener('click', () => this.fetchSubmissions());

    const changePinBtn = document.getElementById('btnChangePin');
    if (changePinBtn) changePinBtn.addEventListener('click', () => App.changePin());

    const copyUrlBtn = document.getElementById('btnCopyShareUrl');
    if (copyUrlBtn) copyUrlBtn.addEventListener('click', () => this.copyShareUrl());

    const closeDetailBtn = document.getElementById('btnCloseDetailModal');
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => this.closeDetailModal());

    const printBtn = document.getElementById('btnPrintSubmission');
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    const shareWaBtn = document.getElementById('btnShareWaReview');
    if (shareWaBtn) shareWaBtn.addEventListener('click', () => this.copySummaryToClipboard());
  },

  async fetchServerInfo() {
    try {
      const res = await fetch('/api/server-info');
      const data = await res.json();
      this.serverInfo = data;

      // Clean respondent URL for partner
      const cleanUrl = data.networkUrl ? data.networkUrl.replace(/\/riwayat.*$/, '') : window.location.origin;

      const shareUrlText = document.getElementById('shareUrlText');
      if (shareUrlText) {
        shareUrlText.textContent = cleanUrl;
        shareUrlText.title = cleanUrl;
      }

      const qrContainer = document.getElementById('qrContainer');
      if (qrContainer && data.qrDataUrl) {
        qrContainer.innerHTML = `<img src="${data.qrDataUrl}" alt="QR Code" style="width: 100%; height: 100%; border-radius: 6px;" />`;
      }
    } catch (err) {
      console.warn('Gagal memuat server info:', err);
    }
  },

  copyShareUrl() {
    const rawUrl = this.serverInfo?.networkUrl || window.location.origin;
    const cleanUrl = rawUrl.replace(/\/riwayat.*$/, '');
    navigator.clipboard.writeText(cleanUrl).then(() => {
      showToast('Link form untuk pacar berhasil disalin! 📋');
    }).catch(() => {
      showToast('Gagal menyalin link.');
    });
  },

  async fetchSubmissions() {
    const listEl = document.getElementById('submissionsList');
    const badgeEl = document.getElementById('submissionsCountBadge');

    let serverData = [];
    try {
      const res = await fetch('/api/submissions');
      const json = await res.json();
      serverData = json.data || [];
    } catch (err) {
      console.warn('Gagal fetch server submissions, membaca riwayat lokal:', err);
    }

    // Gabungkan dengan riwayat lokal browser agar tidak pernah hilang di cloud/Vercel
    const localHistory = JSON.parse(localStorage.getItem('relationship_questionnaire_history') || '[]');
    const map = new Map();
    serverData.forEach(item => map.set(item.id, item));
    localHistory.forEach(item => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    this.submissions = Array.from(map.values()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (badgeEl) badgeEl.textContent = this.submissions.length;

    if (!this.submissions.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💌</div>
          <div class="empty-state-title">Belum Ada Riwayat Jawaban</div>
          <div class="empty-state-desc">
            Bagikan link atau barcode di atas ke pacarmu. Begitu pacarmu selesai mengisi kuesioner, seluruh hasil jawabannya akan langsung otomatis masuk ke riwayat di sini.
          </div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.submissions.map(sub => this.renderSubmissionCard(sub)).join('');

    // Add click handlers to cards
    document.querySelectorAll('.submission-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.openDetailModal(id);
      });
    });
  },

  renderSubmissionCard(sub) {
    const dateStr = new Date(sub.submittedAt).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const candidateName = sub.candidateName || sub.answers?.['s1_q1'] || 'Anonim';
    const ageDom = [sub.answers?.['s1_q2'], sub.answers?.['s1_q3']].filter(Boolean).join(' • ');

    // Scan for flags
    const flags = this.scanRedFlags(sub.answers);
    const hasFlags = flags.length > 0;

    // Love language & Readiness
    const loveLang = sub.answers?.['s6_q3'] || '';
    const readiness = sub.answers?.['s2_q2'] || '';

    return `
      <div class="submission-item-card" data-id="${sub.id}">
        <div class="sub-card-top">
          <div>
            <h4 class="sub-candidate-name">${escapeHtml(candidateName)}</h4>
            ${ageDom ? `<p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${escapeHtml(ageDom)}</p>` : ''}
          </div>
          <span class="sub-date">${dateStr}</span>
        </div>

        <div class="sub-badges-row">
          ${hasFlags ? `
            <span class="tag-badge flag">⚠️ ${flags.length} Catatan Evaluasi</span>
          ` : `
            <span class="tag-badge success">✨ Bebas Red Flag</span>
          `}

          ${readiness ? `
            <span class="tag-badge info">💍 ${escapeHtml(readiness)}</span>
          ` : ''}

          ${loveLang ? `
            <span class="tag-badge info">❤️ ${escapeHtml(loveLang)}</span>
          ` : ''}
        </div>
      </div>
    `;
  },

  scanRedFlags(answers = {}) {
    const flags = [];
    const sections = (typeof App !== 'undefined' && App.activeSections?.length > 0) ? App.activeSections : (window.FORM_SECTIONS || []);
    sections.forEach(sec => {
      (sec.questions || []).forEach(q => {
        if (q.options) {
          const userVal = answers[q.id];
          const chosenOpt = q.options.find(opt => opt.value === userVal);
          if (chosenOpt && chosenOpt.isFlag) {
            flags.push({
              section: sec.title,
              question: q.title,
              answer: chosenOpt.label,
              reason: chosenOpt.flagMessage || 'Pilihan berpotensi red-flag'
            });
          }
        }
      });
    });
    return flags;
  },

  openDetailModal(id) {
    const sub = this.submissions.find(s => s.id === id);
    if (!sub) return;
    this.selectedSubmission = sub;

    const modal = document.getElementById('detailModal');
    const nameEl = document.getElementById('modalCandidateName');
    const dateEl = document.getElementById('modalSubmitDate');
    const bodyEl = document.getElementById('detailModalBody');

    const candidateName = sub.candidateName || sub.answers?.['s1_q1'] || 'Anonim';
    nameEl.textContent = `Jawaban: ${candidateName}`;
    dateEl.textContent = 'Dikirim: ' + new Date(sub.submittedAt).toLocaleString('id-ID');

    // Build flags alert
    const flags = this.scanRedFlags(sub.answers);
    let html = '';

    if (flags.length > 0) {
      html += `
        <div style="background: var(--badge-flag-bg); border: 1px solid var(--badge-flag-border); border-radius: var(--radius-md); padding: 14px;">
          <h4 style="font-size: 14px; color: var(--badge-flag-text); font-weight: 700; margin-bottom: 6px;">
            ⚠️ Perhatian: Terdeteksi ${flags.length} Catatan / Potensi Red Flag
          </h4>
          <ul style="padding-left: 18px; font-size: 13px; color: var(--badge-flag-text);">
            ${flags.map(f => `<li><strong>${escapeHtml(f.question)}</strong>: "${escapeHtml(f.answer)}" <em>(${escapeHtml(f.reason)})</em></li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      html += `
        <div style="background: var(--badge-success-bg); border: 1px solid var(--badge-success-border); border-radius: var(--radius-md); padding: 12px 14px;">
          <h4 style="font-size: 13.5px; color: var(--badge-success-text); font-weight: 700;">
            ✨ Tidak Ada Indikator Diskualifikasi Langsung
          </h4>
          <p style="font-size: 12px; color: var(--badge-success-text); margin-top: 2px;">
            Semua jawaban pilihan ganda berada dalam koridor komitmen positif dan kesiapan serius.
          </p>
        </div>
      `;
    }

    // Render active sections
    const sections = (typeof App !== 'undefined' && App.activeSections?.length > 0) ? App.activeSections : (window.FORM_SECTIONS || []);
    sections.forEach(sec => {
      html += `
        <div class="detail-section-group">
          <div class="detail-section-title">SECTION ${sec.number}: ${escapeHtml(sec.title)}</div>
      `;

      (sec.questions || []).forEach((q, idx) => {
        let ans = sub.answers?.[q.id] || '(Belum dijawab)';
        if (q.type === 'radio_other') {
          const otherVal = sub.answers?.[`${q.id}_other`];
          if (otherVal) ans = `${ans}: ${otherVal}`;
        }

        // Check if this answer was flagged
        const isFlag = q.options?.some(opt => opt.value === ans && opt.isFlag);

        html += `
          <div class="detail-qa-row">
            <div class="detail-q">${idx + 1}. ${escapeHtml(q.title)}</div>
            <div class="detail-a ${isFlag ? 'flagged' : ''}">${escapeHtml(ans)}</div>
          </div>
        `;
      });

      html += `</div>`;
    });

    bodyEl.innerHTML = html;
    modal.classList.add('active');
  },

  closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
    this.selectedSubmission = null;
  },

  copySummaryToClipboard() {
    if (!this.selectedSubmission) return;
    const sub = this.selectedSubmission;
    const candidateName = sub.candidateName || sub.answers?.['s1_q1'] || 'Anonim';
    const flags = this.scanRedFlags(sub.answers);

    let summaryText = `*RINGKASAN HASIL KUESIONER HUBUNGAN*\n`;
    summaryText += `👤 Nama: ${candidateName}\n`;
    summaryText += `📅 Tanggal: ${new Date(sub.submittedAt).toLocaleDateString('id-ID')}\n`;
    summaryText += `💍 Kesiapan Menikah: ${sub.answers?.['s2_q2'] || '-'}\n`;
    summaryText += `❤️ Love Language: ${sub.answers?.['s6_q3'] || '-'}\n`;
    summaryText += `💼 Pekerjaan: ${sub.answers?.['s1_q4'] || '-'}\n\n`;

    if (flags.length > 0) {
      summaryText += `⚠️ *Catatan Evaluasi (${flags.length})*:\n`;
      flags.forEach(f => {
        summaryText += `- ${f.question}: ${f.answer}\n`;
      });
      summaryText += `\n`;
    } else {
      summaryText += `✨ Status: Semua pilihan komitmen positif.\n\n`;
    }

    summaryText += `*Visi 5 Tahun ke Depan:*\n"${sub.answers?.['s6_q1'] || '-'}"\n\n`;
    summaryText += `*Komitmen Seumur Hidup:*\n"${sub.answers?.['s11_q1'] || '-'}"\n`;

    navigator.clipboard.writeText(summaryText).then(() => {
      showToast('Ringkasan disalin! Siap ditempel di WhatsApp 📲');
    }).catch(() => {
      showToast('Gagal menyalin ringkasan.');
    });
  }
};

function escapeHtml(str) {
  if (typeof str !== 'string') return str || '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
