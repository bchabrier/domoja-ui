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
import { Timeline, TimelineOptions } from 'vis-timeline';
//import { Timeline, TimelineOptions } from 'vis-timeline/dist/vis-timeline-graph2d.esm.js';


type ItemData = { content: string, id: string, start: string, end: string, group: string };
type GroupData = { content: string, id: string, className: string };

/**
 * Display a timeline graph described by the device state.
 * 
 * The timeline is implemented by vis-timeline. See https://visjs.github.io/vis-timeline/docs/timeline.
 * 
 * The device state should be a string representing an object containing a field `items`, an optional field `groups`, and a field `options`.
 * 
 * The field `items` is an array used to describe the data items as in https://visjs.github.io/vis-timeline/docs/timeline/#Items. 
 * 
 * The field `groups` is an array used to describe the data groups as in https://visjs.github.io/vis-timeline/docs/timeline/#Groups. 
 * 
 * The field `options` is an object used to describe timeline configuration as in https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options.  
 * It can contain an additional option `displayOnlyInRangeExcept` (string or array of strings), not listed in the vis-timeline documentation, which allows to hide the groups which do not span over the current timeline time range, except the specified group or array of groups.
 *  
 */
@Component({
  selector: 'dmj-vis-graph',
  templateUrl: 'dmj-vis-graph.html',
})
export class DmjVisGraph extends DmjWidgetComponent implements OnInit, OnDestroy {

  @Input() error: SafeHtml;
  @Input() style: SafeHtml;
  graph: Timeline;
  displayOnlyInRangeExcept: string[] = null;

  graph_data: {
    chartType: string,
    items?: ItemData[],
    options?: TimelineOptions & {
      displayOnlyInRangeExcept: string | string[];
    },
    groups?: GroupData[],
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

  filterGroupsInRange(properties?: any) {
    // find visible groups

    const groups = (this.graph as any).itemSet.groups;

    const start: Date = properties ? properties.start : new Date(this.graph["range"].start);
    const end: Date = properties ? properties.end : new Date(this.graph["range"].end);

    for (let groupId in groups) {
      const group = groups[groupId];
      const groupItems = group.items;
      const groupItemsKeys = Object.keys(groupItems);

      // check if visible
      const nbItems = groupItemsKeys.length;
      if (nbItems > 0) {
        const visible = groupItems[groupItemsKeys[0]].data.start <= end && groupItems[groupItemsKeys[nbItems - 1]].data.end >= start;
        group.setData({ className: visible || this.displayOnlyInRangeExcept === null || this.displayOnlyInRangeExcept.indexOf(groupId) != -1 ? "in-range" : "out-range" });
      }
    }
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

        if (this.graph_data.options && this.graph_data.options.displayOnlyInRangeExcept) {
          if (typeof this.graph_data.options.displayOnlyInRangeExcept === 'string') {
            this.displayOnlyInRangeExcept = [this.graph_data.options.displayOnlyInRangeExcept];
          } else if (Array.isArray(this.graph_data.options.displayOnlyInRangeExcept)) {
            this.displayOnlyInRangeExcept = this.graph_data.options.displayOnlyInRangeExcept;
          } else {
            console.warn('dmj-vis-graph: option "displayOnlyInRangeExcept" must be a string or an array of strings specifying the groups that must be always visible.');
          }
          this.graph.on("rangechange", this.filterGroupsInRange.bind(this));
        }
        //this.graph.on("rangechanged", this.rangeChanged.bind(this));
        //this.graph.on("_change", this.rangeChanged.bind(this));
      }

      if (this.graph) {

        if (this.graph_data.options) {
          // disable start and end if already set, so that we do not change the current span and zoom
          if (this.start) delete this.graph_data.options.start;
          else this.start = this.graph_data.options.start;
          if (this.end) delete this.graph_data.options.end;
          else this.end = this.graph_data.options.end;
          delete this.graph_data.options.displayOnlyInRangeExcept;
          this.graph.setOptions(this.graph_data.options);
          //         this.graph.setOptions({ ...this.graph_data.options, "onInitialDrawComplete": this.filterGroupsInRange.bind(this) });
        }

        if (this.graph_data.groups) {
          const groups = (this.graph as any).itemSet.groups;

          this.graph_data.groups.forEach(g => {
            const group = groups[g.id];
            if (group) g.className = group.className;
          });

          this.graph.setGroups(new DataSet(this.graph_data.groups));
        }

        this.graph.setItems(new DataSet(this.graph_data.items));
        this.filterGroupsInRange();

      } else setTimeout(drawChart, 0);

    }

    if (JSON.stringify(this.graph_data) !== this.device.state) {
      this.graph_data = state;

      drawChart();
    }
  }
}
