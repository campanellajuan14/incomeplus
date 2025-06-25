export interface MortgageParams {
  mortgageRate: number; // Annual rate as percentage
  amortizationPeriod: number; // Years
  downPaymentType: 'Percent' | 'Fixed';
  downPaymentValue: number;
  purchasePrice: number;
}

export interface CalculatedMetrics {
  monthlyPayment: number;
  totalRent: number;
  totalExpenses: number;
  monthlyCashFlow: number;
  roi: number;
  capRate: number;
  debtServiceRatio: number;
  downPaymentAmount: number;
  loanAmount: number;
  annualCashFlow: number;
  netOperatingIncome: number;
  yearlyPrincipalPaydown: number;
  fullYearlyROI: number;
}

export const calculateMortgagePayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  if (annualRate === 0) return principal / (years * 12);
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export const calculateDownPayment = (
  purchasePrice: number,
  downPaymentType: 'Percent' | 'Fixed',
  downPaymentValue: number
): number => {
  if (downPaymentType === 'Percent') {
    return (purchasePrice * downPaymentValue) / 100;
  }
  return downPaymentValue;
};

// New reusable function for dynamic cash flow calculation
export const calculateDynamicCashFlow = (
  property: any,
  dynamicMortgageParams: MortgageParams
): number => {
  // Calculate total monthly rent
  const totalRent = property.units?.reduce((total: number, unit: any) => {
    const rent = unit.vacancyStatus === 'Vacant' ? (unit.projectedRent || 0) : unit.rentAmount;
    return total + rent;
  }, 0) || 0;

  // Calculate total annual operating expenses
  const annualOperatingExpenses = (property.property_taxes || 0) + (property.insurance || 0) + 
                                 (property.hydro || 0) + (property.gas || 0) + (property.water || 0) + 
                                 (property.waste_management || 0) + (property.maintenance || 0) + 
                                 (property.management_fees || 0) + (property.miscellaneous || 0);

  // Convert annual expenses to monthly
  const monthlyExpenses = annualOperatingExpenses / 12;

  // Calculate mortgage details using dynamic parameters
  const downPaymentAmount = calculateDownPayment(
    dynamicMortgageParams.purchasePrice,
    dynamicMortgageParams.downPaymentType,
    dynamicMortgageParams.downPaymentValue
  );
  
  const loanAmount = dynamicMortgageParams.purchasePrice - downPaymentAmount;
  const monthlyPayment = calculateMortgagePayment(
    loanAmount,
    dynamicMortgageParams.mortgageRate,
    dynamicMortgageParams.amortizationPeriod
  );

  // Calculate monthly cash flow
  const monthlyCashFlow = totalRent - monthlyExpenses - monthlyPayment;

  return monthlyCashFlow;
};

export const calculatePropertyMetrics = (
  property: any,
  mortgageParams: MortgageParams
): CalculatedMetrics => {
  // Calculate total monthly rent
  const totalRent = property.units?.reduce((total: number, unit: any) => {
    const rent = unit.vacancyStatus === 'Vacant' ? (unit.projectedRent || 0) : unit.rentAmount;
    return total + rent;
  }, 0) || 0;

  // Calculate total annual operating expenses (these are stored as annual values in the database)
  const annualOperatingExpenses = (property.property_taxes || 0) + (property.insurance || 0) + 
                                 (property.hydro || 0) + (property.gas || 0) + (property.water || 0) + 
                                 (property.waste_management || 0) + (property.maintenance || 0) + 
                                 (property.management_fees || 0) + (property.miscellaneous || 0);

  // Convert annual expenses to monthly for display purposes
  const totalExpenses = annualOperatingExpenses / 12;

  // Calculate mortgage details
  const downPaymentAmount = calculateDownPayment(
    mortgageParams.purchasePrice,
    mortgageParams.downPaymentType,
    mortgageParams.downPaymentValue
  );
  
  const loanAmount = mortgageParams.purchasePrice - downPaymentAmount;
  const monthlyPayment = calculateMortgagePayment(
    loanAmount,
    mortgageParams.mortgageRate,
    mortgageParams.amortizationPeriod
  );

  // Calculate annual values
  const annualRent = totalRent * 12;
  const annualDebtService = monthlyPayment * 12;

  // Net Operating Income (NOI) = Annual Rental Income - Annual Operating Expenses
  // This excludes mortgage payments and depreciation
  const netOperatingIncome = annualRent - annualOperatingExpenses;

  // Cash Flow = NOI - Annual Debt Service (mortgage payments)
  const annualCashFlow = netOperatingIncome - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;

  // Cap Rate = NOI / Purchase Price (as percentage)
  // Standard real estate metric for property value assessment
  const capRate = mortgageParams.purchasePrice > 0 ? 
    (netOperatingIncome / mortgageParams.purchasePrice) * 100 : 0;

  // Cash-on-Cash ROI = Annual Cash Flow / Total Cash Invested (as percentage)
  // This is the return on actual cash invested (down payment + closing costs)
  const roi = downPaymentAmount > 0 ? (annualCashFlow / downPaymentAmount) * 100 : 0;

  // Debt Service Coverage Ratio = NOI / Annual Debt Service
  // This is the correct formula: NOI / Debt Service
  // Displayed as a ratio (e.g., -1.68 for your example)
  const debtServiceRatio = annualDebtService > 0 ? 
    (netOperatingIncome / annualDebtService) : 0;

  // Calculate yearly principal paydown
  const yearlyPrincipalPaydown = calculateYearlyPrincipalPaydown(
    loanAmount,
    mortgageParams.mortgageRate,
    mortgageParams.amortizationPeriod
  );

  // Calculate full yearly ROI (cash flow + principal paydown) / total investment
  const fullYearlyROI = calculateFullYearlyROI(
    annualCashFlow,
    yearlyPrincipalPaydown,
    downPaymentAmount
  );

  return {
    monthlyPayment,
    totalRent,
    totalExpenses,
    monthlyCashFlow,
    roi,
    capRate,
    debtServiceRatio,
    downPaymentAmount,
    loanAmount,
    annualCashFlow,
    netOperatingIncome,
    yearlyPrincipalPaydown,
    fullYearlyROI
  };
};

export const calculateYearlyPrincipalPaydown = (
  loanAmount: number,
  annualRate: number,
  years: number,
  year: number = 1
): number => {
  if (annualRate === 0) return loanAmount / years;
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment = calculateMortgagePayment(loanAmount, annualRate, years);
  
  let balance = loanAmount;
  let totalPrincipal = 0;
  
  const startMonth = (year - 1) * 12 + 1;
  const endMonth = year * 12;
  
  for (let month = 1; month <= endMonth; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    if (month >= startMonth) {
      totalPrincipal += principalPayment;
    }
    
    balance -= principalPayment;
  }
  
  return totalPrincipal;
};

export const calculateFullYearlyROI = (
  annualCashFlow: number,
  yearlyPrincipalPaydown: number,
  totalInvestment: number,
  appreciation: number = 0
): number => {
  if (totalInvestment <= 0) return 0;
  
  const totalReturn = annualCashFlow + yearlyPrincipalPaydown + appreciation;
  return (totalReturn / totalInvestment) * 100;
};
