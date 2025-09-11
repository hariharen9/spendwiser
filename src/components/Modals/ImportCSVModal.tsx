import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../types/types';
import AnimatedButton from '../Common/AnimatedButton';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  currency: string;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport,
  currency
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [parsedTransactions, setParsedTransactions] = useState<Omit<Transaction, 'id'>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setFile(null);
    setImportStatus('idle');
    setErrorMessage('');
    setParsedTransactions([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        parseCSV(droppedFile);
      } else {
        setErrorMessage('Please upload a CSV file');
        setImportStatus('error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        parseCSV(selectedFile);
      } else {
        setErrorMessage('Please upload a CSV file');
        setImportStatus('error');
      }
    }
  };

  const parseCSV = (file: File) => {
    setImportStatus('processing');
    setErrorMessage('');
    setValidationErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or invalid');
        }
        
        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['date', 'name', 'category', 'amount', 'type'];
        
        // Check if all required headers are present
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
        }
        
        // Parse data rows
        const transactions: Omit<Transaction, 'id'>[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Column count mismatch`);
            continue;
          }
          
          const transaction: any = {};
          let hasError = false;
          
          // Map values to headers
          headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';
            
            switch (header) {
              case 'date':
                // Validate date format (YYYY-MM-DD)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                  errors.push(`Row ${i + 1}: Invalid date format. Expected YYYY-MM-DD, got "${value}"`);
                  hasError = true;
                }
                transaction.date = value;
                break;
              case 'name':
                if (!value) {
                  errors.push(`Row ${i + 1}: Name is required`);
                  hasError = true;
                }
                transaction.name = value;
                break;
              case 'category':
                transaction.category = value || 'Uncategorized';
                break;
              case 'amount':
                const amount = parseFloat(value);
                if (isNaN(amount)) {
                  errors.push(`Row ${i + 1}: Invalid amount "${value}"`);
                  hasError = true;
                }
                transaction.amount = amount;
                break;
              case 'type':
                if (value !== 'income' && value !== 'expense') {
                  errors.push(`Row ${i + 1}: Type must be "income" or "expense", got "${value}"`);
                  hasError = true;
                }
                transaction.type = value;
                break;
              case 'accountid':
                transaction.accountId = value || undefined;
                break;
              case 'comments':
                transaction.comments = value || undefined;
                break;
              default:
                // Ignore unknown columns
                break;
            }
          });
          
          // Auto-determine sign for amount based on type if not already correct
          if (!hasError && transaction.amount && transaction.type) {
            if (transaction.type === 'income' && transaction.amount < 0) {
              transaction.amount = Math.abs(transaction.amount);
            } else if (transaction.type === 'expense' && transaction.amount > 0) {
              transaction.amount = -Math.abs(transaction.amount);
            }
          }
          
          if (!hasError) {
            transactions.push(transaction as Omit<Transaction, 'id'>);
          }
        }
        
        if (errors.length > 0) {
          setValidationErrors(errors);
          setImportStatus('error');
          return;
        }
        
        setParsedTransactions(transactions);
        setImportStatus('success');
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to parse CSV file');
        setImportStatus('error');
      }
    };
    
    reader.onerror = () => {
      setErrorMessage('Failed to read file');
      setImportStatus('error');
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedTransactions.length > 0) {
      onImport(parsedTransactions);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                Import Transactions
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] text-gray-500 dark:text-[#888888]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {importStatus === 'idle' && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#007BFF] bg-[#007BFF]/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#007BFF]'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-[#888888] mb-4" />
                  <p className="text-gray-700 dark:text-[#F5F5F5] font-medium mb-1">
                    Drag & drop your CSV file
                  </p>
                  <p className="text-gray-500 dark:text-[#888888] text-sm mb-4">
                    or click to browse files
                  </p>
                  <p className="text-gray-400 dark:text-[#888888] text-xs">
                    Supported format: CSV
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-[#F5F5F5] mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    CSV Format Requirements
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-[#888888] space-y-1">
                    <li>• Required columns: Date, Name, Category, Amount, Type</li>
                    <li>• Date format: YYYY-MM-DD</li>
                    <li>• Amount: Numeric values (positive or negative)</li>
                    <li>• Type: "income" or "expense"</li>
                    <li>• Optional columns: AccountId, Comments</li>
                  </ul>
                </div>
              </div>
            )}

            {importStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007BFF] mb-4"></div>
                <p className="text-gray-700 dark:text-[#F5F5F5] font-medium">
                  Processing your CSV file...
                </p>
                <p className="text-gray-500 dark:text-[#888888] text-sm">
                  Validating data and preparing transactions
                </p>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#F5F5F5] mb-1">
                    File Parsed Successfully
                  </h3>
                  <p className="text-gray-600 dark:text-[#888888]">
                    Found {parsedTransactions.length} valid transactions
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    Ready to Import
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    All transactions have been validated and are ready to be imported into your account.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-[#F5F5F5] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 py-2 px-4 bg-[#007BFF] hover:bg-[#0056b3] text-white rounded-lg transition-colors"
                  >
                    Import Transactions
                  </button>
                </div>
              </div>
            )}

            {(importStatus === 'error' || validationErrors.length > 0) && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#F5F5F5] mb-1">
                    Import Failed
                  </h3>
                  <p className="text-gray-600 dark:text-[#888888]">
                    {errorMessage || 'Please fix the following issues:'}
                  </p>
                </div>
                
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Validation Errors
                    </h4>
                    <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                      {validationErrors.length > 10 && (
                        <li className="font-medium">
                          ... and {validationErrors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={resetModal}
                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-[#F5F5F5] rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2 px-4 bg-[#007BFF] hover:bg-[#0056b3] text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportCSVModal;