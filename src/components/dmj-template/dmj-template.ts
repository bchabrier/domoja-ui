import { Component, ComponentRef, ElementRef, OnDestroy, OnInit, Self } from '@angular/core';
import { DomojaApiService } from '../../providers/domoja-api/domoja-api';
import { DmjWidgetComponent } from '../dmj-widget';

import { Subscription } from 'rxjs';


import { DynamicComponentFactory, DynamicComponentFactoryFactory } from '../../providers/DynamicComponentFactoryFactory/dynamicComponentFactoryFactory';

// strongly inspired from https://www.talentica.com/blogs/angular-how-to-render-html-containing-angular-components-dynamically-at-run-time/

type Domoja = {
  getDeviceState: (device: string) => string,
  setDeviceState: (device: string, state: string, callback: (err: Error) => void) => void,
}


/*
 * Displays the device state as simple text. When a date is recognized, it is friendly displayed.
 * A format can be added following a character separator not used in the format.
 * 
 * The supported formats are: 
 * - `intl-messageformat`: see https://formatjs.io/docs/core-concepts/icu-syntax and https://unicode-org.github.io/icu/userguide/format_parse/
 * - `%j`: display as JSON object
 * - `%s`: display as string
 * - `%d`: display as Number
 * - compact<n>: display as a compacted string <start>...<end> limited to n characters
 * 
 * Examples:
 * - `"text"` to display the value without interpreting the HTML tags 
 * - `"text:%s"` to display the value while interpreting the HTML tags 
 * - `"text:Temp is <b>{value, number}</b> °C"` to format a number in an HTML string
 * - `"text/Part is {value, number, ::percent}"` to format a number as a percentage
 * - `"text/Amount is <b>{value, number, ::sign-always compact-short currency/GBP}</b>"` to format a number with a currency
 * - `"text/Temp is {value, number, :: .00 } °C"` to format a number with 2 fraction digit
 * - `"text/Temp is {value, number, :: .0# } °C"` to format a number with at least 1 fraction digit
 * - `"text/Temp is {value, number, :: percent .00 } °C"` to format a number as a percentage with 2 fraction digit
 * - `"text/JSON is: %j"` to format a value as a JSON
 * - `"text: value = %d"` to format a value as a number
 * - `"text:compact256"` to format a string to 256 chars max
 * 
 */

@Component({
  selector: 'dmj-template',
  template: ``,
  providers: [
    DynamicComponentFactoryFactory, // IMPORTANT!
  ],
})
export class DmjTemplateComponent extends DmjWidgetComponent implements OnDestroy, OnInit {

  private readonly factories: DynamicComponentFactory<any>[] = [];
  private readonly hostElement: Element;

  components: any[] = [
    DmjWidgetComponent,
    // ... add others
  ];

  private subscription: Subscription;

  constructor(
    // @Self - best practice; to avoid potential bugs if you forgot to `provide` it here
    @Self() private cmpFactory: DynamicComponentFactoryFactory,
    elementRef: ElementRef,
    public api: DomojaApiService
  ) {
    super(null, api);
    this.hostElement = elementRef.nativeElement;

    window['Domoja'] = (script: HTMLScriptElement) => {
      if (!script) {
        throw new Error(`Domoja: null script element. Must be created at top level in the script (not inside a function)!`);
      }

      const template: DmjTemplateComponent = script['dmjTemplate'];

      return {
        getDeviceState: (device: string) => template.api.getCurrentDevice(device).state,
        setDeviceState: (device: string, state: string, callback: (err: Error) => void) => template.api.setDeviceState(template.api.getCurrentDevice(device), state, callback),
      } as Domoja;
    }

  }

  ngOnInit() {
    this.initFactories();

    this.subscription = this.api.getDevice(this.device.path).subscribe(device => {


      console.log("new device state:", device.state);

      const template = insertDmjWidgets(device.state.toString());
      this.hostElement.innerHTML = template;
      this.createAllComponents();

      // insert <script> tags
      const scriptEls = Array.prototype.slice.call(this.hostElement.querySelectorAll('script')) as HTMLScriptElement[];

      scriptEls.forEach(script => {
        const text = script.textContent;

        let s = document.createElement("script");
        script['getAttributeNames' /* typescript limited to 2.6.2 */]().forEach(attr => {
          s.setAttribute(attr, script.getAttribute(attr));
        });
        s.text = text;
        // link the script to this template
        s['dmjTemplate'] = this;
        script['replaceWith' /* typescript limited to 2.6.2 */](s);
      });

    });

  }

  private initFactories(): void {
    this.components.forEach(c => {
      const f = this.cmpFactory.create(c);
      this.factories.push(f);
    });
  }

  // Create components dynamically
  private createAllComponents(): void {
    const el = this.hostElement;
    const compRefs: ComponentRef<any>[] = [];
    this.factories.forEach(f => {
      const comps = f.create(el);
      compRefs.push(...comps);
    });

    // Here you can make use of compRefs, filter them, etc.
    // to perform any custom operations, if required.
    false && compRefs
      .filter(c => c.instance instanceof DmjWidgetComponent)
      .forEach(c => {
        const cc = c as ComponentRef<DmjWidgetComponent>;
        console.log(cc.location);
        cc.instance['filtering'] = 'false';
      });
  }

  private removeAllComponents(): void {
    this.factories.forEach(f => f.destroy());
  }

  ngOnDestroy(): void {
    this.subscription && this.subscription.unsubscribe();
    this.subscription = null;

    // remove the templates stored in the scripts
    const scriptEls = Array.prototype.slice.call(this.hostElement.querySelectorAll('script')) as HTMLScriptElement[];
    scriptEls.forEach(script => {
      delete script['dmjTemplate'];
    });

    this.removeAllComponents();
  }

}

export function insertDmjWidgets(label: string): string {
  let re = /\$(\{([^{},]+)\})/;
  // path potentially followed by , and chars and possible { } groups

  let result = label;

  let m: RegExpMatchArray;

  while (m = result.match(re)) {
    let devicePath = m[2];
    let value = devicePath;
    if (value === undefined || value === null) console.error(`Unknown device '${devicePath}'`);
    else result = result.replace(re, `<dmj-widget device="${value.toString()}"></dmj-widget>`);
  }

  return result;
}
