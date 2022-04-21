import { Component, OnInit, Input } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
import { CameraUrlProvider } from '../../providers/camera-url/camera-url'
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

/**
 * Displays a camera.
 * 
 * Supports several arguments:
 * type:refreshInterval:aspectRatio
 * 
 * - type is 'snapshot' or 'stream'
 * - refreshInterval is in ms
 * - aspectRatio is used to force an aspect ratio for the video/image (e.g. 16/9)
 * 
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
  style: SafeStyle;

  constructor(private cameraUrlProvider: CameraUrlProvider, private sanitizer: DomSanitizer) {
    super(null);
  }

  ngOnInit() {
    // args: [type:'snapshot' | 'stream', refreshInterval:number, aspectRatio: string (e.g.: 16/9)]

    const aspectRatio = this.args[2] || '';
    this.style = this.sanitizer.bypassSecurityTrustStyle(aspectRatio !== '' ? `width:100%;aspect-ratio:${aspectRatio};` : '');

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
      this.cameraUrlProvider.updateFullscreenImage(this, this.url, this.style);
      // Safari, probably for optimization, does not trigger onload when the URL is static / cached.
      // Hence, we trigger it "manually"
      setTimeout(() => {
        this.onload();
      }, 0);
    } else {
      this.url = this.cameraUrl;
      this.cameraUrlProvider.updateFullscreenImage(this, this.url, this.style);
    }
  }

  updateUrl() {
    if (this.mode == 'snapshot') {
      this.url = this.cameraUrlProvider.getNewTimedUrl(this.cameraUrl);
    }
  }

  onload() {
    if (this.mode == 'snapshot' && this.refreshInterval !== '' && this.refreshInterval !== undefined) {
      this.cameraUrlProvider.updateFullscreenImage(this, this.url, this.style);
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

  onclick() {
    this.cameraUrlProvider.setFullscreenImage(this, this.cameraUrlProvider.getTimedUrl(this.cameraUrl), this.style);
  }


}
