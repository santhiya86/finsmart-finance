const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

router.use(protect);
router.post('/insights', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 }).limit(50);
    if (transactions.length === 0) return res.status(400).json({ message: 'Add some transactions first.' });
    const totalIncome = transactions.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
    const totalExpense = transactions.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome ? ((balance/totalIncome)*100) : 0;
    let score = savingsRate>=30?9:savingsRate>=20?8:savingsRate>=10?7:savingsRate>=0?6:3;
    const scoreReason = savingsRate>=20?`You save ${savingsRate.toFixed(1)}% of income — excellent!`
      :savingsRate>=0?`You save ${savingsRate.toFixed(1)}% of income. Aim for 20%+.`
      :`You are spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn.`;
    const catBreakdown = {};
    transactions.filter(t=>t.type==='expense').forEach(t=>{catBreakdown[t.category]=(catBreakdown[t.category]||0)+t.amount;});
    const top = Object.entries(catBreakdown).sort(([,a],[,b])=>b-a)[0];
    const observations = [
      top?`Your biggest expense is ${top[0]} at Rs.${top[1].toLocaleString()} (${totalExpense?((top[1]/totalExpense)*100).toFixed(1):0}% of total).`:'Start adding transactions to see insights.',
      savingsRate>=0?`You have saved Rs.${balance.toLocaleString()} overall with ${savingsRate.toFixed(1)}% savings rate.`:`You are overspending by Rs.${Math.abs(balance).toLocaleString()}.`,
      `You have ${transactions.length} transactions tracked. ${transactions.filter(t=>t.isRecurring).length} are recurring.`,
    ];
    const tips = [
      top?`Your top expense is ${top[0]}. Consider setting a budget limit for this category.`:'Set budgets for each category to track spending better.',
      savingsRate<20?`Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. You currently save ${Math.max(0,savingsRate).toFixed(1)}%.`:'Great savings rate! Consider investing surplus in SIP mutual funds.',
      'Use the Budget Tracker to set monthly limits and get automatic email alerts at 80% usage.',
    ];
    const motivation = savingsRate>=20?'Outstanding! Keep this discipline going!':savingsRate>=0?'Every rupee saved today builds a stronger tomorrow!':'Awareness is the first step — you can turn this around!';
    res.json({ score, scoreReason, observations, tips, motivation, generatedAt: new Date().toLocaleTimeString(), transactionCount: transactions.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
});
module.exports = router;
