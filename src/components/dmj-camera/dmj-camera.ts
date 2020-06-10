import { Component, OnInit, Input } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
import { CameraUrlProvider } from '../../providers/camera-url/camera-url'
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';

/**
 * Generated class for the DmjCameraComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dmj-camera',
  templateUrl: 'dmj-camera.html'
})
export class DmjCameraComponent extends DmjWidgetComponent implements OnInit {
  mode: 'snapshot' | 'stream';
  refreshInterval: number | '';
  @Input() url: string;
  cameraUrl: string;

  constructor(private cameraUrlProvider: CameraUrlProvider) {
    super(null);
  }

  ngOnInit() {
    // args: [type:'snapshot' | 'stream', refreshInterval:number]
    if (this.args[0] == 'snapshot') {
      this.mode = 'snapshot';
      this.refreshInterval = (this.imageSize == 'tiny') ? 10000 : 0;
      let maxRefreshInterval = this.args && Number(this.args[1]);
      if (!isNaN(maxRefreshInterval)) {
        this.refreshInterval = Math.max(maxRefreshInterval, this.refreshInterval);
      }
    } else {
      if (this.imageSize == 'tiny') {
        this.mode = 'snapshot';
        this.refreshInterval = 10000;
      } else {
        this.mode = 'stream';
      }
    }
    this.cameraUrl = `${DomojaApiService.DomojaURL}/devices/${this.device.path}/${this.mode}`;
    if (this.mode == 'snapshot') {
      this.url = this.cameraUrlProvider.getTimedUrl(this.cameraUrl);
      // Safari, probably for optimization, does not trigger onload when the URL is static / cached.
      // Hence, we trigger it "manually"
      setTimeout(() => {
        this.onload();
      }, 0);
    } else {
      this.url = this.cameraUrl;
    }
  }

  updateUrl() {
    if (this.mode == 'snapshot') {
      this.url = this.cameraUrlProvider.getNewTimedUrl(this.cameraUrl);
    }
  }

  onload() {
    if (this.mode == 'snapshot' && this.refreshInterval !== '' && this.refreshInterval !== undefined) {
      this.cameraUrlProvider.setAsLoadedTimedUrl(this.cameraUrl, this.url)
      setTimeout(() => {
        this.updateUrl();
      }, this.refreshInterval);
    }
  }

  onerror() {
    setTimeout(() => {
      this.updateUrl();
    }, 5000);
  }


}
