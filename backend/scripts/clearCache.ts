import 'dotenv/config';
import redis from '../src/lib/cache';

async function run() {
  try {
    console.log('Connecting to Valkey and flushing DB...');
    await redis.flushdb(); // clears current DB only
    console.log('Valkey cache cleared (FLUSHDB).');
    process.exit(0);
  } catch (error) {
    console.error('Error flushing cache:', error);
    process.exit(2);
  }
}

run();
