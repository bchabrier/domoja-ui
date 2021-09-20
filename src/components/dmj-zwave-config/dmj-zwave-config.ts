import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomojaApiService, Device } from '../../providers/domoja-api/domoja-api';
import { DmjWidgetComponent } from '../dmj-widget';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isArray } from 'ionic-angular/util/util';


// vis package is using a too newer version of typescript, no compatible with angular 5
// hence, to compile we use the js imports, and to check at edit time, we use the ts imports
// this is done automatically by ionic:serve/build:before/after
import { Network } from 'vis-network/peer';
//import { Network } from 'vis-network/dist/vis-network.js';
import { DataSet } from 'vis-data/peer';
//import { DataSet } from 'vis-data/dist/esm.js';

type ValueID = { id: string, value: any, valueMetadata: { type: string }, valueId: any };

enum NodeStatus {
  Unknown,
  Asleep,
  Awake,
  Dead,
  Alive,
}

type zwaveNode = {
  id: string | number,
  usedBy?: Device[],
  neighbors: number[],
  commandClassNames: string[],
  allValues: Array<{
    commandClassName: string,
    values: Array<ValueID>
  }>,
  allValuesByCommandClassName: Array<Array<ValueID>>,
  manufacturer: string,
  product: string,
  productCode: string,
  name: string,
  location: string,
  status: NodeStatus
}

type zwaveState = {
  nodes?: Array<zwaveNode>,
  command?: {
    nodeId: string,
    valueID: ValueID,
    value: any
  }
}

/**
 * Display a ZWave network configuration and allows editing it. 
 * The state is a JSON string listing all nodes and their configuration.
 */
@Component({
  selector: 'dmj-zwave-config',
  templateUrl: 'dmj-zwave-config.html'
})
export class DmjZwaveConfigComponent extends DmjWidgetComponent implements OnInit, OnDestroy {

  @ViewChild('visNetwork') visNetwork: ElementRef;
  private networkInstance: Network;

  @Input() error: SafeHtml;
  @Input() selectedNode: number;
  @Input() state: zwaveState = { nodes: [] };
  devices_subscription: Subscription;
  previousDeviceState = "";
  devices: Device[];

  constructor(public api: DomojaApiService, private sanitizer: DomSanitizer) {
    super(null);
    this.devices_subscription = this.api.getDevices().subscribe(devices => {
      this.devices = devices;
      this.updateWidget(devices);
    });
  }

  ngOnInit() {
    this.selectedNode = -1;
    this.updateWidget(this.api.getCurrentDevices());
  }

  ngAfterViewInit(): void {
    // create an array with nodes
    const nodes = new DataSet(
      this.state.nodes.map(node => {
        return {
          id: node.id.toString(),
          label: (node.id === 1 ? "Controller" : "Node " + node.id)
            + "\n" + node.productCode
            + "\n" + node.product
            + "\n" + (node.location || ""),
          shape: node.id == 1 ? 'circle' : 'box',
          color: node.status === NodeStatus.Unknown ? 'Grey' :
            node.status === NodeStatus.Asleep ? 'lavender' :
              node.status === NodeStatus.Dead ? 'red' :
                node.id == 1 ? 'plum' : null,
        }
      }));

    // create an array with edges
    const tab: { from: number; to: number }[] = [];

    this.state.nodes.forEach(node => {
      node.neighbors.forEach(nb => {
        tab.find(e => e.to == node.id && e.from == nb) || tab.push({
          from: parseInt(node.id.toString()),
          to: nb
        });
      });
    });
    const edges = new DataSet<any>(tab);

    const data = { nodes, edges };

    const container = this.visNetwork;
    this.networkInstance = new Network(container.nativeElement, data, {
      height: "250px",
      nodes: {
        widthConstraint: {
          maximum: 100,
        },
      },
      physics: {
        barnesHut: {
          gravitationalConstant: -10000,
        }
      },
      configure: {
        enabled: false,
      }
    });

    this.networkInstance.on("click", params => {
      console.log(
        "click event, getNodeAt returns: " +
        this.networkInstance.getNodeAt(params.pointer.DOM)
      );
      this.selectedNode = params.nodes.length > 0 ? this.state.nodes.findIndex(node => node.id == params.nodes[0]) : -1;
    });
  }

  ngOnDestroy() {
    this.devices_subscription.unsubscribe();
    this.networkInstance && this.networkInstance.destroy();
    this.networkInstance = null;
    super.ngOnDestroy();
  }

  nodeStatusAsString(status: NodeStatus) {
    return NodeStatus[status];
  }

