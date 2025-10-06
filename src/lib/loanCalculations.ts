import { Loan } from '../types/types';

export interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  endingBalance: number;
}

export interface LoanSummary {
  totalInterestPaid: number;
  loanEndDate: Date;
  amortizationSchedule: AmortizationEntry[];
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
    });

    month++;
  }

  const loanEndDate = new Date(startDate);
  loanEndDate.setMonth(loanEndDate.getMonth() + month - 1);

  return { totalInterestPaid, loanEndDate, amortizationSchedule };
};

export const calculateCurrentBalance = (loan: Loan): { currentBalance: number, percentagePaid: number } => {
  const { loanAmount, startDate } = loan;
  const start = new Date(startDate);
  const today = new Date();

  const monthsElapsed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());

  if (monthsElapsed <= 0) {
    return { currentBalance: loanAmount, percentagePaid: 0 };
  }

  const summary = calculateLoanSummary(loan);
  const lastPayment = summary.amortizationSchedule.find(entry => entry.month === monthsElapsed);

  if (!lastPayment) {
    // If months elapsed is beyond the loan tenure
    if (monthsElapsed > summary.amortizationSchedule.length) {
        return { currentBalance: 0, percentagePaid: 100 };
    }
    return { currentBalance: loanAmount, percentagePaid: 0 };
  }

  const currentBalance = lastPayment.endingBalance;
  const percentagePaid = ((loanAmount - currentBalance) / loanAmount) * 100;

  return { currentBalance, percentagePaid: Math.max(0, Math.min(100, percentagePaid)) };
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