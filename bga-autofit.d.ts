interface AutofitSettings {
    scaleStep?: number;
    minScale?: number;
}
interface AutofitWithObserverSettings extends AutofitSettings {
    rootElement?: HTMLElement;
}
declare function init(settings?: AutofitWithObserverSettings): void;

declare const BgaAutofit: {
    init: typeof init;
};

export { BgaAutofit, init };
