import { inspect } from 'util';

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomojaApiService } from '../providers/domoja-api/domoja-api';
import { WebsocketService } from '../providers/websocket/websocket';
import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageComponentsProvider } from '../providers/page-components/page-components';
import { PageListProvider } from '../providers/page-list/page-list';
import { CameraUrlProvider } from '../providers/camera-url/camera-url';
import { DmjWidgetComponent } from '../components/dmj-widget';
//: # (ImportPageComponents START)    
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
//: # (ImportPageComponents END)    
//: # (ImportWidgetComponents START)    
import { DmjCameraComponent } from '../components/dmj-camera/dmj-camera';
import { DmjColorComponent } from '../components/dmj-color/dmj-color';
import { DmjCommComponent } from '../components/dmj-comm/dmj-comm';
import { DmjConfirmComponent } from '../components/dmj-confirm/dmj-confirm';
import { DmjDashboardCameraComponent } from '../components/dmj-dashboard-camera/dmj-dashboard-camera';
import { DmjDashboardIconComponent } from '../components/dmj-dashboard-icon/dmj-dashboard-icon';
import { DmjDashboardTempoComponent } from '../components/dmj-dashboard-tempo/dmj-dashboard-tempo';
import { DmjGraph } from '../components/dmj-graph/dmj-graph';
import { DmjInputComponent } from '../components/dmj-input/dmj-input';
import { DmjLinkComponent } from '../components/dmj-link/dmj-link';
import { DmjMultistateComponent } from '../components/dmj-multistate/dmj-multistate';
import { DmjProgressBarComponent } from '../components/dmj-progress-bar/dmj-progress-bar';
import { DmjTempGraph } from '../components/dmj-temp-graph/dmj-temp-graph';
import { DmjTemplateComponent } from '../components/dmj-template/dmj-template';
import { DmjTempoColorComponent } from '../components/dmj-tempo-color/dmj-tempo-color';
import { DmjTextComponent } from '../components/dmj-text/dmj-text';
import { DmjToggleComponent } from '../components/dmj-toggle/dmj-toggle';
import { DmjUnknownComponent } from '../components/dmj-unknown/dmj-unknown';
import { DmjVisGraph } from '../components/dmj-vis-graph/dmj-vis-graph';
import { DmjWalkingmanComponent } from '../components/dmj-walkingman/dmj-walkingman';
import { DmjZwaveConfigComponent } from '../components/dmj-zwave-config/dmj-zwave-config';
//: # (ImportWidgetComponents END)    

export let p: any[] = [];


@NgModule({
  declarations: [
    MyApp,
    //: # (PageDeclarations START)    
    AboutPage,
    HomePage,
    ListPage,
    LoginPage,
    //: # (PageDeclarations END)    
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    ComponentsModule,
    DirectivesModule,
    PipesModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    DmjWidgetComponent,
    //: # (PageComponents START)    
    AboutPage,
    HomePage,
    ListPage,
    LoginPage,
    //: # (PageComponents END)    
    //: # (WidgetComponents START)    
    DmjCameraComponent,
    DmjColorComponent,
    DmjCommComponent,
    DmjConfirmComponent,
    DmjDashboardCameraComponent,
    DmjDashboardIconComponent,
    DmjDashboardTempoComponent,
    DmjGraph,
    DmjInputComponent,
    DmjLinkComponent,
    DmjMultistateComponent,
    DmjProgressBarComponent,
    DmjTempGraph,
    DmjTemplateComponent,
    DmjTempoColorComponent,
    DmjTextComponent,
    DmjToggleComponent,
    DmjUnknownComponent,
    DmjVisGraph,
    DmjWalkingmanComponent,
    DmjZwaveConfigComponent,
    //: # (WidgetComponents END)    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    HttpClient,
    DomojaApiService,
    WebsocketService,
    PageComponentsProvider,
    PageListProvider,
    CameraUrlProvider,
  ]
})
export class AppModule { }

