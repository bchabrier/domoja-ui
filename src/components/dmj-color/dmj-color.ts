import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DmjWidgetComponent } from '../dmj-widget';

/**
 * Displays the device state with its color.
 * 
 * The state can be rgb (e.g. `#FFFFFF`) or literal (e.g. `orange`).
 */
@Component({
  selector: 'dmj-color',
  templateUrl: 'dmj-color.html'
})
export class DmjColorComponent extends DmjWidgetComponent {

  constructor(private sanitizer: DomSanitizer) {
    super(null);
  }

  color(rgb: string) {
    return this.sanitizer.bypassSecurityTrustStyle(rgb);
  }

  invertColor(rgb: string) {
    if (/^#[0-9a-fA-F]{6}/.test(rgb)) {
    let r = parseInt(rgb.substr(1,2), 16);
    let g = parseInt(rgb.substr(3,2), 16);
    let b = parseInt(rgb.substr(5,2), 16);

    let rs = (255 - r).toString(16);
    let gs = (255 - g).toString(16);
    let bs = (255 - b).toString(16);
    
  return this.sanitizer.bypassSecurityTrustStyle('#' + rs + gs + bs);
  } else {
    return this.color(rgb);
  }
  }
}
