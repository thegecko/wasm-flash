Module.flash = async buffer => {
    const data = new Uint8Array(buffer);
    const result = await Module.ccall('flash',
        'boolean',
        ['array', 'number'],
        [data, buffer.byteLength],
        { async: true }
    );
    return result;
}
