const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getBudgets = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user._id, month });
    const { start, end } = getMonthRange(month);

    // Get all expense transactions for this month
    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: start, $lte: end },
    });

    // Build spending map with exact category match
    const spending = {};
    transactions.forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    });

    const result = budgets.map(b => {
      const spent = spending[b.category] || 0;
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return {
        ...b.toObject(),
        spent,
        percentage,
        remaining: Math.max(0, b.amount - spent),
        isExceeded: spent > b.amount,
        isWarning: percentage >= 80 && spent <= b.amount,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;
    if (!category || !amount) return res.status(400).json({ message: 'Category and amount required' });
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month: targetMonth },
      { amount: parseFloat(amount) },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });
    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, setBudget, deleteBudget };
