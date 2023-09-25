import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DmjTextComponent } from '../dmj-text/dmj-text'
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';

/**
 * Display the tempo color, based on the device state (`Bleu` or `Blanc` or `Rouge` or `Indéterminé`).
 * 
 * See module domoja-tempo here: https://www.npmjs.com/package/domoja-tempo
 */
@Component({
  selector: 'dmj-tempo-color',
  templateUrl: 'dmj-tempo-color.html'
})
export class DmjTempoColorComponent extends DmjTextComponent {

  constructor(sanitizer: DomSanitizer, public api: DomojaApiService) {
    super(sanitizer, api);
    //console.log('Hello DmjTempoColorComponent Component');
  }

}
