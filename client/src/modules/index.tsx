import * as modules from './modules';
import debug from 'debug';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { Controller, Location, LoadedControllers, Module } from '../types';
import { EventEmitter } from 'events';

const log = debug('MissionControl:Module');
class ModuleEventPayload {
    data: any = {};
    event: string = '';

    constructor(event: string, data: any) {
        this.event = event;
        this.data = data;
    }
}

export default function loadModules({
    events,
    send,
}: {
    events: EventEmitter;
    send: (event: string, data: any) => void;
}): LoadedControllers {
    const loadedModules: LoadedControllers = {
        [Location.Header]: [],
        [Location.BottomLeft]: [],
        [Location.BottomRight]: [],
        [Location.Menu]: [],
        [Location.Window]: [],
        [Location.Hidden]: [],
    };

    for (const [name, module] of Object.entries(modules as Record<string, Module>)) {
        const id = `Module:${name}`;

        const controllerArray = Array.isArray(module) ? module : [module];
        log(`Loading module ${name}`);

        for (const Controller of controllerArray) {
            log(`Loading ${name} controller at ${Controller.location}`);
            const logModule = log.extend(name);
            loadedModules[Controller.location === undefined ? Location.Hidden : Controller.location].push(
                <Controller
                    key={`${id}:${Controller.location}`}
                    events={events}
                    log={logModule}
                    on={(event, callback) => {
                        event = `${id}:${event}`;

                        events.on(event, (payload: ModuleEventPayload | any) => {
                            log(`Event ${event} fired`, payload);
                            if (payload instanceof ModuleEventPayload) {
                                // Payload came from a module, check if the event is the same as the listener
                                // if so, don't fire the callback to prevent an infinite loop.
                                // This is because the base emit might be called from inside the base on function.

                                if (payload.event !== event) {
                                    callback(payload.data);
                                }
                            } else {
                                // Payload didn't come from inside a module.
                                callback(payload);
                            }
                        });
                    }}
                    emit={(event, data) => {
                        event = `${id}:${event}`;

                        const payload = new ModuleEventPayload(event, data);
                        log('Emitting', payload);
                        events.emit(event, payload); // Emit to the events object so that other modules can listen to it
                        send(event, data); // Send to the server
                    }}
                />
            );
        }
    }

    return loadedModules;
}
