import { Component, Input } from '@angular/core';
import { Device } from '../../providers/domoja-api/domoja-api';

@Component({
  selector: 'dmj-unknown',
  templateUrl: 'dmj-unknown.html'
})
export class DmjUnknownComponent {

  @Input() device: Device;

  constructor() { }

}
