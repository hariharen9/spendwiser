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

export const calculateLoanSummary = (loan: Loan): LoanSummary => {
  const { loanAmount, interestRate, emi, startDate } = loan;
  const monthlyInterestRate = interestRate / 12 / 100;
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  const amortizationSchedule: AmortizationEntry[] = [];
  let month = 1;

  while (remainingBalance > 0) {
    const interestPaid = remainingBalance * monthlyInterestRate;
    const principalPaid = emi - interestPaid;
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

export const applyPrepaymentStrategy = (
  loan: Loan,
  extraEmiPerYear: boolean,
  annualEmiIncreasePercentage: number
): LoanSummary => {
  const { loanAmount, interestRate, emi, startDate } = loan;
  const monthlyInterestRate = interestRate / 12 / 100;
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  const amortizationSchedule: AmortizationEntry[] = [];
  let month = 1;
  let currentEmi = emi;

  while (remainingBalance > 0) {
    if (month > 1 && (month - 1) % 12 === 0) {
      currentEmi *= (1 + annualEmiIncreasePercentage / 100);
    }

    let prepayment = 0;
    if (extraEmiPerYear && month % 12 === 0) {
      prepayment = emi;
    }

    const interestPaid = remainingBalance * monthlyInterestRate;
    const principalPaid = currentEmi - interestPaid + prepayment;
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
  }

  const loanEndDate = new Date(startDate);
  loanEndDate.setMonth(loanEndDate.getMonth() + month - 2);

  return { totalInterestPaid, loanEndDate, amortizationSchedule };
};
