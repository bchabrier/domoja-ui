import { Component } from '@angular/core';
import { DmjTextComponent } from '../dmj-text/dmj-text'

/**
 * Generated class for the DmjInputComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dmj-input',
  templateUrl: 'dmj-input.html'
})
export class DmjInputComponent extends DmjTextComponent {

  value: string = '';

  constructor() {
    super()
  }

  done() {
    this.device.stateChange(this.device, this.value);
    this.value = '';
  }

}
