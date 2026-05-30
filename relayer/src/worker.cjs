const { Worker } = require('bullmq');
const Redis = require('ioredis');

const redis = new Redis('redis://localhost:6379');
const jobs = new Map();

const worker = new Worker('tefa-gasless', async (job) => {
  console.log(`Processing: ${job.id}`);
  await new Promise(r => setTimeout(r, 5000));
  console.log(`Completed: ${job.id}`);
  return { success: true };
}, { connection: redis });

console.log('Worker started');
