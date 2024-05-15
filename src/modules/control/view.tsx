import { Inject, Injectable } from 'src/inject';
import { Module, IModule } from 'src/module';
import { UserInterface } from 'src/client/user-interface';
import { View } from 'src/client/view';
import { ControlSettings } from './control-settings';
@Injectable()
export class ControlView implements IModule {
    constructor(
        @Inject(Module) private readonly module: Module,
        @Inject(UserInterface) private readonly userInterface: UserInterface,
    ) {}

    onModuleInit(): void | Promise<void> {
        console.log('ControlView');
        this.userInterface.addContextItem(ControlSettings);
    }
}
