import { Component, OnInit, Input } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
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

  constructor() {
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
      this.url = `${DomojaApiService.DomojaURL}/devices/${this.device.path}/${this.mode}`;
      this.url += this.url.indexOf('?') >= 0 ? '&' : '?';
      this.url += 't=';
    } else {
      if (this.imageSize == 'tiny') {
        this.mode = 'snapshot';
        this.refreshInterval = 10000;  
      } else {
        this.mode = 'stream';
      }
    }
    this.url = `${DomojaApiService.DomojaURL}/devices/${this.device.path}/${this.mode}`;
    if (this.mode == 'snapshot') {
      this.url += this.url.indexOf('?') >= 0 ? '&' : '?';
      this.url += 't=';
    }
  }

  updateUrl() {
    if (this.mode == 'snapshot') {
      var t = Date.now();
      this.url = this.url.substring(0, this.url.lastIndexOf("t=") + 2) + t;
    }
  }

  onload() {
    if (this.mode == 'snapshot' && this.refreshInterval !== '' && this.refreshInterval !== undefined) {
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
