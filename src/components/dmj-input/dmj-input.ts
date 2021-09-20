import { Component } from '@angular/core';
import { DmjTextComponent } from '../dmj-text/dmj-text'

/**
 * Displays a text area with a button
 * 
 * When the button is clicked, the device state is changed to the value of the text area.
 * 
 * *Improvement needed*: pass the button label as a parameter
 *  
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
    const prevState = this.device.state;
    this.device.stateChange(this.device, this.value, err => {if (err) this.device.state = prevState});
    this.value = '';
  }

}
