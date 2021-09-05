import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PageListProvider, componentPage } from '../providers/page-list/page-list';
import { CameraUrlProvider } from '../providers/camera-url/camera-url'
import { DomojaApiService } from '../providers/domoja-api/domoja-api';
import { LoginPage } from '../pages/login/login';

import createPanZoom, { PanZoom } from 'panzoom';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  pages: Array<componentPage> = [];
  panzoom: PanZoom;

  fullscreenImageUrl = "";
  fullscreenVisibleClass: 'hidden' | 'visible' = 'hidden';

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private pageList: PageListProvider, private api: DomojaApiService, private cameraUrlProvider: CameraUrlProvider) {
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
        document.cookie = 'DomojaURL=' + DomojaApiService.DomojaURL;
        document.cookie = 'returnPage=';
        window.location.href = '/login.html';
        //this.nav.setRoot(LoginPage);
      }
    });

    this.cameraUrlProvider.fullscreenImageUrlSubject.subscribe(url => {
      if (!this.panzoom && url !== "") {

        this.fullscreenImageUrl = ''; // to make sure the previous image is cleared whatever happens with the new one
        this.fullscreenImageUrl = url;

        const element = document.getElementById('fullscreen-img');

        this.panzoom = createPanZoom(element, {
          minZoom: 1,
          smoothScroll: false,
          onDoubleClick: function(e) {
            // `e` - is current double click event.
        
            return false; // tells the library to not preventDefault, and not stop propagation
          },
          onTouch: function(e) {    
            return false; // tells the library to not preventDefault, and not stop propagation
          }

        });

        this.fullscreenVisibleClass = 'visible';
      } else if (this.panzoom && url === "") {
        this.fullscreenVisibleClass = 'hidden';
        this.panzoom.dispose();
        this.panzoom = null;
      } else if (this.panzoom) {
        this.fullscreenImageUrl = url;
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

  closeModal() {
    // replace is not known by this version of typescript
    this.cameraUrlProvider.clearFullscreenImage();
  }
}

