import { Component, OnInit, Input } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';

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
  refreshInterval: string;
  @Input() url: string;

  constructor() {
    super(null);
  }

  ngOnInit() {
    this.mode = this.args[0] == 'snapshot' ? 'snapshot' : 'stream';
    this.refreshInterval = this.args[1];
    this.url = this.device.id;
    this.url += this.url.indexOf('?') >= 0 ? '&' : '?';
    this.url += 't=';
  }

  updateUrl() {
    var t = Date.now();
    this.url = this.url.substring(0, this.url.lastIndexOf("t=") + 2) + t;
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
