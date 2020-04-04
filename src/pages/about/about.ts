import { Component, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomojaApiService, App } from '../../providers/domoja-api/domoja-api';
import { PageListProvider } from '../../providers/page-list/page-list';
import { DmjPage } from '../dmj-page';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage extends DmjPage {
  @Input() app: App;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService, public pageList: PageListProvider) {
    super(navCtrl, navParams, api, pageList);
    this.api.getApp().subscribe(app => {
      this.app = app;
    });
  }

  setDemoMode(value: boolean) {
    if (value != this.app.demoMode)
      this.api.setAppDemoMode(value);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
