import { Component, Input, OnInit } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
import { Device } from '../../providers/domoja-api/domoja-api';

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
