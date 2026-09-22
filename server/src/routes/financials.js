import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { notifyVendor } from './events.js';

const router = express.Router();

// Helper to format a loan object for the frontend
function formatLoan(loan) {
  const repayments = (loan.repayments || []).map(r => ({
    id: r.id,
    amount: r.amountPaid,
    date: r.dateStr || (r.paymentDate ? r.paymentDate.toISOString().split('T')[0] : ''),
    method: r.paymentMode || 'UPI',
    note: r.receiptNote || ''
  }));

  const totalRepaid = repayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const remainingAmount = Math.max(0, loan.principalAmount - totalRepaid);
  const status = remainingAmount === 0 ? 'Completed' : loan.status;

  return {
    id: loan.id,
    name: loan.name || 'Microloan',
    lender: loan.lenderName,
    originalAmount: loan.principalAmount,
    totalRepaid,
    remainingAmount,
    repaymentAmount: loan.installmentAmount,
    frequency: loan.repaymentFrequency,
    firstDueDate: loan.startDate ? loan.startDate.toISOString().split('T')[0] : '',
    nextDueDate: loan.startDate ? loan.startDate.toISOString().split('T')[0] : '',
    finalDueDate: loan.endDate ? loan.endDate.toISOString().split('T')[0] : '',
    status,
    notes: loan.notes || '',
    repayments
  };
}

// GET /api/financials/all
router.get('/financials/all', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [rawSales, rawExpenses, rawLoans] = await Promise.all([
      prisma.sale.findMany({
        where: { vendorId },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
      }),
      prisma.expense.findMany({
        where: { vendorId },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
      }),
      prisma.loan.findMany({
        where: { vendorId },
        include: {
          repayments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const sales = rawSales.map(s => ({
      id: s.id,
      amount: s.amount,
      category: s.category || 'Vegetables',
      note: s.note || '',
      date: s.dateStr || (s.date ? s.date.toISOString().split('T')[0] : ''),
      time: s.time || ''
    }));

    const expenses = rawExpenses.map(e => ({
      id: e.id,
      amount: e.amount,
      category: e.category || 'Stock / Purchases',
      note: e.note || '',
      date: e.dateStr || (e.date ? e.date.toISOString().split('T')[0] : ''),
      time: e.time || ''
    }));

    const loans = rawLoans.map(formatLoan);

    res.json({ sales, expenses, loans });
  } catch (error) {
    console.error('Error fetching financials:', error);
    res.status(500).json({ error: 'Failed to fetch financial data: ' + error.message });
  }
});

// POST /api/sales
router.post('/sales', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { amount, category, date, note, paymentMode } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid sale amount greater than 0 is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dateStr = (date && String(date).trim()) || todayStr;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sale = await prisma.sale.create({
      data: {
        vendorId,
        amount: numAmount,
        category: category || 'Vegetables',
        note: note ? String(note).trim() : '',
        date: new Date(dateStr + 'T12:00:00Z'),
        dateStr,
        time: nowTime,
        paymentMode: paymentMode || 'CASH'
      }
    });

    const formatted = {
      id: sale.id,
      amount: sale.amount,
      category: sale.category,
      note: sale.note || '',
      date: sale.dateStr,
      time: sale.time || ''
    };

    notifyVendor(vendorId, { type: 'SALE_ADDED', sale: formatted });
    res.status(201).json({ message: 'Sale recorded successfully', sale: formatted });
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ error: 'Failed to record sale: ' + error.message });
  }
});

// DELETE /api/sales/:id
router.delete('/sales/:id', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing || existing.vendorId !== vendorId) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    await prisma.sale.delete({ where: { id } });
    notifyVendor(vendorId, { type: 'SALE_DELETED', id });
    res.json({ message: 'Sale deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sale: ' + error.message });
  }
});

