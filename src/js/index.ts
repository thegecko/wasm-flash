import { Flash } from './flash';

const DEFAULT_CONFIGURATION = 1;
const DEFAULT_CLASS = 0xFF;
const DEFAULT_PACKETSIZE = 64;

const GET_REPORT = 0x01;
const SET_REPORT = 0x09;
const OUT_REPORT = 0x200;
const IN_REPORT = 0x100;

export class DeviceWrapper {
    protected interfaceNumber?: number;
    protected endpointIn?: USBEndpoint;
    protected endpointOut?: USBEndpoint;
    
    protected flashimp: Flash;

    constructor(
        protected device: USBDevice,
        protected interfaceClass = DEFAULT_CLASS,
        protected configuration = DEFAULT_CONFIGURATION,
        protected packetSize: number = DEFAULT_PACKETSIZE,
        protected alwaysControlTransfer: boolean = false
    ) {
        this.flashimp = new Flash(device);
    }

    public async flash(_buffer: ArrayBuffer): Promise<void> {

        const module = await flash(this);

        /*
        await this.flashimp.connect();
        await this.flashimp.flash(buffer);
        await this.flashimp.disconnect();
        */

        const complete = await module.ccall('GetPrimes',
            'number',
            ['number'],
            [10000],
            {
                async: true
            }
        );
        console.log(`3: ${complete}`);
    }

    protected async showMessage(message: string): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`1: ${message}`);
        return 1;
    }

    /**
     * Open device
     * @returns Promise
     */
    protected async open(): Promise<void> {
        await this.device.open();
        await this.device.selectConfiguration(this.configuration);

        const interfaces = this.device.configuration!.interfaces.filter(iface => {
            return iface.alternates[0].interfaceClass === this.interfaceClass;
        });

        if (!interfaces.length) {
            throw new Error('No valid interfaces found.');
        }

        // Prefer interface with endpoints
        let selectedInterface = interfaces.find(iface => iface.alternates[0].endpoints.length > 0);

        // Otherwise use the first interface
        if (!selectedInterface) {
            selectedInterface = interfaces[0];
        }

        this.interfaceNumber = selectedInterface.interfaceNumber;

        // If we always want to use control transfer, don't set endpoints or claim interface
        if (!this.alwaysControlTransfer) {
            const endpoints = selectedInterface.alternates[0].endpoints;

            this.endpointIn = undefined;
            this.endpointOut = undefined;

            for (const endpoint of endpoints) {
                if (endpoint.direction === 'in') this.endpointIn = endpoint;
                else this.endpointOut = endpoint;
            }
        }

        await this.device.claimInterface(this.interfaceNumber);
    }

    /**
     * Close device
     * @returns Promise
     */
    protected async close(): Promise<void> {
        await this.device.close();
    }

    /**
     * Read from device
     * @returns Promise of data read
     */
    protected async transferIn(): Promise<ArrayBuffer> {
        if (this.interfaceNumber === undefined) {
            throw new Error('No device opened');
        }

        let result: USBInTransferResult;

        if (this.endpointIn) {
            // Use endpoint if it exists
            result = await this.device.transferIn(
                this.endpointIn.endpointNumber,
                this.packetSize
            );
        } else {
            // Fallback to using control transfer
            result = await this.device.controlTransferIn(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: GET_REPORT,
                    value: IN_REPORT,
                    index: this.interfaceNumber
                },
                this.packetSize
            );
        }

        return result.data!.buffer;
    }

    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    protected async transferOut(data: ArrayBuffer): Promise<void> {
        if (this.interfaceNumber === undefined) {
            throw new Error('No device opened');
        }

        // Shorten buffer
        const length = Math.min(data.byteLength, this.packetSize);
        const buffer = new Uint8Array(length);
        buffer.set(new Uint8Array(data));

        if (this.endpointOut) {
            // Use endpoint if it exists
            await this.device.transferOut(
                this.endpointOut.endpointNumber,
                buffer
            );
        } else {
            // Fallback to using control transfer
            await this.device.controlTransferOut(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: SET_REPORT,
                    value: OUT_REPORT,
                    index: this.interfaceNumber
                },
                buffer
            );
        }
    }
}
