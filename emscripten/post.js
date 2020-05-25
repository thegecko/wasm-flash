Module.GetPrimes = end => {
    return Module.ccall('GetPrimes',
        'number',
        ['number'],
        [end],
        { async: true }
    );
}
