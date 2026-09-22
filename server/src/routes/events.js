import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_development_change_in_production_12345';

// Map of vendorId -> Set of active SSE response streams
const activeClients = new Map();

export function notifyVendor(vendorId, eventData) {
  const clients = activeClients.get(vendorId);
  if (!clients || clients.size === 0) return;

  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (err) {
      console.error('Error writing to SSE client:', err);
    }
  }
}

router.get('/events', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Token query parameter required for events' });
  }

  let vendorId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    vendorId = decoded.id;
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  if (!activeClients.has(vendorId)) {
    activeClients.set(vendorId, new Set());
  }
  activeClients.get(vendorId).add(res);

  // Heartbeat ping every 25 seconds
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = activeClients.get(vendorId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        activeClients.delete(vendorId);
      }
    }
  });
});

export default router;
