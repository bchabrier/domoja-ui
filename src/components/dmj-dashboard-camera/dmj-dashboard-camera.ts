import { Component, OnInit } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';
import { DomojaApiService, Device } from '../../providers/domoja-api/domoja-api'
import { CameraUrlProvider } from '../../providers/camera-url/camera-url'

@Component({
  selector: 'dmj-dashboard-camera',
  templateUrl: 'dmj-dashboard-camera.html'
})
export class DmjDashboardCameraComponent extends DmjDashboardComponent implements OnInit {
  refreshInterval: number = 10000;
  camera: Device;
  cameraUrl: string;

  constructor(private cameraUrlProvider: CameraUrlProvider) {
    super();
  }

  ngOnInit() {
    if (this.args.camera) {
      this.cameraUrl = `${DomojaApiService.DomojaURL}/devices/${this.args.camera}/snapshot`;
      this.args.url = this.cameraUrlProvider.getTimedUrl(this.cameraUrl);
    }
  }

  updateUrl() {
    if (!this.args.url) return;
    this.args.url = this.cameraUrlProvider.getNewTimedUrl(this.cameraUrl);
  }

  onload() {
    if (!this.args.url) return;
    this.cameraUrlProvider.setAsLoadedTimedUrl(this.cameraUrl, this.args.url)
    setTimeout(() => {
      this.updateUrl();
    }, this.refreshInterval);
  }

  onerror() {
    if (!this.args.url) return;
    setTimeout(() => {
      this.updateUrl();
    }, 5000);
  }

}
