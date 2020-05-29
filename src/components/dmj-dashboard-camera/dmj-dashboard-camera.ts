import { Component, OnInit } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';
import { DomojaApiService, Device } from '../../providers/domoja-api/domoja-api'

@Component({
  selector: 'dmj-dashboard-camera',
  templateUrl: 'dmj-dashboard-camera.html'
})
export class DmjDashboardCameraComponent extends DmjDashboardComponent implements OnInit {
  refreshInterval: string = '10000';
  camera: Device;

  constructor() {
    super();
  }

  ngOnInit() {
    if (this.args.camera) {
      this.args.url = `${DomojaApiService.DomojaURL}/devices/${this.args.camera}/snapshot`;
    }
    if (!this.args.url || this.args.url == "") {
      this.args.url += this.args.url.indexOf('?') >= 0 ? '&' : '?';
      this.args.url += 't=';
    }
  }

  updateUrl() {
    if (!this.args.url) return;
    var t = Date.now();
    this.args.url = this.args.url.substring(0, this.args.url.lastIndexOf("t=") + 2) + t;
  }

  onload() {
    if (!this.args.url) return;
    if (this.refreshInterval != '' && this.refreshInterval != undefined) {
      setTimeout(() => {
        this.updateUrl();
      }, parseInt(this.refreshInterval));
    }
  }

  onerror() {
    if (!this.args.url) return;
    setTimeout(() => {
      this.updateUrl();
    }, 5000);
  }

}
