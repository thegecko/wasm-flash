/*
* DAPjs
* Copyright Arm Limited 2018
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

/**
 * CMSIS-DAP Protocol
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__Connect.html
 */
export const enum DAPProtocol {
    /**
     * Default mode: configuration of the DAP port mode is derived from DAP_DEFAULT_PORT
     */
    DEFAULT = 0,
    /**
     * SWD mode: connect with Serial Wire Debug mode
     */
    SWD = 1,
    /**
     * JTAG mode: connect with 4/5-pin JTAG mode
     */
    JTAG = 2
}

/**
 * DAP Ports
 */
export const enum DAPPort {
    /**
     * Debug Port (DP)
     */
    DEBUG = 0x00,
    /**
     * Access Port (AP)
     */
    ACCESS = 0x01
}

/**
 * DAP Register Transfer Modes
 */
export const enum DAPTransferMode {
    /**
     * Write
     */
    WRITE = 0x00,
    /**
     * Read
     */
    READ = 0x02
}

/**
 * CMSIS-DAP Commands
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__genCommands__gr.html
 */
export const enum DAPCommand {
    /**
     * Get Information about CMSIS-DAP Debug Unit
     */
    DAP_INFO = 0x00,
    /**
     * Sent status information of the debugger to Debug Unit
     */
    DAP_HOST_STATUS = 0x01,
    /**
     * Connect to Device and selected DAP mode
     */
    DAP_CONNECT = 0x02,
    /**
     * Disconnect from active Debug Port
     */
    DAP_DISCONNECT = 0x03,
    /**
     * Configure Transfers
     */
    DAP_TRANSFER_CONFIGURE = 0x04,
    /**
     * Read/write single and multiple registers
     */
    DAP_TRANSFER = 0x05,
    /**
     * Read/Write a block of data from/to a single register
     */
    DAP_TRANSFER_BLOCK = 0x06,
    /**
     * Abort current Transfer
     */
    DAP_TRANSFER_ABORT = 0x07,
    /**
     * Write ABORT Register
     */
    DAP_WRITE_ABORT = 0x08,
    /**
     * Wait for specified delay
     */
    DAP_DELAY = 0x09,
    /**
     * Reset Target with Device specific sequence
     */
    DAP_RESET_TARGET = 0x0A,
    /**
     * Control and monitor SWD/JTAG Pins
     */
    DAP_SWJ_PINS = 0x10,
    /**
     * Select SWD/JTAG Clock
     */
    DAP_SWJ_CLOCK = 0x11,
    /**
     * Generate SWJ sequence SWDIO/TMS @SWCLK/TCK
     */
    DAP_SWJ_SEQUENCE = 0x12,
    /**
     * Configure SWD Protocol
     */
    DAP_SWD_CONFIGURE = 0x13,
    /**
     * Generate JTAG sequence TMS, TDI and capture TDO
     */
    DAP_JTAG_SEQUENCE = 0x14,
    /**
     * Configure JTAG Chain
     */
    DAP_JTAG_CONFIGURE = 0x15,
    /**
     * Read JTAG IDCODE
     */
    DAP_JTAG_ID_CODE = 0x16,
    /**
     * Set SWO transport mode
     */
    DAP_SWO_TRANSPORT = 0x17,
    /**
     * Set SWO capture mode
     */
    DAP_SWO_MODE = 0x18,
    /**
     * Set SWO baudrate
     */
    DAP_SWO_BAUD_RATE = 0x19,
    /**
     * Control SWO trace data capture
     */
    DAP_SWO_CONTROL = 0x1A,
    /**
     * Read SWO trace status
     */
    DAP_SWO_STATUS = 0x1B,
    /**
     * Read SWO trace data
     */
    DAP_SWO_DATA = 0x1C,
    /**
     * Generate SWD sequence and output on SWDIO or capture input from SWDIO data
     */
    DAP_SWD_SEQUENCE = 0x1D,
    /**
     * Read SWO trace extended status
     */
    DAP_SWO_EXTENDED_STATUS = 0x1E,
    /**
     * Execute multiple DAP commands from a single packet
     */
    DAP_EXECUTE_COMMANDS = 0x7F,
    /**
     * Queue multiple DAP commands provided in a multiple packets
     */
    DAP_QUEUE_COMMANDS = 0x7E
}

