define([
    "dojo","dojo/_base/declare",
    getLibUrl('bga-autofit', '1.x')
],
function (dojo, declare, BgaAutofit) {
    window['BgaAutofit'] = BgaAutofit;
    return declare("bgagame.heat", ebg.core.gamegui, new Heat());
});