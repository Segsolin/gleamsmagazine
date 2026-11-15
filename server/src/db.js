import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'u853919099_gleams',
  ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2' } : undefined,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
});

export async function query(sql, args=[]) {
  const [rows] = await pool.execute(sql, args);
  return rows;
}
export async function logAction(actorId, action, entity, id, detail={}) {
  await query('INSERT INTO audit_logs (actor_id,action,entity,entity_id,detail_json) VALUES (?,?,?,?,?)',
    [actorId || null, action, entity, String(id ?? ''), JSON.stringify(detail)]);
}
