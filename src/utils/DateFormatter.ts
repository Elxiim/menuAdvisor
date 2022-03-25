import moment from 'moment';
import 'moment/locale/fr';

export default class DateFormatter {
  public static format(input: moment.MomentInput, showTime?: boolean): string {
    return moment(input).format(`Do MMM YYYY${showTime ? ' HH:mm' : ''}`);
  }
}
