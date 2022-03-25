import Currency from '../types/Currency';

export default class PriceFormatter {
  public static format(price: { amount?: number; currency: Currency }): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: (price.currency as string).toUpperCase(),
      minimumFractionDigits: 2,
    }).format((price.amount || 0) / 100);
  }
}
