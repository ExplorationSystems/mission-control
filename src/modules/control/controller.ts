import { Module } from 'src/module';
import { Axis } from './types';

export class ControlModuleController extends Module {
    async onModuleInit() {
        this.on<Axis>('aileron', (data) => {
            console.log('Aileron', data);
        });
    }

    /**
     * Maps the axis to the aileron left and right rotation target
     */
    mapAxisToAileron(axis: Axis) {
        /**
         * x = 0 y = 1 -> down -> -90 degrees (left), -90 degrees (right)
         * x = 0, y = -1 -> up -> 90 degrees (left), 90 degrees (right)
         * x = 1, y = 0 -> right -> -90 degrees (left), 90 degrees (right)
         * x = -1, y = 0 -> left -> 90 degrees (left), -90 degrees (right)
         */

        const output = {
            left: 0,
            right: 0,
        }
        const { x, y } = axis;

        output.left = this.mapValue(y, -1, 1, 90, -90);
        output.right = this.mapValue(y, -1, 1, -90, 90);

        return output;
    }

    mapValue(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
}
