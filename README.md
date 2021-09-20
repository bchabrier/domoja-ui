domoja-ui
=========

User interface for [Domoja](https://www.npmjs.com/package/domoja), the home automation framework.

It is a generic user interface that can be configured through the configuration file. However, custom pages or components can be added easily.

It is based on the [Ionic](https://ionicframework.com/) framework.

# Widgets

Widgets are selected through the `widget` attribute of devices, as in:
```
devices:
  - samples:
     - planning-filtration-graph : { type: variable, widget: graph, tags: 'piscine-page', name: "Planning de filtration"} 
```

## Supported widgets

[//]: # (widgetList START)
### Widget `camera`
Displays a camera.

#### Example
```
devices:
  - camera_interieure: { type: httpCamera, widget: camera, tags: 'aquarium-page', video-url: /assets/imgs/demo_camera_interieure.jpg, snapshot-url: /assets/imgs/demo_camera_interieure.jpg, name: "Caméra intérieure" }
```

### Widget `color`
Displays the device state with its color.

The state can be rgb (e.g. `#FFFFFF`) or literal (e.g. `orange`).
#### Example
```
devices:
  - presence-couleur : { type: variable, widget: color, tags: 'semeria', name: "Couleur icon"} 
```

### Widget `comm`
Displays a communication icon when there is a communication with the server

#### Example
```
devices:
  - comm: { type: variable, widget: "comm", name: "Communication"}
```

### Widget `confirm`
Displays a button that, when clicked, will open a confirmation dialog box.

#### Parameters
`widget: "confirm:<button-label>:<button-color>:<confirm-title>:<confirm-message>:<confirm-buttons>"`

The device state will be changed to the value of the clicked confirm button.

- `<button-label>`: the label of the button
- `<button-color>`: the color of the button
- `<button-title>`: the title of the confirmation dialog box
- `<button-message>`: the message of confirmation dialog box
- `<button-buttons>`: the comma-separated names of the buttons that appear in the confirmation dialog box

#### Example
```
devices:
  - controle : { type: variable, widget: "confirm:Actionner:primary:Petit portail:Actionner le petit portail?:Partiel,Grand,Non", tags: 'portails-page, entrée', name: "Actionner le petit portail"} 
```

### Widget `graph`
Display a graph described by the device state.

The device state should be a string representing a google "ChartWrapper" object, with "ChartType", "dataTable" and "options" properties (see specs on https://developers.google.com/chart/interactive/docs/reference#google.visualization.drawchart).
#### Example
```
devices:
  - planning-filtration-graph : { type: variable, debug: false, widget: graph, tags: 'piscine-page', name: "Planning de filtration"} 
```

### Widget `input`
Displays a text area with a button

When the button is clicked, the device state is changed to the value of the text area.

*Improvement needed*: pass the button label as a parameter
 
#### Example
```
devices:
  - text-to-say : { type: variable, widget: "input", tags: 'voix', name: "Message à dire"} 
```

### Widget `multistate`
This widget is used to display a state with multiple values. Each state value is represented with a button. 
When clicked, the device state changes to the label of the clicked button.
The color of the buttons can be specified.

#### Parameters:
`widget: "multistate:<button-labels>:<button-colors>"`

- `<button-states>`: a comma-separated list of the button states
- `<button-colors>`: a comma-separated list of the button colors
- `<button-labels>`: an optional comma-separated list of the button labels, displayed instead of the button state

 
#### Example
```
devices:
  - controle : { type: variable, widget: "multistate:AUTO,ON,OFF:primary,secondary,danger", tags: 'aquarium-page', name: "Commande de l'aquarium"} 
```

### Widget `progress-bar`
Displays a progress or meter HTML5 element, based on the state of the device.

The state must be in the form `<value>:<meter|progress>:<min>:<low>:<high>:<optimum>:<max>`, where:
- `<value>`: is the value of the bar
- `<meter|progress>`: is one of `meter` or `progress`. If `progress`, on `<value>` and `<max>` are taken into account. 
- `<min>`: is the min value
- `<low>`: is the low value
- `<high>`: is the high value
- `<optimum>`: is the optimum value
- `<max>`: is the max value

See HTML specs here:
- https://developer.mozilla.org/fr/docs/Web/HTML/Element/Progress
- https://developer.mozilla.org/fr/docs/Web/HTML/Element/Meter


#### Example
```
devices:
  - charge : { type: sensor, source: robonect, widget: progress-bar, id: "/Robonect/mower/battery/charge", tags: tondeuse-page, name: "Charge batterie", transform: !!js/function 'function (value) { 
      let v = parseInt(value);
      if (isNaN(v)) v = 0;
      // should return <value>:<meter|progress>:<min>:<low>:<high>:<optimum>:<max>
      return v + ":meter:0:33:66:90:100";
    }' }
```

### Widget `temp-graph`

Displays temperature graphs for the current and previous day, week, month and year.

The data is taken from the history of a given device, specified as a parameter.

#### Parameters
`widget: "temp-graph:<device-path>"`

`<device-path>` should identify a device that has persistence enabled and aggregated, as in:
```
devices:
  - piscine:
    - temperature: { type: sensor, widget: text, tags: 'piscine-page, piscine-temp-page', source: myZibase, id: "OS439157539", attribute: "tem", 
      persistence: "mongo:temperature_piscine:0:aggregate:120000", 
      name: "Température" }
```

#### Example
```
devices:
  - temperature-graph : { type: variable, widget: temp-graph:piscine.temperature, tags: 'piscine-temp-page', name: "Courbe de température"} 
```

### Widget `tempo-color`
Display the tempo color, based on the device state (`Bleu` or `Blanc` or `Rouge` or `Indéterminé`).

See module domoja-tempo here: https://www.npmjs.com/package/domoja-tempo
#### Example
```
devices:
  - couleur_du_jour : { type: device, widget: tempo-color, tags: 'tempo', source: tempo, id: couleurDuJour, name: "Couleur du jour" }
```

### Widget `text`
Displays the device state as simple text. When a date is recognized, it is friendly displayed.
#### Example
```
devices:
  - lampes_start : { type: variable, widget: text, tags: 'aquarium-page', name: "Heure allumage aquarium" }
```

### Widget `toggle`
Display a device state as a toggle. The value `ON` display the toggle switched on. Other values display it switched off.
#### Example
```
devices:
  - pompes : { type: device, widget: toggle, tags: 'aquarium-page', source: ZStick, id: "14-37-2-currentValue", name: "Pompes aquarium" }
```

### Widget `vis-graph`
Display a graph described by the device state.

The device state should be a string representing a google "ChartWrapper" object, with "ChartType", "dataTable" and "options" properties (see specs on https://developers.google.com/chart/interactive/docs/reference#google.visualization.drawchart).
#### Example
```
devices:
```

### Widget `walkingman`
This widget is to be used to display presence detectors state. It represents a walking man, 
highlighted in red when the state of the device is `ON`. When it turns to another value,
the walking man fades to white progressively.
#### Example
```
devices:
  - porte: { type: sensor, widget: walkingman, tags: 'détecteurs, sensor-alarm', source: myIPX800, id: "INPUT5", name: "Porte garage du bas ou jardin", transform: "0=>OFF,1=>ON" }
```

### Widget `zwave-config`
Display a ZWave network configuration and allows editing it. 
The state is a JSON string listing all nodes and their configuration.
#### Example
```
devices:
  - config : { type: device, widget: "zwave-config", tags: 'zwave', source: ZStick, id: "1", attribute: "zwave_config", name: "ZWave config"} 
```


[//]: # (widgetList END)

# Development

## Add a new page

```
# generate the page with Ionic
$ ionic generate page dmj-<pagename>
```

The file `<pagename>.module.ts` can be safely deleted.

Then, add the page in `src/pages/providers/page-components/page-components.ts`. You can then customize and use the page.

## Add a new dashboard component

```
# generate the component with Ionic
$ ionic generate component DmjDashboard<ComponentName>
```

In the file `src/components/dmj-dashboard-<component-name>.ts`, make the class `DmjComponentName` derive from `DmjDashboardComponent`, after importing with:
```typescript
import { Component } from '@angular/core';
import { DmjDashboardComponent } from '../dmj-dashboard-component';


@Component({
  selector: 'dmj-dashboard-<component-name>',
  templateUrl: 'dmj-dashboard-<component-name>.html'
})
export class DmjDashboard<ComponentName> extends DmjDashboardComponent {

  constructor() {
    super();
  }

}

```

## Add a new widget

Simply make a copy of an existing `dmj-` widget directory.

Define `ngOnInit()` to initialize the widget.

## Development

# Add a new provider

```
$ ionic generate provider
```
