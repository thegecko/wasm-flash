import Factory from './wasm/flash';

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
    
    constructor(
        protected device: USBDevice,
        protected interfaceClass = DEFAULT_CLASS,
        protected configuration = DEFAULT_CONFIGURATION,
        protected packetSize: number = DEFAULT_PACKETSIZE,
        protected alwaysControlTransfer: boolean = false
    ) {
    }

    public async flash(buffer: ArrayBuffer): Promise<void> {
        const module = await Factory(this);
        await module.flash(buffer);
    }

    /**
     * Message logger
     * @param message Message to log
     */
    protected async logMessage(message: string): Promise<void> {
        console.log(message);
    }

    /**
     * Open device
     * @returns Promise
     */
    protected async usbOpen(): Promise<void> {
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
    protected async usbClose(): Promise<void> {
        await this.device.close();
    }

    /**
     * Read from device
     * @returns Promise of data read
     */
    protected async transferIn(): Promise<Uint8Array> {
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

        return new Uint8Array(result.data!.buffer);
    }

    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    protected async transferOut(data: Uint8Array): Promise<void> {
        if (this.interfaceNumber === undefined) {
            throw new Error('No device opened');
        }

        // Shorten buffer
        const length = Math.min(data.byteLength, this.packetSize);
        const buffer = new Uint8Array(length);
        buffer.set(data);

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
