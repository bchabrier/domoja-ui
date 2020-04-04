import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { of } from 'rxjs/observable/of';
import { WebsocketService } from '../websocket/websocket';
//import { message } from '../../../../domoja/core/sources/source';

type message = any;

function deviceStateChange(device: Device, value: string) {
  console.log(device, value);
  device.api.setDeviceState(device, value);
}


export type Device = {
  name: string,
  id: string,
  path: string,
  tags: string,
  state: string | Date,
  UpdateDate: string | Date,
  widget: string,

  stateChange: (device: Device, value: string) => void,
  api: DomojaApiService,
}

export type Page = {
  name: string,
  menuItem: string,
  title: string,
  page: string,
  args: { [key: string]: any }
}

export type App = {
  demoMode: boolean,
  nbWebockets: number,
  nbWebsocketsHTTP: number,
  nbWebsocketsHTTPS: number,
  startTime: Date,
}

function isDate(value: string | Date) {
  return value instanceof Date || (
    typeof value === 'string' && (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) || /\d{2}:\d{2}:\d{2} GMT/.test(value))
  )
}


@Injectable()
export class DomojaApiService {

  DomojaURL = 'http://192.168.0.10:4001';

  private devices: Array<Device>;
  private devicesByPath: Array<Device> = [];
  private pages: Array<Page> = [];
  private app: App;
  private events: Subject<message>;
  private authentified = undefined;
  private devicesObservable: BehaviorSubject<Array<Device>> = new BehaviorSubject(this.devices);
  private pagesObservable: BehaviorSubject<Array<Page>> = new BehaviorSubject(this.pages);
  private appObservable: BehaviorSubject<App> = new BehaviorSubject(this.app);
  private nbComms: number = 0;
  nbCommsSubject: BehaviorSubject<number> = new BehaviorSubject(this.nbComms);
  private keptEvents: Array<message> = [];
  private authentifiedObservable: BehaviorSubject<boolean> = new BehaviorSubject(this.authentified);

  constructor(public http: HttpClient, wsService: WebsocketService) {
    //console.log('Hello DomojaApiService Provider');

    // create the websocket observable
    this.events = <Subject<message>>wsService
      .connect(this.DomojaURL);

    // register to get the websocket updates
    this.events.subscribe((event: message) => {
      if (event.type == 'reload') {
        // force a reload
        return this.loadAll();
      }
      if (event.demoMode != undefined) {
        // an app change event
        event.startTime = new Date(event.startTime);
        return this.appObservable.next(event);
      }
      this.nbComms++;
      this.nbCommsSubject.next(this.nbComms);
      this.applyEvent(event);
      this.devicesObservable.next(this.devices);
      this.nbComms--;
      this.nbCommsSubject.next(this.nbComms);
    });

    this.loadAll();

  }

  private loadAll() {
    this.loadPagesFromAPI(this.pagesObservable);
    this.loadDevicesFromAPI(this.devicesObservable);
    this.loadAppFromAPI(this.appObservable);
  }


  private loadFromAPI<thing>(path: string, observer: Subject<thing>, transform?: (ret: thing) => thing) {
    this.nbComms++
    this.nbCommsSubject.next(this.nbComms);
    this.http.get(`${this.DomojaURL}${path}`, { withCredentials: true }).subscribe(res => {
      if (this.authentified != true) {
        this.authentified = true;
        this.authentifiedObservable.next(true);
      }
      let ret: thing = <any>res;
      let noop: (ret: thing) => thing = (ret: thing) => ret;
      let tsf = transform || noop;
      observer.next(tsf(ret));
      this.nbComms--
      this.nbCommsSubject.next(this.nbComms);
    },
      err => {
        this.nbComms--
        this.nbCommsSubject.next(this.nbComms);
        if (err.status != 200) {
          if (err.status == 401) {
            if (this.authentified != false) {
              this.authentified = false;
              this.authentifiedObservable.next(false);
            }
          }
          console.error(err.message);
          //observer.error(err);
          //observer.hasError = false;
          //observer.isStopped = false;
          //throw (err);
        }
      })
  }

  setValue(path: string, command: string, value: string, callback: (err: Error) => void) {
    this.setValues(path, [command], [value], callback);
  }

