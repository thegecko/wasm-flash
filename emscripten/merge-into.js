mergeInto(LibraryManager.library, {
    logMessage: function(message) {
        return Asyncify.handleSleep(wakeUp => {
            Module.logMessage(Module.UTF8ToString(message))
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(`logMessage error: ${error.message}`));
        });
    },
    emitProgress: function(percent) {
        try {
            Module.emit('progress', percent);
        } catch (error) {
            Module.logMessage(`emitProgress error: ${error.message}`);
        }
    },
    usbOpen: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.usbOpen()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(`usbOpen error: ${error.message}`));
        });
    },
    usbClose: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.usbClose()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(`usbClose error: ${error.message}`));
        });
    },
    transferOut: function(pointer, size) {
        return Asyncify.handleSleep(wakeUp => {
            const data = HEAPU8.slice(pointer, pointer + size);
            Module.transferOut(data)
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(`transferOut error: ${error.message}`));
        });
    },
    transferIn: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.transferIn()
            .then(result => {
                const pointer = stackAlloc(result.byteLength);
                writeArrayToMemory(result, pointer);
                wakeUp(pointer);
            })
            .catch(error => Module.logMessage(`transferIn error: ${error.message}`));
        });
    }
});
