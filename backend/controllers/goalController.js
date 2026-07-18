const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const goalsWithStats = goals.map(g => {
      const now = new Date();
      const deadline = new Date(g.deadline);
      const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000*60*60*24)));
      const monthsLeft = Math.max(1, Math.ceil((deadline - now) / (1000*60*60*24*30)));
      const remaining = Math.max(0, g.targetAmount - g.savedAmount);
      const monthlySavingsNeeded = Math.round(remaining / monthsLeft);
      const percentage = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
      return { ...g.toObject(), daysLeft, monthsLeft, remaining, monthlySavingsNeeded, percentage };
    });
    res.json(goalsWithStats);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, category, notes } = req.body;
    if (!title || !targetAmount || !deadline) return res.status(400).json({ message: 'Please fill all required fields' });
    const goal = await Goal.create({ user: req.user._id, title, targetAmount, deadline, category: category || 'Other', notes });
    res.status(201).json(goal);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const addSavings = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Please enter a valid amount' });
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    goal.savedAmount = Math.min(goal.targetAmount, goal.savedAmount + parseFloat(amount));
    if (goal.savedAmount >= goal.targetAmount) goal.isCompleted = true;
    await goal.save();
    res.json(goal);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    await goal.deleteOne();
    res.json({ message: 'Goal deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getGoals, createGoal, addSavings, deleteGoal };
