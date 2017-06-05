import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import 'signalr';
import 'jquery';

import "rxjs/add/operator/map";

import { AppComponent } from './app.component';
import { TaskStreamComponent } from './features/tasks/task-stream/task-stream.component';

import { ChannelService, ChannelConfig, SignalrWindow, ChannelConfigFactory } from './services/channel.service';

function getChannelConfig() {
  let channelConfig = new ChannelConfig();
  channelConfig.url = "http://localhost:9123/signalr";
  channelConfig.hubName = "EventHub";
  return channelConfig;
};

@NgModule({
  declarations: [
    AppComponent,
    TaskStreamComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    ChannelService,    
    ChannelConfigFactory,
    { provide: SignalrWindow, useValue: window },
    { provide: 'channel.config', useValue: getChannelConfig() }
    //{ provide: 'channel.config', useValue: channelConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
