import express from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const queue = new Queue('tefa-gasless', { connection: redis });

app.post('/api/gasless/submit', async (req, res) => {
  const { user, swap, signature } = req.body;
  const idempotencyKey = crypto.createHash('sha256').update(`${user}-${swap.nonce}`).digest('hex');
  const job = await queue.add('tefa-gasless', { user, swap, signature }, { jobId: idempotencyKey });
  res.json({ status: 'queued', jobId: job.id });
});

app.get('/health', (req, res) => res.json({ status: 'alive' }));

app.listen(PORT, '0.0.0.0', () => console.log(`✅ API on port ${PORT}`));
