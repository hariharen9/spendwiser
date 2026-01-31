import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import {
  X, Search, TrendingUp, Briefcase, Bitcoin, Building2,
  Coins, Home, Banknote, BarChart3, Calendar, Percent, Info
} from 'lucide-react';
import { Asset, AssetType, ASSET_TYPE_CONFIG } from '../../types/investments';
import CurrencyInput from '../Common/CurrencyInput';
import { searchCrypto } from '../../services/marketData';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id' | 'lastUpdated'>) => void;
  editingAsset?: Asset;
  currency?: string;
}

const assetTypeIcons: Record<AssetType, React.ReactNode> = {
  STOCK: <Briefcase className="w-5 h-5" />,
  CRYPTO: <Bitcoin className="w-5 h-5" />,
  MF: <BarChart3 className="w-5 h-5" />,
  GOLD: <Coins className="w-5 h-5" />,
  FIXED_INCOME: <Building2 className="w-5 h-5" />,
  REAL_ESTATE: <Home className="w-5 h-5" />,
  CASH: <Banknote className="w-5 h-5" />,
};

const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  currency = '₹',
}) => {
  const [assetType, setAssetType] = useState<AssetType>('STOCK');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [avgBuyPrice, setAvgBuyPrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Fixed Income specific
  const [interestRate, setInterestRate] = useState<number>(0);
  const [maturityDate, setMaturityDate] = useState('');
  const [principal, setPrincipal] = useState<number>(0);

  // Real Estate specific
  const [purchaseDate, setPurchaseDate] = useState('');
  const [location, setLocation] = useState('');

  // Search results for crypto
  const [searchResults, setSearchResults] = useState<{ id: string; symbol: string; name: string }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Reset form when modal opens/closes or editing asset changes
  useEffect(() => {
    if (editingAsset) {
      setAssetType(editingAsset.type);
      setSymbol(editingAsset.symbol);
      setName(editingAsset.name);
      setQuantity(editingAsset.quantity);
      setAvgBuyPrice(editingAsset.avgBuyPrice);
      setCurrentPrice(editingAsset.currentPrice);
      setInterestRate(editingAsset.interestRate || 0);
      setMaturityDate(editingAsset.maturityDate || '');
      setPrincipal(editingAsset.principal || 0);
      setPurchaseDate(editingAsset.purchaseDate || '');
      setLocation(editingAsset.location || '');
    } else {
      setAssetType('STOCK');
      setSymbol('');
      setName('');
      setQuantity(0);
      setAvgBuyPrice(0);
      setCurrentPrice(0);
      setInterestRate(0);
      setMaturityDate('');
      setPrincipal(0);
      setPurchaseDate('');
      setLocation('');
    }
    setSearchResults([]);
    setShowSearchResults(false);
  }, [editingAsset, isOpen]);

  // Search crypto symbols
  const handleSymbolSearch = async (query: string) => {
    setSymbol(query);
    if (assetType === 'CRYPTO' && query.length >= 2) {
      const results = await searchCrypto(query);
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setShowSearchResults(false);
    }
  };

  const selectCryptoResult = (result: { id: string; symbol: string; name: string }) => {
    setSymbol(result.symbol);
    setName(result.name);
    setShowSearchResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const asset: Omit<Asset, 'id' | 'lastUpdated'> = {
      type: assetType,
      symbol: symbol.toUpperCase(),
      name: name || symbol,
      quantity,
      avgBuyPrice,
      currentPrice: currentPrice || avgBuyPrice, // Default to buy price if not provided
      currency,
      tags: [],
    };

    // Add type-specific fields
    if (assetType === 'FIXED_INCOME') {
      asset.interestRate = interestRate;
      asset.maturityDate = maturityDate;
      asset.principal = principal || (quantity * avgBuyPrice);
    }

    if (assetType === 'REAL_ESTATE') {
      asset.purchaseDate = purchaseDate;
      asset.location = location;
    }

    onSave(asset);
    onClose();
  };

  const needsSymbol = ['STOCK', 'CRYPTO', 'MF', 'GOLD'].includes(assetType);
  const isFixedIncome = assetType === 'FIXED_INCOME';
  const isRealEstate = assetType === 'REAL_ESTATE';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#242424] z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-blue-500" />
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Asset Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Asset Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(ASSET_TYPE_CONFIG) as AssetType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAssetType(type)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        assetType === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {assetTypeIcons[type]}
                      <span className="text-xs font-medium">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symbol/Ticker (for stocks, crypto, etc.) */}
              {needsSymbol && (
                <div className="relative">
                  <label htmlFor="symbol" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {assetType === 'CRYPTO' ? 'Symbol' : 'Ticker Symbol'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="symbol"
                      value={symbol}
                      onChange={(e) => handleSymbolSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 uppercase"
                      placeholder={assetType === 'CRYPTO' ? 'BTC, ETH, SOL...' : 'AAPL, GOOGL, VOO...'}
                      required
                    />
                  </div>

                  {/* Crypto Search Results */}
                  {showSearchResults && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => selectCryptoResult(result)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{result.symbol}</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{result.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {isRealEstate ? 'Property Name' : 'Asset Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder={isRealEstate ? 'My Apartment, Office Space...' : 'Apple Inc., Bitcoin...'}
                  required={!needsSymbol}
                />
              </div>

              {/* Real Estate Location */}
              {isRealEstate && (
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Address or area"
                  />
                </div>
              )}

              {/* Quantity and Price (for tradeable assets) */}
              {!isFixedIncome && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {isRealEstate ? 'Units' : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="0"
                      step="any"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="avgBuyPrice" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Avg. Buy Price
                    </label>
                    <CurrencyInput
                      id="avgBuyPrice"
                      value={avgBuyPrice || ''}
                      onChange={(value) => setAvgBuyPrice(parseFloat(value) || 0)}
                      currency={currency}
                      className="w-full"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Current Price (optional for manual override) */}
              {!isFixedIncome && needsSymbol && (
                <div>
                  <label htmlFor="currentPrice" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    Current Price
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Optional - auto-fetched for supported assets)</span>
                  </label>
                  <CurrencyInput
                    id="currentPrice"
                    value={currentPrice || ''}
                    onChange={(value) => setCurrentPrice(parseFloat(value) || 0)}
                    currency={currency}
                    className="w-full"
                    placeholder="Leave empty to auto-fetch"
                  />
                </div>
              )}

              {/* Fixed Income specific fields */}
              {isFixedIncome && (
                <>
                  <div>
                    <label htmlFor="principal" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Principal Amount
                    </label>
                    <CurrencyInput
                      id="principal"
                      value={principal || ''}
                      onChange={(value) => setPrincipal(parseFloat(value) || 0)}
                      currency={currency}
                      className="w-full"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="interestRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        <span className="flex items-center">
                          <Percent className="w-4 h-4 mr-1" />
                          Interest Rate (p.a.)
                        </span>
                      </label>
                      <input
                        type="number"
                        id="interestRate"
                        value={interestRate || ''}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="7.5"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="maturityDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Maturity Date
                        </span>
                      </label>
                      <input
                        type="date"
                        id="maturityDate"
                        value={maturityDate}
                        onChange={(e) => setMaturityDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>
                  </div>

                  {/* Calculated return preview */}
                  {principal > 0 && interestRate > 0 && maturityDate && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="font-semibold">Projected Returns</span>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        At maturity, your investment will be worth approximately{' '}
                        <span className="font-bold">
                          {currency}
                          {(principal * (1 + (interestRate / 100) * (
                            (new Date(maturityDate).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000)
                          ))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Purchase Date for Real Estate */}
              {isRealEstate && (
                <div>
                  <label htmlFor="purchaseDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Purchase Date
                    </span>
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              )}

              {/* Total Value Preview */}
              {!isFixedIncome && quantity > 0 && avgBuyPrice > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Total Investment: <span className="font-bold">{currency}{(quantity * avgBuyPrice).toLocaleString()}</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md hover:shadow-lg"
                >
                  {editingAsset ? 'Save Changes' : 'Add Asset'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddAssetModal;
