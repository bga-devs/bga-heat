interface JumpToEntrySettings {
    color?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    classes?: string;
    id?: string;
    html?: string;
}

declare class JumpToEntry {
    constructor(label: string, target: string | HTMLElement, settings?: JumpToEntrySettings);
}

interface JumpToSettings {
    localStorageFoldedKey?: string;
    entries: JumpToEntry[];
    defaultFolded?: boolean;
    element?: HTMLElement;
}

interface BgaJumpToPlayer {
    id: number | string;
    name: string;
    color: string;
}

interface BgaPlayerEntriesSettings {
    playerOrder?: (number | string)[];
    entryTarget?: (playerId: number, player: BgaJumpToPlayer) => string | HTMLElement;
    entrySettings?: (playerId: number, player: BgaJumpToPlayer) => JumpToEntrySettings;
}

declare function BgaPlayerEntries(bga: any, settings?: BgaPlayerEntriesSettings): JumpToEntry[];

declare class JumpToManager {
    constructor(settings: JumpToSettings);
}

declare const BgaJumpTo: {
    Entry: typeof JumpToEntry;
    Manager: typeof JumpToManager;
    BgaPlayerEntries: typeof BgaPlayerEntries;
};

export { BgaJumpTo, BgaPlayerEntries, JumpToEntry as Entry, JumpToManager as Manager };
