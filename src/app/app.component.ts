import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PageListProvider, componentPage } from '../providers/page-list/page-list';
import { DomojaApiService } from '../providers/domoja-api/domoja-api';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  pages: Array<componentPage> = [];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private pageList: PageListProvider, private api: DomojaApiService) {
    this.initializeApp();

    this.pageList.subscribe(pages => {
      //if (!this.pages = pages;
      if (this.pages.length == 0 && pages && pages[0] && pages[0].component && !this.nav.root) {
        //if (pages.indexOf(this.currentPage) == -1) {
        this.pages = pages;
        this.loadHomePage();
      }
    });

    this.api.getAuthentified().subscribe(authentified => {
      if (!this.nav) return;

      if (authentified) {
        this.loadHomePage();
      } else {
        //alert('redirecting to /login')
        // pass domojaserver and return page through cookies to avoid making them visible
        document.cookie = 'DomojaURL=' + api.DomojaURL;
        document.cookie = 'returnPage=';
        window.location.href = '/login.html';
        //this.nav.setRoot(LoginPage);
      }
    });
  }

  loadHomePage() {
    if (LoginPage.returnPage) {
      this.openPage(LoginPage.returnPage);
    } else
      if (this.pages[0]) this.openPage(this.pages[0]);

    //this.nav.root = this.pages[0].component;
    //this.nav.rootParams = { pageName: this.pages[0].name };
  }

  initializeApp() {
    this.platform.ready().then(() => {
      let _isDev: boolean = ((<any>window)['IonicDevServer'] != undefined);
      if (_isDev) document.title = document.title + ' (DEV)';

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page: componentPage) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component, {
      pageName: page.name
    });
  }
}

