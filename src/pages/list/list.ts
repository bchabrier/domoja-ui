import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController, NavParams, Toggle } from 'ionic-angular';
import { DomojaApiService, Device, App } from '../../providers/domoja-api/domoja-api'
import { PageListProvider } from '../../providers/page-list/page-list';
import { DmjPage } from '../dmj-page';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage extends DmjPage implements OnInit, OnDestroy {
    icons: Array<string>;
    devicesFromApi: Array<Device> = [];
    args: { [key: string]: string };
    title: string;
    hasHeaders: boolean;
    displayHeaders: boolean = true;
    groups: Array<{ header: string, devices: Array<Device> }> = [];
    tagList: Array<string>;
    imageSize: string; // size of the camera fields 
    private signature: string = '';
    app: App;
    pages_subscription: Subscription;
    devices_subscription: Subscription;
    app_subscription: Subscription;

    constructor(public navCtrl: NavController, public navParams: NavParams, public api: DomojaApiService, public pageList: PageListProvider) {
        super(navCtrl, navParams, api, pageList);
    }

    ngOnInit() {
        super.ngOnInit();
        this.pages_subscription = this.api.getPages().map(pages => {
            return pages.filter(page => {
                return page.name == this.pageName;
            });
        }).subscribe(pages => {

            if (pages && pages.length == 1) {
                this.args = pages[0].args;
                this.imageSize = this.args['image-size'] || '';
                this.updateGroups();
            }
        });

        this.devices_subscription = this.api.getDevices().subscribe(devices => {
            // if devices really changed, force update groups
            if (this.devicesFromApi !== devices) this.signature = '';
            this.devicesFromApi = devices;
            this.updateGroups();
        });

        this.app_subscription = this.api.getApp().subscribe(app => {
            this.app = app;
        });
    }

    ngOnDestroy() {
        this.app_subscription.unsubscribe();
        this.devices_subscription.unsubscribe();
        this.pages_subscription.unsubscribe();
        super.ngOnDestroy();
    }

    changeState(device: Device, state: string, event: Toggle) {
        if ((device as any).inCancelMode) return;
        device.stateChange(device, state, err => {
            if (err) {
                // should display an error banner?
                (device as any).inCancelMode = true;
                event.setValue(!event.value)
                delete (device as any).inCancelMode;
            }
        });
    }

    updateGroups() {
        this.hasHeaders = this.args && this.args['tag-list'] ? true : false;
        if (this.hasHeaders) {
            this.tagList = this.args['tag-list'].split(/, */);
            this.displayHeaders = this.args['headers'] == 'false' ? false : true;
        }

        if (this.hasHeaders) {
            let groups: Array<{ header: string, devices: Array<Device> }> = [];
            let newSignature: string = '';
            this.tagList.forEach(tag => {
                let t: string;
                let pattern: string;
                let d: Array<Device>;
                let colon = tag.indexOf(':');
                if (colon >= 0) {
                    pattern = tag.substr(0, colon);
                    t = tag.substr(colon + 1);
                } else {
                    pattern = tag
                    t = tag
                }
                if (pattern == '*') {
                    d = this.devicesFromApi.filter(d => {
                        return d['_passed'] != true;
                    });
                } else {
                    let searchTag = pattern;
                    if (pattern.length == 0 || pattern.charAt(0) != '*') {
                        searchTag = ' ' + searchTag;
                    } else {
                        searchTag = searchTag.substr(1);
                    }
                    if (pattern.length == 0 || pattern.charAt(pattern.length - 1) != '*') {
                        searchTag = searchTag + ',';
                    } else {
                        searchTag = searchTag.substr(0, searchTag.length - 1);
                    }

                    d = this.devicesFromApi.filter(d => {
                        return (' ' + d.tags + ',').indexOf(searchTag) >= 0
                    }).map(device => {
                        // mark all passed devices as passed
                        device['_passed'] = true;
                        return device;
                    });
                }
                groups.push({
                    header: t,
                    devices: d
                });
                newSignature = [newSignature, t + ':' + d.map(d => d.path).join('| ')].join(', ');
            });

            if (newSignature != this.signature) {
                this.groups = groups;
                this.signature = newSignature;
            }

            // remove the 'passed' attribute
            this.devicesFromApi.map(device => {
                delete device['_passed'];
            });
        }
    }
}
