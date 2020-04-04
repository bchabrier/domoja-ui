import { Directive, ViewContainerRef } from '@angular/core';

/**
 * Generated class for the DmjWidgetHostDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[dmj-widget-host]' // Attribute selector
})
export class DmjWidgetHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }

}
