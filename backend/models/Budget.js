const mongoose = require('mongoose');

const BUDGET_CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Shopping', 'Entertainment',
  'Health', 'Education', 'Utilities', 'Other',
];

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: BUDGET_CATEGORIES, required: true },
  amount: { type: Number, required: true, min: 1 },
  month: { type: String, required: true },
}, { timestamps: true });

budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
