import { Component } from '@angular/core';
import { DmjTextComponent } from '../dmj-text/dmj-text';

/**
 * Displays a progress or meter HTML5 element, based on the state of the device.
 * 
 * The state must be in the form `<value>:<meter|progress>:<min>:<low>:<high>:<optimum>:<max>`, where:
 * - `<value>`: is the value of the bar
 * - `<meter|progress>`: is one of `meter` or `progress`. If `progress`, on `<value>` and `<max>` are taken into account. 
 * - `<min>`: is the min value
 * - `<low>`: is the low value
 * - `<high>`: is the high value
 * - `<optimum>`: is the optimum value
 * - `<max>`: is the max value
 * 
 * See HTML specs here:
 * - https://developer.mozilla.org/fr/docs/Web/HTML/Element/Progress
 * - https://developer.mozilla.org/fr/docs/Web/HTML/Element/Meter
 * 
 * 
 */
@Component({
  selector: 'dmj-progress-bar',
  templateUrl: 'dmj-progress-bar.html'
})
export class DmjProgressBarComponent extends DmjTextComponent {

  constructor() {
    super()
  }

  value(state: string) {
    return state.split(':')[0];
  }
  type(state: string) {
    return state.split(':')[1];
  }
  min(state: string) {
    return state.split(':')[2];
  }
  low(state: string) {
    return state.split(':')[3];
  }
  high(state: string) {
    return state.split(':')[4];
  }
  optimum(state: string) {
    return state.split(':')[5];
  }
  max(state: string) {
    return state.split(':')[6];
  }

}
