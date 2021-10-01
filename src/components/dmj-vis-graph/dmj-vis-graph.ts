import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmjWidgetComponent } from '../dmj-widget';
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// vis package is using a too newer version of typescript, no compatible with angular 5
// hence, to compile we use the js imports, and to check at edit time, we use the ts imports
// this is done automatically by ionic:serve/build:before/after
import { DataSet } from 'vis-data/peer';
//import { DataSet } from 'vis-data/dist/esm.js';

import 'hammerjs'; // need to avoid error 'Hammer.assign is not a function'. See https://github.com/almende/vis/issues/3292
//import { Timeline, TimelineOptions, TimelineGroup, TimelineItem } from 'vis-timeline';
import { Timeline, TimelineOptions, TimelineGroup, TimelineItem } from 'vis-timeline/dist/vis-timeline-graph2d.esm.js';



/**
 * Display a graph described by the device state.
 * 
 * The device state should be a string representing a google "ChartWrapper" object, with "ChartType", "dataTable" and "options" properties (see specs on https://developers.google.com/chart/interactive/docs/reference#google.visualization.drawchart).
 */
@Component({
  selector: 'dmj-vis-graph',
  templateUrl: 'dmj-vis-graph.html',
})
export class DmjVisGraph extends DmjWidgetComponent implements OnInit, OnDestroy {

  @Input() error: SafeHtml;
  @Input() style: SafeHtml;
  graph: Timeline;
  graph_data: {
    chartType: string,
    items?: Object,
    options?: TimelineOptions,
    groups?: Object,
    style?: string,
    refreshInterval?: Number,
  } //& { containerId: string }
  devices_subscription: Subscription;
  @ViewChild('visGraph') containerElement: ElementRef;
  start: any;
  end: any;

  constructor(public api: DomojaApiService, private sanitizer: DomSanitizer) {
    super(null);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit(): void {
    this.devices_subscription = this.api.getDevices().subscribe(devices => {
      this.updateChart();
    });
    this.updateChart();
  }

  ngOnDestroy() {
    this.devices_subscription && this.devices_subscription.unsubscribe();
    super.ngOnDestroy();
  }

  updateChart() {

    let error = () => {
      this.error = this.sanitizer.bypassSecurityTrustHtml(`State of device "${this.device.id}" should be a string representing a visjs "Timeline" object, with "items", "groups" and "options" properties (see specs <a href="https://github.com/visjs/vis-timeline" target="_blank">here</a>).<br>Is: ${this.device.state}`);
    }

    if (!this.device.state) return;

    // check that state is a real graph info
    if (typeof this.device.state != 'string') {
      error();
      return;
    }
    let state = JSON.parse(this.device.state);
    if (typeof state != 'object' || !state.items) {
      error();
      return;
    }

    let drawChart = () => {
      /*
      const containerElement = document.getElementById(this.container);
      if (containerElement && containerElement !== this.containerElement) {
        this.containerElement = containerElement;
        this.graph = null;
      }
      */
      const containerElement = this.containerElement.nativeElement;
      if (!this.graph && !containerElement) console.error('XXXX should not happen!!!')

      if (!this.graph && containerElement) {
        this.graph = new Timeline(containerElement, null);
      }

      if (this.graph) {
        if (this.graph_data.options) {
          // disable start and end if already set, so that we do not change the current span and zoom
          if (this.start) delete this.graph_data.options.start;
          else this.start = this.graph_data.options.start;
          if (this.end) delete this.graph_data.options.end;
          else this.end = this.graph_data.options.end;
          this.graph.setOptions(this.graph_data.options);
        }
        this.graph_data.groups && this.graph.setGroups(new DataSet(this.graph_data.groups));
        this.graph_data.items && this.graph.setItems(new DataSet(this.graph_data.items));
      } else setTimeout(drawChart, 0);

    }

    if (JSON.stringify(this.graph_data) !== this.device.state) {
      this.graph_data = state;

      drawChart();
    }
  }
}
