const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  category: {
    type: String,
    enum: ['Laptop', 'Phone', 'Vacation', 'Emergency Fund', 'Education', 'Vehicle', 'Home', 'Wedding', 'Other'],
    default: 'Other',
  },
  isCompleted: { type: Boolean, default: false },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
