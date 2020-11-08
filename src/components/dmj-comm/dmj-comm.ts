import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';
import { Subscription } from 'rxjs';

/**
 * Displays a communication icon when there is a communication with the server
 * 
 */
@Component({
  selector: 'dmj-comm',
  templateUrl: 'dmj-comm.html'
})
export class DmjCommComponent implements OnInit, OnDestroy {

  nbComms: number = 0;
  comms_subscription: Subscription;

  constructor(private api: DomojaApiService) {
  }

  ngOnInit() {
    this.comms_subscription = this.api.nbCommsSubject.subscribe(data => {
      if (data < this.nbComms) {
        setTimeout(() => {
          this.nbComms = data;
        }, 100);
      } else {
        this.nbComms = data;
      }
    });
  }

  ngOnDestroy() {
    this.comms_subscription.unsubscribe()
  }
}
