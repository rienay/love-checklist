const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = Boolean(process.env.VERCEL);
const DEFAULT_SECTIONS = require('./public/js/questions');

// Storage path: in Vercel serverless environment, use /tmp (writeable), locally use data/
const DATA_FILE = isVercel 
  ? path.join(os.tmpdir(), 'submissions.json')
  : path.join(__dirname, 'data', 'submissions.json');

const TEMPLATE_FILE = isVercel
  ? path.join(os.tmpdir(), 'template.json')
  : path.join(__dirname, 'data', 'template.json');

// Upstash / Vercel KV credentials (Optional cloud persistence on Vercel)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Explicit route for owner's Riwayat access
app.get('/riwayat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper: Read submissions safely (KV or File)
async function readSubmissions() {
  // If KV is configured, fetch from cloud KV
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/submissions`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await res.json();
      if (data && data.result) {
        return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
      return [];
    } catch (err) {
      console.error('Error reading from KV:', err);
    }
  }

  // Fallback to local or /tmp filesystem
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading submissions file:', err);
    return [];
  }
}

// Helper: Save submissions atomically (KV or File)
async function writeSubmissions(submissions) {
  // If KV is configured, save to cloud KV
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(`${KV_URL}/set/submissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(submissions))
      });
    } catch (err) {
      console.error('Error saving to KV:', err);
    }
  }

  // Also write to filesystem /tmp or local data/
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(submissions, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error writing submissions file:', err);
    return false;
  }
}

// Helper: Read active questions template
async function readTemplate() {
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/template`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return { isCustom: true, sections: parsed };
      }
    } catch (err) {
      console.error('Error reading template from KV:', err);
    }
  }

  try {
    if (fs.existsSync(TEMPLATE_FILE)) {
      const data = fs.readFileSync(TEMPLATE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { isCustom: true, sections: parsed };
      }
    }
  } catch (err) {
    console.error('Error reading template file:', err);
  }

  return { isCustom: false, sections: DEFAULT_SECTIONS };
}

// Helper: Write questions template
async function writeTemplate(sections) {
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(`${KV_URL}/set/template`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(sections))
      });
    } catch (err) {
      console.error('Error saving template to KV:', err);
    }
  }

  try {
    const tempFile = `${TEMPLATE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(sections, null, 2), 'utf8');
    fs.renameSync(tempFile, TEMPLATE_FILE);
    return true;
  } catch (err) {
    console.error('Error writing template file:', err);
    return false;
  }
}

// Helper: Reset template to default
async function resetTemplate() {
  if (KV_URL && KV_TOKEN) {
    try {
      await fetch(`${KV_URL}/del/template`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
    } catch (err) {
      console.error('Error resetting template in KV:', err);
    }
  }

  try {
    if (fs.existsSync(TEMPLATE_FILE)) {
      fs.unlinkSync(TEMPLATE_FILE);
    }
  } catch (err) {
    console.error('Error deleting template file:', err);
  }
  return DEFAULT_SECTIONS;
}

// Helper: Forward submission to optional webhook (Discord / Slack / Telegram)
async function notifyWebhook(sub) {
  if (!WEBHOOK_URL) return;
  try {
    const candidateName = sub.candidateName || 'Anonim';
    const flagsCount = (sub.redFlagsFound || []).length;
    const readiness = sub.answers?.['s2_q2'] || '-';

    const payload = {
      content: `💌 **Jawaban Kuesioner Hubungan Baru Masuk!**\n👤 **Kandidat:** ${candidateName}\n💍 **Kesiapan:** ${readiness}\n⚠️ **Catatan Evaluasi:** ${flagsCount > 0 ? `${flagsCount} catatan` : 'Bebas Red Flag ✨'}\n📅 **Waktu:** ${new Date().toLocaleString('id-ID')}`
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Webhook notification warning:', err);
  }
}

// Helper: Get local network IP addresses
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ interface: name, address: net.address });
      }
    }
  }
  return addresses;
}

