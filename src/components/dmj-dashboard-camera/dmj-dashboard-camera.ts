import { Component, Input, OnInit } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';
import { DomojaApiService, Device } from '../../providers/domoja-api/domoja-api'
import { CameraUrlProvider } from '../../providers/camera-url/camera-url'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'dmj-dashboard-camera',
  templateUrl: 'dmj-dashboard-camera.html'
})
export class DmjDashboardCameraComponent extends DmjDashboardComponent implements OnInit {
  refreshInterval: number = 10000;
  camera: Device;
  cameraUrl: string;
  @Input() url: string;
  style: SafeStyle = undefined;

  constructor(private cameraUrlProvider: CameraUrlProvider, sanitizer: DomSanitizer) {
    super(sanitizer);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.args.camera) {
      this.cameraUrl = `${DomojaApiService.DomojaURL}/devices/${this.args.camera}/snapshot`;
      this.url = this.cameraUrlProvider.getTimedUrl(this.cameraUrl);
      // Safari, probably for optimization, does not trigger onload when the URL is static / cached.
      // Hence, we trigger it "manually"
      setTimeout(() => {
        this.onload();
        this.updateUrl();
      }, 0);
    }
  }

  updateUrl() {
    if (this.style === undefined) {
      const cameraDevice = this.devices.get(this.args.camera);
      if (cameraDevice !== undefined) {
        const cameraWidget = cameraDevice.widget;
        const aspectRatio = cameraWidget && cameraWidget.split(':')[3] || '';
        this.style = this.sanitizer.bypassSecurityTrustStyle(aspectRatio !== '' ? `width:100%;aspect-ratio:${aspectRatio};` : '');
      }
    }
    if (!this.url) return;
    this.url = this.cameraUrlProvider.getNewTimedUrl(this.cameraUrl);
  }

  onload() {
    if (!this.url) return;
    this.cameraUrlProvider.setAsLoadedTimedUrl(this.cameraUrl, this.url)
    setTimeout(() => {
      this.updateUrl();
    }, this.refreshInterval);
  }

  onerror() {
    if (!this.url) return;
    setTimeout(() => {
      this.updateUrl();
    }, 5000);
  }

}
