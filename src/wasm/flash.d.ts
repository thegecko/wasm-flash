export interface FlashModule extends EmscriptenModule {
    flash: (data: ArrayBuffer) => Promise<boolean>;
}

export type ModuleFactory = (moduleOverrides?: any) => Promise<FlashModule>;
declare const moduleFactory: ModuleFactory;
export default moduleFactory;
