import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomojaApiService } from '../../providers/domoja-api/domoja-api'
import { componentPage } from '../../providers/page-list/page-list';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  static returnPage: componentPage;

  username: string = '';
  password: string = '';
  rememberme: boolean = false;
  message: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  doLogin() {
    this.message = ''
    this.api.login(this.username, this.password, this.rememberme, (err: Error) => {
      if (err) {
        this.message = err.message;
        setTimeout(() => { this.message = '' }, 3000);
      } else {
        //if (this.navCtrl.canGoBack()) this.navCtrl.pop();
        //else LoginPage.app.loadHomePage(true);
      }
    });
  }
}
