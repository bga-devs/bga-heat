import type { BgaZoom as BgaZoomType } from "../../bga-zoom";
import type { BgaAutofit as BgaAutofitType } from "../../bga-autofit";
import type { BgaJumpTo as BgaJumpToType } from "../../bga-jump-to";

const BgaZoom: typeof BgaZoomType = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaAutofit: typeof BgaAutofitType = await globalThis.importEsmLib('bga-autofit', '1.x');
const BgaJumpTo: typeof BgaJumpToType = await globalThis.importEsmLib('bga-jump-to', '1.x');

const [BgaHelp, BgaAnimations, BgaCards] = await globalThis.importDojoLibs([
    g_gamethemeurl + "modules/js/bga-help.js",
    g_gamethemeurl + "modules/js/bga-animations.js",
    g_gamethemeurl + "modules/js/bga-cards.js",
]);

export { BgaZoom, BgaAutofit, BgaJumpTo, BgaHelp, BgaAnimations, BgaCards };
