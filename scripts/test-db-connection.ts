// scripts/test-db-connection.ts
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'false' ? false : {
        rejectUnauthorized: false // Supabase often needs this for pooler connections unless CA is set up
    }
};

console.log("ℹ️ Testing connection with config:");
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   SSL: ${JSON.stringify(config.ssl)}`);
// Mask password for safety
const maskedPass = config.password ? 
    `${config.password.substring(0, 2)}...${config.password.substring(config.password.length - 2)}` : 
    'undefined';
console.log(`   Password: ${maskedPass}`);

const pool = new Pool(config);

(async () => {
  try {
    console.log("ℹ️ Attempting to connect...");
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('✅ Database time:', res.rows[0].now);
    client.release();
  } catch (err: unknown) {
    // Fix: Handle 'unknown' type for error
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Database connection failed:', message);
    
    if (message.includes('password authentication failed')) {
        console.log("⚠️  Password authentication failed. Check DB_PASSWORD in .env.local.");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
