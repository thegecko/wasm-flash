mergeInto(LibraryManager.library, {
    open: function () {
        return Asyncify.handleSleep(wakeUp => {
            Module.open()
            .then(() => wakeUp())
            .catch(error => console.log(error));
        });
    },
    close: function () {
        return Asyncify.handleSleep(wakeUp => {
            Module.close()
            .then(() => wakeUp())
            .catch(error => console.log(error));
        });
    },
    transferIn: function () {
        return Asyncify.handleSleep(wakeUp => {
            Module.transferIn()
            .then(arrayBuffer => wakeUp(new Uint8Array(arrayBuffer)))
            .catch(error => console.log(error));
        });
    },
    transferOut: function (data) {
        return Asyncify.handleSleep(wakeUp => {
            Module.transferIn(data.buffer)
            .then(() => wakeUp())
            .catch(error => console.log(error));
        });
    },
    showMessage: function (message) {
        return Asyncify.handleSleep(wakeUp => {
            Module.showMessage(Module.UTF8ToString(message))
            .then(result => wakeUp(result))
            .catch(error => console.log(error));
        });
    }
});
