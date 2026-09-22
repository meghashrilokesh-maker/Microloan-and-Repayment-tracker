import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// On Vercel serverless environment with local SQLite, ensure writable database in /tmp
if (process.env.VERCEL) {
  const currentUrl = process.env.DATABASE_URL || 'file:./dev.db';
  if (currentUrl.startsWith('file:') && !currentUrl.includes('/tmp/')) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'server', 'prisma', 'dev.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db')
      ];
      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (e) {
            console.warn('Unable to copy dev.db to /tmp:', e.message);
          }
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

const prisma = new PrismaClient();

export default prisma;

