import { NgModule } from '@angular/core';
import { DmjCommComponent } from './dmj-comm/dmj-comm';
import { IonicModule } from 'ionic-angular';
import { DmjWalkingmanComponent } from './dmj-walkingman/dmj-walkingman';
import { DmjWidgetComponent } from './dmj-widget';
import { DmjDashboardComponent } from './dmj-dashboard-component';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';
import { DmjUnknownComponent } from './dmj-unknown/dmj-unknown';
import { DmjTextComponent } from './dmj-text/dmj-text';
import { DmjToggleComponent } from './dmj-toggle/dmj-toggle';
import { DmjTempoColorComponent } from './dmj-tempo-color/dmj-tempo-color';
import { DmjMultistateComponent } from './dmj-multistate/dmj-multistate';
import { DmjCameraComponent } from './dmj-camera/dmj-camera';
import { DmjConfirmComponent } from './dmj-confirm/dmj-confirm';
import { DmjDashboardIconComponent } from './dmj-dashboard-icon/dmj-dashboard-icon';
import { DmjDashboardTempoComponent } from './dmj-dashboard-tempo/dmj-dashboard-tempo';
import { DmjDashboardCameraComponent } from './dmj-dashboard-camera/dmj-dashboard-camera';
import { DmjColorComponent } from './dmj-color/dmj-color';

@NgModule({
    declarations: [DmjCommComponent,
        DmjWalkingmanComponent,
        DmjWidgetComponent,
        DmjDashboardComponent,
        DmjUnknownComponent,
        DmjTextComponent,
        DmjToggleComponent,
        DmjTempoColorComponent,
        DmjMultistateComponent,
        DmjCameraComponent,
        DmjConfirmComponent,
        DmjDashboardIconComponent,
        DmjDashboardTempoComponent,
        DmjDashboardCameraComponent,
    DmjColorComponent],
    imports: [
        IonicModule,
        DirectivesModule,
        PipesModule,
    ],
    exports: [DmjCommComponent,
        DmjWalkingmanComponent,
        DmjWidgetComponent,
        DmjDashboardComponent,
        DmjUnknownComponent,
        DmjTextComponent,
        DmjToggleComponent,
        DmjTempoColorComponent,
        DmjMultistateComponent,
        DmjCameraComponent,
        DmjConfirmComponent,
        DmjDashboardIconComponent,
        DmjDashboardTempoComponent,
        DmjDashboardCameraComponent,
    DmjColorComponent]
})
export class ComponentsModule {

    static retrieveWidgetComponents() {
        return {
            //: # (SelectorWidgetComponents START)    
"dmj-camera": DmjCameraComponent,
"dmj-color": DmjColorComponent,
"dmj-comm": DmjCommComponent,
"dmj-confirm": DmjConfirmComponent,
"dmj-dashboard-camera": DmjDashboardCameraComponent,
"dmj-dashboard-icon": DmjDashboardIconComponent,
"dmj-dashboard-tempo": DmjDashboardTempoComponent,
"dmj-multistate": DmjMultistateComponent,
"dmj-tempo-color": DmjTempoColorComponent,
"dmj-text": DmjTextComponent,
"dmj-toggle": DmjToggleComponent,
"dmj-unknown": DmjUnknownComponent,
"dmj-walkingman": DmjWalkingmanComponent,
            //: # (SelectorWidgetComponents END)    
        };
    }
    static getWidgetComponent(widget: string) {
        let component = ComponentsModule.retrieveWidgetComponents()[widget];
        if (!component) {
            component = DmjUnknownComponent;
        }
        return component;
    }
    static getWidgetComponents() {
        let components = ComponentsModule.retrieveWidgetComponents();

        let res: any[] = [];
        Object.keys(components).forEach(component => { res.push(components[component]) })
        return res;
    }
}
