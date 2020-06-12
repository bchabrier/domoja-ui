import { Injectable } from '@angular/core';

/*
  Generated class for the CameraUrlProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CameraUrlProvider {

  timedUrls: { [url: string]: string } = {};

  constructor() {
    //console.log('Hello CameraUrlProvider Provider');
  }

  // returns an existing timed url (hopfully the last url used) for this camera, or a new one
  getTimedUrl(url: string): string {
    return this.timedUrls[url] || this.getNewTimedUrl(url);
  }

  // returns a new timed url
  getNewTimedUrl(url: string): string {
    if (!url) return url;
    let timedUrl = url;
    timedUrl += timedUrl.indexOf('?') >= 0 ? '&' : '?';
    timedUrl += "t=" + Date.now();
    return timedUrl;
  }

  // store the timed url as the one loaded
  setAsLoadedTimedUrl(url: string, timedUrl: string) {
    let prev_timedUrl = this.timedUrls[url];
    if (prev_timedUrl) {
      let prev_t = parseInt(prev_timedUrl.replace(/.*t=/, ""));
      let t = parseInt(timedUrl.replace(/.*t=/, ""));
      if (t < prev_t) return;
    }
    this.timedUrls[url] = timedUrl;
  }

}
