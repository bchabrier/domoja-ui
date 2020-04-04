import { Injectable } from '@angular/core';
import { Page, DomojaApiService, Device } from '../domoja-api/domoja-api';

export type componentPage = {
  name: string,
  menuItem: string,
  title: string,
  component: any,
  args: { [key: string]: string }
};

export function interpretLabel(label: string, devices: Map<string, Device>): string {
  let re = /\$\{([^}]+)\}/;

  let result = label;

  let m: RegExpMatchArray;

  while (m = result.match(re)) {
    let devicePath = m[1];
    let value = devices.get(devicePath) ? devices.get(devicePath).state : "'unknown device'";
    value = value || '??';
    result = result.replace(re, value.toString());
  }

  return result;
}

@Injectable()
export class PageListProvider {

  // dependency injection with PageComponentsProvider to avoid cross imports
  static getPageComponent: (pageFile: string) => any = undefined;

  constructor(private domojaApi: DomojaApiService) {
    //console.log('Hello PageListProvider Provider');
  }

  subscribe(next?: (value: Array<componentPage>) => void, error?: (error: any) => void, complete?: () => void) {
    return this.domojaApi.getPages().subscribe((data: Array<Page>) => {
      let pages: Array<componentPage> = [];
      data.forEach(p => {
        let component = PageListProvider.getPageComponent(p.page);
        pages.push({
          name: p.name,
          menuItem: p.menuItem || p.name,
          title: p.title,
          component: component,
          args: p.args
        });
      });
      next(pages);
    }, error, complete);
  }
}

