"use server";

import { query, pool } from "@/lib/db";
import { Client } from "pg";

export async function checkDbConnection() {
  try {
    const start = Date.now();
    // Try using the pool first
    const result = await query("SELECT current_database(), current_user, version(), inet_server_addr()");
    const duration = Date.now() - start;
    
    return {
      success: true,
      data: result.rows[0],
      duration: `${duration}ms`,
      method: "pool",
      env: {
        host: process.env.DB_HOST || "via-url",
        db: process.env.DB_NAME || "default",
        user: process.env.DB_USER || "unknown",
        port: process.env.DB_PORT || "5432",
        ssl: process.env.DB_HOST && process.env.DB_HOST.includes('localhost') ? "off" : "on",
        hasPassword: !!process.env.DB_PASSWORD,
        hasUrl: !!process.env.DATABASE_URL,
      }
    };
  } catch (poolError: any) {
    console.error("Pool Connection Check Failed:", poolError);
    
    // If pool fails, try a direct client connection to diagnose
    try {
        const client = new Client({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 5432),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: process.env.DB_HOST && process.env.DB_HOST.includes('localhost') ? false : {
                rejectUnauthorized: false, 
            },
            connectionTimeoutMillis: 5000,
        });
        await client.connect();
        const result = await client.query("SELECT current_database(), current_user, version(), inet_server_addr()");
        await client.end();
        
        return {
            success: true,
            data: result.rows[0],
            method: "direct-client-fallback",
            note: "Pool failed but direct client worked. Possible pool config issue.",
            poolError: poolError.message,
            env: {
                host: process.env.DB_HOST || "via-url",
                hasPassword: !!process.env.DB_PASSWORD,
                hasUrl: !!process.env.DATABASE_URL,
            }
        };
    } catch (clientError: any) {
        return {
            success: false,
            error: `Pool: ${poolError.message} | Client: ${clientError.message}`,
            code: poolError.code, 
            env: {
                host: process.env.DB_HOST || "MISSING",
                db: process.env.DB_NAME || "MISSING",
                user: process.env.DB_USER || "MISSING",
                hasPassword: !!process.env.DB_PASSWORD,
                hasUrl: !!process.env.DATABASE_URL,
            }
        };
    }
  }
}
