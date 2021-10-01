import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DmjDashboardComponent } from '../dmj-dashboard-component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dmj-dashboard-icon',
  templateUrl: 'dmj-dashboard-icon.html'
})
export class DmjDashboardIconComponent extends DmjDashboardComponent implements OnInit, OnDestroy {

  icon: string = 'help';
  isIcon: boolean = true;
  color: string = '';
  sanitizedText: SafeHtml = '';
  somethingchanged_subscription: Subscription;

  constructor(sanitizer: DomSanitizer) {
    super(sanitizer);
  }

  ngOnInit() {
    super.ngOnInit();
    this.somethingchanged_subscription = this.somethingChanged.subscribe(() => {
      if (this.args && this.args.icon && this.args.icon !== "'unknown device'") {
        this.icon = this.args.icon;
        this.isIcon = this.icon.match(/^[a-z0-9_-]+$/) && true;
        this.color = this.args.color;
        this.sanitizedText = this.args.text && this.sanitizer.bypassSecurityTrustHtml(this.args.text);
      }
    });
  }

  ngOnDestroy() {
    this.somethingchanged_subscription.unsubscribe();
    super.ngOnDestroy();
  }

}
