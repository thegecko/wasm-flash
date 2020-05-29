mergeInto(LibraryManager.library, {
    logMessage: function(message) {
        return Asyncify.handleSleep(wakeUp => {
            Module.logMessage(Module.UTF8ToString(message))
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    usbOpen: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.usbOpen()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    usbClose: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.usbClose()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    transferOut: function(pointer, size) {
        return Asyncify.handleSleep(wakeUp => {
            const data = HEAPU8.slice(pointer, pointer + size);
            Module.transferOut(data)
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    transferIn: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.transferIn()
            .then(result => {
                const arrayPointer = Module._malloc(result.byteLength);
                HEAPU8.set(result, arrayPointer);
                wakeUp(arrayPointer);
            })
            .catch(error => Module.logMessage(error));
        });
    }
});
