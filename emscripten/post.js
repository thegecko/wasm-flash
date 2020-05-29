Module.flash = async buffer => {
    const data = new Uint8Array(buffer);
    const result = await Module.ccall('flash',
        'number',
        ['array', 'number'],
        [data, buffer.byteLength],
        { async: true }
    );
    return result === 0 ? true : false;
}
