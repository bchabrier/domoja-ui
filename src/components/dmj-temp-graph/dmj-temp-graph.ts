import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DmjWidgetComponent } from '../dmj-widget';
import { DomojaApiService, Device } from '../../providers/domoja-api/domoja-api';
import { SafeHtml } from '@angular/platform-browser';

import { GoogleCharts } from 'google-charts';

type Configuration = {
  pastLabel: string,
  currentLabel: string,
  from: Date,
  to: Date,
  aggregate: "none" | "minute" | "hour" | "day" | "week" | "month" | "year",
  mode: string,
}

/**
 * 
 * Displays temperature graphs for the current and previous day, week, month and year.
 * 
 * The data is taken from the history of a given device, specified as a parameter.
 * 
 * #### Parameters
 * `widget: "temp-graph:<device-path>"`
 * 
 * `<device-path>` should identify a device that has persistence enabled and aggregated, as in:
 * ```
 * devices:
 *   - piscine:
 *     - temperature: { type: sensor, widget: text, tags: 'piscine-page, piscine-temp-page', source: myZibase, id: "OS439157539", attribute: "tem", 
 *       persistence: "mongo:temperature_piscine:0:aggregate:120000", 
 *       name: "Température" }
 * ```
 * 
 */
@Component({
  selector: 'dmj-temp-graph',
  templateUrl: 'dmj-temp-graph.html'
})
export class DmjTempGraph extends DmjWidgetComponent implements OnInit, OnDestroy {

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
  devices_subscription: Subscription;
  sensor: Device;
  modes: string[] = [];
  mode: string;
  @Input() loading = true;


  constructor(public api: DomojaApiService, private http: HttpClient) {
    super(null);
  }

