import { DAPLinkFlash, DAPCommand, AbortMask, DAPResponse, DAPResetTargeResponse, DAPConnectResponse, DAPProtocol } from "./enums";

const DEFAULT_PAGE_SIZE = 62;
const DEFAULT_CONFIGURATION = 1;
const DEFAULT_CLASS = 0xFF;
const DEFAULT_CLOCK_FREQUENCY = 10000000;
const GET_REPORT = 0x01;
const SET_REPORT = 0x09;
const OUT_REPORT = 0x200;
const IN_REPORT = 0x100;

const SWD_SEQUENCE = 0xE79E;
const JTAG_SEQUENCE = 0xE73C;

class Mutex {
    private locked = false;

    /**
     * Wait until the Mutex is available and claim it
     */
    public async lock(): Promise<void> {
        while (this.locked) {
            // Yield the current execution context, effectively moving it to the back of the promise queue
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        this.locked = true;
    }

    /**
     * Unlock the Mutex
     */
    public unlock(): void {
        this.locked = false;
    }
}

export class Flash {
    protected sendMutex = new Mutex();
    protected interfaceNumber?: number;
    protected endpointIn?: USBEndpoint;
    protected endpointOut?: USBEndpoint;
    protected readonly packetSize = 64;
    protected mode = DAPProtocol.DEFAULT;
    public connected = false;

    constructor(private device: USBDevice, private interfaceClass = DEFAULT_CLASS, private configuration = DEFAULT_CONFIGURATION, private alwaysControlTransfer: boolean = false) {
    }

