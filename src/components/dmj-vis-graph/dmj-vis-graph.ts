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


const debug = false;

let start; let end;

function changedOrAddedItems(newItems: ItemData[], initialItems: DataSet<ItemData>): ItemData[] {
  return newItems.filter(i => {
    const alreadyHereItem = initialItems.get(i.id);
    return !alreadyHereItem || alreadyHereItem.start !== i.start || alreadyHereItem.end !== i.end;
  });
}

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
    itemsDeviceList?: string[],
  } //& { containerId: string }
  device_subscription: Subscription;
  itemDevices_subscriptions: Subscription[] = [];
  @ViewChild('visGraph') containerElement: ElementRef;
  start: any;
  end: any;
  openItems: string[] = [];
  allItems = new DataSet<ItemData>(); // all items to be displayed. It could contain "open" items, i.e. items with no end defined
  items: DataSet<ItemData> = new DataSet(); // used by the graph. The end of open items is updated with the current date
  changeQueue: ItemData[][] = [];
  viewChecked: boolean = false;

  constructor(api: DomojaApiService, private sanitizer: DomSanitizer) {
    super(null, api);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit(): void {
    debug && console.log('in ngAfterViewInit');
    this.device_subscription = this.api.getDevice(this.device.id).subscribe(device => {
      this.updateChart();
    });
    this.updateChart();

    if (this.graph_data && this.graph_data.itemsDeviceList) {
      this.graph_data.itemsDeviceList.forEach(id => {
        debug && console.log('device changed', id)
        if (id !== 'alarme.sensorsStatesRecentChanges') return;
        debug && console.log('device changed kept', id)
        const deviceObservable = this.api.getDevice(id);
        if (deviceObservable)
          this.itemDevices_subscriptions.push(deviceObservable.subscribe(device => {
            debug && console.log('device has changed', device.path)
            this.updateItemsFromDevices();
          }))
      });
    }
    this.viewChecked = false;
  }

  ngOnDestroy() {
    this.graph && this.graph.destroy();
    this.graph = null;
    this.device_subscription && this.device_subscription.unsubscribe();
    this.itemDevices_subscriptions.forEach(s => s.unsubscribe());
    this.itemDevices_subscriptions = [];
    this.changeQueue = [];
    super.ngOnDestroy();
  }

  ngAfterViewChecked() {

    if (!this.viewChecked) {
      debug && console.log('in ngAfterViewChecked');
      this.viewChecked = true;
      this.drainChangeQueue();
    }

  }


  updateItemsFromDevices() {
    start = Date.now();
    const allItems = new DataSet(this.allItems.get());
    end = Date.now();
    debug && console.log('allItems created', `${end - start} ms,`, `${allItems.length} elements`);

    if (this.graph_data.itemsDeviceList) this.graph_data.itemsDeviceList.forEach(d => {

      const device = this.api.getCurrentDevice(d);

      if (!device) console.error(`In dmj-vis-graph: device "${d}" not found!`);

      debug && console.log(`updateItemsFromDevice ${d}...`)

      let items: ItemData[] = [];
      try {
        items = JSON.parse(device.state as string);
      } catch (e) {
        console.error(e);
      }
      if (!Array.isArray(items) || (items.length > 0 && !items[0].start && !items[0].end)) {
        console.error(`Device "${device.path}" does not contain data for vis-timeline (should be [{start?, end?, content ...}]):`, (device.state as string).substring(0, 100));
        return;
      }

      start = Date.now();
      const itemsSet: DataSet<ItemData> = new DataSet(items);
      end = Date.now();
      debug && console.log('itemsSet created', `${end - start} ms,`, `${itemsSet.length} elements`);


      start = Date.now();
      allItems.update(items);
      end = Date.now();
      debug && console.log('allItems updated', `${end - start} ms,`, `${itemsSet.length} elements`);
    });

    start = Date.now();
    debug && console.log(`Calculating diff between allItems (${allItems.length} elements) and this.allItems (${this.allItems.length} elements)`)
    const newItems = changedOrAddedItems(allItems.get(), this.allItems);
    end = Date.now();
    debug && console.log(`diff duration`, `${end - start} ms, found ${newItems.length} elements`)

    if (newItems.length) {

      this.allItems = allItems;

      const inWindowItems = newItems.filter(i => !i.start || !i.end || !(new Date(i.start) > this.graph.getWindow().end || new Date(i.end) < this.graph.getWindow().start));
      debug && console.log(`${inWindowItems.length} elements in window`);
      this.queueChanges(inWindowItems);

      const outWindowItems = newItems.filter(i => !(!i.start || !i.end || !(new Date(i.start) > this.graph.getWindow().end || new Date(i.end) < this.graph.getWindow().start)));
      debug && console.log(`${outWindowItems.length} elements out of window`);
      this.queueChanges(outWindowItems);

    }


  }


  queueChanges(change: ItemData[]) {
    debug && console.log(`in queueChange, queuing change of ${change.length} elements, queue has now ${this.changeQueue.length + 1} changes`)
    this.changeQueue.push(change);

    if (this.viewChecked) this.drainChangeQueue();

  }

  doDrain(newItems: ItemData[]) {
    debug && console.log(`updating ${newItems.length} items in this.items (${this.items.length})`)
    start = Date.now();
    this.updateGraphItems(newItems);
    end = Date.now();
    debug && console.log(`done`, `${end - start} ms`);

    if (this.changeQueue.length > 0) setTimeout(() => this.drainChangeQueue());
  }

  drainChangeQueue() {
    debug && console.log('in drainChangeQueue:', `${this.changeQueue.length} elements`);

    const newItems = this.changeQueue.shift();

    const MAX_CHUNKSIZE = 2000;

    if (newItems) {
      debug && console.log(`Requested drain of ${newItems.length} changes`);
      if (newItems.length > MAX_CHUNKSIZE) {
        // the graph updates are slow if the chunks are big and visible.
        // Hence, we start with small chunks (when they are probably visible) during startupTimes times
        // and then, when the items are old and probably not visible, we increase the 
        // size of the chunks (x2 exponentially)
        const startupChunkSize = 100;
        let chunkSize = MAX_CHUNKSIZE;
        let startupTimes = 0;
        if (this.items.length === 0) {
          chunkSize = startupChunkSize;
          startupTimes = 5;
        }
        let i = 1;
        const firstChunkSize = Math.min(chunkSize, newItems.length);
        let sent = chunkSize;
        const chunks: ItemData[][] = [];
        while (sent < newItems.length) {
          const chunk = newItems.slice(newItems.length - sent - chunkSize, newItems.length - sent)
          chunks.push(chunk);
          debug && console.log(`preparing chunk size = ${chunk.length}, ${newItems.length - sent - chunkSize}-${newItems.length - sent}`);
          sent = Math.min(sent + chunkSize, newItems.length);
          i++;
          if (i > startupTimes) {
            chunkSize = Math.min(2 * chunkSize, MAX_CHUNKSIZE);
          }
        }
        this.changeQueue.unshift(...chunks);
        debug && console.log(`draining first chunk size = ${firstChunkSize}`);
        this.doDrain(newItems.slice(newItems.length - firstChunkSize, newItems.length));
      } else {
        this.doDrain(newItems);
      }
    }
  }

  updateGraphItems(items: ItemData[]) {
    if (!this.graph) return; // graph has been destroyed

    if (Object.keys(this.graph['itemSet'].items).length === 0) {
      this.items.update(items);
      this.graph.setItems(this.items);
    } else {
      this.items.update(items);
    }
    this.openItems = this.allItems.get().filter(i => !i.end).map(i => i.id);
    this.updateOnlyOpenItems();

    if (this.displayOnlyInRangeExcept) this.filterGroupsInRange();
  }

  updateOnlyOpenItems() {

    if (this.openItems.length > 0) {
      debug && console.log(`updating ${this.openItems.length} open items`);
      const now = (new Date()).toISOString();
      this.items.update(this.openItems.filter(i => this.items.get(i)).map(i => ({ id: i, end: now })));
    }
  }

  filterGroupsInRange(properties?: any) {
    // find visible groups

    const groups = this.graph['itemSet'].groups;

    const start: Date = properties ? properties.start : new Date(this.graph["range"].start);
    const end: Date = properties ? properties.end : new Date(this.graph["range"].end);

    for (let groupId in groups) {
      const group = groups[groupId];
      const groupItems = group.items;
      const groupItemsKeys = Object.keys(groupItems);

      // check if visible
      const nbItems = groupItemsKeys.length;
      const visible = nbItems > 0 && groupItems[groupItemsKeys[0]].data.start <= end && groupItems[groupItemsKeys[nbItems - 1]].data.end >= start;
      group.setData({ className: visible || this.displayOnlyInRangeExcept === null || this.displayOnlyInRangeExcept.indexOf(groupId) != -1 ? "in-range" : "out-range" });
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
    if (typeof state != 'object' || !(state.items || state.itemsDeviceList)) {
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

        this.graph.on('currentTimeTick', () => this.updateOnlyOpenItems());

        this.graph.on('changed', () => {
          if (!this.graph) return; // graph has been destroyed

          debug && console.log(`graph has changed, has now ${Object.keys(this.graph['itemSet'].items).length} items`);
        });

        if (this.graph_data.options && this.graph_data.options.displayOnlyInRangeExcept) {
          if (typeof this.graph_data.options.displayOnlyInRangeExcept === 'string') {
            this.displayOnlyInRangeExcept = [this.graph_data.options.displayOnlyInRangeExcept];
          } else if (Array.isArray(this.graph_data.options.displayOnlyInRangeExcept)) {
            this.displayOnlyInRangeExcept = this.graph_data.options.displayOnlyInRangeExcept;
          } else {
            console.warn('dmj-vis-graph: option "displayOnlyInRangeExcept" must be a string or an array of strings specifying the groups that must be always visible.');
          }
          if (this.displayOnlyInRangeExcept) this.graph.on("rangechange", this.filterGroupsInRange.bind(this));
        }
        //this.graph.on("rangechanged", this.rangeChanged.bind(this));
        //this.graph.on("_change", this.rangeChanged.bind(this));

        if (this.graph_data.itemsDeviceList) {
          this.updateItemsFromDevices();
        }
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
          const groups = this.graph['itemSet'].groups;

          this.graph_data.groups.forEach(g => {
            const group = groups[g.id];
            if (group) g.className = group.className;
          });

          this.graph.setGroups(new DataSet(this.graph_data.groups));
        }

        if (this.graph_data.items) {

          this.allItems = new DataSet<ItemData>(this.graph_data.items);

          const inWindowItems = this.graph_data.items.filter(i => !i.start || !i.end || !(new Date(i.start) > this.graph.getWindow().end || new Date(i.end) < this.graph.getWindow().start))
          debug && console.log(`${inWindowItems.length} elements in window`)
          this.queueChanges(inWindowItems);

          const outWindowItems = this.graph_data.items.filter(i => !(!i.start || !i.end || !(new Date(i.start) > this.graph.getWindow().end || new Date(i.end) < this.graph.getWindow().start)))
          debug && console.log(`${outWindowItems.length} elements out of window`);
          this.queueChanges(outWindowItems);

        }

      } else setTimeout(drawChart, 0);

    }

    if (JSON.stringify(this.graph_data) !== this.device.state) {
      this.graph_data = state;

      drawChart();
    }
  }
}
