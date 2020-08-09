domoja-ui
=========

User interface for [Domoja](https://www.npmjs.com/package/domoja), the home automation framework.

It is a generic user interface that can be configured through the configuration file. However, custom pages or components can be added easily.

It is based on the [Ionic](https://ionicframework.com/) framework.

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