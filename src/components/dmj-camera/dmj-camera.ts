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
  refreshInterval: number | ''; // current refresh interval
  minRefreshInterval: number; // min refresh interval (requested in args)
  @Input() url: string;
  cameraUrl: string;
  style: SafeStyle;
  opacity: number;
  fullscreenRequested: boolean = false;

  constructor(private cameraUrlProvider: CameraUrlProvider, private sanitizer: DomSanitizer, public api: DomojaApiService) {
    super(null, api);
  }

  ngOnInit() {
    // args: [type:'snapshot' | 'stream', refreshInterval:number, aspectRatio: string (e.g.: 16/9)]

    const aspectRatio = this.args[2] || '';
    this.style = this.sanitizer.bypassSecurityTrustStyle(aspectRatio !== '' ? `width:100%;aspect-ratio:${aspectRatio};` : '');
    this.opacity = 1;

    this.minRefreshInterval = this.args && Number(this.args[1]);
    if (!isNaN(this.minRefreshInterval)) this.minRefreshInterval = 0;

    if (this.args[0] == 'snapshot') {
      this.mode = 'snapshot';
      this.refreshInterval = this.imageSize === 'tiny' ? 10000 : 0;
      this.refreshInterval = Math.max(this.minRefreshInterval, this.refreshInterval);
    } else {
      if (this.imageSize === 'tiny') {
        this.mode = 'snapshot';
        this.refreshInterval = 10000;
        this.refreshInterval = Math.max(this.minRefreshInterval, this.refreshInterval);
      } else {
        this.mode = 'stream';
      }
    }

    this.cameraUrl = `${DomojaApiService.DomojaURL}/devices/${this.device.path}/${this.mode}`;
    if (this.mode == 'snapshot') {
      this.cameraUrlProvider.getLastFreshUrl(this.cameraUrl, (url, errCount) => {
        this.url = url;
        this.opacity = this.computeOpacity(errCount);
      });
      // Safari, probably for optimization, does not trigger onload when the URL is static / cached.
      // Hence, we trigger it "manually"
      setTimeout(() => {
        this.onload();
      }, 0);
    } else {
      this.url = this.cameraUrl;
    }
    this.cameraUrlProvider.updateFullscreenImage(this, this.url, this.style);
  }

  onload() {
    if (this.mode == 'snapshot' && this.refreshInterval !== '' && this.refreshInterval !== undefined) {

      const refreshInterval = this.isInFullScreenMode() ? this.minRefreshInterval : this.refreshInterval;

      this.cameraUrlProvider.updateFullscreenImage(this, this.url, this.style);
      //this.cameraUrlProvider.setAsLoadedTimedUrl(this.cameraUrl, this.url)
      setTimeout(() => {
        //this.updateUrl();
        this.cameraUrlProvider.getNewFreshUrl(this.cameraUrl,
          newUrl => { this.opacity = 1; this.url = newUrl },
          errCount => { this.opacity = this.computeOpacity(errCount) }
        );
      }, refreshInterval);
    }
    this.fullscreenRequested = false;
  }

  onerror() {
    console.error('error')
  }

  onclick() {
    const divElement = document.getElementById('fullscreen-div');
    const imgElement = divElement.querySelector('img');
    imgElement.src = this.url; // change url immediately

    this.cameraUrlProvider.getLastFreshUrl(this.cameraUrl, (url) => {
      this.cameraUrlProvider.setFullscreenImage(this, url, this.style);
    });
    ;
    this.fullscreenRequested = true;
    this.onload();
  }

  computeOpacity(errCount: number) {
    return Math.max(this.opacity * .95 ** errCount, 0.4);
  }

  isInFullScreenMode(): boolean {
    const divElement = document.getElementById('fullscreen-div');
    const imgElement = divElement.querySelector('img');
    return this.fullscreenRequested || (divElement.classList.contains('visible') && imgElement.src.startsWith(this.cameraUrlProvider.getOriginalUrl(this.cameraUrl)));
  }

}
