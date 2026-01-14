import React, { useState, useEffect, useRef, useMemo } from 'react';

interface CurrencyInputProps {
  value: string | number;
  onChange: (value: string) => void;
  currency: string;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
  required?: boolean;
  autoFocus?: boolean;
  error?: string;
}

const numberToWords = (num: number): string => {
  if (num === 0) return '';
  
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertGroup = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'hundred ' + (n % 100 == 0 ? '' : 'and ' + convertGroup(n % 100));
    return '';
  };

  // Indian Numbering System
  // 10,00,00,00,00,00,000 -> 10 Nil (not standard, usually Stops at Crore)
  // Let's handle standard Indian system: Unit, Ten, Hundred, Thousand, Lakh, Crore.
  
  // Clean integer part for words
  const integerPart = Math.floor(num);
  if (integerPart === 0) return 'Zero';

  let str = integerPart.toString();
  let result = '';
  
  // Crores (1,00,00,000+)
  if (str.length > 7) {
      const crores = Math.floor(integerPart / 10000000);
      result += convertGroup(crores) + 'crore '; // Using basic convertGroup for simplicity, might need recursion for huge crores
      str = (integerPart % 10000000).toString();
  }
  
  const remainingInt = parseInt(str);
  if (remainingInt === 0) return result.trim();

  // Re-parse simplified logic for the rest < 1 Crore
  const lakhs = Math.floor(remainingInt / 100000);
  const thousands = Math.floor((remainingInt % 100000) / 1000);
  const hundreds = Math.floor((remainingInt % 1000) / 100);
  const tensUnits = remainingInt % 100;

  if (lakhs > 0) {
      result += convertGroup(lakhs) + 'lakh ';
  }
  
  if (thousands > 0) {
      result += convertGroup(thousands) + 'thousand ';
  }
  
  if (hundreds > 0) {
      result += convertGroup(hundreds) + 'hundred ';
  }
  
  if (tensUnits > 0) {
      if (result !== '') result += 'and ';
      result += convertGroup(tensUnits);
  }

  return result.trim().replace(/-$/, '');
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currency,
  placeholder = "0.00",
  className = "",
  label,
  id,
  required = false,
  autoFocus = false,
  error
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to format the raw value for display
  const formatForDisplay = (val: string | number): string => {
    if (val === '' || val === undefined || val === null) return '';
    const numVal = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(numVal)) return '';
    return numVal.toLocaleString('en-IN');
  };

  const [displayValue, setDisplayValue] = useState(formatForDisplay(value));
  
  // Amount in words logic
  const amountInWords = useMemo(() => {
      const numVal = typeof value === 'string' ? parseFloat(value) : value;
      if (!numVal || isNaN(numVal)) return '';
      // Capitalize first letter
      const words = numberToWords(numVal);
      return words.charAt(0).toUpperCase() + words.slice(1);
  }, [value]);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(formatForDisplay(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    let cleanedValue = rawInput.replace(/,/g, '').replace(/[^0-9.]/g, '');
    
    const decimalParts = cleanedValue.split('.');
    if (decimalParts.length > 2) return;
    
    cleanedValue = decimalParts.length === 2 ? `${decimalParts[0]}.${decimalParts[1].substring(0, 2)}` : decimalParts[0];

    onChange(cleanedValue);
    setDisplayValue(rawInput); // Keep user input as they type, relying on blur to format perfectly
  };

  const handleBlur = () => {
    const formatted = formatForDisplay(value);
    setDisplayValue(formatted);
    if (formatted === '' && value !== '') {
        onChange('');
    }
  };

  const handleFocus = () => {
    const rawValue = displayValue.replace(/,/g, '');
    setDisplayValue(rawValue);
    if (inputRef.current) {
        // Defer selection slightly to ensure value update paints first
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
            }
        }, 0);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{currency}</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          id={id}
          className={`block w-full rounded-md border-gray-300 pl-8 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          autoFocus={autoFocus}
          inputMode="decimal"
          autoComplete="off"
        />
      </div>
      {/* Amount in words displayed subtly below */}
      {amountInWords && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
              {amountInWords}
          </p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CurrencyInput;