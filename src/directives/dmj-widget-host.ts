import { Directive, ViewContainerRef } from '@angular/core';
import { Device } from '../providers/domoja-api/domoja-api'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// IntlMessageFormat package is using a too newer version of typescript, not compatible with angular 5
// hence, to compile we use the js imports, and to check at edit time, we use the ts imports
// this is done automatically by ionic:serve/build:before/after
import IntlMessageFormat from 'intl-messageformat';

import * as util from 'util';

/**
 * Generated class for the DmjWidgetHostDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[dmj-widget-host]' // Attribute selector
})
export class DmjWidgetHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }
}

function applyFormat(format: string, value: string | Date) {
  let string = "";
  let error = "";
  const expr = /%[sdj]/;
  let index = format.search(expr);
  if (index >= 0) {
    // util.format style

    let formatArgs = [];
    while (index >= 0) {
      switch (format.substring(index, index + 2)) {
        case '%s':
        case '%d':
          formatArgs.push(value);
          break;
        case '%j':
        default:
          let valueAsJSON: any;
          try {
            valueAsJSON = JSON.parse(value as string);
          } catch (e) { }
          format = format.substring(0, index) + '%s' + format.substring(index + 2); // otherwise will display "<json_string>" with ""
          formatArgs.push(valueAsJSON ? util.inspect(valueAsJSON).replaceAll('\n', '<br/>').replaceAll(/ /g, '&nbsp;') : value);
          break;
      }
      const i = format.substring(index + 2).search(expr);
      index = i >= 0 ? index + i + 2 : -1;
    }
    string = util.format(format, ...formatArgs);
  } else if (format.match(/^compact[0-9][0-9]+$/)) {
    // compact-<number>
    const n = parseInt(format.substring(7));

    const str = value.toString();
    if (str.length <= n) {
      string = str;
    } else if (n <= 3) {
      string = str.substring(0, 3);
    } else if (n === 4) {
      string = str[0] + '...';
    } else {
      const midLength = Math.floor((n - 3) / 2);
      string = str.substring(0, midLength) + '...' + str.substring(str.length - midLength);
    }
  } else {
    // intl-messageformat style
    try {
      const msg = new IntlMessageFormat(format);
      string = msg.format({ value: value.toString() }) as string;
    } catch (e) {
      error = `${e} in "${format}". Check syntax <a href="https://formatjs.io/docs/core-concepts/icu-syntax" target=_blank>here</a> and <a href="https://unicode-org.github.io/icu/userguide/format_parse/">here</a>.`;
    }
  }
  return { string, error }
}

/**
 * This function interpret the device values in a label
 * Device values are denoted by ${<device-path>}.
 * It can be completed by a format as in
 * ${piscine.temperature, number, ::.#}
 * 
 * @param sanitizer 
 * @param label 
 * @param devices 
 * @returns the new label and the devices that were mentionned
 */
export function interpretLabel(sanitizer: DomSanitizer, label: string, devices: Map<string, Device>): { newlabel: string, devices: string[] } {
  let re = /\$(\{([^{},]+)(,([^{}]*(\{[^}]*\})*)+)?\})/;
  // path potentially followed by , and chars and possible { } groups

  let result = label;

  let m: RegExpMatchArray;

  const devicePaths: string[] = [];

  while (m = result.match(re)) {
    let devicePath = m[2];
    devicePaths.push(devicePath);
    let wholeExpr = m[1].replace(devicePath, "value");
    let value = devices.get(devicePath) ? devices.get(devicePath).state : "'unknown device'";
    if (value === undefined || value === null) value = '??';
    let format = m[3];
    if (format) {
      let { string, error } = applyFormat(wholeExpr, value);
      if (error != "" && string == "") string = error;

      result = result.replace(re, string.toString());
    } else {
      result = result.replace(re, value.toString());
    }
  }

  return { newlabel: result, devices: devicePaths };
}

export function formatString(sanitizer: DomSanitizer, format: string, value: string | Date) {
  let safeString: SafeHtml | string | Date;
  let safeError: SafeHtml;
  if (value === undefined || value === null) value = '??';
  if (format) {
    let { string, error } = applyFormat(format, value);
    safeString = sanitizer.bypassSecurityTrustHtml(string);
    safeError = sanitizer.bypassSecurityTrustHtml(error);
  } else {
    safeString = value;
  }
  return { string: safeString, error: safeError };
}
