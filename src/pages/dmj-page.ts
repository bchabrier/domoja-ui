import { OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PageListProvider, componentPage } from '../providers/page-list/page-list';
import { DomojaApiService, Device } from '../providers/domoja-api/domoja-api';
import { Subscription } from 'rxjs';

//import { LoginPage } from './login/login';

export class DmjPage implements OnInit, OnDestroy {
    title: string;
    pageName: string;
    devices: Map<string, Device> = new Map();
    homePage: componentPage;
    authentified_subscription: Subscription;
    devices_subscription: Subscription;
    pagelist_subscription: Subscription;

    constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService, public pageList: PageListProvider) {
        this.pageName = navParams.get('pageName');
    }

    ngOnInit() {
        this.authentified_subscription = this.api.getAuthentified().subscribe(authentified => {
            if (authentified == false && this.navCtrl.getActive().instance == this) {
                window.location.href = '/login.html';
                return;
                /*
                let returnPage: componentPage = {
                    name: this.pageName,
                    component: this.navCtrl.getActive().component,
                    menuItem: '',
                    title: this.title,
                    args: this.navParams.data,
                }
                LoginPage.returnPage = returnPage;
                this.navCtrl.setRoot(LoginPage);*/
            }
        });

        this.pagelist_subscription = this.pageList.subscribe(pages => {
            this.homePage = pages[0];
            if (pages) {
                pages.forEach(page => {
                    if (page.name == this.pageName) {
                        this.title = page.title;
                    }
                });
            }

        });

        this.devices_subscription = this.api.getDevices().subscribe(devices => {
            this.devices.clear();
            devices && devices.forEach(d => {
                this.devices.set(d.path, d);
            });
        });



    }

    ngOnDestroy() {
        this.authentified_subscription.unsubscribe();
        this.devices_subscription.unsubscribe();
        this.pagelist_subscription.unsubscribe();
    }

    backToHomePage() {
        if (this.pageName == this.homePage.name) return;

        this.navCtrl.setRoot(this.homePage.component, {
            pageName: this.homePage.name,
        }, {
            animate: true,
            direction: 'back',
        });
    }
}