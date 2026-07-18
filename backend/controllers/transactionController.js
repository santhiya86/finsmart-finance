const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const User = require('../models/User');
const { sendAutoAlert } = require('../utils/autoEmailAlert');

const getMonthRange = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const checkAndSendBudgetAlert = async (userId, category, txDate) => {
  try {
    const year = txDate.getFullYear();
    const month = txDate.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const budget = await Budget.findOne({
      user: userId,
      category: category,
      month: monthStr,
    });

    if (!budget) {
      console.log(`[Budget Check] No budget set for ${category} in ${monthStr}`);
      return;
    }

    const { start, end } = getMonthRange(txDate);

    const allExpenses = await Transaction.find({
      user: userId,
      type: 'expense',
      category: category,
      date: { $gte: start, $lte: end },
    });

    const totalSpent = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const percentage = Math.round((totalSpent / budget.amount) * 100);

    console.log(
      `[Budget Check] ${category}: spent=Rs.${totalSpent}, ` +
      `budget=Rs.${budget.amount}, percentage=${percentage}%`
    );

    if (percentage >= 80) {
      const user = await User.findById(userId);
      if (user) {
        await sendAutoAlert(user, category, totalSpent, budget.amount, percentage);
      }
    }
  } catch (err) {
    console.error('[Budget Alert Error]:', err.message);
  }
};

const getTransactions = async (req, res) => {
  try {
    const { category, startDate, endDate, type } = req.query;
    const query = { user: req.user._id };
    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type.toLowerCase();
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const {
      title, amount, type, category,
      date, notes, isRecurring, recurringId,
    } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const txDate = date ? new Date(date) : new Date();
    const parsedAmount = parseFloat(amount);

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: parsedAmount,
      type,
      category,
      date: txDate,
      notes: notes || '',
      isRecurring: isRecurring || false,
      recurringId: recurringId || null,
    });

    if (type === 'expense') {
      process.nextTick(() => {
        checkAndSendBudgetAlert(req.user._id, category, txDate)
          .catch(err => console.error('[Budget Alert Uncaught]:', err.message));
      });
    }

    res.status(201).json(transaction);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const monthly = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
      monthly[key][t.type] += t.amount;
    });

    const categoryBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] =
        (categoryBreakdown[t.category] || 0) + t.amount;
    });

    res.json({ totalIncome, totalExpense, balance, monthly, categoryBreakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
