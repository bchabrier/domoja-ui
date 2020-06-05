import { Component, Input, ComponentFactoryResolver, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { DomojaApiService, Device } from '../providers/domoja-api/domoja-api'
import { Subscription } from 'rxjs';

import { DmjWidgetHostDirective } from '../directives/dmj-widget-host';

import { ComponentsModule } from './components.module';
import { interpretLabel } from '../providers/page-list/page-list';

import { BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Component({
  selector: 'dmj-dashboard-component',
  template: `<ng-template dmj-widget-host></ng-template>`
})
export class DmjDashboardComponent implements OnInit, OnDestroy {

  devices: Map<string, Device> = new Map<string, Device>();
  @Input() widget: {
    widget: string,
  };
  args: { [key: string]: string };
  @ViewChild(DmjWidgetHostDirective) dmjWidgetHost: DmjWidgetHostDirective;
  instance: DmjDashboardComponent;
  static api: DomojaApiService;
  somethingChanged: BehaviorSubject<number>;
  devices_subscription: Subscription;

  constructor(private componentFactoryResolver: ComponentFactoryResolver = null, private api: DomojaApiService = null) {
    this.somethingChanged = new BehaviorSubject<number>(0);
  }

  ngOnInit() {

    if (this.componentFactoryResolver) {
      // creation as host

      if (!DmjDashboardComponent.api) DmjDashboardComponent.api = this.api;

      let widget = this.widget && this.widget.widget;
      let component = ComponentsModule.getWidgetComponent('dmj-' + widget);

      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

      let viewContainerRef = this.dmjWidgetHost.viewContainerRef;
      viewContainerRef.clear();
      let componentRef = viewContainerRef.createComponent(componentFactory);
      this.instance = <DmjDashboardComponent>componentRef.instance;
      this.instance.widget = this.widget;
      this.instance.args = this.fillArgs(this.devices);
    } else {
      // creation as super of a dashboard component

      this.devices_subscription = DmjDashboardComponent.api.getDevices().subscribe(devices => {
        this.devices.clear();
        devices && devices.forEach(d => {
          this.devices.set(d.path, d);
        });
        this.args = this.fillArgs(this.devices);
        this.somethingChanged.next(this.somethingChanged.getValue() + 1);
      });
    }
  }

  ngOnDestroy() {
    this.devices_subscription && this.devices_subscription.unsubscribe();
  }

  fillArgs(devices: Map<string, Device>) {
    let args = {};
    this.widget && Object.keys(this.widget).forEach(k => {
      args[k] = this.interpretLabel(this.widget[k], devices);
    });
    return args;
  }


  interpretLabel(label: string, devices: Map<string, Device>) {
    return interpretLabel(label, devices);
  }

  getDeviceState(path: string) {
    return this.devices && this.devices.get(path) && this.devices.get(path).state;
  }
}

