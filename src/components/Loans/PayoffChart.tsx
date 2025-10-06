
import React, { useMemo } from 'react';
import { LoanSummary } from '../../lib/loanCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PayoffChartProps {
  originalLoanSummary: LoanSummary;
  newLoanSummary: LoanSummary;
  currency: string;
}

const PayoffChart: React.FC<PayoffChartProps> = ({ originalLoanSummary, newLoanSummary, currency }) => {

  const chartData = useMemo(() => {
    const data = [];
    const totalMonths = Math.max(originalLoanSummary.amortizationSchedule.length, newLoanSummary.amortizationSchedule.length);

    for (let i = 0; i <= totalMonths; i++) {
      const originalMonth = originalLoanSummary.amortizationSchedule.find(a => a.month === i);
      const newMonth = newLoanSummary.amortizationSchedule.find(a => a.month === i);

      data.push({
        month: i,
        'Original Plan': originalMonth ? originalMonth.endingBalance : 0,
        'New Plan': newMonth ? newMonth.endingBalance : 0,
      });
    }
    return data;
  }, [originalLoanSummary, newLoanSummary]);

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payoff Projection</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)"/>
          <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', dy: 10 }} />
          <YAxis tickFormatter={(value) => `${currency}${Number(value) / 1000}k`} />
          <Tooltip formatter={(value: number) => `${currency}${value.toLocaleString()}`} />
          <Legend />
          <Line type="monotone" dataKey="Original Plan" stroke="#8884d8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="New Plan" stroke="#82ca9d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PayoffChart;
