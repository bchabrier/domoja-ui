import { Component, Input, ComponentFactoryResolver, ViewChild, OnInit } from '@angular/core';

import { DmjWidgetHostDirective } from '../directives/dmj-widget-host';
import { Device } from '../providers/domoja-api/domoja-api'

import { ComponentsModule } from './components.module';


/**
 * Generated class for the DmjWidgetComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dmj-widget',
  template: `<ng-template dmj-widget-host></ng-template>`
})
export class DmjWidgetComponent implements OnInit {

  @Input() device: Device;
  @Input() imageSize: string;
  args: string[];
  @ViewChild(DmjWidgetHostDirective) dmjWidgetHost: DmjWidgetHostDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {

    if (!this.componentFactoryResolver) return;

    let args = this.device.widget && this.device.widget.split(':') || [undefined];

    let widget = 'dmj-' + args[0];
    args.splice(0, 1);

    let component = ComponentsModule.getWidgetComponent(widget);

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

    let viewContainerRef = this.dmjWidgetHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<DmjWidgetComponent>componentRef.instance).device = this.device;
    (<DmjWidgetComponent>componentRef.instance).imageSize = this.imageSize;
    (<DmjWidgetComponent>componentRef.instance).args = args;
  }
}
