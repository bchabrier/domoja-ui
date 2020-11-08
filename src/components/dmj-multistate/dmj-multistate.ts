import { Component, Input, OnInit } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
import { Device } from '../../providers/domoja-api/domoja-api';

/**
 * This widget is used to display a state with multiple values. Each state value is represented with a button. 
 * When clicked, the device state changes to the label of the clicked button.
 * The color of the buttons can be specified.
 * 
 * #### Parameters:
 * `widget: "multistate:<button-labels>:<button-colors>"`
 * 
 * - `<button-labels>`: a comma-separated list of the button labels
 * - `<button-colors>`: a comma-separated list of the button colors
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

  constructor() {
    super(null);
  }

  ngOnInit() {
    this.states = this.args[0] ? this.args[0].split(',') : []
    this.colors = this.args[1] ? this.args[1].split(',') : []
  }

  changeState(device: Device, state: string) {
    device.stateChange(device, state);
  }

}
