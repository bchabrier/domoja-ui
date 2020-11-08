import { Component, Input } from '@angular/core';
import { Device } from '../../providers/domoja-api/domoja-api';

/**
 * Displays the device state as simple text. When a date is recognized, it is friendly displayed.
 */
@Component({
  selector: 'dmj-text',
  templateUrl: 'dmj-text.html'
})
export class DmjTextComponent {

  @Input() device: Device;

  constructor() { }

}
