import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AnimationPlaybackEvent } from 'web-animations-js/web-animations.min';


export var _unusedVariableToForceTheInclusionOfWebAnimations = AnimationPlaybackEvent;

import { AppModule } from './app.module';


platformBrowserDynamic().bootstrapModule(AppModule);
