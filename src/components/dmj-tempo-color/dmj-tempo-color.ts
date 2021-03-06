import { Component } from '@angular/core';
import { DmjTextComponent } from '../dmj-text/dmj-text'

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

  constructor() {
    super();
    //console.log('Hello DmjTempoColorComponent Component');
  }

}