// POST /api/expenses
router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { amount, category, date, note } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid expense amount greater than 0 is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dateStr = (date && String(date).trim()) || todayStr;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const expense = await prisma.expense.create({
      data: {
        vendorId,
        amount: numAmount,
        category: category || 'Stock / Purchases',
        note: note ? String(note).trim() : '',
        date: new Date(dateStr + 'T12:00:00Z'),
        dateStr,
        time: nowTime
      }
    });

    const formatted = {
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      note: expense.note || '',
      date: expense.dateStr,
      time: expense.time || ''
    };

    notifyVendor(vendorId, { type: 'EXPENSE_ADDED', expense: formatted });
    res.status(201).json({ message: 'Expense recorded successfully', expense: formatted });
  } catch (error) {
    console.error('Error recording expense:', error);
    res.status(500).json({ error: 'Failed to record expense: ' + error.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.vendorId !== vendorId) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    await prisma.expense.delete({ where: { id } });
    notifyVendor(vendorId, { type: 'EXPENSE_DELETED', id });
    res.json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense: ' + error.message });
  }
});

// POST /api/loans
router.post('/loans', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, lender, originalAmount, repaymentAmount, frequency, firstDueDate, finalDueDate, notes } = req.body;

    const numAmount = Number(originalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid loan amount greater than 0 is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const startDateStr = (firstDueDate && String(firstDueDate).trim()) || todayStr;
    const installment = Number(repaymentAmount) || Math.round(numAmount / 10);

    const loan = await prisma.loan.create({
      data: {
        vendorId,
        name: (name || 'Microcredit Account').trim(),
        lenderName: (lender || 'Local Bank').trim(),
        principalAmount: numAmount,
        installmentAmount: installment,
        repaymentFrequency: frequency || 'Daily',
        startDate: new Date(startDateStr + 'T12:00:00Z'),
        endDate: finalDueDate ? new Date(finalDueDate + 'T12:00:00Z') : null,
        notes: notes ? String(notes).trim() : '',
        status: 'On Track'
      },
      include: {
        repayments: true
      }
    });

    const formatted = formatLoan(loan);
    notifyVendor(vendorId, { type: 'LOAN_ADDED', loan: formatted });
    res.status(201).json({ message: 'Loan created successfully', loan: formatted });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Failed to create loan: ' + error.message });
  }
});

// POST /api/repayments
router.post('/repayments', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { loanId, amount, date, method, note } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid repayment amount greater than 0 is required' });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { repayments: true }
    });

    if (!loan || loan.vendorId !== vendorId) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const currentTotalRepaid = loan.repayments.reduce((s, r) => s + r.amountPaid, 0);
    const remaining = loan.principalAmount - currentTotalRepaid;

    if (numAmount > remaining) {
      return res.status(400).json({ error: 'Repayment amount exceeds remaining loan balance' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dateStr = (date && String(date).trim()) || todayStr;

    const repayment = await prisma.repayment.create({
      data: {
        loanId,
        vendorId,
        amountPaid: numAmount,
        paymentDate: new Date(dateStr + 'T12:00:00Z'),
        dateStr,
        paymentMode: method || 'UPI',
        receiptNote: note ? String(note).trim() : ''
      }
    });

    const newTotalRepaid = currentTotalRepaid + numAmount;
    if (newTotalRepaid >= loan.principalAmount) {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'Completed' }
      });
    }

    const updatedLoanRaw = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { repayments: { orderBy: { createdAt: 'desc' } } }
    });

    const updatedLoan = formatLoan(updatedLoanRaw);
    notifyVendor(vendorId, { type: 'REPAYMENT_ADDED', loan: updatedLoan, repayment });
    res.status(201).json({ message: 'Repayment recorded successfully', loan: updatedLoan });
  } catch (error) {
    console.error('Error recording repayment:', error);
    res.status(500).json({ error: 'Failed to record repayment: ' + error.message });
  }
});

// POST /api/financials/reset - Resets current vendor's financial records to empty state (0)
router.post('/financials/reset', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.user.id;

    await prisma.$transaction([
      prisma.repayment.deleteMany({ where: { vendorId } }),
      prisma.loan.deleteMany({ where: { vendorId } }),
      prisma.sale.deleteMany({ where: { vendorId } }),
      prisma.expense.deleteMany({ where: { vendorId } })
    ]);

    notifyVendor(vendorId, { type: 'FINANCIAL_RESET' });
    res.json({ message: 'Financial records cleared to ₹0 successfully' });
  } catch (error) {
    console.error('Error resetting financials:', error);
    res.status(500).json({ error: 'Failed to reset financial records: ' + error.message });
  }
});

export default router;
