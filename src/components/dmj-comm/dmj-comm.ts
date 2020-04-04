import { Component } from '@angular/core';
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';

/**
 * Generated class for the DmjCommComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dmj-comm',
  templateUrl: 'dmj-comm.html'
})
export class DmjCommComponent {

  nbComms: number = 0;

  constructor(private api: DomojaApiService) {

    this.api.nbCommsSubject.subscribe(data => {
      if (data < this.nbComms) {
        setTimeout(() => {
          this.nbComms = data;
        }, 100);
      } else {
        this.nbComms = data;
      }
    });
  }
}
