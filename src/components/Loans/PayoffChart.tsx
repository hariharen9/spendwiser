import React, { useMemo } from 'react';
import { LoanSummary } from '../../lib/loanCalculations';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface PayoffChartProps {
  originalLoanSummary: LoanSummary;
  newLoanSummary: LoanSummary;
  currency: string;
  currentMonthProgress?: number;
}

const PayoffChart: React.FC<PayoffChartProps> = ({ originalLoanSummary, newLoanSummary, currency, currentMonthProgress }) => {

  const chartData = useMemo(() => {
    const data = [];
    const totalMonths = Math.max(originalLoanSummary.amortizationSchedule.length, newLoanSummary.amortizationSchedule.length);
    
    let cumInterestOriginal = 0;
    let cumInterestNew = 0;

    // Initial state (Month 0)
    data.push({
      month: 0,
      'Original Balance': originalLoanSummary.amortizationSchedule[0]?.principal + originalLoanSummary.amortizationSchedule[0]?.endingBalance || 0, // Approx loan amount
      'Optimized Balance': newLoanSummary.amortizationSchedule[0]?.principal + newLoanSummary.amortizationSchedule[0]?.endingBalance || 0,
      'Original Interest': 0,
      'Optimized Interest': 0,
    });

    for (let i = 1; i <= totalMonths; i++) {
      const originalMonth = originalLoanSummary.amortizationSchedule.find(a => a.month === i);
      const newMonth = newLoanSummary.amortizationSchedule.find(a => a.month === i);

      if (originalMonth) cumInterestOriginal += originalMonth.interest;
      if (newMonth) cumInterestNew += newMonth.interest;

      data.push({
        month: i,
        'Original Balance': originalMonth ? originalMonth.endingBalance : 0,
        'Optimized Balance': newMonth ? newMonth.endingBalance : 0,
        'Original Interest': cumInterestOriginal,
        'Optimized Interest': cumInterestNew,
      });
    }
    return data;
  }, [originalLoanSummary, newLoanSummary]);

  return (
    <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center text-gray-900 dark:text-white">
          <TrendingDown className="w-5 h-5 mr-2 text-blue-500" />
          Debt Payoff Mountain
        </h3>
        <div className="flex gap-4 text-xs">
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-gray-500">Original Balance</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-500">Optimized Balance</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 rounded-full bg-orange-400"></div>
              <span className="text-gray-500">Interest Cost</span>
           </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              tickFormatter={(val) => val % 12 === 0 ? `Yr ${val/12}` : ''}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              tickFormatter={(val) => val === 0 ? '0' : `${val/1000}k`} 
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-[#1A1A1A] p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Month {label}</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-bold">Balance Remaining</p>
                          <div className="flex justify-between gap-4">
                            <span className="text-xs text-gray-500">Original:</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{currency}{Number(payload[0].value).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-xs text-blue-500">Optimized:</span>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{currency}{Number(payload[1].value).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] uppercase text-orange-400 font-bold">Interest Paid To Date</p>
                          <div className="flex justify-between gap-4">
                            <span className="text-xs text-gray-500">Original:</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{currency}{Number(payload[2].value).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-xs text-green-600">Optimized:</span>
                            <span className="text-xs font-bold text-green-600">{currency}{Number(payload[3].value).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {currentMonthProgress !== undefined && (
              <ReferenceLine x={currentMonthProgress} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'YOU', fontSize: 10, fill: '#ef4444' }} />
            )}
            
            {/* Areas for Balance (The Mountain) */}
            <Area 
              type="monotone" 
              dataKey="Original Balance" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorOriginal)" 
            />
            <Area 
              type="monotone" 
              dataKey="Optimized Balance" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorNew)" 
            />

            {/* Lines for Interest (The Cost) */}
            <Line 
              type="monotone" 
              dataKey="Original Interest" 
              stroke="#fb923c" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Optimized Interest" 
              stroke="#22c55e" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayoffChart;