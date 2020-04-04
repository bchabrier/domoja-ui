import { Component, Input } from '@angular/core';
import { Device } from '../../providers/domoja-api/domoja-api';

@Component({
  selector: 'dmj-text',
  templateUrl: 'dmj-text.html'
})
export class DmjTextComponent {

  @Input() device: Device;

  constructor() { }

}