/**
 * CMSIS-DAP Command Response
 * @hidden
 */
export const enum DAPResponse {
    /**
     * This is fine
     */
    DAP_OK = 0x00,
    /**
     * Error
     */
    DAP_ERROR = 0xFF
}

/**
 * Get Information about CMSIS-DAP Debug Unit
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__Info.html
 */
export const enum DAPInfoRequest {
    /**
     * Get the Vendor ID (string)
     */
    VENDOR_ID = 0x01,
    /**
     * Get the Product ID (string)
     */
    PRODUCT_ID = 0x02,
    /**
     * Get the Serial Number (string)
     */
    SERIAL_NUMBER = 0x03,
    /**
     * Get the CMSIS-DAP Firmware Version (string)
     */
    CMSIS_DAP_FW_VERSION = 0x04,
    /**
     * Get the Target Device Vendor (string)
     */
    TARGET_DEVICE_VENDOR = 0x05,
    /**
     * Get the Target Device Name (string)
     */
    TARGET_DEVICE_NAME = 0x06,
    /**
     * Get information about the Capabilities (BYTE) of the Debug Unit
     */
    CAPABILITIES = 0xF0,
    /**
     * Get the Test Domain Timer parameter information
     */
    TEST_DOMAIN_TIMER = 0xF1,
    /**
     * Get the SWO Trace Buffer Size (WORD)
     */
    SWO_TRACE_BUFFER_SIZE = 0xFD,
    /**
     * Get the maximum Packet Count (BYTE)
     */
    PACKET_COUNT = 0xFE,
    /**
     * Get the maximum Packet Size (SHORT)
     */
    PACKET_SIZE = 0xFF,
}

/**
 * CMSIS-DAP Host Status Type
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__HostStatus.html
 * @hidden
 */
export const enum DAPHostStatusType {
    /**
     *  Connect: Status indicates that the debugger is connected to the Debug Unit
     */
    CONNECT = 0,
    /**
     * Running: Status indicates that the target hardware is executing application code
     */
    RUNNING = 1
}

/**
 * CMSIS-DAP Host Status Response
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__HostStatus.html
 * @hidden
 */
export const enum DAPHostStatusResponse {
    /**
     * False: may be used to turn off a status LED (Connect or Running) on the Debug Unit
     */
    FALSE = 0,
    /**
     * True: may be used to turn on a status LED (Connect or Running) on the Debug Unit
     */
    TRUE = 1
}

/**
 * CMSIS-DAP Connect Response
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__Connect.html
 * @hidden
 */
export const enum DAPConnectResponse {
    /**
     * Initialization failed; no mode pre-configured
     */
    FAILED = 0,
    /**
     * Initialization for SWD mode
     */
    SWD = 1,
    /**
     * Initialization for JTAG mode
     */
    JTAG = 2
}

/**
 * CMSIS-DAP Reset Target Execute Response
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__ResetTarget.html
 * @hidden
 */
export const enum DAPResetTargeResponse {
    /**
     * No device specific reset sequence is implemented
     */
    NO_RESET_SEQUENCE = 0,
    /**
     * A device specific reset sequence is implemented
     */
    RESET_SEQUENCE = 1
}

/**
 * CMSIS-DAP SWO Transport
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__SWO__Transport.html
 * @hidden
 */
export const enum DAPSWOTransport {
    /**
     * None (default)
     */
    NONE = 0,
    /**
     * Read trace data via DAP_SWO_Data command
     */
    READ = 1,
    /**
     * Send trace data via separate WinUSB endpoint (requires CMSIS-DAP v2 configuration)
     */
    SEND = 2
}

/**
 * CMSIS-DAP SWO Mode
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__SWO__Mode.html
 * @hidden
 */
export const enum DAPSWOMode {
    /**
     * Off (default)
     */
    OFF = 0,
    /**
     * UART
     */
    UART = 1,
    /**
     * Manchester
     */
    MANCHESTER = 2
}

