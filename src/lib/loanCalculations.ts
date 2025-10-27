import { Loan, Transaction } from '../types/types';

export interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  endingBalance: number;
  isPaid: boolean;
  paymentDate?: string;
}

export interface LoanSummary {
  totalInterestPaid: number;
  loanEndDate: Date;
  amortizationSchedule: AmortizationEntry[];
}

export interface LoanStatus {
  currentBalance: number;
  percentagePaid: number;
  paymentsMade: number;
  totalPayments: number;
  nextPaymentDue: number | null;
  isFullyPaid: boolean;
}

export interface PreClosureCalculation {
  payoffAmount: number;
  interestSaved: number;
  monthsEarly: number;
}

// Helper function to get total months from tenure (years) or tenureInMonths
const getTotalMonths = (loan: Loan): number => {
  if (loan.tenureInMonths !== undefined && loan.tenureInMonths > 0) {
    return loan.tenureInMonths;
  }
  return loan.tenure * 12;
};

export const calculateLoanSummary = (loan: Loan): LoanSummary => {
  const { loanAmount, interestRate, emi, startDate } = loan;
  const totalMonths = getTotalMonths(loan);
  const monthlyInterestRate = interestRate / 12 / 100;
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  const amortizationSchedule: AmortizationEntry[] = [];
  let month = 1;

  while (remainingBalance > 0 && month <= totalMonths) {
    const interestPaid = remainingBalance * monthlyInterestRate;
    let principalPaid = emi - interestPaid;
    
    // For 0% interest loans, all payment goes to principal
    if (interestRate === 0) {
      principalPaid = emi;
      // Adjust for the last payment to exactly match remaining balance
      if (principalPaid > remainingBalance) {
        principalPaid = remainingBalance;
      }
    }
    
    // If this is the last month, adjust principal to clear remaining balance
    if (remainingBalance - principalPaid <= 0) {
      principalPaid = remainingBalance;
    }
    
    remainingBalance -= principalPaid;
    totalInterestPaid += interestPaid;

    amortizationSchedule.push({
      month,
      principal: principalPaid,
      interest: interestPaid,
      totalPayment: emi,
      endingBalance: remainingBalance,
      isPaid: false, // Will be updated based on actual payments
    });

    month++;
  }

  const loanEndDate = new Date(startDate);
  loanEndDate.setMonth(loanEndDate.getMonth() + month - 1);

  return { totalInterestPaid, loanEndDate, amortizationSchedule };
};

// Completely rewritten function based on actual payments
export const calculateCurrentBalance = (loan: Loan, transactions: Transaction[]): LoanStatus => {
  const { loanAmount } = loan;
  
  // Get all payments for this specific loan
  const loanPayments = transactions
    .filter(t => t.loanId === loan.id && t.type === 'expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const paymentsMade = loanPayments.length;
  
  // Get the full amortization schedule
  const loanSummary = calculateLoanSummary(loan);
  const totalPayments = loanSummary.amortizationSchedule.length;
  
  // Update amortization schedule with payment status
  const updatedSchedule = loanSummary.amortizationSchedule.map((entry, index) => ({
    ...entry,
    isPaid: index < paymentsMade,
    paymentDate: index < paymentsMade ? loanPayments[index]?.date : undefined,
  }));

  // Calculate current balance based on payments made
  let currentBalance = loanAmount;
  if (paymentsMade > 0 && paymentsMade <= totalPayments) {
    currentBalance = updatedSchedule[paymentsMade - 1].endingBalance;
  } else if (paymentsMade >= totalPayments) {
    currentBalance = 0;
  }

  const percentagePaid = ((loanAmount - currentBalance) / loanAmount) * 100;
  const nextPaymentDue = paymentsMade < totalPayments ? paymentsMade + 1 : null;
  const isFullyPaid = paymentsMade >= totalPayments;

  return {
    currentBalance: Math.max(0, currentBalance),
    percentagePaid: Math.max(0, Math.min(100, percentagePaid)),
    paymentsMade,
    totalPayments,
    nextPaymentDue,
    isFullyPaid,
  };
};

// New function for pre-closure calculations
export const calculatePreClosure = (loan: Loan, transactions: Transaction[], targetMonth: number): PreClosureCalculation => {
  const loanStatus = calculateCurrentBalance(loan, transactions);
  const loanSummary = calculateLoanSummary(loan);
  
  if (targetMonth <= loanStatus.paymentsMade || targetMonth > loanSummary.amortizationSchedule.length) {
    return {
      payoffAmount: 0,
      interestSaved: 0,
      monthsEarly: 0,
    };
  }

  // Get the outstanding balance at the target month (before that month's payment)
  const payoffAmount = targetMonth > 1 ? loanSummary.amortizationSchedule[targetMonth - 2].endingBalance : loan.loanAmount;
  
  // Calculate interest that would be saved
  const remainingSchedule = loanSummary.amortizationSchedule.slice(targetMonth - 1);
  const interestSaved = remainingSchedule.reduce((total, entry) => total + entry.interest, 0);
  
  const monthsEarly = loanSummary.amortizationSchedule.length - targetMonth + 1;

  return {
    payoffAmount,
    interestSaved,
    monthsEarly,
  };
};

export const applyPrepaymentStrategy = (
  loan: Loan,
  extraEmiPerYear: boolean,
  annualEmiIncreasePercentage: number,
  lumpSumAmount: number = 0,
  lumpSumTiming: number = 12
): LoanSummary => {
  const { loanAmount, interestRate, emi, startDate } = loan;
  const totalMonths = getTotalMonths(loan);
  const monthlyInterestRate = interestRate / 12 / 100;
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  const amortizationSchedule: AmortizationEntry[] = [];
  let month = 1;
  let currentEmi = emi;

  while (remainingBalance > 0 && month <= totalMonths * 2) { // Allow up to 2x the original term
    // Apply annual EMI increase
    if (month > 1 && (month - 1) % 12 === 0) {
      currentEmi *= (1 + annualEmiIncreasePercentage / 100);
    }

    let prepayment = 0;
    
    // Apply extra EMI per year
    if (extraEmiPerYear && month % 12 === 0) {
      prepayment = emi;
    }
    
    // Apply lump sum payment
    if (lumpSumAmount > 0 && month === lumpSumTiming) {
      prepayment += lumpSumAmount;
    }

    const interestPaid = remainingBalance * monthlyInterestRate;
    let principalPaid = currentEmi - interestPaid + prepayment;
    
    // For 0% interest loans, all payment goes to principal
    if (interestRate === 0) {
      principalPaid = currentEmi + prepayment;
      // Adjust for the last payment to exactly match remaining balance
      if (principalPaid > remainingBalance) {
        principalPaid = remainingBalance;
      }
    }
    
    // If payment exceeds remaining balance, adjust to clear remaining balance
    if (remainingBalance - principalPaid <= 0) {
      principalPaid = remainingBalance;
    }
    
    remainingBalance -= principalPaid;
    totalInterestPaid += interestPaid;

    amortizationSchedule.push({
      month,
      principal: principalPaid,
      interest: interestPaid,
      totalPayment: currentEmi + prepayment,
      endingBalance: remainingBalance,
      isPaid: false, // Will be updated based on actual payments
    });

    month++;
    
    // Exit loop if loan is fully paid
    if (remainingBalance <= 0) {
      break;
    }
  }

  const loanEndDate = new Date(startDate);
  loanEndDate.setMonth(loanEndDate.getMonth() + month - 1);

  return { totalInterestPaid, loanEndDate, amortizationSchedule };
};