import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { SafeStyle } from '@angular/platform-browser';

type callback = (newUrl: string) => void;

/*
  Generated class for the CameraUrlProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CameraUrlProvider {

  timedUrls: {
    [url: string]: {
      url: string, // last known timed url
      reloading: boolean, // true if we are trying to get a new url
      callbacks: callback[], // callbacks to call when reloading is completed
      img: HTMLImageElement, // img used to reload urls
      errorCount: number, // number of consecutive load errors
    }
  } = {};

  // fullscreen image management
  fullscreenRequester: any;
  fullscreenImageUrlSubject: BehaviorSubject<{ url: string, style: SafeStyle }> = new BehaviorSubject({ url: '', style: '' });

  constructor() {
    //console.log('Hello CameraUrlProvider Provider');
  }

  /**
   * returns a new timed url
   * @param url 
   * @returns 
   */
  private getNewTimedUrl(url: string): string {
    if (!url) return url;
    let timedUrl = url;
    timedUrl += timedUrl.indexOf('?') >= 0 ? '&' : '?';
    timedUrl += "t=" + Date.now();
    return timedUrl;
  }

  /**
   * returns the orginal url of a (timed) url
   * @param timedUrl 
   * @returns 
   */
  public getOriginalUrl(timedUrl: string): string {
    if (!timedUrl) return timedUrl;
    return timedUrl.replace(/\?t=[0-9]+$/, '')
  }

  setFullscreenImage(requester: any, url: string, style: SafeStyle) {
    this.fullscreenRequester = requester;
    this.fullscreenImageUrlSubject.next({ url, style });
  }

  clearFullscreenImage() {
    this.fullscreenRequester = null;
    this.fullscreenImageUrlSubject.next({ url: '', style: '' });
  }

  updateFullscreenImage(requester: any, url: string, style: SafeStyle) {
    if (this.fullscreenRequester === requester) this.fullscreenImageUrlSubject.next({ url, style });
  }

  /**
   * returns an existing timed url (hopefully the last url used) for this camera, or a new one
   * @param url 
   * @returns 
   */
  getLastFreshUrl(url: string, callback: callback) {
    if (!this.timedUrls[url] || !this.timedUrls[url].url) {
      return this.getNewFreshUrl(url, callback);
    } else {
      callback(this.timedUrls[url].url);
    }
  }

  /**
   * returns a new timed url for this camera
   * @param url 
   * @returns 
   */
  getNewFreshUrl(url: string, callback: callback, onerror: (errCount: number) => void = null) {
    if (!this.timedUrls[url])
      this.timedUrls[url] = {
        url: undefined,
        reloading: false,
        callbacks: [],
        img: document.createElement('img'),
        errorCount: 0,
      };
    if (this.timedUrls[url].callbacks.indexOf(callback) === -1)
      this.timedUrls[url].callbacks.push(callback);

    if (!this.timedUrls[url].reloading) {
      const newUrl = this.getNewTimedUrl(url);
      this.timedUrls[url].reloading = true;

      // if first time we get a new url, call the callbacks immediately,
      // else wait for the url to be loaded before calling the callbacks
      if (!this.timedUrls[url].url) {
        this.timedUrls[url].url = newUrl;
        this.timedUrls[url].callbacks.forEach(c => c(newUrl));
        this.timedUrls[url].callbacks = [];
      }

      this.timedUrls[url].img.onload = () => {
        this.timedUrls[url].url = newUrl;
        this.timedUrls[url].callbacks.forEach(c => c(newUrl));
        this.timedUrls[url].callbacks = [];
        this.timedUrls[url].reloading = false;
        this.timedUrls[url].errorCount = 0;
      };

      const errorHandler = () => {
        this.timedUrls[url].reloading = false;
        this.timedUrls[url].errorCount++;
        if (onerror) onerror(this.timedUrls[url].errorCount);
        setTimeout(() => this.getNewFreshUrl(url, callback), this.timedUrls[url].errorCount < 5 ? 0 : 5000);
      };
      
      this.timedUrls[url].img.onerror = errorHandler;
      this.timedUrls[url].img.onabort = errorHandler;
      this.timedUrls[url].img.onemptied = errorHandler;
      this.timedUrls[url].img.onstalled = errorHandler;
      this.timedUrls[url].img.onsuspend = errorHandler;
      this.timedUrls[url].img.onwaiting = errorHandler;

      this.timedUrls[url].img.src = newUrl;

    }
  }

}
