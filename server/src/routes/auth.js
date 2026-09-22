import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_development_change_in_production_12345';

function sanitizeVendor(vendor) {
  const { passwordHash, ...rest } = vendor;
  return rest;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, fullName, businessName, businessType, preferredLanguage, location } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const cleanPhone = phone.trim();
    const existing = await prisma.vendor.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return res.status(400).json({ error: 'Mobile number is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const vendor = await prisma.vendor.create({
      data: {
        phone: cleanPhone,
        passwordHash,
        fullName: (fullName || 'Vendor').trim(),
        businessName: (businessName || 'My Business').trim(),
        businessType: businessType || 'General Store',
        preferredLanguage: preferredLanguage || 'en',
        location: location ? location.trim() : null,
      }
    });

    const token = jwt.sign({ id: vendor.id, phone: vendor.phone }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      message: 'Account created successfully',
      token,
      vendor: sanitizeVendor(vendor)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account: ' + error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const cleanPhone = phone.trim();
    let vendor = await prisma.vendor.findUnique({ where: { phone: cleanPhone } });

    // Convenience auto-provision for default vendor phone if first time logging in
    if (!vendor && cleanPhone === '9876543210') {
      const passwordHash = await bcrypt.hash(password || 'vendor123', 10);
      vendor = await prisma.vendor.create({
        data: {
          phone: cleanPhone,
          passwordHash,
          fullName: 'Ravi Kumar',
          businessName: 'Ravi Fresh Vegetables & Fruits',
          businessType: 'Vegetables & Fruits',
          preferredLanguage: 'en',
          location: 'City Market, Cross 4, Bengaluru'
        }
      });
    }

    if (!vendor) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const token = jwt.sign({ id: vendor.id, phone: vendor.phone }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      message: 'Logged in successfully',
      token,
      vendor: sanitizeVendor(vendor)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id: req.user.id } });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    res.json({ vendor: sanitizeVendor(vendor) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { ownerName, fullName, businessName, businessType, preferredLanguage, language, location } = req.body;

    const updated = await prisma.vendor.update({
      where: { id: req.user.id },
      data: {
        ...(fullName || ownerName ? { fullName: (fullName || ownerName).trim() } : {}),
        ...(businessName ? { businessName: businessName.trim() } : {}),
        ...(businessType ? { businessType } : {}),
        ...(language || preferredLanguage ? { preferredLanguage: language || preferredLanguage } : {}),
        ...(location !== undefined ? { location: location ? location.trim() : null } : {})
      }
    });

    res.json({
      message: 'Profile updated successfully',
      vendor: sanitizeVendor(updated)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
});

export default router;
