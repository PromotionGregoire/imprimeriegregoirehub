import { format } from 'date-fns';

export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return '0,00 $';
  
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Non définie';
  
  return format(new Date(date), 'dd/MM/yyyy');
};

export const calculateDaysRemaining = (deadline: Date | string | null | undefined) => {
  if (!deadline) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      text: `En retard de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`,
      color: 'text-red-600',
      days: diffDays
    };
  }
  
  if (diffDays === 0) {
    return {
      text: "Aujourd'hui",
      color: 'text-orange-600',
      days: 0
    };
  }
  
  if (diffDays <= 7) {
    return {
      text: `J-${diffDays}`,
      color: 'text-orange-600',
      days: diffDays
    };
  }
  
  return {
    text: `J-${diffDays}`,
    color: 'text-gray-500',
    days: diffDays
  };
};