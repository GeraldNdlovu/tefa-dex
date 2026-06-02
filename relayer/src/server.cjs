const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const Redis = require('ioredis');

const app = express();

app.use(cors({
  origin: ['https://dex.147.182.193.26.nip.io', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const ADMIN_WALLETS = [
  '0xa35dcfB812fB9D9DF1f59e45b72abc94683a9734',
  '0x46980BC901a04B9AD24E86a4d76eCd7c45df6ca4'
];

const sessions = new Map();
const jobs = new Map();

app.post('/api/auth/nonce', (req, res) => {
  const { wallet } = req.body;
  const nonce = crypto.randomBytes(32).toString('hex');
  const message = `Sign this message to login to TEFA DEX Admin Dashboard\n\nNonce: ${nonce}\nWallet: ${wallet}`;
  sessions.set(`nonce:${wallet.toLowerCase()}`, nonce);
  setTimeout(() => sessions.delete(`nonce:${wallet.toLowerCase()}`), 300000);
  res.json({ nonce, message });
});

app.post('/api/auth/login', (req, res) => {
  const { wallet } = req.body;
  const isAdmin = ADMIN_WALLETS.some(w => w.toLowerCase() === wallet.toLowerCase());
  if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });
  
  const token = crypto.randomBytes(64).toString('hex');
  sessions.set(token, { wallet, permissions: ['admin.access'] });
  res.cookie('admin_session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 86400000 });
  res.json({ permissions: ['admin.access'] });
});

app.get('/api/admin/me', (req, res) => {
  const token = req.cookies.admin_session;
  if (!token || !sessions.has(token)) return res.status(401).json({ error: 'No session' });
  res.json({ address: sessions.get(token).wallet, permissions: ['admin.access'] });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.admin_session;
  if (token) sessions.delete(token);
  res.clearCookie('admin_session');
  res.json({ success: true });
});

app.post('/api/gasless/submit', (req, res) => {
  const { user, swap, signature } = req.body;
  const jobId = crypto.randomBytes(32).toString('hex');
  jobs.set(jobId, { id: jobId, status: 'queued', user, swap, signature, createdAt: Date.now() });
  res.json({ success: true, jobId });
});

app.get('/api/job/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

app.get('/api/jobs/recent', (req, res) => {
  const recent = Array.from(jobs.values()).slice(-10);
  res.json({ jobs: recent });
});

app.get('/metrics', (req, res) => {
  const all = Array.from(jobs.values());
  res.json({
    waiting: all.filter(j => j.status === 'queued').length,
    active: all.filter(j => j.status === 'processing').length,
    completed: all.filter(j => j.status === 'completed').length,
    failed: all.filter(j => j.status === 'failed').length
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`API on ${PORT}`));

// Add missing gasless status endpoint
app.get('/api/gasless/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Add alias for backward compatibility
app.get('/api/gasless/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});
