import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DmjTextComponent } from '../dmj-text/dmj-text'
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';

/**
 * Display a device state as a toggle. The value `ON` display the toggle switched on. Other values display it switched off.
 */
@Component({
  selector: 'dmj-toggle',
  templateUrl: 'dmj-toggle.html'
})
export class DmjToggleComponent extends DmjTextComponent {

  constructor(sanitizer: DomSanitizer, public api: DomojaApiService) {
    super(sanitizer, api)
  }

}
