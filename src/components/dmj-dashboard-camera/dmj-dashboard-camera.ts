import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';
import { DomojaApiService, Device } from '../../providers/domoja-api/domoja-api'
import { CameraUrlProvider } from '../../providers/camera-url/camera-url'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { computeAspectRatio, patchAspectRatio } from '../dmj-camera/dmj-camera';

@Component({
  selector: 'dmj-dashboard-camera',
  templateUrl: 'dmj-dashboard-camera.html'
})
export class DmjDashboardCameraComponent extends DmjDashboardComponent implements OnInit, OnDestroy {
  refreshInterval: number = 10000;
  camera: Device;
  cameraUrl: string;
  @Input() url: string;
  style: SafeStyle = undefined;
  devices_subscription: Subscription;
  aspectRatio: number;

  constructor(private element: ElementRef, private cameraUrlProvider: CameraUrlProvider, sanitizer: DomSanitizer, private apiService: DomojaApiService) {
    super(sanitizer);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.args.camera) {
      this.cameraUrl = `${DomojaApiService.DomojaURL}/devices/${this.args.camera}/snapshot`;
      // Safari, probably for optimization, does not trigger onload when the URL is static / cached.
      // Hence, we trigger it "manually"

      // wait for devices to be set to set the style
      this.devices_subscription = this.apiService.getDevices().subscribe((devices) => {
        if (!this.style) {
          const cameraDevices = devices.filter(d => d.path === this.args.camera);
          if (cameraDevices.length > 0) {
            const cameraDevice = cameraDevices[0];
            const cameraWidget = cameraDevice.widget;
            const aspectRatio = cameraWidget && cameraWidget.split(':')[3] || '';
            this.style = this.sanitizer.bypassSecurityTrustStyle(aspectRatio !== '' ? `width:100%;aspect-ratio:${aspectRatio};` : '');
            this.aspectRatio = computeAspectRatio(aspectRatio);

            // suppress subscription which is now of no use
            this.devices_subscription.unsubscribe();
            this.devices_subscription = null;
          }
        }
      });

      this.cameraUrlProvider.getLastFreshUrl(this.cameraUrl, (url) => { this.url = url });
      setTimeout(() => {
        this.onload();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.devices_subscription && this.devices_subscription.unsubscribe();
    this.devices_subscription = null;
  }

  onload() {
    const img = this.element.nativeElement.getElementsByTagName('img')[0] as HTMLImageElement;
    patchAspectRatio(img, this.aspectRatio);

    setTimeout(() => {
      this.cameraUrlProvider.getNewFreshUrl(this.cameraUrl, (newUrl) => { this.url = newUrl }, null);
    }, this.refreshInterval);
  }

  onerror() {
    if (!this.url) return;
  }

}
