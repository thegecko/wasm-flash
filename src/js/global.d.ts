interface EmModule extends EmscriptenModule {
    ccall: typeof ccall;
    GetPrimes: (end: number) => Promise<number>;
}

declare function flash(module: any): Promise<EmModule>;
