import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';
import { DmjWidgetComponent } from '../components/dmj-widget';
import { DmjDashboardComponent } from '../components/dmj-dashboard-component';
//: # (ImportWidgetComponents START)  
import { DmjCameraComponent } from '../components/dmj-camera/dmj-camera';
import { DmjColorComponent } from '../components/dmj-color/dmj-color';
import { DmjCommComponent } from '../components/dmj-comm/dmj-comm';
import { DmjConfirmComponent } from '../components/dmj-confirm/dmj-confirm';
import { DmjDashboardCameraComponent } from '../components/dmj-dashboard-camera/dmj-dashboard-camera';
import { DmjDashboardIconComponent } from '../components/dmj-dashboard-icon/dmj-dashboard-icon';
import { DmjDashboardTempoComponent } from '../components/dmj-dashboard-tempo/dmj-dashboard-tempo';
import { DmjGraph } from '../components/dmj-graph/dmj-graph';
import { DmjInputComponent } from '../components/dmj-input/dmj-input';
import { DmjMultistateComponent } from '../components/dmj-multistate/dmj-multistate';
import { DmjProgressBarComponent } from '../components/dmj-progress-bar/dmj-progress-bar';
import { DmjTempGraph } from '../components/dmj-temp-graph/dmj-temp-graph';
import { DmjTempoColorComponent } from '../components/dmj-tempo-color/dmj-tempo-color';
import { DmjTextComponent } from '../components/dmj-text/dmj-text';
import { DmjToggleComponent } from '../components/dmj-toggle/dmj-toggle';
import { DmjUnknownComponent } from '../components/dmj-unknown/dmj-unknown';
import { DmjWalkingmanComponent } from '../components/dmj-walkingman/dmj-walkingman';
import { DmjZwaveConfigComponent } from '../components/dmj-zwave-config/dmj-zwave-config';
//: # (ImportWidgetComponents END)  

@NgModule({
    declarations: [    
        DmjWidgetComponent,
        DmjDashboardComponent,
        //: # (WidgetComponents START)    
DmjCameraComponent,
DmjColorComponent,
DmjCommComponent,
DmjConfirmComponent,
DmjDashboardCameraComponent,
DmjDashboardIconComponent,
DmjDashboardTempoComponent,
DmjGraph,
DmjInputComponent,
DmjMultistateComponent,
DmjProgressBarComponent,
DmjTempGraph,
DmjTempoColorComponent,
DmjTextComponent,
DmjToggleComponent,
DmjUnknownComponent,
DmjWalkingmanComponent,
DmjZwaveConfigComponent,
        //: # (WidgetComponents END)    
],
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
"dmj-graph": DmjGraph,
"dmj-input": DmjInputComponent,
"dmj-multistate": DmjMultistateComponent,
"dmj-progress-bar": DmjProgressBarComponent,
"dmj-temp-graph": DmjTempGraph,
"dmj-tempo-color": DmjTempoColorComponent,
"dmj-text": DmjTextComponent,
"dmj-toggle": DmjToggleComponent,
"dmj-unknown": DmjUnknownComponent,
"dmj-walkingman": DmjWalkingmanComponent,
"dmj-zwave-config": DmjZwaveConfigComponent,
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
