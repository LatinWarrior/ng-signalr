import { Component } from '@angular/core';

import { ChannelConfigFactory } from './services/channel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  eventName: string;
  apiUrl: string;

  constructor(private service: ChannelConfigFactory) {
    // this.eventName = factory.channelConfig.;
    this.apiUrl = "http://localhost:9123/signalr";
  }

}