  select(index: number) {
    this.selectedNode = index;
    this.networkInstance.selectNodes(index >= 0 ? [this.state.nodes[index].id] : []);
  }

  getUsedDevices(node: zwaveNode): string {
    return node.usedBy ? node.usedBy.map(d => d.path).join(', ') : ''
  }

  getDevicesFromId(id: string): string {
    return this.devices.filter(d => d.id === id).map(d => d.path).join(', ');
  }

  getCommandClassNames(node: zwaveNode): string[] {
    return node.allValues.map(v => v.commandClassName);
  }

  getValueIDs(node: zwaveNode, commandClassName: string) {
    const values = node.allValues.filter(v => v.commandClassName === commandClassName);
    return values && values.length === 1 ? JSON.parse(JSON.stringify(values[0].values)) : [];
  }

  getStatesAsArray(states: Object) {
    return Object.keys(states).map(k => {
      return { key: k, state: states[k] };
    });
  }

  getOriginalValue(node: zwaveNode, valueID_id: string) {
    let foundValueID: ValueID;
    node.allValues.forEach(v => {
      v.values.forEach(valueID => {
        if (valueID.id === valueID_id) {
          foundValueID = valueID;
        }
      });
    });
    if (foundValueID === undefined) console.error("Could not find original value of valueID_id", valueID_id);
    return foundValueID ? foundValueID.value : "";
  }

  private sendControllerCommand(command: Object) {
    let msg = JSON.parse(this.device.state as string);
    Object.assign(command, msg);
    this.device.stateChange(this.device, JSON.stringify(command), err => {});
  }

  setValueID(node: zwaveNode, valueID: ValueID) {
    let value: any;
    switch (valueID.valueMetadata.type) {
      case 'boolean':
      case 'number':
        value = JSON.parse(valueID.value);
        break;
      default:
        value = valueID.value;
    }

    this.sendControllerCommand({
      command: {
        command: "setValue",
        nodeId: node.id.toString(),
        valueID: valueID.valueId,
        value: value
      }
    });
  }

  ping(node: zwaveNode) {
    this.sendControllerCommand({
      command: {
        command: "ping",
        nodeId: node.id.toString(),
      }
    });
  }

  heal(node: zwaveNode) {
    this.sendControllerCommand({
      command: {
        command: "heal",
        nodeId: node.id.toString(),
      }
    });
  }

  refreshInfo(node: zwaveNode) {
    this.sendControllerCommand({
      command: {
        command: "refreshInfo",
        nodeId: node.id.toString(),
      }
    });
  }

  interviewCC(node: zwaveNode, commandClassName: string) {
    // find the commandClass code
    const commandClass = node.allValuesByCommandClassName[commandClassName][0].id.split('-')[1];
    this.sendControllerCommand({
      command: {
        command: "interviewCC",
        nodeId: node.id.toString(),
        commandClass: commandClass
      }
    });
  }


  updateWidget(devices: Device[]) {
    let error = () => {
      this.error = this.sanitizer.bypassSecurityTrustHtml(`State of controller "${this.device.id}" should be a string representing a ZWave network: {nodes: [...]} .<br>Is: ${this.device.state}`);
    }

    if (!this.device) return;

    // check that state is a JSON string
    if (typeof this.device.state != 'string') {
      error();
      return;
    }

    if (this.device.state !== this.previousDeviceState) {
      console.log('new state');
      const newState: zwaveState = JSON.parse(this.device.state);

      if (!newState.nodes) return;

      this.state = newState;
      if (typeof this.state != 'object' || !this.state.nodes || !isArray(this.state.nodes)) {
        error();
        return;
      }

      // update need fields
      this.state.nodes.forEach(node => {
        node.commandClassNames = this.getCommandClassNames(node);
        node.allValuesByCommandClassName = [];
        node.commandClassNames.forEach(commandClassName => {
          node.allValuesByCommandClassName[commandClassName] = this.getValueIDs(node, commandClassName);
          node.allValuesByCommandClassName[commandClassName].forEach(valueID => {
            if (valueID.valueMetadata.states) valueID.valueMetadata.states = this.getStatesAsArray(valueID.valueMetadata.states);
          });
        });
      });

      this.previousDeviceState = this.device.state;
    }


    // update the list of "used by" devices
    this.state.nodes.forEach(node => {
      const nodeId = node.id.toString();
      node.usedBy = devices.filter(d => d.source === this.device.source && d.id.toString().split('-')[0] === nodeId);
    });

  }

}
