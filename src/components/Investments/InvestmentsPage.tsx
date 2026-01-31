import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInVariants, modalVariants } from '../Common/AnimationVariants';
import {
  Plus, TrendingUp, TrendingDown, Wallet, PieChart, BarChart3,
  RefreshCw, Settings, ChevronRight, ArrowUpRight, ArrowDownRight,
  Briefcase, Bitcoin, Building2, Banknote, Coins, Home, DollarSign
} from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis,
  CartesianGrid
} from 'recharts';
import { Asset, AssetType, AssetWithMetrics, PortfolioMetrics, ASSET_TYPE_CONFIG, InvestmentTransaction } from '../../types/investments';
import { Account } from '../../types/types';
import Tabs from '../Common/Tabs';
import AnimatedNumber from '../Common/AnimatedNumber';
import AssetDetailsModal from './AssetDetailsModal';

// Props interface
interface InvestmentsPageProps {
  assets: Asset[];
  investmentTransactions: InvestmentTransaction[];
  accounts: Account[];
  onAddAsset: () => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onTrade: (asset: Asset, type: 'BUY' | 'SELL' | 'DIVIDEND') => void;
  onRefreshPrices: () => void;
  currency: string;
  isRefreshing?: boolean;
}

// --- Helper Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PLBadge: React.FC<{ value: number; percent: number; size?: 'sm' | 'md' }> = ({ value, percent, size = 'md' }) => {
  const isPositive = value >= 0;
  const colorClass = isPositive
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';

  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center ${sizeClass} rounded-full border font-medium ${colorClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3 mr-0.5' : 'w-4 h-4 mr-1'} />
      {isPositive ? '+' : ''}{percent.toFixed(2)}%
    </span>
  );
};

const AssetTypeIcon: React.FC<{ type: AssetType; className?: string }> = ({ type, className = "w-5 h-5" }) => {
  const icons: Record<AssetType, React.ReactNode> = {
    STOCK: <Briefcase className={className} />,
    CRYPTO: <Bitcoin className={className} />,
    MF: <BarChart3 className={className} />,
    GOLD: <Coins className={className} />,
    FIXED_INCOME: <Building2 className={className} />,
    REAL_ESTATE: <Home className={className} />,
    CASH: <Banknote className={className} />,
  };
  return <>{icons[type]}</>;
};

// --- Portfolio Summary Card ---

const PortfolioSummary: React.FC<{ metrics: PortfolioMetrics; currency: string }> = ({ metrics, currency }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Portfolio Value
        </h3>
        <Wallet className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber value={metrics.totalValue} currency={currency} decimals={0} />
          </p>
          <div className="flex items-center gap-2 mt-2">
            <PLBadge value={metrics.unrealizedPL} percent={metrics.unrealizedPLPercent} />
            <span className="text-sm text-gray-500 dark:text-gray-400">All time</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Invested</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {currency}{metrics.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Unrealized P&L</p>
            <p className={`text-lg font-semibold ${metrics.unrealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {metrics.unrealizedPL >= 0 ? '+' : ''}{currency}{metrics.unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// --- Asset Allocation Chart ---

const AssetAllocationChart: React.FC<{ allocation: PortfolioMetrics['assetAllocation']; currency: string }> = ({ allocation, currency }) => {
  const COLORS = {
    STOCK: '#3B82F6',
    CRYPTO: '#F97316',
    MF: '#8B5CF6',
    GOLD: '#EAB308',
    FIXED_INCOME: '#10B981',
    REAL_ESTATE: '#6366F1',
    CASH: '#22C55E',
  };

  const data = allocation.filter(a => a.value > 0).map(a => ({
    name: ASSET_TYPE_CONFIG[a.type].label,
    value: a.value,
    percentage: a.percentage,
    type: a.type,
  }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No assets to display
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type as AssetType]} />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-md text-sm">
                    <p className="font-bold text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {currency}{d.value.toLocaleString()} ({d.percentage.toFixed(1)}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((entry) => (
          <div key={entry.type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[entry.type as AssetType] }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{entry.percentage.toFixed(0)}% {entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Asset Row ---

const AssetRow: React.FC<{
  asset: AssetWithMetrics;
  currency: string;
  onClick: () => void;
  onTrade: (type: 'BUY' | 'SELL') => void;
}> = ({ asset, currency, onClick, onTrade }) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      className="group p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${
            asset.type === 'CRYPTO' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
            asset.type === 'STOCK' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
            asset.type === 'GOLD' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
            asset.type === 'FIXED_INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            <AssetTypeIcon type={asset.type} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">{asset.symbol || asset.name}</h4>
              {asset.symbol && <span className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })} units @ {currency}{asset.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-semibold text-gray-900 dark:text-white">
              {currency}{asset.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center justify-end gap-1">
              <span className={`text-sm ${asset.unrealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {asset.unrealizedPL >= 0 ? '+' : ''}{currency}{asset.unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <PLBadge value={asset.unrealizedPL} percent={asset.unrealizedPLPercent} size="sm" />
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onTrade('BUY'); }}
              className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
            >
              Buy
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onTrade('SELL'); }}
              className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              Sell
            </button>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </div>
      </div>
    </motion.div>
  );
};

// --- Holdings List ---

