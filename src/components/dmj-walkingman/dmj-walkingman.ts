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
 * Generated class for the DmjWalkingmanComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
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
