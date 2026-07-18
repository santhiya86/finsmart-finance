const mongoose = require('mongoose');

const ALL_CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Shopping', 'Entertainment',
  'Health', 'Education', 'Utilities', 'Salary', 'Freelance', 'Investment', 'Other',
];

const recurringSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ALL_CATEGORIES, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  startDate: { type: Date, required: true },
  lastProcessed: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Recurring', recurringSchema);
