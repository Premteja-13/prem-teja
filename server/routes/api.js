const express = require('express');
const router = express.Router();
const config = require('../config');
const geminiService = require('../services/geminiService');
const storageService = require('../services/storageService');

/**
 * GET /api/health
 * System diagnostics and readiness status (Safe - never exposes secrets)
 */
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    app: 'NoticeSense AI',
    readiness: {
      gemini_configured: config.hasGeminiKey,
      gemini_model: config.geminiModel,
      storage_mode: storageService.getStorageMode(),
      supabase_configured: config.hasSupabase,
      node_version: process.version
    }
  });
});

/**
 * POST /api/analyze
 * Analyzes notice text using Gemini + Two-Phase Verification Pipeline
 */
router.post('/analyze', async (req, res) => {
  try {
    const { title, text, save = true } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 15) {
      return res.status(400).json({
        success: false,
        error: 'Notice text is too short. Please provide at least 15 characters of notice content.'
      });
    }

    if (text.length > 20000) {
      return res.status(400).json({
        success: false,
        error: 'Notice text exceeds 20,000 characters limit. Please submit a shorter excerpt or document section.'
      });
    }

    const cleanTitle = (title || '').trim().substring(0, 150);
    const analysis = await geminiService.analyzeNotice({ title: cleanTitle, text });

    let savedRecord = null;
    if (save) {
      try {
        savedRecord = await storageService.saveNotice({
          title: cleanTitle,
          originalText: text,
          analysisJson: analysis
        });
      } catch (saveErr) {
        console.warn('[API] Notice save warning:', saveErr.message);
      }
    }

    res.json({
      success: true,
      notice_id: savedRecord ? savedRecord.id : null,
      saved: Boolean(savedRecord),
      analysis: savedRecord ? savedRecord.analysis_json : analysis,
      tasks: savedRecord ? savedRecord.tasks : (analysis.tasks || []),
      original_text: text,
      title: cleanTitle
    });
  } catch (err) {
    if (err.message && err.message.includes('GEMINI_API_KEY is not configured')) {
      return res.status(503).json({ success: false, error: err.message, missing_key: true });
    }
    console.error('[API] /analyze error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while analyzing notice.'
    });
  }
});

/**
 * POST /api/analyze-file
 * Analyzes uploaded PDF or image notice using Gemini Multimodal input
 */
router.post('/analyze-file', async (req, res) => {
  try {
    const { title, fileBase64, mimeType, save = true } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'File data and MIME type are required. Please upload a PDF or image document.'
      });
    }

    const cleanTitle = (title || '').trim().substring(0, 150);
    const { analysis, extracted_text } = await geminiService.analyzeNoticeDocument({
      title: cleanTitle,
      fileBase64,
      mimeType
    });

    let savedRecord = null;
    if (save) {
      try {
        savedRecord = await storageService.saveNotice({
          title: cleanTitle || (analysis.category ? `${analysis.category} Circular` : 'Uploaded Document Notice'),
          originalText: extracted_text,
          analysisJson: analysis
        });
      } catch (saveErr) {
        console.warn('[API] Notice save warning:', saveErr.message);
      }
    }

    res.json({
      success: true,
      notice_id: savedRecord ? savedRecord.id : null,
      saved: Boolean(savedRecord),
      analysis: savedRecord ? savedRecord.analysis_json : analysis,
      tasks: savedRecord ? savedRecord.tasks : (analysis.tasks || []),
      original_text: extracted_text,
      title: cleanTitle || (analysis.category ? `${analysis.category} Circular` : 'Uploaded Document Notice')
    });
  } catch (err) {
    if (err.message && err.message.includes('GEMINI_API_KEY is not configured')) {
      return res.status(503).json({ success: false, error: err.message, missing_key: true });
    }
    console.error('[API] /analyze-file error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while analyzing document file.'
    });
  }
});

/**
 * POST /api/ask
 * Grounded Q&A against original notice with negative constraint & citation verification
 */
router.post('/ask', async (req, res) => {
  try {
    const { noticeText, question, analysisSummary } = req.body;

    if (!noticeText || !question) {
      return res.status(400).json({
        success: false,
        error: 'Both noticeText and question are required.'
      });
    }

    if (question.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Question is too short.'
      });
    }

    const answerResult = await geminiService.askNotice({
      noticeText,
      question: question.trim(),
      analysisSummary
    });

    res.json({
      success: true,
      question: question.trim(),
      ...answerResult
    });
  } catch (err) {
    console.error('[API] /ask error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Error answering question.'
    });
  }
});

/**
 * POST /api/compare
 * Compare two notices to highlight differences and contradictions
 */
router.post('/compare', async (req, res) => {
  try {
    const { noticeA, noticeB, titleA, titleB } = req.body;

    if (!noticeA || !noticeB) {
      return res.status(400).json({
        success: false,
        error: 'Both noticeA and noticeB content are required for comparison.'
      });
    }

    const comparison = await geminiService.compareNotices({
      noticeA,
      noticeB,
      titleA: titleA || 'Notice 1',
      titleB: titleB || 'Notice 2'
    });

    res.json({
      success: true,
      comparison
    });
  } catch (err) {
    console.error('[API] /compare error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Error comparing notices.'
    });
  }
});

/**
 * GET /api/notices
 * Fetch all saved notices
 */
router.get('/notices', async (req, res) => {
  try {
    const notices = await storageService.getAllNotices();
    res.json({ success: true, count: notices.length, notices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/notices/:id
 * Fetch single saved notice with details and tasks
 */
router.get('/notices/:id', async (req, res) => {
  try {
    const notice = await storageService.getNoticeById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, error: 'Notice not found.' });
    }
    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/notices/:id
 * Delete a saved notice and associated tasks
 */
router.delete('/notices/:id', async (req, res) => {
  try {
    const deleted = await storageService.deleteNotice(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/tasks/:id
 * Toggle or update task completion
 */
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Field "completed" must be a boolean.' });
    }
    const updated = await storageService.updateTaskStatus(req.params.id, completed);
    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tasks/upcoming
 * Fetch upcoming tasks across all notices
 */
router.get('/tasks/upcoming', async (req, res) => {
  try {
    const tasks = await storageService.getUpcomingTasks();
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