    /**
     * Flash the target
     * @param buffer The image to flash
     * @param pageSize The page size to use (defaults to 62)
     * @returns Promise
     */
    public async flash(buffer: BufferSource, pageSize: number = DEFAULT_PAGE_SIZE): Promise<void> {
        const isView = (source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView => {
            return (source as ArrayBufferView).buffer !== undefined;
        };

        const arrayBuffer = isView(buffer) ? buffer.buffer : buffer;
        const streamType = this.isBufferBinary(arrayBuffer) ? 0 : 1;

        try {
            let result = await this.send(DAPLinkFlash.OPEN, new Uint32Array([streamType]));

            // An error occurred
            if (result.getUint8(1) !== 0) {
                throw new Error('Flash error');
            }

            await this.writeBuffer(arrayBuffer, pageSize);
            result = await this.send(DAPLinkFlash.CLOSE);

            // An error occurred
            if (result.getUint8(1) !== 0) {
                throw new Error('Flash error');
            }

            await this.send(DAPLinkFlash.RESET);
        } catch (error) {
            await this.clearAbort();
            throw error;
        }
    }

    /**
     * Detect if buffer contains text or binary data
     */
    protected isBufferBinary(buffer: ArrayBuffer): boolean {
        const numberArray = Array.prototype.slice.call(new Uint16Array(buffer, 0, 50));
        const bufferString: string = String.fromCharCode.apply(null, numberArray);

        for (let i = 0; i < bufferString.length; i++) {
            const charCode = bufferString.charCodeAt(i);
            // 65533 is a code for unknown character
            // 0-8 are codes for control characters
            if (charCode === 65533 || charCode <= 8) {
                return true;
            }
        }
        return false;
    }

    protected async writeBuffer(buffer: ArrayBuffer, pageSize: number, offset: number = 0): Promise<void> {
        const end = Math.min(buffer.byteLength, offset + pageSize);
        const page = buffer.slice(offset, end);
        const data = new Uint8Array(page.byteLength + 1);

        data.set([page.byteLength]);
        data.set(new Uint8Array(page), 1);

        try {
            await this.send(DAPLinkFlash.WRITE, data);
        } catch (error) {
            await this.clearAbort();
            throw error;
        }

        if (end < buffer.byteLength) {
            return this.writeBuffer(buffer, pageSize, end);
        }
    }

    /**
     * Clears the abort register of all error flags
     * @param abortMask Optional AbortMask to use, otherwise clears all flags
     */
    protected async clearAbort(abortMask: number = AbortMask.WDERRCLR | AbortMask.STKERRCLR | AbortMask.STKCMPCLR | AbortMask.ORUNERRCLR): Promise<void> {
        await this.send(DAPCommand.DAP_WRITE_ABORT, new Uint8Array([0, abortMask]));
    }

    /**
     * Send a command
     * @param command Command to send
     * @param data Data to use
     * @returns Promise of DataView
     */
    public async send(command: number, data?: BufferSource): Promise<DataView> {
        const array = this.bufferSourceToUint8Array(command, data);
        await this.sendMutex.lock();

        try {
            await this.transferOut(array);
            const result = await this.transferIn();
            const response = new DataView(result);

            if (response.getUint8(0) !== command) {
                throw new Error(`Bad response for ${command} -> ${response.getUint8(0)}`);
            }

            switch (command) {
                case DAPCommand.DAP_DISCONNECT:
                case DAPCommand.DAP_WRITE_ABORT:
                case DAPCommand.DAP_DELAY:
                case DAPCommand.DAP_RESET_TARGET:
                case DAPCommand.DAP_SWJ_CLOCK:
                case DAPCommand.DAP_SWJ_SEQUENCE:
                case DAPCommand.DAP_SWD_CONFIGURE:
                case DAPCommand.DAP_SWD_SEQUENCE:
                case DAPCommand.DAP_SWO_TRANSPORT:
                case DAPCommand.DAP_SWO_MODE:
                case DAPCommand.DAP_SWO_CONTROL:
                case DAPCommand.DAP_JTAG_CONFIGURE:
                case DAPCommand.DAP_JTAG_ID_CODE:
                case DAPCommand.DAP_TRANSFER_CONFIGURE:
                    if (response.getUint8(1) !== DAPResponse.DAP_OK) {
                        throw new Error(`Bad status for ${command} -> ${response.getUint8(1)}`);
                    }
            }

            return response;
        } finally {
            this.sendMutex.unlock();
        }
    }

    protected bufferSourceToUint8Array(prefix: number, data?: BufferSource): Uint8Array {

        if (!data) {
            return new Uint8Array([prefix]);
        }

        const isView = (source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView => {
            return (source as ArrayBufferView).buffer !== undefined;
        };

        const arrayBuffer = isView(data) ? data.buffer : data;
        const result = new Uint8Array(arrayBuffer.byteLength + 1);

        result.set([prefix]);
        result.set(new Uint8Array(arrayBuffer), 1);

        return result;
    }

    /**
     * Read from device
     * @returns Promise of DataView
     */
    public async transferIn(): Promise<ArrayBuffer> {
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
    public async transferOut(data: ArrayBuffer): Promise<void> {
        if (this.interfaceNumber === undefined) {
            throw new Error('No device opened');
        }

        const buffer = this.extendBuffer(data, this.packetSize);
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

        /**
     * Open device
     * @returns Promise
     */
    public async open(): Promise<void> {
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

        // Otherwise use the first
        if (!selectedInterface) {
            selectedInterface = interfaces[0];
        }

        this.interfaceNumber = selectedInterface.interfaceNumber;

        // If we always want to use control transfer, don't find/set endpoints and claim interface
        if (!this.alwaysControlTransfer) {
            const endpoints = selectedInterface.alternates[0].endpoints;

            this.endpointIn = undefined;
            this.endpointOut = undefined;

            for (const endpoint of endpoints) {
                if (endpoint.direction === 'in') this.endpointIn = endpoint;
                else this.endpointOut = endpoint;
            }
        }

        return this.device.claimInterface(this.interfaceNumber);
    }

    /**
     * Close device
     * @returns Promise
     */
    public close(): Promise<void> {
        return this.device.close();
    }

    protected extendBuffer(data: BufferSource, packetSize: number): BufferSource {
        function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
            return (source as ArrayBufferView).buffer !== undefined;
        }

        const arrayBuffer = isView(data) ? data.buffer : data;
        const length = Math.min(arrayBuffer.byteLength, packetSize);

        const result = new Uint8Array(length);
        result.set(new Uint8Array(arrayBuffer));

        return result;
    }

        /**
     * Connect to target device
     * @returns Promise
     */
    public async connect(): Promise<void> {
        if (this.connected === true) {
            return;
        }

        await this.open();

        try {
            await this.send(DAPCommand.DAP_SWJ_CLOCK, new Uint32Array([DEFAULT_CLOCK_FREQUENCY]));
            const result = await this.send(DAPCommand.DAP_CONNECT, new Uint8Array([this.mode]));

            if (result.getUint8(1) === DAPConnectResponse.FAILED || this.mode !== DAPProtocol.DEFAULT && result.getUint8(1) !== this.mode) {
                throw new Error('Mode not enabled.');
            }
        } catch (error) {
            await this.clearAbort();
            await this.close();
            throw error;
        }

        try {
            await this.configureTransfer(0, 100, 0);
            await this.selectProtocol(DAPProtocol.SWD);
        } catch (error) {
            await this.close();
            throw error;
        }

        this.connected = true;
    }

    /**
     * Disconnect from target device
     * @returns Promise
     */
    public async disconnect(): Promise<void> {
        if (this.connected === false) {
            return;
        }

        try {
            await this.send(DAPCommand.DAP_DISCONNECT);
        } catch (error) {
            await this.clearAbort();
            throw error;
        }

        await this.close();
        this.connected = false;
    }

    /**
     * Reconnect to target device
     * @returns Promise
     */
    public async reconnect(): Promise<void> {
        await this.disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.connect();
    }

    /**
     * Reset target device
     * @returns Promise of whether a device specific reset sequence is implemented
     */
    public async reset(): Promise<boolean> {
        try {
            const response = await this.send(DAPCommand.DAP_RESET_TARGET);
            return response.getUint8(2) === DAPResetTargeResponse.RESET_SEQUENCE;
        } catch (error) {
            await this.clearAbort();
            throw error;
        }
    }

    /**
     * Switches the CMSIS-DAP unit to use SWD
     * http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.ddi0316d/Chdhfbhc.html
     */
    protected async selectProtocol(protocol: DAPProtocol): Promise<void> {
        const sequence = protocol === DAPProtocol.JTAG ? JTAG_SEQUENCE : SWD_SEQUENCE;

        await this.swjSequence(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])); // Sequence of 1's
        await this.swjSequence(new Uint16Array([sequence]));                                // Send protocol sequence
        await this.swjSequence(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])); // Sequence of 1's
        await this.swjSequence(new Uint8Array([0x00]));
    }

