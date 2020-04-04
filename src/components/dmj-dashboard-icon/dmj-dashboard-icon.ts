import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DmjDashboardComponent } from '../dmj-dashboard-component';

@Component({
  selector: 'dmj-dashboard-icon',
  templateUrl: 'dmj-dashboard-icon.html'
})
export class DmjDashboardIconComponent extends DmjDashboardComponent {

  icon: string = 'help';
  color: string = '';
  sanitizedText: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {
    super();

    this.somethingChanged.subscribe(() => {
      if (this.args && this.args.icon && this.args.icon !== "'unknown device'") {
        this.icon = this.args.icon;
        this.color = this.args.color;
        this.sanitizedText = this.args.text && this.sanitizer.bypassSecurityTrustHtml(this.args.text);
      } 
    });
  }

}