// API: Server & Network info for mobile QR code and direct access
app.get('/api/server-info', async (req, res) => {
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const publicUrl = `${protocol}://${host}`;

  const ips = getNetworkIps();
  const primaryIp = ips.find(i => /wi-fi|wireless|wlan|lan/i.test(i.interface))?.address || ips[0]?.address || 'localhost';
  const networkUrl = isVercel ? publicUrl : `http://${primaryIp}:${PORT}`;

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(networkUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR code generation error:', err);
  }

  res.json({
    isVercel,
    hasCloudStorage: Boolean(KV_URL && KV_TOKEN),
    port: PORT,
    primaryIp,
    allIps: ips,
    localUrl: publicUrl,
    networkUrl,
    qrDataUrl,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/qr', async (req, res) => {
  const url = req.query.url || `http://localhost:${PORT}`;
  try {
    const svg = await QRCode.toString(url, { type: 'svg', margin: 1 });
    res.type('image/svg+xml').send(svg);
  } catch (err) {
    res.status(500).send('Error generating QR');
  }
});

// API: Get all submissions
app.get('/api/submissions', async (req, res) => {
  const submissions = await readSubmissions();
  res.json({ success: true, count: submissions.length, data: submissions });
});

// API: Get single submission by ID
app.get('/api/submissions/:id', async (req, res) => {
  const submissions = await readSubmissions();
  const item = submissions.find(s => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  res.json({ success: true, data: item });
});

// API: Submit answers
app.post('/api/submissions', async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.answers) {
    return res.status(400).json({ success: false, message: 'Invalid submission data' });
  }

  const submissions = await readSubmissions();
  const newSubmission = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    submittedAt: new Date().toISOString(),
    candidateName: payload.candidateName || payload.answers?.['s1_q1'] || 'Anonim',
    clientInfo: {
      userAgent: req.headers['user-agent'] || '',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    },
    answers: payload.answers,
    redFlagsFound: payload.redFlagsFound || [],
    completionTimeSeconds: payload.completionTimeSeconds || 0,
    reviewerNotes: '',
    rating: null
  };

  submissions.unshift(newSubmission);
  await writeSubmissions(submissions);

  // Trigger optional webhook notification (non-blocking)
  notifyWebhook(newSubmission);

  res.status(201).json({ success: true, id: newSubmission.id, data: newSubmission });
});

// API: Update reviewer notes & rating
app.patch('/api/submissions/:id/notes', async (req, res) => {
  const { notes, rating } = req.body;
  const submissions = await readSubmissions();
  const index = submissions.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (notes !== undefined) submissions[index].reviewerNotes = notes;
  if (rating !== undefined) submissions[index].rating = rating;
  submissions[index].updatedAt = new Date().toISOString();

  await writeSubmissions(submissions);
  res.json({ success: true, data: submissions[index] });
});

// API: Delete submission
app.delete('/api/submissions/:id', async (req, res) => {
  const submissions = await readSubmissions();
  const filtered = submissions.filter(s => s.id !== req.params.id);
  if (filtered.length === submissions.length) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  await writeSubmissions(filtered);
  res.json({ success: true, message: 'Submission deleted' });
});

// API: Get active template
app.get('/api/template', async (req, res) => {
  const result = await readTemplate();
  res.json({ success: true, isCustom: result.isCustom, data: result.sections });
});

// API: Save custom template
app.post('/api/template', async (req, res) => {
  const { sections } = req.body;
  if (!Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid sections array' });
  }
  await writeTemplate(sections);
  res.json({ success: true, message: 'Template saved successfully', data: sections });
});

// API: Reset template to default
app.post('/api/template/reset', async (req, res) => {
  const defaultSections = await resetTemplate();
  res.json({ success: true, message: 'Template reset to default', data: defaultSections });
});

// Start listening if run directly (local node execution)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    const ips = getNetworkIps();
    console.log(`Server running at:`);
    console.log(`  Local:   http://localhost:${PORT}`);
    ips.forEach(ip => {
      console.log(`  Network: http://${ip.address}:${PORT} (${ip.interface})`);
    });
  });
}

// Export for Vercel Serverless Function
module.exports = app;
