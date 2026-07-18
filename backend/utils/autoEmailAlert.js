const { sendEmail } = require('./emailSender');

/**
 * AUTO BUDGET ALERT
 * Fires automatically when spending crosses 80% or 100% of budget
 * Sends to the user's registered email address
 */
const sendAutoAlert = async (user, category, spent, budgetAmount, percentage) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;

  if (!gmailUser || !gmailPass) {
    console.log(`[Auto Alert] GMAIL_USER or GMAIL_APP_PASS not configured. Skipping.`);
    return;
  }

  try {
    const isExceeded = percentage >= 100;
    const statusColor = isExceeded ? '#ef4444' : '#f59e0b';
    const subject = isExceeded
      ? `🔴 Budget Exceeded! Your ${category} budget is over limit`
      : `⚠️ Budget Warning! You have used ${percentage}% of your ${category} budget`;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#4f6ef7,#6366f1);padding:28px 32px;text-align:center">
      <h1 style="color:white;margin:0;font-size:22px">💰 FinSmart Finance</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">Automatic Budget Alert</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#1e293b;margin-top:0">Hello ${user.name}!</h2>
      <p style="color:#64748b;font-size:14px">
        This is an automatic alert for your <strong>${category}</strong> budget.
      </p>
      <div style="background:${isExceeded ? '#fff1f2' : '#fffbeb'};border:2px solid ${statusColor};border-radius:12px;padding:20px;margin:20px 0;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">${isExceeded ? '🚨' : '⚠️'}</div>
        <div style="font-size:18px;font-weight:bold;color:${statusColor}">
          ${category} Budget — ${percentage}% Used
        </div>
        <div style="font-size:13px;color:#64748b;margin-top:6px">
          ${isExceeded ? 'Budget limit has been exceeded!' : 'Approaching budget limit!'}
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;font-size:13px;color:#64748b">Budget Limit</td>
          <td style="padding:12px 16px;font-size:15px;font-weight:bold;color:#1e293b;text-align:right">
            Rs.${Number(budgetAmount).toLocaleString()}
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#64748b">Amount Spent</td>
          <td style="padding:12px 16px;font-size:15px;font-weight:bold;color:#ef4444;text-align:right">
            Rs.${Number(spent).toLocaleString()}
          </td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;font-size:13px;color:#64748b">Usage</td>
          <td style="padding:12px 16px;font-size:15px;font-weight:bold;color:${statusColor};text-align:right">
            ${percentage}%
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#64748b">
            ${isExceeded ? 'Exceeded By' : 'Remaining'}
          </td>
          <td style="padding:12px 16px;font-size:15px;font-weight:bold;text-align:right;color:${isExceeded ? '#ef4444' : '#10b981'}">
            Rs.${isExceeded
              ? Number(spent - budgetAmount).toLocaleString()
              : Number(budgetAmount - spent).toLocaleString()}
          </td>
        </tr>
      </table>
      <div style="background:#f0f4ff;border-radius:12px;padding:18px;margin-top:16px">
        <p style="color:#4f6ef7;font-weight:bold;font-size:13px;margin:0 0 8px">💡 What you can do:</p>
        <ul style="color:#64748b;font-size:13px;padding-left:18px;margin:0;line-height:2">
          <li>Review your recent ${category} transactions</li>
          <li>Avoid non-essential ${category} spending this month</li>
          <li>Consider increasing your ${category} budget for next month</li>
        </ul>
      </div>
      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px">
        Automatically sent by FinSmart Finance<br>
        Sent to: ${user.email}
      </p>
    </div>
  </div>
</body>
</html>`;

    await sendEmail({ to: user.email, subject, html });
    console.log(`[Auto Alert] ✅ Alert sent to ${user.email} — ${category} at ${percentage}%`);
  } catch (err) {
    console.error(`[Auto Alert] ❌ Failed for ${user.email}:`, err.message);
  }
};

module.exports = { sendAutoAlert };
