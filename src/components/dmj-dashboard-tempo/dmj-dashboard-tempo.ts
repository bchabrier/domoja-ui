import { Component } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'dmj-dashboard-tempo',
  templateUrl: 'dmj-dashboard-tempo.html'
})
export class DmjDashboardTempoComponent extends DmjDashboardComponent {

  constructor(sanitizer: DomSanitizer) {
    super(sanitizer);
  }
}