  ngOnInit() {
    super.ngOnInit();
    this.devices_subscription = this.api.getDevices().subscribe(devices => {
      if (this.container) return;

      this.modes = ["Jour", "Semaine", "Mois", "Année"];

      this.container = '_graph_' + this.device.path;
      this.sensor = devices.filter(d => d.path == this.device.widget.split(':')[1])[0];
      /*
            this.from = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
            this.to = new Date(this.from.getTime() + 24 * 60 * 60 * 1000);
            this.aggregate = "hour";
      */
      GoogleCharts.load(() => {
        if (this.graph) return;

        this.graph = new GoogleCharts.api.visualization.ChartWrapper();
        this.graph.setChartType("AreaChart");
        this.graph.setContainerId(this.container);
        this.graph.setOptions({
          vAxis: { format: "#.#°C" },
          hAxis: {
            title: "Courbe de température",
            format: "H'h'",
            //slantedText: false,
          },
          legend: { position: 'top' },
          interpolateNulls: true,
          height: "200",
          width: "300",
        });

        this.changeMode(this.modes[0]);
      });

    });

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateChart(config: Configuration, options: Object) {

    if (this.mode == config.mode) return;


    let dataTable: any[][] = [
      ["Heure", config.currentLabel, config.pastLabel, { role: "certainty" }],
      [config.from, 0, 0, false],
      [config.to, 0, 0, false]
    ];

    this.graph.setDataTable(dataTable);
    options["vAxis"].viewWindow = { min: 0, max: parseFloat(this.sensor.state as string) };
    this.graph.setOptions(options);
    this.graph.draw();

    let gap = config.to.getTime() - config.from.getTime();
    let pastFrom = new Date(config.from.getTime() - gap);
    let pastTo = new Date(config.to.getTime() - gap);

    this.mode = config.mode;

    const notif = this.api.notifyConnectionStarted();
    let http_subscription = this.http.get(`${DomojaApiService.DomojaURL}/devices/${this.sensor.path}/history?from=${pastFrom.toJSON()}&to=${config.to.toJSON()}&aggregate=${config.aggregate}`, { withCredentials: true }).pipe(
      this.api.checkAuthentifiedOperator(),
    ).subscribe(
      (res: { date: string, value: number }[]) => {
        this.api.notifyConnectionClosed(notif, true);

        let rawres = res.map(r => { return { date: new Date(r.date), value: r.value } });

        let rawdata: { [date: string]: { current: number, past: number } } = {};

        // get current data
        rawres.filter(
          r => r.date >= config.from && r.date < config.to
        ).forEach(r => { rawdata[r.date.toJSON()] = { current: r.value, past: null } });

        // push current value
        let lastDate: Date = this.sensor.UpdateDate as Date;
        let lastUpdateDate = new Date((this.sensor as any).lastUpdateDate)
        if (lastUpdateDate > lastDate) lastDate = lastUpdateDate;

        if (lastDate.getTime() > 0) {
          rawdata[lastDate.toJSON()] = { current: parseFloat(this.sensor.state as string), past: null }
        }

        // push from and to
        //if (!rawdata[config.from.toJSON()]) rawdata[config.from.toJSON()] = { current: null, past: null };
        //if (!rawdata[config.to.toJSON()]) rawdata[config.to.toJSON()] = { current: null, past: null };

        // merge past data
        let pastres = rawres.filter(
          r => r.date >= pastFrom && r.date <= pastTo
        );

        pastres.forEach(r => {
          let d = new Date(r.date.getTime() + gap).toJSON();
          if (rawdata[d]) {
            rawdata[d].past = r.value
          } else {
            rawdata[d] = { current: null, past: r.value }
          }
        });

        // build data table
        let data = this.buildDataTable(rawdata, options['hAxis'].format);

        let dataTable: any[][] = [
          ["Heure", config.currentLabel, config.pastLabel, { role: "certainty" }],
          ...data
        ]

        // remove past data column if no data
        if (pastres.length == 0) {
          dataTable = dataTable.map(r => [r[0], r[1], r[3]]);
        }

        this.graph.setDataTable(dataTable);
        options["vAxis"].viewWindow.max = undefined;
        this.graph.setOptions(options);

        http_subscription.unsubscribe();

        // if the request does not correspond to the selected mode, drop it
        // indeed it is probably an "old" request if the user changed his mind
        if (this.mode == config.mode) {
          this.graph.draw();
          this.loading = false;
        }

      }, err => {
        this.api.notifyConnectionClosed(notif, false);
        console.log("Error while retrieving history", err);
      });
  }

  changeMode(mode: string) {
    if (mode == this.mode) return;
    this.loading = true;
    let options = this.graph.getOptions();
    let from: Date;
    let to: Date;
    let pastLabel: string;
    let currentLabel: string;
    let _config: Configuration;
    let aggregate: typeof _config.aggregate;
    options.hAxis.ticks = undefined;
    options.hAxis.gridlines = undefined;
    switch (mode) {
      case "Jour":
        from = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
        to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
        aggregate = "hour";
        options.hAxis.ticks = [];
        for (let i = 0; i <= 4; i++) options.hAxis.ticks.push({ v: new Date(from.getTime() + i * 6 * 60 * 60 * 1000), f: (i * 6) + 'h' });
        options.hAxis.format = "H'h'";
        currentLabel = "Aujourd'hui";
        pastLabel = "Hier";
        break;
      case "Semaine":
        let day = new Date().getDay();
        if (day == 0) day = 7;
        from = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1 - day, 0, 0, 0, 0);
        to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
        aggregate = "hour";
        options.hAxis.format = 'EEE';
        options.hAxis.gridlines = { count: 7 };
        currentLabel = "Cette semaine";
        pastLabel = "Semaine dernière";
        break;
      case "Mois":
        from = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0);
        to = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1, 0, 0, 0, 0);
        aggregate = "day";
        options.hAxis.format = 'd';
        currentLabel = from.toLocaleString('default', { month: 'long' });
        pastLabel = new Date(from.getTime() - 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'long' });
        break;
      case "Année":
        from = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0);
        to = new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0, 0);
        aggregate = "week";
        options.hAxis.format = 'MMM';
        currentLabel = from.getFullYear().toString();
        pastLabel = (from.getFullYear() - 1).toString();
        break;

    }

    options.hAxis.viewWindow = { min: from, max: to };
    this.updateChart({
      from: from,
      to: to,
      pastLabel: pastLabel,
      currentLabel: currentLabel,
      aggregate: aggregate,
      mode: mode,
    }, options);
  }

  buildDataTable(data: { [date: string]: { current: number, past: number } }, hAxisFormat: string) {

    function temp(t) {
      let f = Math.round(parseFloat(t) * 10) / 10;
      let i = parseInt(t);

      return ((i == f) ? i : f) + "°C";
    }

    let dateFormatFunction = d => {
      if (hAxisFormat == 'MMM') {
        return d.toLocaleString('default', { month: 'short' });;
      } else if (hAxisFormat == 'EEE') {
        return d.toLocaleString('default', { weekday: 'long' });;
      } else {
        let formatter = new GoogleCharts.api.visualization.DateFormat({ pattern: hAxisFormat });
        return formatter.formatValue(d);
      }
    }

    return Object.keys(data).map(d => {
      let dd = new Date(d);
      return [
        dateFormatFunction ? { v: dd, f: dateFormatFunction(dd) } : dd,
        data[d].current ? { v: data[d].current, f: temp(data[d].current) } : null,
        data[d].past ? { v: data[d].past, f: temp(data[d].past) } : null,
        true
      ]
    }).sort((a, b) => {
      let _a = (typeof a[0] == 'object') ? a[0]['v'] : a[0];
      let _b = (typeof b[0] == 'object') ? b[0]['v'] : b[0];
      if (_a < _b) return -1;
      if (_a > _b) return 1;
      return 0;
    });
  }
}
