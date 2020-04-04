import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PageListProvider, componentPage, interpretLabel } from '../../providers/page-list/page-list';
import { DomojaApiService, App } from '../../providers/domoja-api/domoja-api';
import { DmjPage } from '../dmj-page';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends DmjPage {
  pages: Array<componentPage> = [];
  args: { [key: string]: any };
  widgets: Object[];
  app: App;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService, public pageList: PageListProvider) {
    super(navCtrl, navParams, api, pageList);

    this.pageList.subscribe(pages => {
      pages && pages.forEach(page => {
        if (page.name == this.pageName) {
          this.args = page.args;
          this.widgets = this.args['widgets'];
          this.pages = pages;
        }
      })
    });
    this.api.getApp().subscribe(app => {
      this.app = app;
    });
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

  interpretLabel(label: string) {
    return interpretLabel(label, this.devices);
  }

}
