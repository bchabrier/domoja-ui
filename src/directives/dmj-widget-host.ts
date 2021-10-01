import { Directive, ViewContainerRef } from '@angular/core';
import { Device } from '../providers/domoja-api/domoja-api'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// IntlMessageFormat package is using a too newer version of typescript, no compatible with angular 5
// hence, to compile we use the js imports, and to check at edit time, we use the ts imports
// this is done automatically by ionic:serve/build:before/after
import IntlMessageFormat from 'intl-messageformat';
//import IntlMessageFormat from '../recompiled/intl-messageformat.esm.js';

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

    let valueAsJSON: any;
    try {
      valueAsJSON = JSON.parse(value as string);
    } catch (e) { }

    let formatArgs = [];
    while (index >= 0) {
      switch (format.substr(index, 2)) {
        case '%s':
        case '%d':
          formatArgs.push(value);
          break;
        case '%j':
        default:
          format = format.substr(0, index) + '%s' + format.substr(index + 2); // otherwise will display "<json_string>" with ""
          formatArgs.push(valueAsJSON ? util.inspect(valueAsJSON).replaceAll('\n', '<br/>').replaceAll(/ /g, '&nbsp;') : value);
          break;
      }
      const i = format.substr(index + 2).search(expr);
      index = i >= 0 ? index + i + 2 : -1;
    }
    string = util.format(format, ...formatArgs);
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

export function interpretLabel(sanitizer: DomSanitizer, label: string, devices: Map<string, Device>): string {
  let re = /\$(\{([^{},]+)(,([^{}]*(\{[^}]*\})*)+)?\})/;
  // path potentially followed by , and chars and possible { } groups

  let result = label;

  let m: RegExpMatchArray;

  while (m = result.match(re)) {
    let devicePath = m[2];
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

  return result;
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
