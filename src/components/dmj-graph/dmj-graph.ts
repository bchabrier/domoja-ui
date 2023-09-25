import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmjWidgetComponent } from '../dmj-widget';
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GoogleCharts } from 'google-charts';

/**
 * Display a graph described by the device state.
 * 
 * The device state should be a string representing a google "ChartWrapper" object, with "ChartType", "dataTable" and "options" properties (see specs on https://developers.google.com/chart/interactive/docs/reference#google.visualization.drawchart).
 */
@Component({
  selector: 'dmj-graph',
  templateUrl: 'dmj-graph.html'
})
export class DmjGraph extends DmjWidgetComponent implements OnInit, OnDestroy {

  @Input() error: SafeHtml;
  container: string;
  graph: any;
  graph_data: {
    chartType: string,
    dataTable?: Object,
    options?: Object,
    dataSourceUrl?: string,
    query?: string,
    refreshInterval?: Number,
    view?: Object | Array<Object>,
  } //& { containerId: string }
  device_subscription: Subscription;

  constructor(public api: DomojaApiService, private sanitizer: DomSanitizer) {
    super(null, api);
  }

  ngOnInit() {
    super.ngOnInit();
    this.device_subscription = this.api.getDevice(this.device.id).subscribe(device => {
      this.container = '_graph_' + this.device.path;
      this.updateChart();
    });
  }

  ngOnDestroy() {
    this.device_subscription.unsubscribe();
    super.ngOnDestroy();
  }

  updateChart() {

    let error = () => {
      this.error = this.sanitizer.bypassSecurityTrustHtml(`State of device "${this.device.id}" should be a string representing a google "ChartWrapper" object, with "ChartType", "dataTable" and "options" properties (see specs <a href="https://developers.google.com/chart/interactive/docs/reference#google.visualization.drawchart" target="_blank">here</a>).<br>Is: ${this.device.state}`);
    }

    // check that state is a real graph info
    if (typeof this.device.state != 'string') {
      error();
      return;
    }
    let state = JSON.parse(this.device.state);
    if (typeof state != 'object' || !state.chartType || !state.dataTable) {
      error();
      return;
    }

    let drawChart = () => {
      if (!this.graph) {
        this.graph = new GoogleCharts.api.visualization.ChartWrapper();
        this.graph.setContainerId(this.container);
      }

      this.graph.setChartType(this.graph_data.chartType);
      this.graph.setDataTable(this.graph_data.dataTable);
      this.graph.setDataSourceUrl(this.graph_data.dataSourceUrl);
      this.graph.setQuery(this.graph_data.query);
      this.graph.setRefreshInterval(this.graph_data.refreshInterval);
      this.graph.setView(this.graph_data.view);
      this.graph.setOptions(this.graph_data.options);
      this.graph.draw();
    }

    if (this.graph_data !== state) {
      this.graph_data = state;

      //Load the charts library with a callback
      GoogleCharts.load(drawChart);
    }
  }
}