/**
 * CMSIS-DAP SWO Control
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__SWO__Control.html
 * @hidden
 */
export const enum DAPSWOControl {
    /**
     * Stop
     */
    STOP = 0,
    /**
     * Start
     */
    START = 1
}

/**
 * CMSIS-DAP Transfer Response
 * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__Transfer.html
 * @hidden
 */
export const enum DAPTransferResponse {
    /**
     * OK (for SWD protocol), OK or FAULT (for JTAG protocol)
     */
    OK = 0x01,
    /**
     * Wait
     */
    WAIT = 0x02,
    /**
     * Fault
     */
    FAULT = 0x04,
    /**
     * NO_ACK (no response from target)
     */
    NO_ACK = 0x07,
    /**
     * Protocol Error (SWD)
     */
    PROTOCOL_ERROR = 0x08,
    /**
     * Value Mismatch (Read Register with Value Match)
     */
    VALUE_MISMATCH = 0x10
}

/**
 * Vendor-specific commands for DapLink mass-storage device flashing
 */
export const enum DAPLinkFlash {
    /**
     * Reset the target
     */
    RESET = 0x89,
    /**
     * Open the MSD
     */
    OPEN = 0x8A,
    /**
     * Close the MSD
     */
    CLOSE = 0x8B,
    /**
     * Write the image
     */
    WRITE = 0x8C
}

/*
* DAPjs
* Copyright Arm Limited 2018
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

/**
 * Debug Port Registers
 * http://infocenter.arm.com/help/topic/com.arm.doc.100230_0004_00_en/Chunk310569109.html#smr1439293850345
 */
export const enum DPRegister {
    /**
     * AP Abort register, write only
     */
    ABORT = 0x0,
    /**
     * Debug Port Identification register, read only
     */
    DPIDR = 0x0,
    /**
     * Control/Status register, SELECT.DPBANKSEL 0x0
     */
    CTRL_STAT = 0x4,
    /**
     * Data Link Control Register, SELECT.DPBANKSEL 0x1
     */
    DLCR = 0x4,
    /**
     * Read Resend register, read only
     */
    RESEND = 0x8,
    /**
     * AP Select register, write only
     */
    SELECT = 0x8,
    /**
     * Read Buffer register, read only
     */
    RDBUFF = 0xC,
    // Version 2
    /**
     * Target Identification register, read only, SELECT.DPBANKSEL 0x2
     */
    TARGETID = 0x4,
    /**
     * Data Link Protocol Identification Register, read only, SELECT.DPBANKSEL 0x3
     */
    DLPIDR = 0x4,
    /**
     * Event Status register, read only, SELECT.DPBANKSEL 0x4
     */
    EVENTSTAT = 0x4,
    /**
     * Target Selection, write only
     */
    TARGETSEL = 0xC
}

/**
 * Access Port Registers
 * http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.100230_0004_00_en/smr1439293381481.html
 */
export const enum APRegister {
    /**
     * Control/Status Word register
     */
    CSW = 0x00,
    /**
     * Transfer Address Register
     */
    TAR = 0x04,
    /**
     * Data Read/Write register
     */
    DRW = 0x0C,
    /**
     * Banked Data register
     */
    BD0 = 0x10,
    /**
     * Banked Data register
     */
    BD1 = 0x14,
    /**
     * Banked Data register
     */
    BD2 = 0x18,
    /**
     * Banked Data register
     */
    BD3 = 0x1C,
    /**
     * Configuration register
     */
    CFG = 0xF4,
    /**
     * Debug Base Address register
     */
    ROM = 0xF8,
    /**
     * Identification Register
     */
    IDR = 0xFC
}

/**
 * Abort Register Mask
 * @hidden
 */
export const enum AbortMask {
    /**
     * Generates a DAP abort, that aborts the current AP transaction
     */
    DAPABORT = (1 << 0),
    /**
     * Reserved
     */
    STKCMPCLR = (1 << 1),
    /**
     * Sets the STICKYERR sticky error flag to 0
     */
    STKERRCLR = (1 << 2),
    /**
     * Sets the WDATAERR write data error flag to 0
     */
    WDERRCLR = (1 << 3),
    /**
     * Sets the STICKYORUN overrun error flag to 0
     */
    ORUNERRCLR = (1 << 4)
}

