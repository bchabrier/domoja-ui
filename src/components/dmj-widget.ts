import { Component, Input, ComponentFactoryResolver, ViewChild, OnInit, OnDestroy } from '@angular/core';

import { DmjWidgetHostDirective, interpretLabel } from '../directives/dmj-widget-host';
import { Device, DomojaApiService } from '../providers/domoja-api/domoja-api'

import { ComponentsModule } from './components.module';
import { Subscription } from 'rxjs';


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
export class DmjWidgetComponent implements OnInit, OnDestroy {

  @Input() device: Device;
  @Input() imageSize: string;
  args: string[];
  @ViewChild(DmjWidgetHostDirective) dmjWidgetHost: DmjWidgetHostDirective;
  args_subscriptions: Subscription[];

  onArgsChange() {
    console.error(`Widget "${this.device.widget}": DmjWidgetComponent.onArgsChange should not be called! Did you forget to override it?`);
  }

  constructor(private componentFactoryResolver: ComponentFactoryResolver, public api: DomojaApiService) { }

  //abstract onArgsChange(): void;

  getWidgetAndArgs(): { widget: string, args: string[] } {
    let sepIndex = this.device.widget && this.device.widget.search(/[^-a-zA-Z0-9]/);
    let args = [undefined];

    if (this.device.widget) {
      args = sepIndex >= 0 && this.device.widget.split(this.device.widget[sepIndex]) || [this.device.widget];
    }
    if (sepIndex >= 0)
      args = this.device.widget && this.device.widget.split(this.device.widget[sepIndex]) || [undefined];

    let widget = 'dmj-' + args[0];
    args.splice(0, 1);

    return { widget: widget, args: args }
  }

  ngOnInit() {

    if (!this.componentFactoryResolver) return;
    if (!this.device) return;

    const { widget, args } = this.getWidgetAndArgs();

    let component = ComponentsModule.getWidgetComponent(widget);

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

    let viewContainerRef = this.dmjWidgetHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    const realWidget = <DmjWidgetComponent>componentRef.instance;
    realWidget.device = this.device;
    realWidget.imageSize = this.imageSize;
    realWidget.args = args;

    // find the devices used in args
    const { devices } = this.interpretArgs();

    // create a subscription for each device
    this.args_subscriptions = [];
    devices.forEach(d => {
      this.args_subscriptions.push(this.api.getDevice(d).subscribe(() => {
        const { newArgs } = this.interpretArgs();
        const realWidget = <DmjWidgetComponent>componentRef.instance;
        realWidget.args = newArgs;
        if (realWidget.onArgsChange) realWidget.onArgsChange();
      }));
    });


  }

  interpretArgs(): { newArgs: string[], devices: string[] } {

    const deviceMap: Map<string, Device> = new Map();
    this.api.getCurrentDevices().forEach(d => deviceMap.set(d.path, d));

    const { args } = this.getWidgetAndArgs();

    const newArgs: string[] = [];
    let usedDevices: string[] = [];
    args.forEach((arg, i) => {
      const { newlabel, devices } = interpretLabel(null, arg, deviceMap);
      newArgs[i] = newlabel;
      usedDevices = usedDevices.concat(devices);
    });

    return { newArgs: newArgs, devices: [...usedDevices] /* remove duplicates */ };
  }

  ngOnDestroy() {
    this.args_subscriptions && this.args_subscriptions.forEach(s => s.unsubscribe());
    this.args_subscriptions = null;
  }
}
