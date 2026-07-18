const Recurring = require('../models/Recurring');
const Transaction = require('../models/Transaction');

const getRecurring = async (req, res) => {
  try {
    const items = await Recurring.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const addRecurring = async (req, res) => {
  try {
    const { title, amount, type, category, frequency, startDate, notes } = req.body;
    if (!title || !amount || !type || !category || !frequency)
      return res.status(400).json({ message: 'Please fill all required fields' });
    const start = startDate ? new Date(startDate) : new Date();
    const recurring = await Recurring.create({
      user: req.user._id, title, amount: parseFloat(amount),
      type, category, frequency, startDate: start, notes: notes || '', lastProcessed: start,
    });
    await Transaction.create({
      user: req.user._id, title, amount: parseFloat(amount), type, category, date: start,
      notes: `${notes ? notes + ' ' : ''}[🔁 Recurring - ${frequency}]`,
      isRecurring: true, recurringId: recurring._id,
    });
    res.status(201).json(recurring);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const toggleRecurring = async (req, res) => {
  try {
    const item = await Recurring.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });
    item.isActive = !item.isActive;
    await item.save();
    res.json(item);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteRecurring = async (req, res) => {
  try {
    const item = await Recurring.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });
    await item.deleteOne();
    res.json({ message: 'Recurring transaction removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const processRecurring = async (req, res) => {
  try {
    const items = await Recurring.find({ user: req.user._id, isActive: true });
    const now = new Date();
    let processed = 0;
    for (const item of items) {
      if (!item.lastProcessed) continue;
      const last = new Date(item.lastProcessed);
      let due = false;
      if (item.frequency === 'daily') due = (now - last) >= 23 * 60 * 60 * 1000;
      else if (item.frequency === 'weekly') due = (now - last) >= 6 * 24 * 60 * 60 * 1000;
      else if (item.frequency === 'monthly')
        due = now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
      if (due) {
        await Transaction.create({
          user: item.user, title: item.title, amount: item.amount,
          type: item.type, category: item.category, date: now,
          notes: `${item.notes ? item.notes + ' ' : ''}[🔁 Auto - ${item.frequency}]`,
          isRecurring: true, recurringId: item._id,
        });
        await Recurring.findByIdAndUpdate(item._id, { lastProcessed: now });
        processed++;
      }
    }
    res.json({ message: `Processed ${processed} recurring transactions` });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getRecurring, addRecurring, toggleRecurring, deleteRecurring, processRecurring };
