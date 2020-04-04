import { Component, OnInit } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';

@Component({
  selector: 'dmj-dashboard-camera',
  templateUrl: 'dmj-dashboard-camera.html'
})
export class DmjDashboardCameraComponent extends DmjDashboardComponent implements OnInit {
  refreshInterval: string = '1000';

  constructor() {
    super();
  }

  ngOnInit() {
    this.args.url += this.args.url.indexOf('?') >= 0 ? '&' : '?';
    this.args.url += 't=';
  }
  
  updateUrl() {
    var t = Date.now();
    this.args.url = this.args.url.substring(0, this.args.url.lastIndexOf("t=") + 2) + t;
  }

  onload() {
    if (this.refreshInterval != '' && this.refreshInterval != undefined) {
      setTimeout(() => {
        this.updateUrl();
      }, parseInt(this.refreshInterval));
    }
  }

  onerror() {
    setTimeout(() => {
      this.updateUrl();
    }, 5000);
  }

}