  setValues(path: string, commands: string[], values: string[], callback: (err: Error) => void) {
    this.nbComms++
    this.nbCommsSubject.next(this.nbComms);
    let body = ''
    for (let i = 0; i < commands.length; i++) {
      body += `${commands[i]}=${values[i]}&`;
    }
    return this.http.post(`${this.DomojaURL}${path}`, body,
      {
        withCredentials: true,
        headers: {
          'accept': 'text/html',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).subscribe(
        res => {
          // never called because content is not parseable
          console.log('POST done')
          if (this.authentified != true) {
            this.authentified = true;
            this.authentifiedObservable.next(true);
          }
          this.nbComms--
          this.nbCommsSubject.next(this.nbComms);
        },
        err => {
          this.nbComms--
          this.nbCommsSubject.next(this.nbComms);

          if (err.status == 401 || err.error.text.match(/\/login.html/)) {
            if (this.authentified != false) {
              this.authentified = false;
              this.authentifiedObservable.next(false);
            }
          } else {
            if (this.authentified != true) {
              this.authentified = true;
              this.authentifiedObservable.next(true);
            }
          }
          if (err.status != 200 || (err.status == 200 && (err.error.text.match(/\/login.html/) || err.error.text != 'OK'))) {
            let errmsg = `${err.status} - ${err.statusText}`;
            console.log(errmsg);
            callback(err);
          } else {
            callback(null);
          }
        }
      );
  }

  applyEvent(event: message) {
    console.log(event);
    if (!this.devicesByPath || !this.devicesByPath[event.id]) {
      this.keptEvents.push(event);
    } else {
      let eventDate = new Date(event.date)
      if (this.devicesByPath[event.id].UpdateDate < eventDate) {
        this.devicesByPath[event.id].state = isDate(event.newValue) ? new Date(event.newValue) : event.newValue
        this.devicesByPath[event.id].UpdateDate = eventDate;
      }
    }
  }

  private loadDevicesFromAPI(observer: BehaviorSubject<Array<Device>>) {
    this.getDevicesFromAPI().subscribe(devices => {
      this.devices = devices;
      this.devicesByPath = [];
      this.devices.forEach(d => {
        this.devicesByPath[d.path] = d;
        d.stateChange = deviceStateChange;
        d.api = this;
      })
      // apply kept events if any
      this.keptEvents.forEach(ev => this.applyEvent(ev));
      this.keptEvents = [];
      observer.next(this.devices);
    });
  }

  getDevicesFromAPI(): Observable<Array<Device>> {
    this.nbComms++
    this.nbCommsSubject.next(this.nbComms);
    return this.http.get(`${this.DomojaURL}/devices`, { withCredentials: true }).catch((err, caught) => {
      return of([]);
    }).map(res => {
      console.log('done real API call');
      let ret: Array<Device> = <any>res;
      (<any>res).forEach(element => {
        let state = element.state;
        if (isDate(state)) {
          // restore dates to real dates
          element.state = new Date(state);
        }
        element.UpdateDate = new Date(element.UpdateDate ? element.UpdateDate : null);
        ret[element.path] = element;
      });
      this.nbComms--
      this.nbCommsSubject.next(this.nbComms);
      return ret;
    });
  }

  getDevices(): Observable<Array<Device>> {
    return this.devicesObservable;
  }

  setDeviceState(device: Device, state: string) {
    this.setValue(`/devices/${device.path}`, 'command', state, (err) => { });
  }

  private loadPagesFromAPI(observer: BehaviorSubject<Array<Page>>) {
    return this.loadFromAPI('/pages', observer);
  }

  getAuthentified(): Observable<boolean> {
    return this.authentifiedObservable;
  }

  getPages(): Observable<Array<Page>> {
    return this.pagesObservable;
  }

  private loadAppFromAPI(observer: BehaviorSubject<App>) {
    return this.loadFromAPI('/app', observer, app => {
      app.startTime = new Date(app.startTime);
      return app;
    });
  }




  setAppDemoMode(value: boolean) {
    this.setValue('/app/demo-mode', 'value', value.toString(), (err) => { });
  }

  getApp(): Observable<App> {
    return this.appObservable;
  }

  login(username: string, password: string, remember_me: boolean, callback: (err: Error) => void) {
    this.setValues(`/login.html`, ['username', 'password', 'remember_me'], [username, password, remember_me.toString()], (err) => {
      if (!this.authentified) {
        callback(new Error('Identification erronée'));
      } else {
        // force reload 
        this.loadAll();
        callback(null);
      }
    });
  }
}