        /**
     * Send an SWJ Sequence
     * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__SWJ__Sequence.html
     * @param sequence The sequence to send
     * @returns Promise
     */
    protected async swjSequence(sequence: BufferSource): Promise<void> {
        const bitLength = sequence.byteLength * 8;
        const data = this.bufferSourceToUint8Array(bitLength, sequence);

        try {
            await this.send(DAPCommand.DAP_SWJ_SEQUENCE, data);
        } catch (error) {
            await this.clearAbort();
            throw error;
        }
    }

    /**
     * Configure Transfer
     * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__TransferConfigure.html
     * @param idleCycles Number of extra idle cycles after each transfer
     * @param waitRetry Number of transfer retries after WAIT response
     * @param matchRetry Number of retries on reads with Value Match in DAP_Transfer
     * @returns Promise
     */
    protected async configureTransfer(idleCycles: number, waitRetry: number, matchRetry: number): Promise<void> {
        const data = new Uint8Array(5);
        const view = new DataView(data.buffer);

        view.setUint8(0, idleCycles);
        view.setUint16(1, waitRetry, true);
        view.setUint16(3, matchRetry, true);

        try {
            await this.send(DAPCommand.DAP_TRANSFER_CONFIGURE, data);
        } catch (error) {
            await this.clearAbort();
            throw error;
        }
    }
}
