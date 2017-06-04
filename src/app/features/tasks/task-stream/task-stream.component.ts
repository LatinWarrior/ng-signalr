import { Component, OnInit, Input } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import  'signalr'

import { ChannelService, ChannelEvent } from './../../../services/channel.service';

class StatusEvent {
  State: string;
  PercentComplete: number;
}

@Component({
  moduleId: module.id,
  selector: 'app-task-stream',
  templateUrl: './task-stream.component.html',
  styleUrls: ['./task-stream.component.css']
})
export class TaskStreamComponent implements OnInit {

  @Input() eventName: string;
  @Input() apiUrl: string;

  messages = "";

  private channel = "tasks";

  constructor(private http: Http, private channelService: ChannelService) { }

  ngOnInit() {
    this.channelService.sub(this.channel).subscribe((event: ChannelEvent) => {
      switch (event.Name) {
        case this.eventName: { this.appendStatusUpdate(event); }
      }
    },
      (error: any) => {
        console.warn(`Attempt to join channel ${this.channel} failed.`);
      });
  }

  private appendStatusUpdate(ev: ChannelEvent): void {
    // Just prepend this to the messages string shown in the text area.
    let date = new Date();
    switch (ev.Data.State) {
      case "starting": {
        this.messages = `${date.toLocaleTimeString()} : starting\n` + this.messages;
        break;
      }
      case "complete": {
        this.messages = `${date.toLocaleTimeString()} : complere\n` + this.messages;
        break;
      }
      default: {
        this.messages = `${date.toLocaleTimeString()} : ${ev.Data.State} : ${ev.Data.PercentComplete} % complete\n` + this.messages;
      }
    }
  }

  callApi() {
    this.http.get(this.apiUrl)
      .map((res: Response) => res.json())
      .subscribe((message: string) => { console.log(message); })
  }

}
