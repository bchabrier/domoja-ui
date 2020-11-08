import { Component, OnInit, Input } from '@angular/core';
import { DmjWidgetComponent } from '../dmj-widget';
import { AlertController } from 'ionic-angular';

/**
 * Displays a button that, when clicked, will open a confirmation dialog box.
 * 
 * #### Parameters
 * `widget: "confirm:<button-label>:<button-color>:<confirm-title>:<confirm-message>:<confirm-buttons>"`
 * 
 * The device state will be changed to the value of the clicked confirm button.
 * 
 * - `<button-label>`: the label of the button
 * - `<button-color>`: the color of the button
 * - `<button-title>`: the title of the confirmation dialog box
 * - `<button-message>`: the message of confirmation dialog box
 * - `<button-buttons>`: the comma-separated names of the buttons that appear in the confirmation dialog box
 * 
 */
@Component({
  selector: 'dmj-confirm',
  templateUrl: 'dmj-confirm.html'
})
export class DmjConfirmComponent extends DmjWidgetComponent implements OnInit {

  @Input() button: string;
  @Input() color: string;
  @Input() title: string;
  @Input() message: string;
  @Input() buttons: Array<string>;

  constructor(private alertCtrl: AlertController) {
    super(null);
  }

  ngOnInit() {
    this.button = this.args[0];
    this.color = this.args[1];
    this.title = this.args[2];
    this.message = this.args[3];
    this.buttons = this.args[4] ? this.args[4].split(',') : [];
  }

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: this.title,
      message: this.message,
      buttons: this.buttons.map((text, i) => {
        return {
          text: text,
          //role: 'cancel',
          handler: () => {
            this.device.stateChange(this.device, text);
          }
        }
      })
    });
    alert.present();
  }
}
