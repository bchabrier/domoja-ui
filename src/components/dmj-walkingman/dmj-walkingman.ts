import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { Device } from '../../providers/domoja-api/domoja-api';

/**
 * This widget is to be used to display presence detectors state. It represents a walking man, 
 * highlighted in red when the state of the device is `ON`. When it turns to another value,
 * the walking man fades to white progressively.
 */
@Component({
  selector: 'dmj-walkingman',
  templateUrl: 'dmj-walkingman.html',
  animations: [
    trigger('openClose', [
      state('red', style({
        backgroundColor: 'red',
        opacity: 1
      })),
      state('white', style({
        backgroundColor: 'white',
        opacity: .25
      })),
      transition('red => white', [
        animate('180s 0s cubic-bezier(0,.45,.02,.83)'),
      ])
    ])
  ]
})
export class DmjWalkingmanComponent {

  @Input() device: Device;

  constructor() { }

}
