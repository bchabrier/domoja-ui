import { Component, Input, OnInit } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
import { Device, DomojaApiService } from '../../providers/domoja-api/domoja-api';

/**
 * This widget is used to display a state with multiple values. Each state value is represented with a button. 
 * When clicked, the device state changes to the label of the clicked button.
 * The color of the buttons can be specified.
 * 
 * #### Parameters:
 * `widget: "multistate:<button-labels>:<button-colors>"`
 * 
 * - `<button-states>`: a comma-separated list of the button states
 * - `<button-colors>`: a comma-separated list of the button colors
 * - `<button-labels>`: an optional comma-separated list of the button labels, displayed instead of the button state
 * 
 *  
 */
@Component({
  selector: 'dmj-multistate',
  templateUrl: 'dmj-multistate.html'
})
export class DmjMultistateComponent extends DmjWidgetComponent implements OnInit {

  @Input() states: string[];
  @Input() colors: string[];
  @Input() labels: string[];

  constructor(api: DomojaApiService) {
    super(null, api);
  }

  ngOnInit() {
    this.onArgsChange();
  }

  changeState(device: Device, state: string) {
    const prevState = this.device.state;
    device.stateChange(device, state, err => { if (err) this.device.state = prevState });
  }

  onArgsChange() {
    this.states = this.args[0] ? this.args[0].split(',') : [];
    this.colors = this.args[1] ? this.args[1].split(',') : [];
    this.labels = this.args[2] ? this.args[2].split(',') : this.states;
  }

}
