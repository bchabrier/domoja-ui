import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Device } from '../../providers/domoja-api/domoja-api';
import { DmjWidgetComponent } from '../dmj-widget';
import { formatString } from '../../directives/dmj-widget-host';

/*
 * Displays the device state as simple text. When a date is recognized, it is friendly displayed.
 * A format can be added following a character separator not used in the format.
 * 
 * The supported formats are: 
 * - `intl-messageformat`: see https://formatjs.io/docs/core-concepts/icu-syntax and https://unicode-org.github.io/icu/userguide/format_parse/
 * - `%j`: display as JSON object
 * - `%s`: display as string
 * - `%d`: display as Number
 * - compact<n>: display as a compacted string <start>...<end> limited to n characters
 * 
 * Examples:
 * - `"text"` to display the value without interpreting the HTML tags 
 * - `"text:%s"` to display the value while interpreting the HTML tags 
 * - `"text:Temp is <b>{value, number}</b> °C"` to format a number in an HTML string
 * - `"text/Part is {value, number, ::percent}"` to format a number as a percentage
 * - `"text/Amount is <b>{value, number, ::sign-always compact-short currency/GBP}</b>"` to format a number with a currency
 * - `"text/Temp is {value, number, :: .00 } °C"` to format a number with 2 fraction digit
 * - `"text/Temp is {value, number, :: .0# } °C"` to format a number with at least 1 fraction digit
 * - `"text/Temp is {value, number, :: percent .00 } °C"` to format a number as a percentage with 2 fraction digit
 * - `"text/JSON is: %j"` to format a value as a JSON
 * - `"text: value = %d"` to format a value as a number
 * - `"text:compact256"` to format a string to 256 chars max
 * 
 */
@Component({
  selector: 'dmj-text',
  templateUrl: 'dmj-text.html'
})
export class DmjTextComponent extends DmjWidgetComponent implements OnInit {

  @Input() device: Device;
  @Input() error: SafeHtml;
  format: string;
  @Input() string: string | Date | SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
    super(null);
  }

  ngOnInit() {
    this.format = this.args[0];
    if (this.format) {
      let { string, error } = formatString(this.sanitizer, this.format, this.device.state);
      this.string = string;
      this.error = error;  
    } else {
      this.string = null;
      this.error = "";
    }
  }


}