const HoldingsList: React.FC<{
  assets: AssetWithMetrics[];
  currency: string;
  groupByType: boolean;
  onAssetClick: (asset: Asset) => void;
  onTrade: (asset: Asset, type: 'BUY' | 'SELL') => void;
}> = ({ assets, currency, groupByType, onAssetClick, onTrade }) => {
  const groupedAssets = useMemo(() => {
    if (!groupByType) return { All: assets };

    return assets.reduce((acc, asset) => {
      const type = ASSET_TYPE_CONFIG[asset.type].label;
      if (!acc[type]) acc[type] = [];
      acc[type].push(asset);
      return acc;
    }, {} as Record<string, AssetWithMetrics[]>);
  }, [assets, groupByType]);

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No investments yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start building your portfolio!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Object.entries(groupedAssets).map(([group, groupAssets]) => (
        <div key={group}>
          {groupByType && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group} ({groupAssets.length})
              </h4>
            </div>
          )}
          {groupAssets.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              currency={currency}
              onClick={() => onAssetClick(asset)}
              onTrade={(type) => onTrade(asset, type)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// --- Main Page Component ---

const InvestmentsPage: React.FC<InvestmentsPageProps> = ({
  assets,
  investmentTransactions,
  accounts,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  onTrade,
  onRefreshPrices,
  currency,
  isRefreshing = false,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState('holdings');
  const [groupByType, setGroupByType] = useState(true);

  // Calculate metrics for each asset
  const assetsWithMetrics: AssetWithMetrics[] = useMemo(() => {
    return assets.map(asset => {
      const currentValue = asset.quantity * asset.currentPrice;
      const investedValue = asset.quantity * asset.avgBuyPrice;
      const unrealizedPL = currentValue - investedValue;
      const unrealizedPLPercent = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;

      return {
        ...asset,
        currentValue,
        investedValue,
        unrealizedPL,
        unrealizedPLPercent,
      };
    });
  }, [assets]);

  // Calculate portfolio metrics
  const portfolioMetrics: PortfolioMetrics = useMemo(() => {
    const totalValue = assetsWithMetrics.reduce((sum, a) => sum + a.currentValue, 0);
    const totalInvested = assetsWithMetrics.reduce((sum, a) => sum + a.investedValue, 0);
    const unrealizedPL = totalValue - totalInvested;
    const unrealizedPLPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;

    // Asset allocation
    const allocationMap = new Map<AssetType, number>();
    assetsWithMetrics.forEach(a => {
      const current = allocationMap.get(a.type) || 0;
      allocationMap.set(a.type, current + a.currentValue);
    });

    const assetAllocation = Array.from(allocationMap.entries()).map(([type, value]) => ({
      type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }));

    return {
      totalValue,
      totalInvested,
      unrealizedPL,
      unrealizedPLPercent,
      dayChange: 0, // Would need historical data
      dayChangePercent: 0,
      assetAllocation,
    };
  }, [assetsWithMetrics]);

  // Sort assets by value
  const sortedAssets = useMemo(() => {
    return [...assetsWithMetrics].sort((a, b) => b.currentValue - a.currentValue);
  }, [assetsWithMetrics]);

  const tabs = [
    { id: 'holdings', label: 'Holdings' },
    { id: 'allocation', label: 'Allocation' },
  ];

  return (
    <motion.div
      className="space-y-8 pb-20 relative"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Background Accent */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Investments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your portfolio and watch your wealth grow.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onAddAsset}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Portfolio Summary */}
        <div className="lg:col-span-5">
          <PortfolioSummary metrics={portfolioMetrics} currency={currency} />
        </div>

        {/* Right Column: Asset Allocation */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                Asset Allocation
              </h3>
            </div>
            <AssetAllocationChart allocation={portfolioMetrics.assetAllocation} currency={currency} />
          </GlassCard>
        </div>
      </div>

      {/* Holdings Section */}
      <GlassCard>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <Tabs tabs={tabs} selectedTab={activeTab} onSelectTab={setActiveTab} />
          <button
            onClick={() => setGroupByType(!groupByType)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {groupByType ? 'Ungroup' : 'Group by type'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'holdings' && (
            <motion.div
              key="holdings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HoldingsList
                assets={sortedAssets}
                currency={currency}
                groupByType={groupByType}
                onAssetClick={setSelectedAsset}
                onTrade={onTrade}
              />
            </motion.div>
          )}

          {activeTab === 'allocation' && (
            <motion.div
              key="allocation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioMetrics.assetAllocation
                  .filter(a => a.value > 0)
                  .sort((a, b) => b.value - a.value)
                  .map((alloc) => (
                    <div
                      key={alloc.type}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          alloc.type === 'CRYPTO' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                          alloc.type === 'STOCK' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                          alloc.type === 'GOLD' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                          alloc.type === 'FIXED_INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600'
                        }`}>
                          <AssetTypeIcon type={alloc.type} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {ASSET_TYPE_CONFIG[alloc.type].label}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {alloc.percentage.toFixed(1)}% of portfolio
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currency}{alloc.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Asset Details Modal */}
      <AssetDetailsModal
        isOpen={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
        transactions={investmentTransactions.filter(t => t.assetId === selectedAsset?.id)}
        currency={currency}
        onEdit={() => selectedAsset && onEditAsset(selectedAsset)}
        onDelete={() => selectedAsset && onDeleteAsset(selectedAsset.id)}
        onTrade={(type) => selectedAsset && onTrade(selectedAsset, type)}
      />
    </motion.div>
  );
};

export default InvestmentsPage;
