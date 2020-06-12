import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController, NavParams } from 'ionic-angular';
import { DomojaApiService, App } from '../../providers/domoja-api/domoja-api';
import { PageListProvider } from '../../providers/page-list/page-list';
import { DmjPage } from '../dmj-page';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage extends DmjPage implements OnInit, OnDestroy{
  @Input() app: App;
  app_subscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService, public pageList: PageListProvider) {
    super(navCtrl, navParams, api, pageList);
  }

  ngOnInit() {
    super.ngOnInit();
    this.app_subscription = this.api.getApp().subscribe(app => {
      this.app = app;
    });
  }

  ngOnDestroy() {
    this.app_subscription.unsubscribe();
    super.ngOnDestroy();
  }

  setDemoMode(value: boolean) {
    if (value != this.app.demoMode)
      this.api.setAppDemoMode(value);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
