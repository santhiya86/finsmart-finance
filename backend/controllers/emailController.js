const { sendEmail } = require('../utils/emailSender');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * EMAIL CONTROLLER
 * Only Monthly Summary remains (Budget Alert removed from manual buttons)
 * Budget Alert is now AUTOMATIC only — fires when expense added
 */

// @route   POST /api/email/monthly-summary
// @access  Private
const sendMonthlySummary = async (req, res) => {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS;

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({
        message: 'Email not configured. Please add GMAIL_USER and GMAIL_APP_PASS in Render Environment Variables.',
      });
    }

    const user = await User.findById(req.user._id);
    const { month, year } = req.body;

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = parseInt(month) || (now.getMonth() + 1);

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ];
    const displayMonth = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

    const startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome
      ? ((balance / totalIncome) * 100).toFixed(1)
      : '0.0';

    const categorySpending = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const categoryRows = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amt]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-weight:500">${cat}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#ef4444;font-weight:600;text-align:right">
            Rs.${Number(amt).toLocaleString()}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#64748b;text-align:right">
            ${totalExpense ? ((amt / totalExpense) * 100).toFixed(1) : 0}%
          </td>
        </tr>`).join('');

    const transactionRows = transactions.map((t, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
        <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#1e293b">
          ${t.title}${t.isRecurring ? ' 🔁' : ''}
        </td>
        <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b">${t.category}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;text-align:center">
          ${new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
        </td>
        <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;text-align:center">
          <span style="background:${t.type==='income'?'#d1fae5':'#fee2e2'};color:${t.type==='income'?'#059669':'#dc2626'};padding:2px 8px;border-radius:6px;font-size:11px;font-weight:bold">
            ${t.type}
          </span>
        </td>
        <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:bold;text-align:right;color:${t.type==='income'?'#10b981':'#ef4444'}">
          ${t.type==='income'?'+':'-'}Rs.${Number(t.amount).toLocaleString()}
        </td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px">
  <div style="max-width:680px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center">
      <h1 style="color:white;margin:0;font-size:24px">💰 FinSmart Finance</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px">Monthly Financial Report</p>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">${displayMonth}</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#1e293b;margin-top:0">Hello ${user.name}! 👋</h2>
      <p style="color:#64748b;font-size:14px">
        Here is your complete financial report for <strong>${displayMonth}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tr>
          <td style="width:50%;padding:6px">
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;border:1px solid #bbf7d0;text-align:center">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:6px">Total Income</div>
              <div style="font-size:22px;font-weight:bold;color:#10b981">+Rs.${Number(totalIncome).toLocaleString()}</div>
            </div>
          </td>
          <td style="width:50%;padding:6px">
            <div style="background:#fff1f2;border-radius:12px;padding:16px;border:1px solid #fecdd3;text-align:center">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:6px">Total Expenses</div>
              <div style="font-size:22px;font-weight:bold;color:#ef4444">-Rs.${Number(totalExpense).toLocaleString()}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="width:50%;padding:6px">
            <div style="background:#f0f4ff;border-radius:12px;padding:16px;border:1px solid #c7d2fe;text-align:center">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:6px">Balance</div>
              <div style="font-size:22px;font-weight:bold;color:${balance >= 0 ? '#4f6ef7' : '#ef4444'}">
                Rs.${Number(balance).toLocaleString()}
              </div>
            </div>
          </td>
          <td style="width:50%;padding:6px">
            <div style="background:#faf5ff;border-radius:12px;padding:16px;border:1px solid #e9d5ff;text-align:center">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:6px">Transactions</div>
              <div style="font-size:22px;font-weight:bold;color:#8b5cf6">${transactions.length}</div>
            </div>
          </td>
        </tr>
      </table>
      <div style="background:${balance >= 0 ? '#f0fdf4' : '#fff1f2'};border-radius:12px;padding:16px;margin-bottom:28px;text-align:center;border:1px solid ${balance >= 0 ? '#bbf7d0' : '#fecdd3'}">
        <p style="margin:0;font-weight:600;font-size:15px;color:${balance >= 0 ? '#059669' : '#dc2626'}">
          ${balance >= 0
            ? `🎉 You saved Rs.${Number(balance).toLocaleString()} this month (${savingsRate}% savings rate)`
            : `⚠️ You overspent by Rs.${Number(Math.abs(balance)).toLocaleString()} this month`}
        </p>
      </div>
      ${Object.keys(categorySpending).length > 0 ? `
      <h3 style="color:#1e293b;font-size:15px;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #f1f5f9">
        📊 Category-wise Expense Summary
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:10px 14px;text-align:left;font-size:11px;color:#64748b">CATEGORY</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;color:#64748b">AMOUNT</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;color:#64748b">SHARE</th>
          </tr>
        </thead>
        <tbody>${categoryRows}</tbody>
      </table>` : ''}
      ${transactions.length > 0 ? `
      <h3 style="color:#1e293b;font-size:15px;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #f1f5f9">
        📋 All Transactions — ${displayMonth}
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:9px 10px;text-align:left;font-size:11px;color:#64748b">TITLE</th>
            <th style="padding:9px 10px;text-align:left;font-size:11px;color:#64748b">CATEGORY</th>
            <th style="padding:9px 10px;text-align:center;font-size:11px;color:#64748b">DATE</th>
            <th style="padding:9px 10px;text-align:center;font-size:11px;color:#64748b">TYPE</th>
            <th style="padding:9px 10px;text-align:right;font-size:11px;color:#64748b">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${transactionRows}</tbody>
      </table>` : '<p style="color:#94a3b8;text-align:center;padding:20px">No transactions found for this month.</p>'}
      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid #f1f5f9">
        Report for ${displayMonth} · Sent to ${user.email} · FinSmart Finance
      </p>
    </div>
  </div>
</body>
</html>`;

    await sendEmail({
      to: user.email,
      subject: `Your Monthly Expense Report – ${displayMonth}`,
      html,
    });

    console.log(`[Monthly Summary] ✅ Sent to ${user.email} for ${displayMonth}`);
    res.json({ message: `Monthly report has been sent successfully to your registered email.` });

  } catch (error) {
    console.error('[Monthly Summary Error]:', error.message);
    res.status(500).json({ message: `Failed to send email: ${error.message}` });
  }
};

module.exports = { sendMonthlySummary };
