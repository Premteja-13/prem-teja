/**
 * NoticeSense AI — Main Client Application
 * Premium AI SaaS for Campus Notice Intelligence
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // Global State
  // ==========================================================================
  const state = {
    currentNoticeText: '',
    currentAnalysis: null,
    currentNoticeId: null,
    currentAttachedFile: null,
    savedNotices: [],
    systemHealth: null
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const elements = {
    // Nav & Tabs
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    savedCountBadge: document.getElementById('saved-count'),
    statusPill: document.getElementById('status-pill'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),

    // Hero Stats & Upcoming Widget
    statVerifiedRate: document.getElementById('stat-verified-rate'),
    statNoticesCount: document.getElementById('stat-notices-count'),
    statPendingTasks: document.getElementById('stat-pending-tasks'),
    upcomingDashboardCard: document.getElementById('upcoming-dashboard-card'),
    upcomingTasksBadge: document.getElementById('upcoming-tasks-badge'),
    upcomingItemsGrid: document.getElementById('upcoming-items-grid'),

    // Sample picker & Input Form
    sampleChipsContainer: document.getElementById('sample-chips'),
    noticeForm: document.getElementById('notice-form'),
    noticeTitleInput: document.getElementById('notice-title'),
    noticeTextInput: document.getElementById('notice-text'),
    charCounter: document.getElementById('char-counter'),
    wordCounter: document.getElementById('word-counter'),
    btnUploadFile: document.getElementById('btn-upload-file'),
    noticeFileInput: document.getElementById('notice-file-input'),
    fileAttachmentPreview: document.getElementById('file-attachment-preview'),
    attachmentName: document.getElementById('attachment-name'),
    attachmentMeta: document.getElementById('attachment-meta'),
    btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
    btnPasteClipboard: document.getElementById('btn-paste-clipboard'),
    btnClearInput: document.getElementById('btn-clear-input'),
    btnAnalyze: document.getElementById('btn-analyze'),
    analyzeSpinner: document.getElementById('analyze-spinner'),

    // Loading Card
    loadingCard: document.getElementById('loading-card'),
    loadingStepTitle: document.getElementById('loading-step-title'),
    loadingStepDesc: document.getElementById('loading-step-desc'),
    analysisProgressBar: document.getElementById('analysis-progress-bar'),

    // Results Display
    resultsContainer: document.getElementById('results-container'),
    resCategory: document.getElementById('res-category'),
    resConfidence: document.getElementById('res-confidence'),
    resDate: document.getElementById('res-date'),
    resTitle: document.getElementById('res-title'),
    resSummary: document.getElementById('res-summary'),
    scorePercentage: document.getElementById('score-percentage'),
    scoreBarFill: document.getElementById('score-bar-fill'),
    scoreSupportedCount: document.getElementById('score-supported-count'),
    scoreReviewCount: document.getElementById('score-review-count'),
    scoreConflictCount: document.getElementById('score-conflict-count'),
    resAlertsContainer: document.getElementById('res-alerts-container'),
    deadlinesCount: document.getElementById('deadlines-count'),
    timelineList: document.getElementById('timeline-list'),
    eligibilityList: document.getElementById('eligibility-list'),
    feesList: document.getElementById('fees-list'),
    documentsList: document.getElementById('documents-list'),
    contactList: document.getElementById('contact-list'),
    stepsList: document.getElementById('steps-list'),
    tasksChecklist: document.getElementById('tasks-checklist'),
    taskProgressBadge: document.getElementById('task-progress-badge'),

    // Grounded QA
    qaForm: document.getElementById('qa-form'),
    qaQuestionInput: document.getElementById('qa-question-input'),
    btnQaSubmit: document.getElementById('btn-qa-submit'),
    qaSpinner: document.getElementById('qa-spinner'),
    qaResultsStream: document.getElementById('qa-results-stream'),
    suggestedChips: document.querySelectorAll('.question-chip'),

    // Saved Tab
    savedNoticesContainer: document.getElementById('saved-notices-container'),
    btnRefreshSaved: document.getElementById('btn-refresh-saved'),

    // Compare Tab
    compareTitleA: document.getElementById('compare-title-a'),
    compareTextA: document.getElementById('compare-text-a'),
    compareTitleB: document.getElementById('compare-title-b'),
    compareTextB: document.getElementById('compare-text-b'),
    btnRunCompare: document.getElementById('btn-run-compare'),
    compareSpinner: document.getElementById('compare-spinner'),
    compareResults: document.getElementById('compare-results'),

    // Evidence Modal
    evidenceModal: document.getElementById('evidence-modal'),
    modalQuoteText: document.getElementById('modal-quote-text'),
    modalStatusBadge: document.getElementById('modal-status-badge'),
    modalMetaResult: document.getElementById('modal-meta-result'),
    modalMetaNotes: document.getElementById('modal-meta-notes'),
    btnCloseModal: document.getElementById('btn-close-modal'),

    // App Alert
    appAlert: document.getElementById('app-alert')
  };

  // ==========================================================================
  // Notification Utility
  // ==========================================================================
  function showAlert(message, type = 'info', timeout = 5000) {
    elements.appAlert.className = `app-alert ${type}`;
    elements.appAlert.querySelector('.alert-text').textContent = message;
    elements.appAlert.classList.remove('hidden');

    if (timeout > 0) {
      setTimeout(() => {
        elements.appAlert.classList.add('hidden');
      }, timeout);
    }
  }

  elements.appAlert.querySelector('.alert-close').addEventListener('click', () => {
    elements.appAlert.classList.add('hidden');
  });

  // ==========================================================================
  // Tab Navigation
  // ==========================================================================
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      elements.navTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      elements.tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');

      if (targetId === 'tab-saved') {
        loadSavedNotices();
      }
    });
  });

  // ==========================================================================
  // System Health & Diagnostics
  // ==========================================================================
  async function checkSystemHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      state.systemHealth = data;

      const dot = elements.statusPill.querySelector('.status-dot');
      const label = elements.statusPill.querySelector('.status-label');

      if (data.readiness && data.readiness.gemini_configured) {
        dot.className = 'status-dot online';
        label.textContent = `Gemini Active (${data.readiness.gemini_model})`;
      } else {
        dot.className = 'status-dot offline';
        label.textContent = 'API Key Needed (.env)';
      }

      // Update Diagnostics modal
      document.getElementById('diag-gemini').textContent = data.readiness?.gemini_configured ? 'Connected ✅' : 'Missing Key ⚠️';
      document.getElementById('diag-model').textContent = data.readiness?.gemini_model || 'gemini-1.5-flash';
      document.getElementById('diag-storage').textContent = data.readiness?.storage_mode === 'supabase' ? 'Supabase PostgreSQL ✅' : 'Local JSON Store (Resilient) ✅';
      document.getElementById('diag-supabase').textContent = data.readiness?.supabase_configured ? 'Connected ✅' : 'Optional (Using local fallback)';
      document.getElementById('diag-node').textContent = data.readiness?.node_version || 'v20.x';
    } catch (err) {
      console.warn('[NoticeSense] Health check error:', err);
    }
  }

  // Settings Modal Handlers
  elements.btnOpenSettings.addEventListener('click', () => {
    checkSystemHealth();
    elements.settingsModal.classList.remove('hidden');
  });

  elements.btnCloseSettings.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });

  // ==========================================================================
  // Sample Notices Population
  // ==========================================================================
  function initSampleChips() {
    if (typeof SAMPLE_NOTICES === 'undefined' || !Array.isArray(SAMPLE_NOTICES)) return;

    elements.sampleChipsContainer.innerHTML = '';
    SAMPLE_NOTICES.forEach((notice, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'sample-chip';
      chip.textContent = `${index + 1}. ${notice.title.split('—')[0].substring(0, 32)}...`;
      chip.title = notice.description;
      chip.addEventListener('click', () => loadSampleNotice(notice));
      elements.sampleChipsContainer.appendChild(chip);
    });

    // Also bind benchmark suite buttons
    document.querySelectorAll('.load-bench-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleId = btn.dataset.id;
        const target = SAMPLE_NOTICES.find(s => s.id === sampleId);
        if (target) {
          // Switch to analyze tab and load
          document.querySelector('.nav-tab[data-tab="tab-analyze"]').click();
          loadSampleNotice(target);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }
      });
    });
  }

  function loadSampleNotice(sample) {
    elements.noticeTitleInput.value = sample.title;
    elements.noticeTextInput.value = sample.text;
    updateCounters();
    showAlert(`Loaded sample: "${sample.title}"`, 'info', 3000);
  }

  // Text counters
  function updateCounters() {
    const text = elements.noticeTextInput.value || '';
    elements.charCounter.textContent = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean);
    elements.wordCounter.textContent = words.length;
  }

  elements.noticeTextInput.addEventListener('input', updateCounters);

  // Paste from clipboard
  elements.btnPasteClipboard.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      elements.noticeTextInput.value = text;
      updateCounters();
      showAlert('Pasted text from clipboard.', 'success', 2500);
    } catch (err) {
      showAlert('Clipboard permission denied. Please paste manually using Ctrl+V.', 'warning', 4000);
    }
  });

  // File Upload Handlers (PDF & Images)
  if (elements.btnUploadFile && elements.noticeFileInput) {
    elements.btnUploadFile.addEventListener('click', () => {
      elements.noticeFileInput.click();
    });

    elements.noticeFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showAlert('File size exceeds 10MB limit. Please upload a smaller document.', 'warning', 5000);
        elements.noticeFileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        state.currentAttachedFile = {
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          base64: loadEvent.target.result
        };

        const sizeKb = Math.round(file.size / 1024);
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

        elements.attachmentName.textContent = file.name;
        elements.attachmentMeta.textContent = `${file.type.toUpperCase().replace('APPLICATION/', '')} &bull; ${sizeStr} &bull; Attached for Gemini Vision & OCR Extraction`;
        elements.fileAttachmentPreview.classList.remove('hidden');
        elements.noticeTextInput.removeAttribute('required');

        if (!elements.noticeTitleInput.value.trim()) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
          elements.noticeTitleInput.value = autoTitle;
        }

        showAlert(`Attached "${file.name}" (${sizeStr}) for AI multimodal analysis.`, 'info', 3500);
      };

      reader.onerror = () => {
        showAlert('Error reading file. Please try again.', 'error', 4000);
      };

      reader.readAsDataURL(file);
    });

    elements.btnRemoveAttachment.addEventListener('click', () => {
      state.currentAttachedFile = null;
      elements.noticeFileInput.value = '';
      elements.fileAttachmentPreview.classList.add('hidden');
      if (!elements.noticeTextInput.value.trim()) {
        elements.noticeTextInput.setAttribute('required', 'true');
      }
      showAlert('Removed attached document.', 'info', 2000);
    });
  }

  // Clear input
  elements.btnClearInput.addEventListener('click', () => {
    elements.noticeTitleInput.value = '';
    elements.noticeTextInput.value = '';
    if (elements.btnRemoveAttachment) {
      state.currentAttachedFile = null;
      if (elements.noticeFileInput) elements.noticeFileInput.value = '';
      if (elements.fileAttachmentPreview) elements.fileAttachmentPreview.classList.add('hidden');
      elements.noticeTextInput.setAttribute('required', 'true');
    }
    updateCounters();
    elements.resultsContainer.classList.add('hidden');
  });

  // ==========================================================================
  // Analysis Pipeline Execution
  // ==========================================================================
  elements.noticeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = elements.noticeTextInput.value.trim();
    const title = elements.noticeTitleInput.value.trim();
    const hasFile = Boolean(state.currentAttachedFile);

    if (!hasFile && (!text || text.length < 15)) {
      showAlert('Notice text is too short. Please provide at least 15 characters or attach a PDF/Image document.', 'warning', 4000);
      return;
    }

    // Set UI loading state
    elements.btnAnalyze.disabled = true;
    elements.analyzeSpinner.classList.remove('hidden');
    elements.loadingCard.classList.remove('hidden');
    elements.resultsContainer.classList.add('hidden');

    if (hasFile) {
      updateLoadingStep('Processing Document with Gemini Vision...', `Uploading and extracting structured content from ${state.currentAttachedFile.name}...`, 30);
    } else {
      updateLoadingStep('Extracting Notice Intelligence...', 'Sending content to Gemini for structured entity extraction.', 30);
    }

    setTimeout(() => {
      updateLoadingStep('Running Verification Engine...', 'Verifying date tokens, fees, and exact source citations against notice text.', 65);
    }, 1200);

    try {
      const endpoint = hasFile ? '/api/analyze-file' : '/api/analyze';
      const payload = hasFile
        ? { title, fileBase64: state.currentAttachedFile.base64, mimeType: state.currentAttachedFile.type, save: true }
        : { title, text, save: true };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze notice.');
      }

      updateLoadingStep('Rendering Fact Hierarchy...', 'Preparing timeline, checklists, and grounded Q&A.', 100);

      const resolvedText = data.original_text || text;
      state.currentNoticeText = resolvedText;
      state.currentAnalysis = data.analysis;
      state.currentNoticeId = data.notice_id;

      // Update text input with extracted text for grounded QA
      if (hasFile && data.original_text) {
        elements.noticeTextInput.value = data.original_text;
        updateCounters();
      }

      setTimeout(() => {
        elements.loadingCard.classList.add('hidden');
        renderAnalysisResults(data.analysis, title || data.title, resolvedText, data.tasks);
        elements.resultsContainer.classList.remove('hidden');
        elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        loadStats();
      }, 400);

    } catch (err) {
      console.error('[NoticeSense] Analysis error:', err);
      elements.loadingCard.classList.add('hidden');
      showAlert(err.message, 'error', 7000);
    } finally {
      elements.btnAnalyze.disabled = false;
      elements.analyzeSpinner.classList.add('hidden');
    }
  });

  function updateLoadingStep(title, desc, progressPercent) {
    elements.loadingStepTitle.textContent = title;
    elements.loadingStepDesc.textContent = desc;
    elements.analysisProgressBar.style.width = `${progressPercent}%`;
  }

  // ==========================================================================
  // Render Analysis Results
  // ==========================================================================
  function renderAnalysisResults(analysis, fallbackTitle, originalText, explicitTasks) {
    // 1. Header Badges & Summary
    elements.resCategory.textContent = analysis.category || 'General Notice';
    elements.resConfidence.textContent = `${(analysis.overall_confidence || 'medium').toUpperCase()} CONFIDENCE`;
    elements.resDate.textContent = `Analyzed ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    elements.resTitle.textContent = fallbackTitle || (analysis.category ? `${analysis.category} Announcement` : 'Campus Circular');
    elements.resSummary.textContent = analysis.summary || 'Summary not provided by model.';

    // 2. Trust Scorecard
    const vSummary = analysis.verification_summary || {
      trust_score: 100, supported: 0, needs_review: 0, conflicts: 0, total_facts: 0
    };
    elements.scorePercentage.textContent = `${vSummary.trust_score}%`;
    elements.scoreBarFill.style.width = `${vSummary.trust_score}%`;
    elements.scoreSupportedCount.textContent = `${vSummary.supported} Supported`;
    elements.scoreReviewCount.textContent = `${vSummary.needs_review} Review`;
    elements.scoreConflictCount.textContent = `${vSummary.conflicts} Conflicts`;

    // 3. Ambiguities & Missing Info Alerts
    elements.resAlertsContainer.innerHTML = '';
    const hasAmbiguities = Array.isArray(analysis.ambiguities) && analysis.ambiguities.length > 0;
    const hasMissing = Array.isArray(analysis.missing_information) && analysis.missing_information.length > 0;

    if (hasAmbiguities) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert-callout warning';
      alertDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <div class="alert-callout-content">
          <h5>Potential Contradictions or Ambiguities Flagged:</h5>
          <ul>${analysis.ambiguities.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
        </div>
      `;
      elements.resAlertsContainer.appendChild(alertDiv);
    }

    if (hasMissing) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert-callout missing';
      alertDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div class="alert-callout-content">
          <h5>Unstated Critical Details (Missing from Notice):</h5>
          <ul>${analysis.missing_information.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
        </div>
      `;
      elements.resAlertsContainer.appendChild(alertDiv);
    }

    // 4. Deadlines Timeline
    renderDeadlines(analysis.deadlines || []);

    // 5. Key Info Cards
    renderEligibility(analysis.eligibility || []);
    renderFees(analysis.fees || []);
    renderDocuments(analysis.required_documents || []);
    renderContact(analysis.contact_details);

    // 6. Step-by-Step Procedure
    renderInstructions(analysis.instructions || []);

    // 7. Student Action Checklist (with persisted task support)
    renderChecklist(explicitTasks || analysis.tasks || []);

    // Reset QA stream for new notice
    elements.qaResultsStream.innerHTML = '';
  }

  // --------------------------------------------------------------------------
  // Render Sub-Sections
  // --------------------------------------------------------------------------
  function renderDeadlines(deadlines) {
    elements.deadlinesCount.textContent = `${deadlines.length} date${deadlines.length === 1 ? '' : 's'}`;
    elements.timelineList.innerHTML = '';

    if (deadlines.length === 0) {
      elements.timelineList.innerHTML = '<div class="empty-state-notice">No specific deadlines or calendar dates were detected in this circular.</div>';
      return;
    }

    deadlines.forEach(d => {
      const item = document.createElement('div');
      item.className = 'timeline-item';

      const badgeHtml = getVerificationBadgeHtml(d.verification_status);

      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-item-header">
          <div class="date-verbatim">${escapeHtml(d.date_text || 'Date Unspecified')}</div>
          ${badgeHtml}
        </div>
        <div class="timeline-desc">${escapeHtml(d.description || 'Action required')}</div>
        <div class="timeline-footer">
          <span class="text-metrics">${d.normalized_date ? `ISO: ${escapeHtml(d.normalized_date)}` : 'Calendar date context'}</span>
          ${d.evidence ? `<button type="button" class="btn-inspect-evidence" data-evidence="${escapeHtml(d.evidence)}" data-status="${d.verification_status || ''}" data-notes="${escapeHtml(d.verification_notes || '')}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            Inspect Source Evidence
          </button>` : ''}
        </div>
      `;
      elements.timelineList.appendChild(item);
    });

    bindEvidenceButtons();
  }

  function renderEligibility(eligibility) {
    elements.eligibilityList.innerHTML = '';
    if (eligibility.length === 0) {
      elements.eligibilityList.innerHTML = '<div class="empty-state-notice">No specific eligibility constraints mentioned.</div>';
      return;
    }

    eligibility.forEach(e => {
      const item = document.createElement('div');
      item.className = 'fact-item';
      item.innerHTML = `
        <div class="fact-header">
          <span class="fact-title">${escapeHtml(e.condition || e.description || '')}</span>
          ${getVerificationBadgeHtml(e.verification_status)}
        </div>
        ${e.evidence ? `<div class="fact-sub"><button type="button" class="btn-inspect-evidence" data-evidence="${escapeHtml(e.evidence)}" data-status="${e.verification_status || ''}" data-notes="${escapeHtml(e.verification_notes || '')}">Inspect Quote</button></div>` : ''}
      `;
      elements.eligibilityList.appendChild(item);
    });
    bindEvidenceButtons();
  }

  function renderFees(fees) {
    elements.feesList.innerHTML = '';
    if (fees.length === 0) {
      elements.feesList.innerHTML = '<div class="empty-state-notice">No application or registration fee mentioned (Free or unstated).</div>';
      return;
    }

    fees.forEach(f => {
      const item = document.createElement('div');
      item.className = 'fact-item';
      item.innerHTML = `
        <div class="fact-header">
          <span class="fact-title">${escapeHtml(f.description || 'Fee')}</span>
          <span class="category-pill">${escapeHtml(f.amount || 'Stated')}</span>
        </div>
        <div class="fact-sub" style="display:flex; justify-content:space-between; align-items:center;">
          ${getVerificationBadgeHtml(f.verification_status)}
          ${f.evidence ? `<button type="button" class="btn-inspect-evidence" data-evidence="${escapeHtml(f.evidence)}" data-status="${f.verification_status || ''}" data-notes="${escapeHtml(f.verification_notes || '')}">Inspect Quote</button>` : ''}
        </div>
      `;
      elements.feesList.appendChild(item);
    });
    bindEvidenceButtons();
  }

  function renderDocuments(docs) {
    elements.documentsList.innerHTML = '';
    if (docs.length === 0) {
      elements.documentsList.innerHTML = '<div class="empty-state-notice">No specific document attachments requested.</div>';
      return;
    }

    docs.forEach(d => {
      const item = document.createElement('div');
      item.className = 'fact-item';
      item.innerHTML = `
        <div class="fact-header">
          <span class="fact-title">${escapeHtml(d.item || d.description || '')}</span>
          ${getVerificationBadgeHtml(d.verification_status)}
        </div>
        ${d.evidence ? `<div class="fact-sub"><button type="button" class="btn-inspect-evidence" data-evidence="${escapeHtml(d.evidence)}" data-status="${d.verification_status || ''}" data-notes="${escapeHtml(d.verification_notes || '')}">Inspect Quote</button></div>` : ''}
      `;
      elements.documentsList.appendChild(item);
    });
    bindEvidenceButtons();
  }

  function renderContact(contact) {
    elements.contactList.innerHTML = '';
    if (!contact || (!contact.person_or_office && !contact.email && !contact.phone)) {
      elements.contactList.innerHTML = '<div class="empty-state-notice">No specific official contact or submission desk listed.</div>';
      return;
    }

    const item = document.createElement('div');
    item.className = 'fact-item';
    item.innerHTML = `
      ${contact.person_or_office ? `<div class="fact-title" style="margin-bottom:0.25rem;">${escapeHtml(contact.person_or_office)}</div>` : ''}
      ${contact.email ? `<div class="fact-sub">Email: <a href="mailto:${escapeHtml(contact.email)}" style="color:var(--text-accent);">${escapeHtml(contact.email)}</a></div>` : ''}
      ${contact.phone ? `<div class="fact-sub">Phone: ${escapeHtml(contact.phone)}</div>` : ''}
      ${contact.location ? `<div class="fact-sub">Office: ${escapeHtml(contact.location)}</div>` : ''}
      ${contact.evidence ? `<div style="margin-top:0.4rem;"><button type="button" class="btn-inspect-evidence" data-evidence="${escapeHtml(contact.evidence)}" data-status="${contact.verification_status || ''}" data-notes="Contact information verified from notice.">Inspect Quote</button></div>` : ''}
    `;
    elements.contactList.appendChild(item);
    bindEvidenceButtons();
  }

  function renderInstructions(instructions) {
    elements.stepsList.innerHTML = '';
    if (instructions.length === 0) {
      elements.stepsList.innerHTML = '<div class="empty-state-notice">No sequential step-by-step instructions detected.</div>';
      return;
    }

    instructions.forEach((inst, idx) => {
      const row = document.createElement('div');
      row.className = 'step-row';
      row.innerHTML = `
        <div class="step-num">${inst.step || (idx + 1)}</div>
        <div class="step-content">
          <div class="step-text">${escapeHtml(inst.instruction || inst.description || '')}</div>
          ${inst.evidence ? `<button type="button" class="btn-inspect-evidence" data-evidence="${escapeHtml(inst.evidence)}" data-status="${inst.verification_status || ''}" data-notes="Procedural step from notice.">Inspect Quote</button>` : ''}
        </div>
      `;
      elements.stepsList.appendChild(row);
    });
    bindEvidenceButtons();
  }

  function getDeadlineUrgency(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
      return { label: 'Action Item', badgeClass: 'undated' };
    }

    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) {
      return { label: 'Scheduled', badgeClass: 'undated' };
    }

    const now = new Date();
    const targetDate = new Date(parsed);
    const diffMs = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', badgeClass: 'overdue' };
    } else if (diffDays <= 3) {
      return { label: diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`, badgeClass: 'urgent' };
    } else if (diffDays <= 14) {
      return { label: `In ${diffDays} days`, badgeClass: 'upcoming' };
    } else {
      return { label: 'Upcoming', badgeClass: 'upcoming' };
    }
  }

  function renderChecklist(tasks) {
    elements.tasksChecklist.innerHTML = '';
    if (!tasks || tasks.length === 0) {
      elements.tasksChecklist.innerHTML = '<div class="empty-state-notice">No actionable tasks generated.</div>';
      elements.taskProgressBadge.textContent = '0 / 0 completed';
      return;
    }

    const totalCount = tasks.length;
    let completedCount = tasks.filter(t => Boolean(t.completed)).length;

    tasks.forEach((t, i) => {
      const taskText = typeof t === 'string' ? t : (t.task || t.description || 'Task');
      const isCompleted = Boolean(t.completed);
      const taskId = t.id || null;
      const urgency = getDeadlineUrgency(t.due_date || t.dueDate);

      const item = document.createElement('div');
      item.className = `task-item ${isCompleted ? 'completed' : ''}`;
      item.id = `task-row-${i}`;

      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" id="chk-task-${i}" ${isCompleted ? 'checked' : ''} ${taskId ? `data-task-id="${taskId}"` : ''}>
          <label for="chk-task-${i}" class="task-label">${escapeHtml(taskText)}</label>
        </div>
        <div style="display:flex; align-items:center; gap:0.6rem;">
          ${t.due_date ? `<div class="task-due">Due: ${escapeHtml(t.due_date)}</div>` : ''}
          ${urgency ? `<span class="urgency-badge ${urgency.badgeClass}">${urgency.label}</span>` : ''}
        </div>
      `;

      const chk = item.querySelector('.task-checkbox');
      chk.addEventListener('change', async () => {
        const nextState = chk.checked;
        if (nextState) {
          item.classList.add('completed');
          completedCount++;
        } else {
          item.classList.remove('completed');
          completedCount--;
        }
        elements.taskProgressBadge.textContent = `${completedCount} / ${totalCount} completed`;

        if (taskId) {
          try {
            await fetch(`/api/tasks/${taskId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ completed: nextState })
            });
            loadStats();
          } catch (err) {
            console.warn('[NoticeSense] Error updating task status:', err);
          }
        }
      });

      elements.tasksChecklist.appendChild(item);
    });

    elements.taskProgressBadge.textContent = `${completedCount} / ${totalCount} completed`;
  }

  // --------------------------------------------------------------------------
  // Verification Badges Helper
  // --------------------------------------------------------------------------
  function getVerificationBadgeHtml(status) {
    if (!status || status === 'Supported by notice') {
      return '<span class="badge-supported"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Supported</span>';
    } else if (status === 'Needs review') {
      return '<span class="badge-review"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Review</span>';
    } else if (status === 'Conflicting information') {
      return '<span class="badge-conflict">Conflict</span>';
    } else {
      return '<span class="badge-notfound">Not Found</span>';
    }
  }

  // --------------------------------------------------------------------------
  // Evidence Inspector Modal
  // --------------------------------------------------------------------------
  function bindEvidenceButtons() {
    document.querySelectorAll('.btn-inspect-evidence').forEach(btn => {
      btn.onclick = () => {
        const evidence = btn.dataset.evidence;
        const status = btn.dataset.status || 'Supported by notice';
        const notes = btn.dataset.notes || 'Verified against original notice text.';

        elements.modalQuoteText.textContent = `"${evidence}"`;
        elements.modalStatusBadge.textContent = status;
        elements.modalStatusBadge.className = status === 'Supported by notice' ? 'badge-supported' : 'badge-review';
        elements.modalMetaResult.textContent = status === 'Supported by notice' ? 'Verbatim Match in Document' : 'Requires Student Attention';
        elements.modalMetaNotes.textContent = notes;

        elements.evidenceModal.classList.remove('hidden');
      };
    });
  }

  elements.btnCloseModal.addEventListener('click', () => {
    elements.evidenceModal.classList.add('hidden');
  });

  // ==========================================================================
  // Grounded "Ask the Notice" Q&A
  // ==========================================================================
  elements.suggestedChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.qaQuestionInput.value = chip.dataset.q;
      elements.qaForm.dispatchEvent(new Event('submit'));
    });
  });

  elements.qaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const question = elements.qaQuestionInput.value.trim();
    if (!question) return;

    if (!state.currentNoticeText) {
      showAlert('Please analyze a notice first before asking questions.', 'warning', 4000);
      return;
    }

    elements.btnQaSubmit.disabled = true;
    elements.qaSpinner.classList.remove('hidden');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeText: state.currentNoticeText,
          question,
          analysisSummary: state.currentAnalysis?.summary
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to retrieve grounded answer.');
      }

      renderQaResult(question, data);
      elements.qaQuestionInput.value = '';
    } catch (err) {
      console.error('[NoticeSense QA Error]', err);
      showAlert(err.message, 'error', 5000);
    } finally {
      elements.btnQaSubmit.disabled = false;
      elements.qaSpinner.classList.add('hidden');
    }
  });

  function renderQaResult(question, qaData) {
    const item = document.createElement('div');
    item.className = 'qa-item';

    const isStated = qaData.is_stated_in_notice;
    const excerpts = Array.isArray(qaData.supporting_excerpts) ? qaData.supporting_excerpts : [];

    item.innerHTML = `
      <div class="qa-question">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        ${escapeHtml(question)}
      </div>
      <div class="qa-answer">${escapeHtml(qaData.answer)}</div>
      ${excerpts.length > 0 ? `
        <div class="qa-grounding-box">
          <div class="grounding-header">Cited Verbatim Evidence:</div>
          ${excerpts.map(ex => `<div class="grounding-quote">"${escapeHtml(ex)}"</div>`).join('')}
        </div>
      ` : (!isStated ? `
        <div class="qa-grounding-box" style="border-color: rgba(245, 158, 11, 0.4);">
          <div class="grounding-header" style="color:var(--status-warning);">Negative Constraint Applied:</div>
          <div class="grounding-quote">This detail is not present in the document. NoticeSense strictly avoided guessing.</div>
        </div>
      ` : '')}
    `;

    elements.qaResultsStream.prepend(item);
  }

  // ==========================================================================
  // Saved Notices Tab
  // ==========================================================================
  async function loadSavedNotices() {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error);

      state.savedNotices = data.notices || [];
      elements.savedCountBadge.textContent = state.savedNotices.length;
      renderSavedNoticesList(state.savedNotices);
    } catch (err) {
      console.warn('[NoticeSense] Error loading saved notices:', err);
    }
  }

  function renderSavedNoticesList(notices) {
    elements.savedNoticesContainer.innerHTML = '';

    if (notices.length === 0) {
      elements.savedNoticesContainer.innerHTML = `
        <div class="empty-state-notice" style="grid-column: 1/-1; padding: 3rem;">
          No notices saved yet. Analyze any campus notice on the first tab and it will appear here automatically.
        </div>
      `;
      return;
    }

    notices.forEach(n => {
      const card = document.createElement('div');
      card.className = 'saved-card';

      const dateStr = n.created_at ? new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

      card.innerHTML = `
        <div class="saved-card-top">
          <span class="saved-card-category">${escapeHtml(n.category || 'General')}</span>
          <h3 class="saved-card-title">${escapeHtml(n.title)}</h3>
          <p class="saved-card-summary">${escapeHtml(n.summary || 'Summary available in full analysis.')}</p>
        </div>
        <div class="saved-card-footer">
          <span class="saved-card-date">${dateStr} &bull; ${n.deadlineCount || 0} dates</span>
          <div class="saved-card-actions">
            <button class="btn-ghost btn-sm open-saved-btn" data-id="${n.id}">Open</button>
            <button class="btn-ghost btn-sm delete-saved-btn" data-id="${n.id}" style="color:var(--status-danger);">Delete</button>
          </div>
        </div>
      `;

      card.querySelector('.open-saved-btn').addEventListener('click', () => openSavedNotice(n.id));
      card.querySelector('.delete-saved-btn').addEventListener('click', () => deleteSavedNotice(n.id));

      elements.savedNoticesContainer.appendChild(card);
    });
  }

  async function openSavedNotice(id) {
    try {
      const res = await fetch(`/api/notices/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      const notice = data.notice;
      state.currentNoticeText = notice.original_text;
      state.currentAnalysis = notice.analysis_json;
      state.currentNoticeId = notice.id;

      elements.noticeTitleInput.value = notice.title;
      elements.noticeTextInput.value = notice.original_text;
      updateCounters();

      // Switch to tab-analyze and render
      document.querySelector('.nav-tab[data-tab="tab-analyze"]').click();
      renderAnalysisResults(notice.analysis_json, notice.title, notice.original_text, notice.tasks);
      elements.resultsContainer.classList.remove('hidden');
      elements.resultsContainer.scrollIntoView({ behavior: 'smooth' });

      showAlert(`Loaded saved notice: "${notice.title}"`, 'info', 3000);
    } catch (err) {
      showAlert(`Could not load notice: ${err.message}`, 'error', 4000);
    }
  }

  async function deleteSavedNotice(id) {
    if (!confirm('Are you sure you want to delete this saved notice and its action items?')) return;

    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showAlert('Notice deleted successfully.', 'success', 3000);
      loadSavedNotices();
      loadStats();
    } catch (err) {
      showAlert(`Delete failed: ${err.message}`, 'error', 4000);
    }
  }

  elements.btnRefreshSaved.addEventListener('click', loadSavedNotices);

  // ==========================================================================
  // Notice Comparison Tool
  // ==========================================================================
  elements.btnRunCompare.addEventListener('click', async () => {
    const textA = elements.compareTextA.value.trim();
    const textB = elements.compareTextB.value.trim();
    const titleA = elements.compareTitleA.value.trim() || 'Notice A';
    const titleB = elements.compareTitleB.value.trim() || 'Notice B';

    if (!textA || !textB) {
      showAlert('Please enter text for both Notice A and Notice B to run comparative analysis.', 'warning', 4000);
      return;
    }

    elements.btnRunCompare.disabled = true;
    elements.compareSpinner.classList.remove('hidden');

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeA: textA, noticeB: textB, titleA, titleB })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      renderComparisonResults(data.comparison, titleA, titleB);
      elements.compareResults.classList.remove('hidden');
      elements.compareResults.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('[NoticeSense Compare Error]', err);
      showAlert(err.message, 'error', 5000);
    } finally {
      elements.btnRunCompare.disabled = false;
      elements.compareSpinner.classList.add('hidden');
    }
  });

  function renderComparisonResults(comp, titleA, titleB) {
    const points = Array.isArray(comp.comparison_points) ? comp.comparison_points : [];

    elements.compareResults.innerHTML = `
      <div class="compare-summary-box">
        <h4 style="margin-bottom:0.4rem; color:#FFF;">Comparative Analysis Summary</h4>
        <p>${escapeHtml(comp.comparison_summary || 'No major structural contradictions found.')}</p>
      </div>

      <div class="benchmark-table-responsive">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Status</th>
              <th>${escapeHtml(titleA)} Passage</th>
              <th>${escapeHtml(titleB)} Passage</th>
              <th>Analysis</th>
            </tr>
          </thead>
          <tbody>
            ${points.map(p => `
              <tr>
                <td><strong>${escapeHtml(p.topic)}</strong></td>
                <td><span class="${p.type === 'conflict' ? 'badge-conflict' : 'badge-supported'}">${escapeHtml(p.type)}</span></td>
                <td><em style="color:#94A3B8;">"${escapeHtml(p.notice_a_excerpt || 'N/A')}"</em></td>
                <td><em style="color:#D8B4FE;">"${escapeHtml(p.notice_b_excerpt || 'N/A')}"</em></td>
                <td>${escapeHtml(p.explanation)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // Global Metrics & Upcoming Tasks Widget
  // ==========================================================================
  async function loadStats() {
    try {
      const [nRes, tRes] = await Promise.all([
        fetch('/api/notices'),
        fetch('/api/tasks/upcoming')
      ]);

      const nData = await nRes.json();
      const tData = await tRes.json();

      if (nData.success) {
        elements.statNoticesCount.textContent = nData.count || 0;
        elements.savedCountBadge.textContent = nData.count || 0;
      }
      if (tData.success) {
        const upcomingTasks = tData.tasks || [];
        elements.statPendingTasks.textContent = upcomingTasks.length;
        renderUpcomingTasksWidget(upcomingTasks);
      }
    } catch (e) {
      console.warn('[NoticeSense] Error loading stats:', e);
    }
  }

  function renderUpcomingTasksWidget(tasks) {
    if (!elements.upcomingDashboardCard || !elements.upcomingItemsGrid) return;

    if (!tasks || tasks.length === 0) {
      elements.upcomingDashboardCard.classList.add('hidden');
      return;
    }

    elements.upcomingDashboardCard.classList.remove('hidden');
    elements.upcomingTasksBadge.textContent = `${tasks.length} Active`;
    elements.upcomingItemsGrid.innerHTML = '';

    // Show up to 6 most immediate tasks
    const displayTasks = tasks.slice(0, 6);
    displayTasks.forEach(task => {
      const urgency = getDeadlineUrgency(task.due_date);
      const card = document.createElement('div');
      card.className = 'upcoming-item-card';

      card.innerHTML = `
        <div class="upcoming-item-top">
          <input type="checkbox" class="task-checkbox upcoming-task-chk" data-task-id="${task.id}" id="dash-chk-${task.id}">
          <label for="dash-chk-${task.id}" class="upcoming-item-desc">${escapeHtml(task.description)}</label>
        </div>
        <div class="upcoming-item-bottom">
          <button type="button" class="upcoming-notice-link" data-notice-id="${task.notice_id}" title="Open Notice: ${escapeHtml(task.notice_title || 'Campus Notice')}">
            📄 ${escapeHtml(task.notice_title || 'Campus Notice')}
          </button>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            ${task.due_date ? `<span style="font-size:0.75rem; color:#94A3B8;">${escapeHtml(task.due_date)}</span>` : ''}
            <span class="urgency-badge ${urgency.badgeClass}">${urgency.label}</span>
          </div>
        </div>
      `;

      const chk = card.querySelector('.upcoming-task-chk');
      chk.addEventListener('change', async () => {
        if (chk.checked) {
          card.style.opacity = '0.4';
          try {
            await fetch(`/api/tasks/${task.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ completed: true })
            });
            setTimeout(() => {
              loadStats();
              loadSavedNotices();
            }, 300);
          } catch (err) {
            console.warn('[NoticeSense] Error updating task:', err);
          }
        }
      });

      const link = card.querySelector('.upcoming-notice-link');
      link.addEventListener('click', () => {
        if (task.notice_id) {
          openSavedNotice(task.notice_id);
        }
      });

      elements.upcomingItemsGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // Helper: Escape HTML to prevent injection
  // ==========================================================================
  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // Initial Boot
  // ==========================================================================
  checkSystemHealth();
  initSampleChips();
  loadStats();
});
