import { Injectable } from '@angular/core';
import * as Rx from 'rxjs/Rx';
import * as io from 'socket.io-client';

@Injectable()
export class WebsocketService {

  private socket: SocketIOClient.Socket;

  constructor() { }

  private subject: Rx.Subject<MessageEvent>;

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {

     this.socket = io(url);

    let observable = Rx.Observable.create((obs: Rx.Observer<MessageEvent>) => {
      this.socket.on('change', obs.next.bind(obs));
      this.socket.on('reload', value => {
        obs.next(new MessageEvent('reload'));
      });
      //this.socket.on('error', obs.error.bind(obs));
      this.socket.on('error', err => { console.log('error', err, this) })
      //this.socket.on('close', obs.complete.bind(obs));
      this.socket.on('close', err => { console.log('close', err) })
      this.socket.on('reconnect', value => {
        obs.next(new MessageEvent('reload'));
      });
      return this.socket.disconnect.bind(this.socket);
    })
    let observer = {
      next: (data: Object) => {
        this.socket.emit('message', JSON.stringify(data));
      }
    }
    return Rx.Subject.create(observer, observable);
  }

}