import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController, NavParams } from 'ionic-angular';
import { PageListProvider, componentPage } from '../../providers/page-list/page-list';
import { DomojaApiService, App } from '../../providers/domoja-api/domoja-api';
import { interpretLabel } from '../../directives/dmj-widget-host';
import { DomSanitizer } from '@angular/platform-browser';
import { DmjPage } from '../dmj-page';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends DmjPage implements OnInit, OnDestroy {
  pages: Array<componentPage> = [];
  args: { [key: string]: any };
  widgets: Object[];
  app: App;
  app_subscription: Subscription;
  pagelist_subscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService, public pageList: PageListProvider, public sanitizer: DomSanitizer) {
    super(navCtrl, navParams, api, pageList);
  }

  ngOnInit() {
    super.ngOnInit();
    this.pagelist_subscription = this.pageList.subscribe(pages => {
      pages && pages.forEach(page => {
        if (page.name == this.pageName) {
          this.args = page.args;
          this.widgets = this.args['widgets'];
          this.pages = pages;
        }
      })
    });
    this.app_subscription = this.api.getApp().subscribe(app => {
      this.app = app;
    });
  }

  ngOnDestroy() {
    this.pagelist_subscription.unsubscribe();
    this.app_subscription.unsubscribe();
    super.ngOnDestroy();
  }

  openPage(pageName: string) {
    if (!pageName) return;

    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    let page = this.pages.filter(p => p.name == pageName)[0];

    this.navCtrl.setRoot(page ? page.component : null, {
      pageName: pageName,
    }, {
      animate: true,
      direction: 'forward',
    });
  }

  interpretLabel(label: string): string {
    return interpretLabel(this.sanitizer, label, this.devices).newlabel;
  }

}
