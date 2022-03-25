export default class FormValidation {
  public static isEmail(value: string): boolean {
    return /.+@.+\..{2,}/.test(value);
  }

  public static isPhoneNumber(value: string): boolean {
    return /\+?\d+/.test(value);
  }

  public static isNotEmpty(value: string): boolean {
    return value.length > 0;
  }
}
