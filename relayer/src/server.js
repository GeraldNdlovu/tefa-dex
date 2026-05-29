import express from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow your domain
app.use(cors({
  origin: ['https://dex.147.182.193.26.nip.io', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const queue = new Queue('tefa-gasless', { connection: redis });

app.post('/api/gasless/submit', async (req, res) => {
  try {
    const { user, swap, signature } = req.body;
    
    console.log('📬 Received request for user:', user);
    
    if (!user || !swap || !signature) {
      return res.status(400).json({ error: 'Missing user, swap, or signature' });
    }
    
    const idempotencyKey = crypto.createHash('sha256')
      .update(`${user}-${swap.nonce}-${signature.slice(0, 66)}`)
      .digest('hex');
    
    const job = await queue.add('execution', { user, swap, signature, idempotencyKey }, {
      jobId: idempotencyKey,
      removeOnComplete: 100,
      removeOnFail: 500
    });
    
    console.log(`📥 Queued ${job.id} for ${user}`);
    res.json({ status: 'queued', jobId: job.id });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'alive' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API server running on port ${PORT}`);
});
