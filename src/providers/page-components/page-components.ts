import { Injectable } from '@angular/core';

import { PageListProvider } from '../page-list/page-list'

import { HomePage } from '../../pages/home/home';
import { ListPage } from '../../pages/list/list';
import { AboutPage } from '../../pages/about/about';


@Injectable()
export class PageComponentsProvider {

  // put below the list of supported pages
  private static pages = {
    'list.html': ListPage,
    'home.html': HomePage,
    'about.html': AboutPage,
  }

  // dependency injection with PageComponentsProvider to avoid cross imports
  static initPageListProvider() {
    if (!PageListProvider.getPageComponent)
      PageListProvider.getPageComponent = PageComponentsProvider.getPageComponent;
  }

  static getPageComponents() {
    PageComponentsProvider.initPageListProvider();
    return Object.keys(PageComponentsProvider.pages).map(p => {
      return PageComponentsProvider.pages[p];
    });
  }

  static getPageComponent(pageFile: string) {
    return PageComponentsProvider.pages[pageFile];
  }

  constructor() {
    //console.log('Hello PageComponentsProvider Provider');
  }

}

PageComponentsProvider.initPageListProvider();


