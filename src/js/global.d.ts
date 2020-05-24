interface EmModule extends EmscriptenModule {
    ccall: typeof ccall;
}

declare function flash(module: any): Promise<EmModule>;
