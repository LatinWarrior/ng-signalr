import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export class SignalrWindow extends Window {
    $: any;
}

export enum ConnectionState {
    Connecting = 1,
    Connected = 2,
    Reconnecting = 3,
    Disconnected = 4
}

export class ChannelConfig {
    url: string;
    hubName: string;
    channel: string;
}

export class ChannelEvent {
    Name: string;
    ChannelName: string;
    TimeStamp: Date;
    Data: any;
    Json: string;

    constructor() {
        this.TimeStamp = new Date();
    }
}

export class ChannelSubject {
    channel: string;
    subject: Subject<ChannelEvent>;
}

@Injectable()
export class ChannelService {

    starting$: Observable<any>;

    connectionState$: Observable<ConnectionState>;

    error$: Observable<string>;

    private connectionStateSubject = new Subject<ConnectionState>();
    private startingSubject = new Subject<any>();
    private errorSubject = new Subject<any>();

    private hubConnection: any;
    private hubProxy: any;

    private subjects = new Array<ChannelSubject>();

    constructor(
        @Inject(SignalrWindow) private window: SignalrWindow,
        @Inject("channel.config") private channelConfig: ChannelConfig
    ) {
        if (this.window.$ === undefined || this.window.$.hubConnection === undefined) {
            throw new Error(
                `
                    The variable '$' or the .hubConnection() function is not defined. 
                    Please check whether the SignalR scripts have been loaded properly.
                `);
        }

        // Set up the observables.
        this.connectionState$ = this.connectionStateSubject.asObservable();
        this.error$ = this.errorSubject.asObservable();
        this.starting$ = this.startingSubject.asObservable();

        this.hubConnection = this.window.$.hubConnection();
        this.hubConnection.url = channelConfig.url;
        this.hubProxy = this.hubConnection.createHubProxy(channelConfig.hubName);

        // Define handlers for the connection state events.
        this.hubConnection.stateChanged((state: any) => {
            let newState = ConnectionState.Connecting;

            switch (state.newState) {
                case this.window.$.connectionState.connecting:
                    newState = ConnectionState.Connecting;
                    break;
                case this.window.$.connectionState.connected:
                    newState = ConnectionState.Connected;
                    break;
                case this.window.$.connectionState.reconnecting:
                    newState = ConnectionState.Reconnecting;
                    break;
                case this.window.$.connectionState.disconnected:
                    newState = ConnectionState.Disconnected;
                    break;
            }

            // Push the new state on our subject.
            this.connectionStateSubject.next(newState);
        });

        // Define handlers for any errors.
        this.hubConnection.error((error: any) => {
            this.errorSubject.next(error);
        });

        this.hubProxy.on("onEvent", (channel: string, ev: ChannelEvent) => {
            let channelSub = this.subjects.find((subject: ChannelSubject) => {
                return subject.channel === channel;
            }) as ChannelSubject;

            // If we found a subject, then emit the event on it.
            if (channelSub !== undefined) {
                return channelSub.subject.next(ev);
            }

        });
    }

    // Start the SignalR connection. The starting$ stream will emit an event if the 
    // connection is establshed. Otherwise, it will emit an error.
    start(): void {
        // We only want the connection started once. So we have a special
        // starting$ observable that clients can subscribe to know if
        // the startup sequence is done.
        // If we just mapped the start() promise to an observable, then any
        // time a client subscribed to it, the start sequence would be 
        // triggered again since it is a cold observable.
        this.hubConnection.start()
            .done(() => {
                this.startingSubject.next();
            })
            .fail((error: any) => {
                this.startingSubject.error(error);
            });
    }

    sub(channel: string): Observable<ChannelEvent> {
        // Try to finc an observable that we already created
        // for the requested channel.
        let channelSub = this.subjects.find((subject: ChannelSubject) => {
            return subject.channel === channel;
        }) as ChannelSubject;

        // If we already have one for this event, then just return it.
        if (channelSub !== undefined) {
            console.log(`Found existing observable for ${channel} channel.`);
            return channelSub.subject.asObservable();
        }

        // If we got to this point, then we don't have the observable to
        // provide the caller. So we need to call the server method to join
        // the channel and then create an observable that the caller can
        // use to receive messages.

        // Create an internal object to track this specific subject,
        // in case it is required by another client.
        channelSub = new ChannelSubject();
        channelSub.channel = channel;
        channelSub.subject = new Subject<ChannelEvent>();
        this.subjects.push(channelSub);

        // SignalR is asynchronous. So we need to ensure the connection
        // is established before we call any server methods. So we will
        // subscribe to the starting$ stream since it won't emit a value
        // until the connection is ready.
        this.starting$.subscribe(() => {
            this.hubProxy.invoke("Subscribe", channel)
                .done(() => {
                    console.log(`Successfully subscribed to ${channel} channel.`);
                })
                .fail((error: any) => {
                    channelSub.subject.error(error);
                });
        },
            (error: any) => {
                channelSub.subject.error(error);
            });

        return channelSub.subject.asObservable();
    }

    // Not quite sure how to handle this (if at all) since there could be
    // more than 1 caller subscribed to an observable we created
    // unsubscribe(channel: string): Rx.Observable<any> {
    //     this.observables = this.observables.filter((x: ChannelObservable) => {
    //         return x.channel === channel;
    //     });
    // }

    // publish provides a way for callers to emit events on any channel. In a 
    // production app, the server would ensure that only authorized clients can
    // actually emit the message, but here we're not concerned about that.    
    publish(ev: ChannelEvent): void {
        this.hubProxy.invoke("Publish", ev);
    }

}