if (console.log.name !== 'log') {
  // console.log has been overwritten, we are probably in Angular Dev mode, and console.log also redirects messages to the server
  // where objects are displayed as [object Object]
  // Hence, we redefine console.log to compensate for this

  // Angular console.log make a call to JSON.stringify inside drainMessageQueue. We overwrite JSON.stringiy to detect
  // this situation and replace the object by inspect(object)

  const origJSONStringify = JSON.stringify;

  const fakeJSONStringify = function (): string {

    // Error
    //   at JSON.fakeJSONStringify (app.module.ts:132:14)
    //   at Object.drainMessageQueue (ion-dev.js?v=3.2.1:139:33)
    //   at Object.queueMessageSend (ion-dev.js?v=3.2.1:131:10)
    //   at console.<anonymous> (ion-dev.js?v=3.2.1:167:18)
    //   at webpackJsonp.413.console.log (app.module.ts:159:21)
    //   at webpackJsonp.21.DomojaApiService.applyEvent (domoja-api.ts:277:13)
    //   at SafeSubscriber._next (domoja-api.ts:139:12)
    //   at SafeSubscriber.__tryOrUnsub (Subscriber.js:242:1)
    //   at SafeSubscriber.next (Subscriber.js:189:1)
    //   at Subscriber._next (Subscriber.js:129:1)
    const s = (new Error()).stack;

    if (s.split('\n')[2].match(/at Object.drainMessageQueue/)) {
      const msg = arguments[0];
      if (msg && msg.category && msg.type && msg.data) {
        const MAX = 256;
        for (let i = 0; i < msg.data.length; i++) {
          if (typeof msg.data[i] === 'object') {
            // deactivate the patch during recursive inspection
            JSON.stringify = origJSONStringify;
            const dataAsString = inspect(msg.data[i]);
            JSON.stringify = fakeJSONStringify;

            if (dataAsString.length <= MAX) msg.data[i] = dataAsString;
            else msg.data[i] = dataAsString.substring(0, MAX / 2) + ' ... ' + dataAsString.substring(dataAsString.length - MAX / 2);
          }
        }
        return origJSONStringify(msg);
      }
    }
    return origJSONStringify.apply(JSON, arguments);
  };

  JSON.stringify = fakeJSONStringify;

}

if (/iPhone/.test(navigator.userAgent) && window.location.origin !== 'https://domo.bchabrier.com') {

  alert('iphone detected, logging activated!');

  var orig_consolelog = console.log;

  var unsentMsgs = '';
  var sending = false;

  var send = function () {
    if (sending) {
      setTimeout(send, 1000);
    } else {
      if (unsentMsgs !== '') {
        sending = true;

        const LMAX = 65535; // 32768 OK

        var sendingMsgs = unsentMsgs.substring(0, LMAX);
        unsentMsgs = unsentMsgs.substring(LMAX);

        var xhttp = new XMLHttpRequest();

        xhttp.open('POST', window.location.origin + '/serial', true);

        xhttp.onerror = function (e) {
          if (!(e instanceof ProgressEvent)) {
            sending = false;
            unsentMsgs = sendingMsgs + unsentMsgs;
            setTimeout(send);
          }
        };
        xhttp.onreadystatechange = function (e) {
          if (xhttp.readyState === 4) {
            sending = false;
            switch (xhttp.status) {
              case 200:   // success
                break;
              case 0:     // error (status to be checked in chrome network tab). Usually happens when reloading in dev mode
              case 401:   // Unauthorized
              case 500:   // Internal Server Error
                unsentMsgs = sendingMsgs + unsentMsgs;
                break;
              default:
                alert('readystate=4, status=' + xhttp.status + '(' + xhttp.statusText + ')')
            }
          }
        };

        xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp.send('msg=' + sendingMsgs);

        if (unsentMsgs.length > 0)
          setTimeout(send);
      }
    }
  };

  console.log = function () {

    if (orig_consolelog) {
      orig_consolelog.apply(console, arguments);
    }

    var d = new Date();
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var y = d.getFullYear();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var ms = d.getMilliseconds();

    var dstr = (dd < 10 ? '0' : '') + dd + '/' + (mm < 10 ? '0' : '') + mm + '/' + y +
      ' ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' :
        '') + s +
      '.' + (ms < 10 ? '0' : '') + (ms < 100 ? '0' : '') + ms;
    var msg = dstr + ': ';
    for (var i = 0; i < arguments.length; i++) {
      if (i > 0) {
        msg += ' ';
      }
      if (typeof arguments[i] === 'string') {
        msg += arguments[i];
      } else {
        msg += inspect(arguments[i]);
      }
    }

    const LMAX = 1024;

    if (msg.length > 1024) {
      msg = msg.substring(0, LMAX / 2) + '\n...\n' + msg.substring(msg.length - LMAX / 2);
    }

    msg += '\n';

    unsentMsgs += msg;

    send();
  };

  console.error = console.log;
}
