import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
const COLORS = ['#4f6ef7','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1'];

export function PieChartBox({ data }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No expense data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
          {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => `Rs.${v.toLocaleString()}`} />
        <Legend iconType="circle" iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarChartBox({ data }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No monthly data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top:5, right:10, left:0, bottom:5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} />
        <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickFormatter={(v) => `Rs.${v}`} />
        <Tooltip formatter={(v) => `Rs.${v.toLocaleString()}`} />
        <Legend iconType="circle" iconSize={10} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
