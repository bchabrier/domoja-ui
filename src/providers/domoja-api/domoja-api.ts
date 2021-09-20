import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';
import { tap } from 'rxjs/operators';
import { WebsocketService } from '../websocket/websocket';
//import { message } from '../../../../domoja/core/sources/source';

type message = any;

function deviceStateChange(device: Device, value: string, callback: (err: Error) => void) {
  console.log(device, value);
  device.api.setDeviceState(device, value, callback);
}

const timeout = 10000; //10s
class connectionNotification {
  static connections: {
    notif: connectionNotification,
    timeout: number
  }[] = [];

  constructor(private api: DomojaApiService) {
    connectionNotification.connections.push({
      notif: this,
      timeout: setTimeout(() => {
        this.api.notifyConnectionClosed(this);
      }, timeout)
    });
  }
  close() {
    const thisIndex = connectionNotification.connections.findIndex(cn => cn.notif === this);
    if (thisIndex > -1) {
      const thisKept = connectionNotification.connections[thisIndex];
      clearTimeout(thisKept.timeout);
      connectionNotification.connections.splice(thisIndex, 1);
    } else {
      // connectionNotification already deleted, probably because the timeout occurred before
      // programmed close()
      //console.error('Warning, non existent connectionNotification. Did you call notifyConnectionStarted()?');
    }
  }
};

export type Device = {
  name: string,
  id: string,
  path: string,
  tags: string,
  state: string | Date,
  UpdateDate: string | Date,
  widget: string,
  source: string,

  stateChange: (device: Device, value: string, callback: (err: Error) => void) => void,
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
    typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || /\d{2}:\d{2}:\d{2} GMT/.test(value)) && (new Date(value)).toString() != "Invalid Date"
  )
}


@Injectable()
export class DomojaApiService {

  public static DomojaURL = 'https://domo.bchabrier.com'; // set to window.location.origin if the UI use the same URL as Domoja

  private devices: Array<Device> = [];
  private devicesByPath: Array<Device> = [];
  private pages: Array<Page> = [];
  private app: App = {
    demoMode: false,
    nbWebockets: 0,
    nbWebsocketsHTTPS: 0,
    nbWebsocketsHTTP: 0,
    startTime: new Date
  };
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
      .connect(DomojaApiService.DomojaURL);

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
      const notify = this.notifyConnectionStarted();
      this.applyEvent(event);
      this.devicesObservable.next(this.devices);
      this.notifyConnectionClosed(notify);
    });

    this.loadAll();

  }

  private loadAll() {
    this.loadPagesFromAPI(this.pagesObservable);
    this.loadDevicesFromAPI(this.devicesObservable);
    this.loadAppFromAPI(this.appObservable);
  }


  private loadFromAPI<thing>(path: string, observer: Subject<thing>, transform?: (ret: thing) => thing) {
    const notify = this.notifyConnectionStarted();
    this.http.get(`${DomojaApiService.DomojaURL}${path}`, { withCredentials: true }).pipe(
      this.notifyConnectionClosedOperator(notify)
    ).subscribe(res => {
      if (this.authentified != true) {
        this.authentified = true;
        this.authentifiedObservable.next(true);
      }
      let ret: thing = <any>res;
      let noop: (ret: thing) => thing = (ret: thing) => ret;
      let tsf = transform || noop;
      observer.next(tsf(ret));
    },
      err => {
        if (err.status != 200) {
          if (err.status == 401) {
            if (this.authentified != false) {
              this.authentified = false;
              this.authentifiedObservable.next(false);
            }
          }
          console.error('Error with GET', `${DomojaApiService.DomojaURL}${path}` + ':', err.message);
          //observer.error(err);
          //observer.hasError = false;
          //observer.isStopped = false;
          //throw (err);
        }
      })
  }

  /**
   * 
   * An operator that checks if the user is authentified. 
   * If not, then a redirect to the login page will occur
   * 
   * @returns the operator 
   */
  checkAuthentifiedOperator() {
    return tap(res => {
      console.log(res);
      if (this.authentified != true) {
        this.authentified = true;
        this.authentifiedObservable.next(true);
      }
    },
      err => {
        console.error(err);
        if (this.authentified != false) {
          this.authentified = false;
          this.authentifiedObservable.next(false);
        }
      });
  }

  /**
   * To be used when initiating a connection to the api
   * 
   * @returns a connection notification to be passesd to notifyConnectionClosed
   */
  notifyConnectionStarted(): connectionNotification {
    this.nbComms++;
    this.nbCommsSubject.next(this.nbComms);
    return new connectionNotification(this);
  }

  notifyConnectionClosed(notif: connectionNotification) {
    notif.close();
    this.nbComms--;
    this.nbCommsSubject.next(this.nbComms);
  }

  notifyConnectionClosedOperator(notif: connectionNotification) {
    const notify = () => {
      this.notifyConnectionClosed(notif);
    }
    return tap(notify, notify);
  }

  setValue(path: string, command: string, value: string, callback: (err: Error) => void) {
    this.setValues(path, [command], [value], callback);
  }

  setValues(path: string, commands: string[], values: string[], callback: (err: Error) => void) {
    const notif = this.notifyConnectionStarted();
    let body = ''
    for (let i = 0; i < commands.length; i++) {
      body += `${commands[i]}=${values[i]}&`;
    }
    return this.http.post(`${DomojaApiService.DomojaURL}${path}`, body,
      {
        withCredentials: true,
        headers: {
          'accept': 'text/html',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        responseType: 'text'
      }).pipe(
        this.checkAuthentifiedOperator(),
        this.notifyConnectionClosedOperator(notif),
      ).subscribe(
        res => {
          console.log('POST done')
          callback(null);
        },
        err => {
          let errmsg = `${err.status} - ${err.statusText}`;
          console.error(errmsg);
          callback(err);
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
    const notif = this.notifyConnectionStarted()
      ; return this.http.get(`${DomojaApiService.DomojaURL}/devices`, { withCredentials: true }).catch((err, caught) => {
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
        this.notifyConnectionClosed(notif);
        return ret;
      });
  }

  getDevices(): Observable<Array<Device>> {
    return this.devicesObservable;
  }

  getCurrentDevices(): Device[] {
    return this.devices;
  }

  setDeviceState(device: Device, state: string, callback: (err: Error) => void) {
    const prevState = device.state;
    this.setValue(`/devices/${device.path}`, 'command', state, callback);
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