/**
 * Control/Status Register Mask
 * @hidden
 */
export const enum CtrlStatMask {
    /**
     * This bit is set to 1 to enable overrun detection. The reset value is 0
     */
    ORUNDETECT = (1 << 0),
    /**
     * This bit is set to 1 when an overrun occurs, read only
     */
    STICKYORUN = (1 << 1),
    /**
     * Reserved
     */
    STICKYCMP = (1 << 4),
    /**
     * If an error is returned by an access port transaction, this bit is set to 1, read only
     */
    STICKYERR = (1 << 5),
    /**
     * Whether the response to the previous access port read or RDBUFF read was OK, read only
     */
    READOK = (1 << 6),
    /**
     * If a Write Data Error occurs, read only
     */
    WDATAERR = (1 << 7),
    /**
     * Debug reset request, the reset value is 0
     */
    CDBGRSTREQ = (1 << 26),
    /**
     * Debug reset acknowledge, read only
     */
    CDBGRSTACK = (1 << 27),
    /**
     * Debug powerup request, the reset value is 0
     */
    CDBGPWRUPREQ = (1 << 28),
    /**
     * Debug powerup acknowledge, read only
     */
    CDBGPWRUPACK = (1 << 29),
    /**
     * System powerup request, the reset value is 0
     */
    CSYSPWRUPREQ = (1 << 30),
    /**
     * System powerup acknowledge, read only
     */
    CSYSPWRUPACK = (1 << 31)
}

/**
 * Control/Status Word Register Mask
 * http://infocenter.arm.com/help/topic/com.arm.doc.100165_0201_00_en/Chunk2061626261.html#ric1417175948266
 * @hidden
 */
export const enum CSWMask {
    /**
     * 8 bits
     */
    SIZE_8 = (0 << 0),
    /**
     * 16 bits
     */
    SIZE_16 = (1 << 0),
    /**
     * 32 bits
     */
    SIZE_32 = (1 << 1),
    /**
     * Auto address increment single
     */
    ADDRINC_SINGLE = (1 << 4),
    /**
     * Auto address increment packed
     */
    ADDRINC_PACKED = (1 << 5),
    /**
     * Indicates the status of the DAPEN port - AHB transfers permitted
     */
    DBGSTATUS = (1 << 6),
    /**
     * Indicates if a transfer is in progress
     */
    TRANSINPROG = (1 << 7),
    /**
     * Reserved
     */
    RESERVED = (1 << 24),
    /**
     * User and Privilege control
     */
    HPROT1 = (1 << 25),
    /**
     * Set to 1 for master type debug
     */
    MASTERTYPE = (1 << 29),
    /**
     * Common mask value
     * @hidden
     */
    VALUE = ( ADDRINC_SINGLE | DBGSTATUS | RESERVED | HPROT1 | MASTERTYPE ),
}

/**
 * Debug Port Bank Select
 * @hidden
 */
export const enum DPBankSelect {
    /**
     * CTRL/STAT
     */
    CTRL_STAT = 0x00,
    /**
     * DLCR
     */
    DLCR = 0x01,
    /**
     * TARGETID
     */
    TARGETID = 0x02,
    /**
     * DLPIDR
     */
    DLPIDR = 0x03,
    /**
     * EVENTSTAT
     */
    EVENTSTAT = 0x04
}

/**
 * Bank Select Mask
 * @hidden
 */
export const enum BankSelectMask {
    /**
     * Selects the current access port
     */
    APSEL = 0xFF000000,
    /**
     * Selects the active 4-word register window on the current access port
     */
    APBANKSEL = 0x000000F0,
    /**
     * Selects the register that appears at DP register 0x4
     */
    DPBANKSEL = 0x0000000F
}

/**
 * Event Status Mask
 * @hidden
 */
export const enum EventStatMask {
    /**
     * Event status flag, indicates that the processor is halted when set to 0
     */
    EA = 0x01
}
