const mongoose = require('mongoose');

const ALL_CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Shopping', 'Entertainment',
  'Health', 'Education', 'Utilities', 'Salary', 'Freelance',
  'Investment', 'Other',
];

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ALL_CATEGORIES, required: true },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
  recurringId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recurring', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
