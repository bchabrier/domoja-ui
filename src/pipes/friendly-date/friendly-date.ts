import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
/**
 * Generated class for the FriendlyDatePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'friendlyDate',
})
export class FriendlyDatePipe implements PipeTransform {

  pipe = new DatePipe('en-US');

  transform(value: string | Date, ...args) {
    if (value instanceof (Date)) {
      var str = '';
      var now = new Date();
      if (value.getFullYear() === now.getFullYear()) {
        if (value.getMonth() === now.getMonth()) {
          if (value.getDate() === now.getDate()) {
            return this.pipe.transform(value, 'HH:mm');
          } else if (value.getDate() === now.getDate() - 1) {
            str = 'hier';
          } else if (value.getDate() === now.getDate() + 1) {
            str = 'demain';
          } else {
            str = this.pipe.transform(value, 'dd/MM/yyyy');
          }
        } else {
          str = this.pipe.transform(value, 'dd/MM/yyyy');
        }
      } else {
        str = this.pipe.transform(value, 'dd/MM/yyyy');
      }
      str += ' ' + this.pipe.transform(value, 'HH:mm');
      return str;
    }
    return value;
  }
}
