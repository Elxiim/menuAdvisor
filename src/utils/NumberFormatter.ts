export default class NumberFormatter {
  public static format(
    number: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    return new Intl.NumberFormat('fr-FR', options).format(number);
  }
}
