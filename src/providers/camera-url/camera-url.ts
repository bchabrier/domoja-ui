import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

/*
  Generated class for the CameraUrlProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CameraUrlProvider {

  timedUrls: { [url: string]: string } = {};

  // fullscreen image management
  fullscreenRequester: any;
  fullscreenImageUrlSubject: BehaviorSubject<string> = new BehaviorSubject('');

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

  setFullscreenImage(requester: any, url: string) {
    this.fullscreenRequester = requester;
    this.fullscreenImageUrlSubject.next(url);
  }

  clearFullscreenImage() {
    this.fullscreenRequester = null;
    this.fullscreenImageUrlSubject.next('');
  }

  updateFullscreenImage(requester: any, url: string) {
    if (this.fullscreenRequester === requester) this.fullscreenImageUrlSubject.next(url);
  }

}
