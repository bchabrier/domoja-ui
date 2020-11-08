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
import { DmjMultistateComponent } from '../components/dmj-multistate/dmj-multistate';
import { DmjProgressBarComponent } from '../components/dmj-progress-bar/dmj-progress-bar';
import { DmjTempGraph } from '../components/dmj-temp-graph/dmj-temp-graph';
import { DmjTempoColorComponent } from '../components/dmj-tempo-color/dmj-tempo-color';
import { DmjTextComponent } from '../components/dmj-text/dmj-text';
import { DmjToggleComponent } from '../components/dmj-toggle/dmj-toggle';
import { DmjUnknownComponent } from '../components/dmj-unknown/dmj-unknown';
import { DmjWalkingmanComponent } from '../components/dmj-walkingman/dmj-walkingman';
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
DmjMultistateComponent,
DmjProgressBarComponent,
DmjTempGraph,
DmjTempoColorComponent,
DmjTextComponent,
DmjToggleComponent,
DmjUnknownComponent,
DmjWalkingmanComponent,
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

if (/iPhone/.test(navigator.userAgent)) {

  var orig_consolelog = console.log;

  var unsentMsgs = '';
  var sending = false;

  var send = function () {
    if (sending) {
      setTimeout(send, 1000);
    } else {
      if (unsentMsgs !== '') {
        sending = true;

        var sendingMsgs = unsentMsgs;
        unsentMsgs = '';

        var xhttp = new XMLHttpRequest();

        xhttp.open('GET', 'https://domo.bchabrier.com/serial?msg=' + sendingMsgs, true);

        xhttp.onerror = function (e) {
          if (!(e instanceof ProgressEvent)) {
            sending = false;
            unsentMsgs = sendingMsgs + unsentMsgs;
            setTimeout(send);
          }
        };
        xhttp.onreadystatechange = function (e) {
          if (xhttp.readyState === 4) {
            if (xhttp.status === 200) {
              sending = false;
            } else {
              //alert('readystate=4, status=' + xhttp.status + '(' + xhttp.statusText + ')')
            }
          }
        };

        xhttp.send();
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
    msg += '%0A';

    unsentMsgs += msg;

    send();
  };
}
