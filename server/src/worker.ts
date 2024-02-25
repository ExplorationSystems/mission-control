import { ChildProcess, spawn } from 'child_process';
import debug from 'debug';
import { EventEmitter } from 'stream';
import fs from 'fs';
import path from 'path';
import config from './config';
import WebSocket, { WebSocketServer } from 'ws';

type WorkerPayload = {
    data: any;
    action: 'event' | 'log';
    event: string;
}

export class Worker {
    private readonly events = new EventEmitter();
    private socket?: WebSocket;
    static baseSocketPort: number = 17506
    static workerIndex: number = 0;

    constructor(
        private readonly worker: ChildProcess,
        private readonly log: debug.Debugger,
        private readonly socketPort: number) {

        // setTimeout(() => {
        //     this.connect();
        // }, 1000)

        // worker.stdout?.on('data', (data: Buffer) => {
        //     const message = data.toString();
        //     try {
        //         const [rawPrint, rawPayload] = message.split(PAYLOAD_IDENTIFIER);
        //         if (rawPayload) {
        //             const payload = JSON.parse(rawPayload) as WorkerPayload;

        //             switch (payload.action) {
        //                 case 'event':
        //                     this.events.emit(payload.event, payload.data);
        //                     break;
        //                 case 'log':
        //                     this.log(payload.data);
        //                     break;
        //                 default:
        //                     this.log('Unknown payload action', payload);
        //                     break;
        //             }
        //         } else {
        //             // If the payload identifier is not found, just log the message to debug
        //             console.log(rawPrint);
        //         }
        //     } catch (error) {
        //         console.error('Worker error', error);
        //     }
        // });
    }

    private connect() {
        if (this.socket) {
            this.socket.close();
        }

        try {
            this.socket = new WebSocket(`ws://localhost:${this.socketPort}`, {
                perMessageDeflate: false
            });

            this.socket.on('close', () => {
                this.log('Socket closed');
                this.connect();
            })
        } catch (error) {
            process.nextTick(() => {
                this.connect();
            });
        }
    }

    on(event: string, callback: (data: any) => void) {
        this.events.on(event, callback);
    }
    emit(event: string, data: any) {
        if (this.worker.stdin) {
            this.log('Emitting event', event, data);
            // try {
            //     this.socket.send(JSON.stringify({
            //         event,
            //         // Send an object so that it can correctly serialize the data and allows for future expansion
            //         data,
            //     }));
            // } catch (error) {
            //     this.log('Error sending to worker', error);
            // }
            this.worker.stdin.write(JSON.stringify({
                event,
                // Send an object so that it can correctly serialize the data and allows for future expansion
                data,
            }) + '\n');
        } else {
            this.log('Worker socket not available');
        }
    }

    static getNextSocketPort() {
        const nextIndex = Worker.workerIndex++;
        return Worker.baseSocketPort + nextIndex;
    }

    // static replaceStaticVariablesInLoader(loader: string, {
    //     socketPort,
    //     workerPath
    // }: {
    //     socketPort: number;
    //     workerPath: string;
    // }) {
    //     loader = loader.replace(/__SOCKET_PORT__/g, socketPort.toString());
    //     loader = loader.replace(/__WORKER_PATH__/g, workerPath);
    //     return loader;
    // }

    static loadPythonWorker(workerPath: string, log: debug.Debugger) {
        const socketPort = Worker.getNextSocketPort();

        const worker = spawn(config.workers.python.cmd, ['-u', path.join(__dirname, 'worker.py'), workerPath, socketPort.toString()], {
            stdio: 'inherit'
        });

        return new this(worker, log, socketPort);
    }
}

