
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

export const calculatePropertyMetrics = (
  property: any,
  mortgageParams: MortgageParams
): CalculatedMetrics => {
  // Calculate total monthly rent
  const totalRent = property.units?.reduce((total: number, unit: any) => {
    const rent = unit.vacancyStatus === 'Vacant' ? (unit.projectedRent || 0) : unit.rentAmount;
    return total + rent;
  }, 0) || 0;

  // Calculate total monthly expenses
  const totalExpenses = (property.property_taxes || 0) + (property.insurance || 0) + 
                       (property.hydro || 0) + (property.gas || 0) + (property.water || 0) + 
                       (property.waste_management || 0) + (property.maintenance || 0) + 
                       (property.management_fees || 0) + (property.miscellaneous || 0);

  // Calculate mortgage details
  const downPayment = calculateDownPayment(
    property.purchase_price,
    mortgageParams.downPaymentType,
    mortgageParams.downPaymentValue
  );
  
  const loanAmount = property.purchase_price - downPayment;
  const monthlyPayment = calculateMortgagePayment(
    loanAmount,
    mortgageParams.mortgageRate,
    mortgageParams.amortizationPeriod
  );

  // Calculate metrics
  const monthlyCashFlow = totalRent - totalExpenses - monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const roi = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
  const capRate = property.purchase_price > 0 ? 
    ((totalRent * 12 - totalExpenses * 12) / property.purchase_price) * 100 : 0;
  const debtServiceRatio = totalRent > 0 ? (monthlyPayment / totalRent) * 100 : 0;

  return {
    monthlyPayment,
    totalRent,
    totalExpenses,
    monthlyCashFlow,
    roi,
    capRate,
    debtServiceRatio
  };
};
