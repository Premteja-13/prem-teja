const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Initialize Supabase client if configured
let supabase = null;
if (config.hasSupabase) {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('[Storage] Supabase client initialized.');
  } catch (err) {
    console.error('[Storage] Supabase init error, falling back to local store:', err.message);
  }
}

// Local JSON file storage fallback
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'notices.json');

function ensureLocalStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ notices: [], tasks: [] }, null, 2), 'utf-8');
  }
}

function readLocalStore() {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Storage] Error reading local JSON store:', err);
    return { notices: [], tasks: [] };
  }
}

function writeLocalStore(data) {
  ensureLocalStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Storage Service with Supabase PostgreSQL and local JSON fallback
 */
class StorageService {
  isUsingSupabase() {
    return Boolean(supabase);
  }

  getStorageMode() {
    return this.isUsingSupabase() ? 'supabase' : 'local-json';
  }

  async saveNotice({ title, originalText, analysisJson }) {
    const noticeId = uuidv4();
    const now = new Date().toISOString();

    // Extract tasks from analysis if present
    const rawTasks = Array.isArray(analysisJson.tasks) ? analysisJson.tasks : [];
    const taskRecords = rawTasks.map(t => ({
      id: uuidv4(),
      notice_id: noticeId,
      description: typeof t === 'string' ? t : (t.description || t.task || 'Action item'),
      evidence: t.evidence || null,
      due_date: t.due_date || t.dueDate || null,
      completed: false,
      created_at: now
    }));

    const enrichedAnalysis = { ...analysisJson, tasks: taskRecords };

    const noticeRecord = {
      id: noticeId,
      title: title || (analysisJson.category ? `${analysisJson.category} Notice` : 'Untitled Campus Notice'),
      original_text: originalText,
      analysis_json: enrichedAnalysis,
      created_at: now,
      updated_at: now
    };

    if (this.isUsingSupabase()) {
      try {
        const { data: nData, error: nErr } = await supabase
          .from('notices')
          .insert([noticeRecord])
          .select()
          .single();

        if (nErr) throw nErr;

        if (taskRecords.length > 0) {
          const { error: tErr } = await supabase
            .from('tasks')
            .insert(taskRecords);
          if (tErr) console.warn('[Storage] Error inserting tasks to Supabase:', tErr.message);
        }

        return { ...noticeRecord, tasks: taskRecords };
      } catch (err) {
        console.warn('[Storage] Supabase save failed, saving to local store:', err.message);
      }
    }

    // Local JSON store fallback
    const store = readLocalStore();
    store.notices.unshift(noticeRecord);
    store.tasks.push(...taskRecords);
    writeLocalStore(store);

    return { ...noticeRecord, tasks: taskRecords };
  }

  async getAllNotices() {
    if (this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('id, title, created_at, updated_at, analysis_json')
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase fetch failed, falling back to local:', err.message);
      }
    }

    const store = readLocalStore();
    return store.notices.map(n => ({
      id: n.id,
      title: n.title,
      created_at: n.created_at,
      updated_at: n.updated_at,
      summary: n.analysis_json?.summary || '',
      category: n.analysis_json?.category || 'General',
      deadlineCount: n.analysis_json?.deadlines?.length || 0,
      confidence: n.analysis_json?.overall_confidence || 'medium'
    }));
  }

  async getNoticeById(id) {
    if (this.isUsingSupabase()) {
      try {
        const { data: notice, error: nErr } = await supabase
          .from('notices')
          .select('*')
          .eq('id', id)
          .single();

        if (!nErr && notice) {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('notice_id', id)
            .order('created_at', { ascending: true });

          return { ...notice, tasks: tasks || [] };
        }
      } catch (err) {
        console.warn('[Storage] Supabase getNoticeById error:', err.message);
      }
    }

    const store = readLocalStore();
    const notice = store.notices.find(n => n.id === id);
    if (!notice) return null;

    const tasks = store.tasks.filter(t => t.notice_id === id);
    return { ...notice, tasks };
  }

  async deleteNotice(id) {
    if (this.isUsingSupabase()) {
      try {
        await supabase.from('tasks').delete().eq('notice_id', id);
        const { error } = await supabase.from('notices').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('[Storage] Supabase delete error:', err.message);
      }
    }

    const store = readLocalStore();
    store.notices = store.notices.filter(n => n.id !== id);
    store.tasks = store.tasks.filter(t => t.notice_id !== id);
    writeLocalStore(store);
    return true;
  }

  async updateTaskStatus(taskId, completed) {
    if (this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({ completed })
          .eq('id', taskId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase update task error:', err.message);
      }
    }

    const store = readLocalStore();
    const task = store.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = completed;
      const parentNotice = store.notices.find(n => n.id === task.notice_id);
      if (parentNotice && parentNotice.analysis_json && Array.isArray(parentNotice.analysis_json.tasks)) {
        const matchingTask = parentNotice.analysis_json.tasks.find(t => t.id === taskId);
        if (matchingTask) matchingTask.completed = completed;
      }
      writeLocalStore(store);
      return task;
    }
    return null;
  }

  async getUpcomingTasks() {
    if (this.isUsingSupabase()) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, notices(title)')
          .eq('completed', false)
          .order('due_date', { ascending: true, nullsFirst: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase tasks query error:', err.message);
      }
    }

    const store = readLocalStore();
    return store.tasks.filter(t => !t.completed).map(t => {
      const parent = store.notices.find(n => n.id === t.notice_id);
      return { ...t, notice_title: parent?.title || 'Unknown Notice' };
    });
  }
}

module.exports = new StorageService();
