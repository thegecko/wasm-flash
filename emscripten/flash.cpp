#include <stdio.h>
#include <math.h>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

#define DEFAULT_CLOCK_FREQUENCY 10000000
#define DAP_OK 0x00
#define DAP_CONNECT 0x02
#define DAP_DISCONNECT 0x03
#define DAP_WRITE_ABORT 0x08
#define DAP_DELAY 0x09
#define DAP_RESET_TARGET 0x0A
#define DAP_SWJ_CLOCK 0x11
#define DAP_SWJ_SEQUENCE 0x12
#define DAP_SWD_CONFIGURE 0x13
#define DAP_SWD_SEQUENCE 0x1D
#define DAP_SWO_TRANSPORT 0x17
#define DAP_SWO_MODE 0x18
#define DAP_SWO_CONTROL 0x1A
#define DAP_JTAG_CONFIGURE 0x15
#define DAP_JTAG_ID_CODE 0x16
#define DAP_TRANSFER_CONFIGURE 0x04
#define SWD_SEQUENCE 0xE79E
#define DEFAULT_DAP_PROTOCOL 0
#define DEFAULT_PAGE_SIZE 62
#define FLASH_OPEN 0x8A
#define FLASH_CLOSE 0x8B
#define FLASH_WRITE 0x8C
#define FLASH_RESET 0x89
#define ABORT_MASK_STKCMPCLR (1 << 1)
#define ABORT_MASK_STKERRCLR (1 << 2)
#define ABORT_MASK_WDERRCLR (1 << 3)
#define ABORT_MASK_ORUNERRCLR (1 << 4)
#define CONNECT_RESPONSE_FAILED 0

#define COUNT_OF(array) (sizeof(array) / sizeof(array[0]))

#ifdef __cplusplus
// So that the C++ compiler does not rename our function names
extern "C" {
    extern void logMessage(const char* message);
    extern void usbOpen();
    extern void usbClose();
    extern uint8_t* transferIn();
    extern void transferOut(const uint8_t* data, uint32_t size);
#endif

    void logNumber(uint32_t num) {
        char buff[100];
        sprintf(buff,"data: %d", num);
        logMessage(buff);
    }

    uint8_t* send(uint8_t command, uint8_t* data, uint32_t size) {
        uint8_t request[size + 1];
        request[0] = command;
      
        for (int index = 1; index < sizeof(request); index++) {
            request[index] = data[index - 1];
        }

        transferOut(request, sizeof(request));
        uint8_t* response = transferIn();

        if (response[0] != command) {
            char buff[100];
            sprintf(buff, "Bad response for %d -> %d", command, response[0]);
            logMessage(buff);
            throw buff;
        }

        switch (command) {
            case DAP_DISCONNECT:
            case DAP_WRITE_ABORT:
            case DAP_DELAY:
            case DAP_RESET_TARGET:
            case DAP_SWJ_CLOCK:
            case DAP_SWJ_SEQUENCE:
            case DAP_SWD_CONFIGURE:
            case DAP_SWO_TRANSPORT:
            case DAP_SWO_MODE:
            case DAP_SWO_CONTROL:
            case DAP_JTAG_CONFIGURE:
            case DAP_JTAG_ID_CODE:
            case DAP_TRANSFER_CONFIGURE:
                if (response[1] != DAP_OK) {
                    char buf2[100];
                    sprintf(buf2, "Bad status for %d -> %d", command, response[1]);
                    logMessage(buf2);
                    throw buf2;
                }
        }

        return response;
    }

    void clearAbort() {
        uint8_t abortMask = ABORT_MASK_STKCMPCLR | ABORT_MASK_STKERRCLR | ABORT_MASK_WDERRCLR | ABORT_MASK_ORUNERRCLR;
        uint8_t data[] = { 0, abortMask };
        send(DAP_WRITE_ABORT, data, COUNT_OF(data));
    }

    void configureTransfer(uint8_t idleCycles, uint8_t waitRetry, uint8_t matchRetry) {
        uint8_t data[5];
        data[0] = idleCycles;
        data[1] = (uint8_t)waitRetry;
        data[2] = (uint8_t)(waitRetry >> 8);
        data[3] = (uint8_t)matchRetry;
        data[4] = (uint8_t)(matchRetry >> 8);

        send(DAP_TRANSFER_CONFIGURE, data, COUNT_OF(data));
    }

    void swjSequence(uint8_t* sequence, uint8_t size) {
        uint8_t data[size + 1];
        uint8_t bitLength = size*8;
        data[0] = bitLength;
      
        for (int index = 1; index < sizeof(data); index++) {
            data[index] = sequence[index - 1];
        }

        send(DAP_SWJ_SEQUENCE, data, COUNT_OF(data));
    }
    
    void selectProtocol(uint16_t sequence) {
        uint8_t seq[2];
        seq[0] = (uint8_t)sequence;
        seq[1] = (uint8_t)(sequence >> 8);

        uint8_t seq1[] = { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };  // Sequence of 1's
        uint8_t seqend[] = { 0x00 };
        swjSequence(seq1, COUNT_OF(seq1));
        swjSequence(seq, COUNT_OF(seq));
        swjSequence(seq1, COUNT_OF(seq1));
        swjSequence(seqend, COUNT_OF(seqend));
    }

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif
    void connect() {
        logMessage("connect");
        usbOpen();
        uint32_t clockdata[] = { DEFAULT_CLOCK_FREQUENCY };
        send(DAP_SWJ_CLOCK, (uint8_t*)clockdata, sizeof(clockdata));
        uint8_t data[] = { DEFAULT_DAP_PROTOCOL };
        uint8_t *result = send(DAP_CONNECT, data, COUNT_OF(data));

        if (result[1] == CONNECT_RESPONSE_FAILED) {
            logMessage("Mode not enabled");
            clearAbort();
            usbClose();
            throw "Mode not enabled";
        }

        configureTransfer(0, 100, 0);
        selectProtocol(SWD_SEQUENCE);
    }

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif
    void disconnect() {
        logMessage("disconnect");
        send(DAP_DISCONNECT, NULL, 0);
        usbClose();
    }

    void writeBuffer(uint8_t* buffer, uint8_t pageSize, uint32_t size, uint32_t offset) {
        uint32_t end = fmin(size, offset + pageSize);
        uint8_t byteLength = end - offset;
        uint8_t page[byteLength + 1];
        page[0] = byteLength;

        for (int index = 1; index < sizeof(page); index++) {
            page[index] = buffer[offset + index - 1];
        }

        send(FLASH_WRITE, page, COUNT_OF(page));

        if (end < size) {
            writeBuffer(buffer, pageSize, size, end);
        }
    }

    void doFlash(uint8_t* buffer, uint32_t size) {
        uint8_t data[] = { 0x00, 0x00, 0x00, 0x00 };
        uint8_t* result = send(FLASH_OPEN, data, COUNT_OF(data));

        // An error occurred
        if (result[1] != 0) {
           logMessage("Flash open error");
           clearAbort();
           throw "Flash open error";
        }

        writeBuffer(buffer, DEFAULT_PAGE_SIZE, size, 0);
        uint8_t* result2 = send(FLASH_CLOSE, NULL, 0);

        // An error occurred
        if (result2[1] != 0) {
           logMessage("Flash close error");
           clearAbort();
           throw "Flash close error";
        }

        send(FLASH_RESET, NULL, 0);
    }

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif
    int flash(uint8_t* data, uint32_t size) {
        connect();
        doFlash(data, size);
        disconnect();
        return 0;
    }

#ifdef __cplusplus
}
#endif
