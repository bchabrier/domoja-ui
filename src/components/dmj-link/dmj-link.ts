import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Device, DomojaApiService } from '../../providers/domoja-api/domoja-api';
import { DmjWidgetComponent } from '../dmj-widget';
import { PageListProvider, componentPage } from '../../providers/page-list/page-list';
import { Subscription } from 'rxjs';
import { NavController } from 'ionic-angular';

/*
 * Displays the device state as a link. 
 * Additional arguments can be added, separated by a character separator not used in the arguments.
 * 
 * The supported arguments are: 
 * - <page>: the page to which the link points
 * - <visibility>: "hidden" or "visible" (default)
 * 
 * Examples:
 * - `"link:temperature:visible"`  
 * 
 * Note that the state of the device is never shown. A typical use is:
 * `devices:`
 * `- more-info : { type: device, widget: link:more-info:visible, source: demo, id: whatever, name: "More info"}`
 */
@Component({
  selector: 'dmj-link',
  templateUrl: 'dmj-link.html'
})
export class DmjLinkComponent extends DmjWidgetComponent implements OnInit, OnDestroy {

  @Input() device: Device;
  @Input() error: SafeHtml;
  visible: 'hidden' | 'visible';
  page: string;
  pages: Array<componentPage> = [];
  pagelist_subscription: Subscription;

  constructor(private sanitizer: DomSanitizer, public pageList: PageListProvider, public navCtrl: NavController, public api: DomojaApiService) {
    super(null, api);
  }

  ngOnInit() {
    this.page = this.args[0];
    this.error = "";
    if (this.args[1] === 'hidden') this.visible = 'hidden';
    else if (this.args[1] === 'visible') this.visible = 'visible';
    else if (this.args[1] === '') this.visible = 'visible';
    else this.error = this.sanitizer.bypassSecurityTrustHtml(`Wrong visibility "${this.args[1]}" (should be "hidden" of "visible")`);

    this.pagelist_subscription = this.pageList.subscribe(pages => {
      this.pages = pages;
      this.error = (this.pages.filter(p => p.name == this.page).length === 0) ? `Wrong page "${this.page}"` : "";
    });

  }

  ngOnDestroy() {
    this.pagelist_subscription.unsubscribe();
  }

  openPage() {

    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    let page = this.pages.filter(p => p.name == this.page)[0];

    this.navCtrl.push(page ? page.component : null, {
      pageName: this.page,
    }, {
      animate: true,
      direction: 'forward',
    });
  }

}