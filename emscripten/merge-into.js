mergeInto(LibraryManager.library, {
    logMessage: function(message) {
        return Asyncify.handleSleep(wakeUp => {
            Module.logMessage(Module.UTF8ToString(message))
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    open: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.open()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    close: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.close()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    transferIn: function() {
        return Asyncify.handleSleep(wakeUp => {
            Module.transferIn()
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    },
    transferOut: function(data) {
        return Asyncify.handleSleep(wakeUp => {
            Module.transferIn(data)
            .then(result => wakeUp(result))
            .catch(error => Module.logMessage(error));
        });
    }
});
