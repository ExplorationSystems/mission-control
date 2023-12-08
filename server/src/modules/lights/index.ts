import { PCA9685, mapValue } from 'openi2c';
import { Module } from '../../types';
import { SmoothValue } from '../../utils/SmoothValue';
// import { Gpio } from 'pigpio';

const LIGHTS_CHANNEL = 4;
export const Lights: Module = async ({
    on,
    log
}) => {
    const pwmDriver = new PCA9685();
    await pwmDriver.init();
    await pwmDriver.setFrequency(50);

    const brightness = new SmoothValue().on('update', (value) => {
        log('Setting brightness smoothed', value);
        pwmDriver.setDutyCycle(LIGHTS_CHANNEL, mapValue(value, 0, 100, 0, 1))
    });

    on('setBrightness', (newValue: number) => {
        log('Set brightness', newValue);
        brightness.value = newValue;
    });
}
