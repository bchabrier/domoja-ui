import { NgModule } from '@angular/core';
import { FriendlyDatePipe } from './friendly-date/friendly-date';
@NgModule({
	declarations: [FriendlyDatePipe],
	imports: [],
	exports: [FriendlyDatePipe]
})
export class PipesModule {}
