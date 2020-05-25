export interface FlashModule extends EmscriptenModule {
    GetPrimes: (end: number) => Promise<number>;
}

export type ModuleFactory = (moduleOverrides?: any) => Promise<FlashModule>;
declare const moduleFactory: ModuleFactory;
export default moduleFactory;
