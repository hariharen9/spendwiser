import { calculateLoanSummary, applyPrepaymentStrategy } from './loanCalculations';
import { Loan } from '../types/types';

// Test function to verify loan calculations work correctly
export const verifyLoanCalculations = () => {
  console.log('Testing Loan Calculations...');
  
  // Test 1: Years-based tenure
  console.log('\n1. Testing years-based tenure:');
  const loan1: Loan = {
    id: 'test1',
    name: 'Test Loan',
    loanAmount: 100000,
    interestRate: 10,
    tenure: 1,
    emi: 8792,
    startDate: '2023-01-01'
  };

  const summary1 = calculateLoanSummary(loan1);
  console.log(`Total Interest Paid: ${summary1.totalInterestPaid}`);
  console.log(`Loan End Date: ${summary1.loanEndDate}`);
  console.log(`Amortization Schedule Length: ${summary1.amortizationSchedule.length}`);

  // Test 2: Months-based tenure
  console.log('\n2. Testing months-based tenure:');
  const loan2: Loan = {
    id: 'test2',
    name: 'Test Loan',
    loanAmount: 50000,
    interestRate: 12,
    tenure: 0,
    tenureInMonths: 12,
    emi: 4429,
    startDate: '2023-01-01'
  };

  const summary2 = calculateLoanSummary(loan2);
  console.log(`Total Interest Paid: ${summary2.totalInterestPaid}`);
  console.log(`Loan End Date: ${summary2.loanEndDate}`);
  console.log(`Amortization Schedule Length: ${summary2.amortizationSchedule.length}`);

  // Test 3: Prepayment strategy with years-based tenure
  console.log('\n3. Testing prepayment strategy with years-based tenure:');
  const prepaymentSummary1 = applyPrepaymentStrategy(loan1, true, 0);
  console.log(`Total Interest Paid: ${prepaymentSummary1.totalInterestPaid}`);
  console.log(`Loan End Date: ${prepaymentSummary1.loanEndDate}`);
  console.log(`Amortization Schedule Length: ${prepaymentSummary1.amortizationSchedule.length}`);

  // Test 4: Prepayment strategy with months-based tenure
  console.log('\n4. Testing prepayment strategy with months-based tenure:');
  const prepaymentSummary2 = applyPrepaymentStrategy(loan2, false, 5);
  console.log(`Total Interest Paid: ${prepaymentSummary2.totalInterestPaid}`);
  console.log(`Loan End Date: ${prepaymentSummary2.loanEndDate}`);
  console.log(`Amortization Schedule Length: ${prepaymentSummary2.amortizationSchedule.length}`);

  console.log('\nVerification complete!');
};