var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this.zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', function () { return _this.zoomOrDimensionChanged(); });
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        window.addEventListener('resize', function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { return _this.zoomOrDimensionChanged(); }).observe(settings.element);
        }
        if ((_e = this.settings.autoZoom) === null || _e === void 0 ? void 0 : _e.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this.zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this.zoomLevels[this.zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this.zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.getBoundingClientRect().width / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.getBoundingClientRect().height, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this.zoomLevels[this.zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this.zoomLevels[0]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var BgaHelpButton = /** @class */ (function () {
    function BgaHelpButton() {
    }
    return BgaHelpButton;
}());
var BgaHelpPopinButton = /** @class */ (function (_super) {
    __extends(BgaHelpPopinButton, _super);
    function BgaHelpPopinButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpPopinButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var button = document.createElement('button');
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_popin-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "?";
        if (this.settings.buttonBackground) {
            button.style.setProperty('--background', this.settings.buttonBackground);
        }
        if (this.settings.buttonColor) {
            button.style.setProperty('--color', this.settings.buttonColor);
        }
        toElement.appendChild(button);
        button.addEventListener('click', function () { return _this.showHelp(); });
    };
    BgaHelpPopinButton.prototype.showHelp = function () {
        var _a, _b, _c;
        var popinDialog = new window.ebg.popindialog();
        popinDialog.create('bgaHelpDialog');
        popinDialog.setTitle(this.settings.title);
        popinDialog.setContent("<div id=\"help-dialog-content\">".concat((_a = this.settings.html) !== null && _a !== void 0 ? _a : '', "</div>"));
        (_c = (_b = this.settings).onPopinCreated) === null || _c === void 0 ? void 0 : _c.call(_b, document.getElementById('help-dialog-content'));
        popinDialog.show();
    };
    return BgaHelpPopinButton;
}(BgaHelpButton));
var BgaHelpExpandableButton = /** @class */ (function (_super) {
    __extends(BgaHelpExpandableButton, _super);
    function BgaHelpExpandableButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpExpandableButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var folded = (_b = this.settings.defaultFolded) !== null && _b !== void 0 ? _b : true;
        if (this.settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(this.settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        var button = document.createElement('button');
        button.dataset.folded = folded.toString();
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_expandable-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "\n            <div class=\"bga-help_folded-content ".concat(((_c = this.settings.foldedContentExtraClasses) !== null && _c !== void 0 ? _c : '').split(/\s+/g), "\">").concat((_d = this.settings.foldedHtml) !== null && _d !== void 0 ? _d : '', "</div>\n            <div class=\"bga-help_unfolded-content  ").concat(((_e = this.settings.unfoldedContentExtraClasses) !== null && _e !== void 0 ? _e : '').split(/\s+/g), "\">").concat((_f = this.settings.unfoldedHtml) !== null && _f !== void 0 ? _f : '', "</div>\n        ");
        button.style.setProperty('--expanded-width', (_g = this.settings.expandedWidth) !== null && _g !== void 0 ? _g : 'auto');
        button.style.setProperty('--expanded-height', (_h = this.settings.expandedHeight) !== null && _h !== void 0 ? _h : 'auto');
        button.style.setProperty('--expanded-radius', (_j = this.settings.expandedRadius) !== null && _j !== void 0 ? _j : '10px');
        toElement.appendChild(button);
        button.addEventListener('click', function () {
            button.dataset.folded = button.dataset.folded == 'true' ? 'false' : 'true';
            if (_this.settings.localStorageFoldedKey) {
                localStorage.setItem(_this.settings.localStorageFoldedKey, button.dataset.folded);
            }
        });
    };
    return BgaHelpExpandableButton;
}(BgaHelpButton));
var HelpManager = /** @class */ (function () {
    function HelpManager(game, settings) {
        this.game = game;
        if (!(settings === null || settings === void 0 ? void 0 : settings.buttons)) {
            throw new Error('HelpManager need a `buttons` list in the settings.');
        }
        var leftSide = document.getElementById('left-side');
        var buttons = document.createElement('div');
        buttons.id = "bga-help_buttons";
        leftSide.appendChild(buttons);
        settings.buttons.forEach(function (button) { return button.add(buttons); });
    }
    return HelpManager;
}());
/**
 * Jump to entry.
 */
var JumpToEntry = /** @class */ (function () {
    function JumpToEntry(
    /**
     * Label shown on the entry. For players, it's player name.
     */
    label, 
    /**
     * HTML Element id, to scroll into view when clicked.
     */
    targetId, 
    /**
     * Any element that is useful to customize the link.
     * Basic ones are 'color' and 'colorback'.
     */
    data) {
        if (data === void 0) { data = {}; }
        this.label = label;
        this.targetId = targetId;
        this.data = data;
    }
    return JumpToEntry;
}());
var JumpToManager = /** @class */ (function () {
    function JumpToManager(game, settings) {
        var _a, _b, _c;
        this.game = game;
        this.settings = settings;
        var entries = __spreadArray(__spreadArray([], ((_a = settings === null || settings === void 0 ? void 0 : settings.topEntries) !== null && _a !== void 0 ? _a : []), true), ((_b = settings === null || settings === void 0 ? void 0 : settings.playersEntries) !== null && _b !== void 0 ? _b : this.createEntries(Object.values(game.gamedatas.players))), true);
        this.createPlayerJumps(entries);
        var folded = (_c = settings === null || settings === void 0 ? void 0 : settings.defaultFolded) !== null && _c !== void 0 ? _c : false;
        if (settings === null || settings === void 0 ? void 0 : settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        document.getElementById('bga-jump-to_controls').classList.toggle('folded', folded);
    }
    JumpToManager.prototype.createPlayerJumps = function (entries) {
        var _this = this;
        var _a, _b, _c, _d;
        document.getElementById("game_play_area_wrap").insertAdjacentHTML('afterend', "\n        <div id=\"bga-jump-to_controls\">        \n            <div id=\"bga-jump-to_toggle\" class=\"bga-jump-to_link ".concat((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', " toggle\" style=\"--color: ").concat((_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.toggleColor) !== null && _d !== void 0 ? _d : 'black', "\">\n                \u21D4\n            </div>\n        </div>"));
        document.getElementById("bga-jump-to_toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        entries.forEach(function (entry) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var html = "<div id=\"bga-jump-to_".concat(entry.targetId, "\" class=\"bga-jump-to_link ").concat((_b = (_a = _this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', "\">");
            if ((_d = (_c = _this.settings) === null || _c === void 0 ? void 0 : _c.showEye) !== null && _d !== void 0 ? _d : true) {
                html += "<div class=\"eye\"></div>";
            }
            if (((_f = (_e = _this.settings) === null || _e === void 0 ? void 0 : _e.showAvatar) !== null && _f !== void 0 ? _f : true) && ((_g = entry.data) === null || _g === void 0 ? void 0 : _g.id)) {
                var cssUrl = (_h = entry.data) === null || _h === void 0 ? void 0 : _h.avatarUrl;
                if (!cssUrl) {
                    var img = document.getElementById("avatar_".concat(entry.data.id));
                    var url = img === null || img === void 0 ? void 0 : img.src;
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    if (url) {
                        cssUrl = "url('".concat(url, "')");
                    }
                }
                if (cssUrl) {
                    html += "<div class=\"bga-jump-to_avatar\" style=\"--avatar-url: ".concat(cssUrl, ";\"></div>");
                }
            }
            html += "\n                <span class=\"bga-jump-to_label\">".concat(entry.label, "</span>\n            </div>");
            //
            document.getElementById("bga-jump-to_controls").insertAdjacentHTML('beforeend', html);
            var entryDiv = document.getElementById("bga-jump-to_".concat(entry.targetId));
            Object.getOwnPropertyNames((_j = entry.data) !== null && _j !== void 0 ? _j : []).forEach(function (key) {
                entryDiv.dataset[key] = entry.data[key];
                entryDiv.style.setProperty("--".concat(key), entry.data[key]);
            });
            entryDiv.addEventListener('click', function () { return _this.jumpTo(entry.targetId); });
        });
        var jumpDiv = document.getElementById("bga-jump-to_controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    JumpToManager.prototype.jumpToggle = function () {
        var _a;
        var jumpControls = document.getElementById('bga-jump-to_controls');
        jumpControls.classList.toggle('folded');
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.localStorageFoldedKey) {
            localStorage.setItem(this.settings.localStorageFoldedKey, jumpControls.classList.contains('folded').toString());
        }
    };
    JumpToManager.prototype.jumpTo = function (targetId) {
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    JumpToManager.prototype.getOrderedPlayers = function (unorderedPlayers) {
        var _this = this;
        var players = unorderedPlayers.sort(function (a, b) { return Number(a.playerNo) - Number(b.playerNo); });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.game.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    JumpToManager.prototype.createEntries = function (players) {
        var orderedPlayers = this.getOrderedPlayers(players);
        return orderedPlayers.map(function (player) { return new JumpToEntry(player.name, "player-table-".concat(player.id), {
            'color': '#' + player.color,
            'colorback': player.color_back ? '#' + player.color_back : null,
            'id': player.id,
        }); });
    };
    return JumpToManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg) scale(").concat((_d = settings.scale) !== null && _d !== void 0 ? _d : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_d = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _d !== void 0 ? _d : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_e = (_d = this.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : 500, scale: (_g = (_f = this.zoomManager) === null || _f === void 0 ? void 0 : _f.zoom) !== null && _g !== void 0 ? _g : undefined });
                        _m = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _m.result = _o.sent();
                        (_j = (_h = animation.settings).animationEnd) === null || _j === void 0 ? void 0 : _j.call(_h, animation);
                        (_k = settings.element) === null || _k === void 0 ? void 0 : _k.classList.remove((_l = settings.animationClass) !== null && _l !== void 0 ? _l : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_c = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _c !== void 0 ? _c : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            this.manager.removeCard(card, settings);
        }
        this.cardRemoved(card, settings);
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        _this.autoRemovePreviousCards = (_d = settings.autoRemovePreviousCards) !== null && _d !== void 0 ? _d : true;
        var shadowDirection = (_e = settings.shadowDirection) !== null && _e !== void 0 ? _e : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard, undefined);
        }
        else if (settings.cardNumber > 0) {
            console.warn("Deck is defined with ".concat(settings.cardNumber, " cards but no top card !"));
        }
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error("You need to set cardNumber if you want to show the counter");
            }
            else {
                _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
                if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                    _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        _this.setCardNumber((_k = settings.cardNumber) !== null && _k !== void 0 ? _k : 52);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = null; }
        if (topCard) {
            this.addCard(topCard);
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function (animatedCardsMax, fakeCardSetter) {
        if (animatedCardsMax === void 0) { animatedCardsMax = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var animatedCards, elements, i, newCard, newElement;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 2];
                        elements = [this.getCardElement(this.getTopCard())];
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = {};
                            if (fakeCardSetter) {
                                fakeCardSetter(newCard, i);
                            }
                            else {
                                newCard.id = -100000 + i;
                            }
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    return Deck;
}(CardStock));
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     *
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    SlotStock.prototype.addSlotsIds = function (newSlotsIds) {
        var _a;
        var _this = this;
        if (newSlotsIds.length == 0) {
            // no change
            return;
        }
        (_a = this.slotsIds).push.apply(_a, newSlotsIds);
        newSlotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) { // after splice/push
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotStock;
}(LineStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function (result) {
                _this.removeCard(card);
                return result;
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _this = this;
        var _a;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        element.style.setProperty('--shift', (_a = settings.shift) !== null && _a !== void 0 ? _a : '3px');
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
    };
    return AllVisibleDeck;
}(CardStock));
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return true;
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _b !== void 0 ? _b : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _e !== void 0 ? _e : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _f !== void 0 ? _f : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_h = (_g = this.settings).setupBackDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _j !== void 0 ? _j : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    return CardManager;
}());
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[Heat\]/ig, '<div class="heat icon"></div>')
        .replace(/\[Cooldown\]/ig, '<div class="cooldown icon"></div>')
        .replace(/\[Speed\]/ig, '<div class="speed icon"></div>')
        .replace(/\[Boost\]/ig, '<div class="boost icon"></div>');
}
//console.log(Object.values(CARDS_DATA).map(card => card.startingSpace));
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "personal-card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('personal-card');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            isCardVisible: function (card) { return Boolean(card.type); },
            cardWidth: 225,
            cardHeight: 362,
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    CardsManager.prototype.setupFrontDiv = function (card, div, ignoreTooltip) {
        if (ignoreTooltip === void 0) { ignoreTooltip = false; }
        var type = card.type;
        div.dataset.type = '' + type; // for debug purpose only
        div.classList.toggle('upgrade-card', type < 100);
        if (type >= 100) {
            switch (type) {
                case 110:
                    div.classList.add('stress');
                    break;
                case 111:
                    div.classList.add('heat');
                    break;
                default:
                    div.dataset.col = "".concat(type % 100);
                    break;
            }
        }
        else {
            var imagePosition = type - 1;
            var image_items_per_row = 10;
            var row = Math.floor(imagePosition / image_items_per_row);
            var xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
            var yBackgroundPercent = row * 100;
            div.style.backgroundPosition = "-".concat(xBackgroundPercent, "% -").concat(yBackgroundPercent, "%");
            div.innerHTML = "<div class=\"text\">".concat(_(card.text), "</div>");
        }
        if (!ignoreTooltip) {
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    };
    CardsManager.prototype.getGarageModuleTextTooltip = function (card) {
        switch (card.type) {
            // 4 wheel drive
            case 1:
            case 2:
            case 3:
            case 47:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("This early system was designed to transfer all the force from the engine into the tarmac through all four wheels but it resulted in poor handling. These cards have the potential of high Speed or Cooldown but also reduce control because they flip cards like Stress."));
            // Body
            case 4:
            case 5:
            case 6:
            case 18:
            case 19:
            case 20:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("A safer car with better balance that does not understeer. These cards allow you to discard Stress cards."));
            // Brakes
            case 7:
            case 8:
            case 9:
            case 10:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("Brakes are all about how late you can make a decision to overtake or step on the brake, and still stay on the track. These cards have variable speed where you make a decision as you reveal the cards."));
            // Cooling systems
            case 11:
            case 12:
            case 13:
            case 21:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("Provides a more stable and clean drive ; a better fuel economy and less stress to the car. These are cooldown cards."));
            // R.P.M.
            case 14:
            case 15:
            case 16:
            case 17:
            case 29:
            case 30:
            case 31:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("A powerful engine allows your car to respond faster. When played at key moments, those cards make it easier for you to accelerate past opponents. They are cards that help you slipstream and overtake all over the track, but are most effective in and around corners."));
            // Fuel
            case 22:
            case 23:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("Racing fuel is highly regulated. These are the super fuel “illegal“ cards."));
            // Gas pedal
            case 24:
            case 25:
            case 26:
            case 27:
            case 28:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("The car reacts more quickly to pressure on the accelerator. These cards increase your overall speed."));
            // Suspension
            case 32:
            case 33:
            case 34:
            case 35:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("Giving you a smoother drive, these cards can be played round after round."));
            // tires
            case 36:
            case 37:
            case 38:
            case 39:
            case 40:
            case 41:
                return "<strong>".concat(_(card.text), "</strong><br>\n            ").concat(_("It is about grip through width and durability. These cards allow you to go faster on corners or sacrifice the grip for a lot of cooldown."));
            // turbocharger
            case 42:
            case 43:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("A bigger engine giving you more horsepower and a higher top speed but also increasing weight and wear. These are the highest valued cards and require you to pay Heat."));
            // wings
            case 44:
            case 45:
            case 46:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_("Creates downforce in corners but it lowers the top speed. These cards help you drive faster in corners but they are also unreliable, thus requiring Heat."));
            case 101:
            case 102:
            case 103:
            case 104:
                return "<strong>".concat(_('Speed card'), "</strong><br>\n                ").concat(_('Speed:'), " <strong>").concat(Number(card.type) - 100, "</strong>\n                ");
            case 100:
            case 105:
                return "<strong>".concat(_('Starting upgrade'), "</strong><br>\n                ").concat(_('Speed:'), " ").concat(Number(card.type) - 100, "\n                ");
        }
    };
    CardsManager.prototype.getTooltip = function (card) {
        var _this = this;
        switch (card.effect) {
            case 'heat': return "<strong>".concat(_('Heat card'), "</strong>");
            case 'stress': return "<strong>".concat(_('Stress card'), "</strong>");
            case 'basic_upgrade':
            case 'advanced_upgrade':
                var tooltip = this.getGarageModuleTextTooltip(card);
                var icons = Object.entries(card.symbols).map(function (_a) {
                    var symbol = _a[0], number = _a[1];
                    return "<div>".concat(_this.game.getGarageModuleIconTooltip(symbol, number), "</div>");
                }).join('<br>');
                if (icons != '') {
                    tooltip += "<br><br>".concat(icons);
                }
                return tooltip;
            default:
                switch (card.type) {
                    case 101:
                    case 102:
                    case 103:
                    case 104:
                        return "<strong>".concat(_('Speed card'), "</strong><br>\n                        ").concat(_('Speed:'), " <strong>").concat(Number(card.type) - 100, "</strong>\n                        ");
                    case 100:
                    case 105:
                        return "<strong>".concat(_('Starting upgrade'), "</strong><br>\n                        ").concat(_('Speed:'), " ").concat(Number(card.type) - 100, "\n                        ");
                }
        }
    };
    CardsManager.prototype.getHtml = function (card) {
        var type = Number(card.type);
        var className = '';
        var style = '';
        var col = null;
        if (type >= 100) {
            switch (type) {
                case 110:
                    className = 'stress';
                    break;
                case 111:
                    className = 'heat';
                    break;
                default:
                    col = "".concat(type % 100);
                    break;
            }
        }
        else {
            className = 'upgrade-card';
            var imagePosition = type - 1;
            var image_items_per_row = 10;
            var row = Math.floor(imagePosition / image_items_per_row);
            var xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
            var yBackgroundPercent = row * 100;
            style = "background-position: -".concat(xBackgroundPercent, "% -").concat(yBackgroundPercent, "%;");
        }
        var html = "<div class=\"card personal-card\" data-side=\"front\">\n            <div class=\"card-sides\">\n                <div class=\"card-side front ".concat(className, "\" ").concat(col !== null ? "data-col=\"".concat(col, "\"") : '', " style=\"").concat(style, "\">").concat(type < 100 ? "<div class=\"text\">".concat(_(card.text), "</div>") : '', "\n                </div>\n            </div>\n        </div>");
        return html;
    };
    return CardsManager;
}(CardManager));
var LegendCardsManager = /** @class */ (function (_super) {
    __extends(LegendCardsManager, _super);
    function LegendCardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "legend-card-".concat(JSON.stringify(card).replace(/"/g, '')); },
            setupDiv: function (card, div) {
                div.classList.add('legend-card');
            },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            isCardVisible: function (card) { return Object.values(card).length > 0; },
            cardWidth: 362,
            cardHeight: 225,
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    LegendCardsManager.prototype.setupFrontDiv = function (card, div) {
        if (!Object.values(card).length) {
            return;
        }
        var html = "<div class=\"table\">";
        [0, 1, 2, 3].forEach(function (cornerBonus, index) {
            html += "<div>".concat(Object.entries(card[index]).map(function (_a) {
                var color = _a[0], number = _a[1];
                return "<div class=\"legend-icon\" style=\"--color: ".concat(color, "\">").concat(number, "</div>");
            }).join(''), "</div>");
        });
        html += "</div>";
        div.innerHTML = html;
    };
    return LegendCardsManager;
}(CardManager));
var MAP_WIDTH = 1650;
var MAP_HEIGHT = 1100;
var LEADERBOARD_POSITIONS = {
    '-1': { x: 0, y: 0, a: 0 },
    '-2': { x: -77, y: 52, a: 0 },
    '-3': { x: 77, y: 52, a: 0 },
    '-4': { x: 0, y: 128, a: 0 },
    '-5': { x: 0, y: 180, a: 0 },
    '-6': { x: 0, y: 232, a: 0 },
    '-7': { x: 0, y: 284, a: 0 },
    '-8': { x: 0, y: 336, a: 0 },
};
var WEATHER_TOKENS_ON_SECTOR_TENT = [0, 4, 5];
// Wrapper for the animation that use requestAnimationFrame
var CarAnimation = /** @class */ (function () {
    function CarAnimation(car, pathCells) {
        this.car = car;
        this.pathCells = pathCells;
        // Control strength is how far the control point are from the center of the cell
        //  => it should probably be something related/proportional to scale of current board
        var controlStrength = 20;
        var path = "";
        pathCells.forEach(function (data, i) {
            // We compute the control point based on angle
            //  => we have a special case for i = 0 since it's the only one with a "positive control point" (ie that goes in the same direction as arrow)
            var cp = {
                x: data.x + Math.cos((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
                y: data.y + Math.sin((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
            };
            // See "Shortand curve to" on https://developer.mozilla.org/fr/docs/Web/SVG/Tutorial/Paths
            if (i == 0) {
                path += "M ".concat(data.x, " ").concat(data.y, " C ").concat(cp.x, " ").concat(cp.y, ", ");
            }
            else if (i == 1) {
                path += "".concat(cp.x, " ").concat(cp.y, ", ").concat(data.x, " ").concat(data.y, " ");
            }
            else {
                path += "S ".concat(cp.x, " ").concat(cp.y, ", ").concat(data.x, " ").concat(data.y);
            }
        });
        this.newpath = document.createElementNS('http://www.w3.org/2000/svg', "path");
        this.newpath.setAttributeNS(null, "d", path);
    }
    CarAnimation.prototype.start = function () {
        var _this = this;
        this.duration = this.pathCells.length * 250;
        this.resolve = null;
        this.move(0);
        setTimeout(function () {
            _this.tZero = Date.now();
            requestAnimationFrame(function () { return _this.run(); });
        }, 0);
        return new Promise(function (resolve, reject) {
            _this.resolve = resolve;
        });
    };
    // Just a wrapper to get the absolute position based on a floating number u in [0, 1] (0 mean start of animation, 1 is the end)
    CarAnimation.prototype.getPos = function (u) {
        return this.newpath.getPointAtLength(u * this.newpath.getTotalLength());
    };
    CarAnimation.prototype.move = function (u) {
        var pos = this.getPos(u);
        var posPrev = this.getPos(u - 0.01);
        var posNext = this.getPos(u + 0.01);
        var angle = -Math.atan2(posNext.x - posPrev.x, posNext.y - posPrev.y);
        this.car.style.setProperty('--x', "".concat(pos.x, "px"));
        this.car.style.setProperty('--y', "".concat(pos.y, "px"));
        this.car.style.setProperty('--r', "".concat((angle * 180) / Math.PI + 90, "deg"));
    };
    CarAnimation.prototype.run = function () {
        var _this = this;
        var u = Math.min((Date.now() - this.tZero) / this.duration, 1);
        this.move(u);
        if (u < 1) {
            // Keep requesting frames, till animation is ready
            requestAnimationFrame(function () { return _this.run(); });
        }
        else {
            if (this.resolve != null) {
                this.resolve();
            }
        }
    };
    return CarAnimation;
}());
var Circuit = /** @class */ (function () {
    function Circuit(game, gamedatas) {
        var _this = this;
        var _a;
        this.game = game;
        this.gamedatas = gamedatas;
        this.scale = 1;
        this.tableCenterDiv = document.getElementById('table-center');
        this.circuitDiv = document.getElementById('circuit');
        if ((_a = gamedatas.circuitDatas) === null || _a === void 0 ? void 0 : _a.jpgUrl) {
            this.loadCircuit(gamedatas.circuitDatas);
            Object.values(this.gamedatas.constructors).forEach(function (constructor) { return _this.createCar(constructor); });
        }
    }
    Circuit.prototype.loadCircuit = function (circuitDatas) {
        this.circuitDatas = circuitDatas;
        this.circuitDiv.style.backgroundImage = "url('".concat(this.circuitDatas.jpgUrl.startsWith('http') ? this.circuitDatas.jpgUrl : "".concat(g_gamethemeurl, "img/").concat(this.circuitDatas.jpgUrl), "')");
        this.createCorners(this.circuitDatas.corners);
        this.createWeather(this.gamedatas.weather, this.circuitDatas);
        //this.createPressToken(this.circuitDatas);
    };
    /**
     * Set map size, depending on available screen size.
     * Player table will be placed left or bottom, depending on window ratio.
     */
    Circuit.prototype.setAutoZoom = function () {
        var _this = this;
        if (!this.tableCenterDiv.clientWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var horizontalScale = document.getElementById('game_play_area').clientWidth / MAP_WIDTH;
        var verticalScale = (window.innerHeight - 80) / MAP_HEIGHT;
        this.scale = Math.min(1, horizontalScale, verticalScale);
        this.tableCenterDiv.style.transform = this.scale === 1 ? '' : "scale(".concat(this.scale, ")");
        var maxHeight = this.scale === 1 ? '' : "".concat(MAP_HEIGHT * this.scale, "px");
        //this.mapDiv.style.maxHeight = maxHeight;
        this.tableCenterDiv.style.maxHeight = maxHeight;
        //this.mapDiv.style.marginBottom = `-${(1 - this.scale) * gameHeight}px`;
    };
    Circuit.prototype.createCorners = function (corners) {
        var _this = this;
        Object.entries(corners).forEach(function (_a) {
            var stringId = _a[0], corner = _a[1];
            return _this.createCorner(__assign(__assign({}, corner), { id: Number(stringId) }));
        });
    };
    Circuit.prototype.createCorner = function (corner) {
        var cornerDiv = document.createElement('div');
        cornerDiv.id = "corner-".concat(corner.id),
            cornerDiv.classList.add('corner');
        cornerDiv.style.setProperty('--x', "".concat(corner.x, "px"));
        cornerDiv.style.setProperty('--y', "".concat(corner.y, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', cornerDiv);
    };
    Circuit.prototype.createPressToken = function (circuitDatas) {
        var corner = circuitDatas.corners[12];
        var pressTokenDiv = document.createElement('div');
        pressTokenDiv.id = "press-token",
            pressTokenDiv.style.setProperty('--x', "".concat(corner.tentX, "px"));
        pressTokenDiv.style.setProperty('--y', "".concat(corner.tentY, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', pressTokenDiv);
    };
    Circuit.prototype.createWeather = function (weather, circuitDatas) {
        if (weather === null || weather === void 0 ? void 0 : weather.tokens) {
            this.createWeatherCard(weather.card, circuitDatas.weatherCardPos);
            this.createWeatherTokens(weather.tokens, circuitDatas.corners, weather.card);
        }
    };
    Circuit.prototype.createWeatherCard = function (type, wheatherCardPos) {
        var weatherCardDiv = document.createElement('div');
        weatherCardDiv.id = 'weather-card';
        weatherCardDiv.classList.add('weather-card');
        weatherCardDiv.dataset.cardType = "".concat(type);
        weatherCardDiv.style.setProperty('--x', "".concat(wheatherCardPos.x, "px"));
        weatherCardDiv.style.setProperty('--y', "".concat(wheatherCardPos.y, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', weatherCardDiv);
        this.game.setTooltip(weatherCardDiv.id, "".concat(this.getWeatherCardSetupTooltip(type), "<br><br>").concat(this.getWeatherCardEffectTooltip(type)));
    };
    Circuit.prototype.getWeatherCardSetupTooltip = function (type) {
        switch (type) {
            case 0:
                return _("Remove 1 Stress card from your deck.");
            case 1:
                return _("Place 1 extra Heat card in your Engine.");
            case 2:
                return _("Shuffle 1 extra Stress card into your deck.");
            case 3:
                return _("Remove 1 Heat card from your Engine.");
            case 4:
                return _("Shuffle 3 of your Heat cards into your draw deck.");
            case 5:
                return _("Place 3 of your Heat cards into your discard pile.");
        }
    };
    Circuit.prototype.getWeatherCardEffectTooltip = function (type) {
        switch (type) {
            case 0:
                return "\n                    <strong>".concat(_("No cooling"), "</strong>\n                    <br>\n                    ").concat(_("No Cooldown allowed in this sector during the React step."), "\n                ");
            case 1:
                return "\n                    <strong>".concat(_("No slipstream"), "</strong>\n                    <br>\n                    ").concat(_("You cannot start slipstreaming from this sector (you may slipstream into it)."), "\n                    ");
            case 2:
            case 5:
                return "<strong>".concat(_("Slipstream boost"), "</strong>\n                <br>\n                ").concat(_("If you choose to Slipstream, you may add 2 extra Spaces to the usual 2 Spaces. Your car must be located in this sector before you slipstream."), "\n                ");
            case 3:
            case 4:
                return "<strong>".concat(_("Cooling Bonus"), "</strong>\n                <br>\n                ").concat(_("+1 Cooldown in this sector during the React step."), "\n                ");
        }
    };
    Circuit.prototype.createWeatherTokens = function (tokens, corners, cardType) {
        var _this = this;
        Object.entries(tokens).forEach(function (_a) {
            var cornerId = _a[0], type = _a[1];
            var field = WEATHER_TOKENS_ON_SECTOR_TENT.includes(type) ? 'sectorTent' : 'tent';
            var corner = corners[cornerId];
            _this.createWeatherToken(type, corner["".concat(field, "X")], corner["".concat(field, "Y")], cardType);
        });
    };
    Circuit.prototype.createWeatherToken = function (type, x, y, cardType) {
        var weatherTokenDiv = document.createElement('div');
        weatherTokenDiv.id = "weather-token-".concat(type, "-").concat(document.querySelectorAll(".weather-token[id^=\"weather-token-\"]").length);
        weatherTokenDiv.classList.add('weather-token');
        weatherTokenDiv.dataset.tokenType = "".concat(type);
        weatherTokenDiv.style.setProperty('--x', "".concat(x, "px"));
        weatherTokenDiv.style.setProperty('--y', "".concat(y, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', weatherTokenDiv);
        this.game.setTooltip(weatherTokenDiv.id, this.getWeatherTokenTooltip(type, cardType));
    };
    Circuit.prototype.getWeatherTokenTooltip = function (type, cardType) {
        switch (type) {
            case 0:
                return "\n                    <strong>".concat(_("Weather"), "</strong>\n                    <br>\n                    ").concat(_("Weather effect applies to this sector:"), "\n                    <br>\n                    ").concat(this.getWeatherCardEffectTooltip(cardType), "\n                ");
            case 1:
                return "\n                    <strong>".concat(_("Overheat"), "</strong>\n                    <br>\n                    ").concat(_("If your Speed is higher than the Speed Limit when you cross this corner, the cost in Heat that you need to pay is increased by one."), "\n                ");
            case 2:
                return this.game.getGarageModuleIconTooltip('adjust', -1);
            case 3:
                return this.game.getGarageModuleIconTooltip('adjust', 1);
            case 4:
                return "\n                    <strong>".concat(_("Heat control"), "</strong>\n                    <br>\n                    ").concat(_("Do not pay Heat to boost in this sector (still max one boost per turn). Your car must be in the sector when you boost."), "\n                ");
            case 5:
                return "\n                    <strong>".concat(_("Slipstream boost"), "</strong>\n                    <br>\n                    ").concat(_("If you choose to Slipstream, you may add one extra Space to the usual 2 Spaces. Your car must be located in this sector before you slipstream."), "\n                ");
        }
    };
    Circuit.prototype.getCellPosition = function (carCell) {
        var cell = structuredClone(carCell < 0 ? this.circuitDatas.podium : this.circuitDatas.cells[carCell]);
        if (carCell < 0) {
            cell.x += LEADERBOARD_POSITIONS[carCell].x;
            cell.y += LEADERBOARD_POSITIONS[carCell].y;
        }
        return cell;
    };
    Circuit.prototype.createCar = function (constructor) {
        var car = document.getElementById("car-".concat(constructor.id));
        if (!car) {
            car = document.createElement('div');
            car.id = "car-".concat(constructor.id),
                car.classList.add('car');
            if (constructor.pId === this.game.getPlayerId()) {
                car.classList.add('current');
            }
            car.style.setProperty('--constructor-id', "".concat(constructor.id));
            this.circuitDiv.insertAdjacentElement('beforeend', car);
        }
        var cell = this.getCellPosition(constructor.carCell);
        car.style.setProperty('--x', "".concat(cell.x, "px"));
        car.style.setProperty('--y', "".concat(cell.y, "px"));
        car.style.setProperty('--r', "".concat(cell.a, "deg"));
    };
    Circuit.prototype.moveCar = function (constructorId, carCell, path) {
        var _this = this;
        var car = document.getElementById("car-".concat(constructorId));
        if (path) {
            return this.moveCarWithAnimation(car, path).then(function () { return _this.moveCar(constructorId, carCell); });
        }
        else {
            var cell = this.getCellPosition(carCell);
            car.style.setProperty('--x', "".concat(cell.x, "px"));
            car.style.setProperty('--y', "".concat(cell.y, "px"));
            car.style.setProperty('--r', "".concat(cell.a, "deg"));
            return Promise.resolve(true);
        }
    };
    Circuit.prototype.spinOutWithAnimation = function (constructorId, carCell, cellsDiff) {
        var _this = this;
        return new Promise(function (resolve) {
            var car = document.getElementById("car-".concat(constructorId));
            var time = cellsDiff * 250;
            car.style.setProperty('--transition-time', "".concat(time, "ms"));
            car.classList.add('with-transition');
            car.clientWidth;
            var cell = _this.getCellPosition(carCell);
            car.style.setProperty('--x', "".concat(cell.x, "px"));
            car.style.setProperty('--y', "".concat(cell.y, "px"));
            car.style.setProperty('--r', "".concat(cell.a + 1080, "deg"));
            setTimeout(function () {
                car.classList.remove('with-transition');
                car.clientWidth;
                car.style.setProperty('--r', "".concat(cell.a, "deg"));
                resolve(true);
            }, time + 200);
        });
    };
    Circuit.prototype.finishRace = function (constructorId, pos) {
        var _this = this;
        return new Promise(function (resolve) {
            var car = document.getElementById("car-".concat(constructorId));
            var time = 1500;
            car.style.setProperty('--transition-time', "".concat(time, "ms"));
            car.classList.add('with-transition');
            car.clientWidth;
            var cell = _this.getCellPosition(-pos);
            car.style.setProperty('--x', "".concat(cell.x, "px"));
            car.style.setProperty('--y', "".concat(cell.y, "px"));
            car.style.setProperty('--r', "".concat(cell.a, "deg"));
            setTimeout(function () {
                car.classList.remove('with-transition');
                resolve(true);
            }, time + 200);
        });
    };
    Circuit.prototype.addMapIndicator = function (cellId, clickCallback, stress) {
        if (stress === void 0) { stress = false; }
        var mapIndicator = document.createElement('div');
        mapIndicator.id = "map-indicator-".concat(cellId),
            mapIndicator.classList.add('map-indicator');
        var cell = this.circuitDatas.cells[cellId];
        mapIndicator.style.setProperty('--x', "".concat(cell.x, "px"));
        mapIndicator.style.setProperty('--y', "".concat(cell.y, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', mapIndicator);
        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
            mapIndicator.classList.add('clickable');
        }
        if (stress) {
            mapIndicator.classList.add('stress');
            mapIndicator.innerHTML = "?";
        }
    };
    Circuit.prototype.removeMapIndicators = function () {
        this.circuitDiv.querySelectorAll('.map-indicator').forEach(function (elem) { return elem.remove(); });
    };
    Circuit.prototype.getCellInfos = function (cellId) {
        // This is just a wrapper to either return the datas about the cell (center x, center y, angle)
        //      or simulate an "averaged cell" if two cells are given (to go through the middle of them)
        if (Array.isArray(cellId)) {
            var cellId1 = cellId[0];
            var cellId2 = cellId[1];
            return {
                x: (this.circuitDatas.cells[cellId1].x + this.circuitDatas.cells[cellId2].x) / 2,
                y: (this.circuitDatas.cells[cellId1].y + this.circuitDatas.cells[cellId2].y) / 2,
                a: (this.circuitDatas.cells[cellId1].a + this.circuitDatas.cells[cellId2].a) / 2,
            };
        }
        else {
            return this.circuitDatas.cells[cellId];
        }
    };
    Circuit.prototype.getCellsInfos = function (pathCellIds) {
        var _this = this;
        return pathCellIds.map(function (cellId) { return _this.getCellInfos(cellId); });
    };
    Circuit.prototype.moveCarWithAnimation = function (car, pathCellIds) {
        var pathCells = this.getCellsInfos(pathCellIds);
        var animation = new CarAnimation(car, pathCells);
        return animation.start();
    };
    Circuit.prototype.showCorner = function (id, color) {
        var _this = this;
        var _a;
        (_a = document.getElementById("corner-".concat(id))) === null || _a === void 0 ? void 0 : _a.style.setProperty('--color', color !== null && color !== void 0 ? color : 'transparent');
        if (color) {
            setTimeout(function () { return _this.showCorner(id); }, this.game.animationManager.animationsActive() ? 2000 : 1);
        }
    };
    return Circuit;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PERSONAL_CARDS_SORTING = function (a, b) { return Number(a.type) - Number(b.type); };
var InPlayStock = /** @class */ (function (_super) {
    __extends(InPlayStock, _super);
    function InPlayStock(game, constructor) {
        var _this = _super.call(this, game.cardsManager, document.getElementById("player-table-".concat(constructor.pId, "-inplay")), {
            sort: PERSONAL_CARDS_SORTING,
        }) || this;
        _this.playerId = constructor.pId;
        _this.addCards(Object.values(constructor.inplay));
        _this.toggleInPlay(); // in case inplay is empty, addCard is not called
        return _this;
    }
    InPlayStock.prototype.toggleInPlay = function () {
        document.getElementById("player-table-".concat(this.playerId, "-inplay-wrapper")).dataset.visible = (!this.isEmpty()).toString();
    };
    InPlayStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.toggleInPlay();
        return promise;
    };
    InPlayStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.toggleInPlay();
    };
    return InPlayStock;
}(LineStock));
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, constructor) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;
        this.fakeDeckCard = { id: "".concat(this.playerId, "-top-deck") };
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\" style=\"--player-color: #").concat(player.color, "; --personal-card-background-y: ").concat(constructor.id * 100 / 6, "%;\">\n            <div id=\"player-table-").concat(this.playerId, "-name\" class=\"name-wrapper\">").concat(player.name, "</div>\n        ");
        if (this.currentPlayer) {
            html += "\n            <div class=\"block-with-text hand-wrapper\">\n                <div class=\"block-label\">".concat(_('Your hand'), "</div>\n                <div id=\"player-table-").concat(this.playerId, "-hand\" class=\"hand cards\"></div>\n            </div>");
        }
        html += "\n            <div id=\"player-table-".concat(this.playerId, "-board\" class=\"player-board\" data-color=\"").concat(player.color, "\">\n                <div id=\"player-table-").concat(this.playerId, "-deck\" class=\"deck\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-engine\" class=\"engine\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-discard\" class=\"discard\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-gear\" class=\"gear\" data-color=\"").concat(player.color, "\" data-gear=\"").concat(this.currentGear, "\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-inplay-wrapper\" class=\"inplay-wrapper\">\n                <div class=\"hand-wrapper\">\n                    <div class=\"block-label\">").concat(_('Cards in play'), "</div>\n                        <div id=\"player-table-").concat(this.playerId, "-inplay\" class=\"inplay\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        if (this.currentPlayer) {
            this.hand = new LineStock(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-hand")), {
                sort: PERSONAL_CARDS_SORTING,
            });
            this.hand.onSelectionChange = function (selection) { return _this.game.onHandCardSelectionChange(selection); };
            this.hand.addCards(constructor.hand);
        }
        this.deck = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-deck")), {
            cardNumber: constructor.deckCount,
            topCard: constructor.deckCount ? this.fakeDeckCard : null,
            counter: {
                extraClasses: 'round',
            }
        });
        var engineCards = Object.values(constructor.engine);
        this.engine = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-engine")), {
            cardNumber: engineCards.length,
            topCard: engineCards[0],
            counter: {
                extraClasses: 'round',
            }
        });
        var discardCards = Object.values(constructor.discard);
        this.discard = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-discard")), {
            cardNumber: discardCards.length,
            topCard: discardCards[0],
            counter: {
                extraClasses: 'round',
            }
        });
        this.inplay = new InPlayStock(this.game, constructor);
    }
    PlayerTable.prototype.setHandSelectable = function (selectionMode, selectableCardsIds, selectedCardsIds) {
        var _this = this;
        if (selectableCardsIds === void 0) { selectableCardsIds = null; }
        if (selectedCardsIds === void 0) { selectedCardsIds = null; }
        var cards = this.hand.getCards();
        this.hand.setSelectionMode(selectionMode, selectableCardsIds ? cards.filter(function (card) { return selectableCardsIds.includes(Number(card.id)); }) : undefined);
        selectedCardsIds === null || selectedCardsIds === void 0 ? void 0 : selectedCardsIds.forEach(function (id) { var _a; return (_a = _this.hand.getCardElement(cards.find(function (card) { return Number(card.id) == Number(id); }))) === null || _a === void 0 ? void 0 : _a.classList.add(_this.hand.getSelectedCardClass()); }); // TODO make all numbers?
    };
    PlayerTable.prototype.getCurrentGear = function () {
        return this.currentGear;
    };
    PlayerTable.prototype.setCurrentGear = function (gear) {
        this.currentGear = gear;
        document.getElementById("player-table-".concat(this.playerId, "-gear")).dataset.gear = "".concat(gear);
    };
    PlayerTable.prototype.refreshHand = function (hand) {
        this.hand.removeAll();
        return this.hand.addCards(hand);
    };
    PlayerTable.prototype.setInplay = function (cards) {
        this.inplay.removeAll();
        return this.inplay.addCards(cards);
    };
    PlayerTable.prototype.clearPlayedCards = function (cardIds) {
        return this.discard.addCards(this.inplay.getCards());
    };
    PlayerTable.prototype.cooldown = function (cards) {
        return this.engine.addCards(cards);
    };
    PlayerTable.prototype.payHeats = function (cards) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.engine.getCardNumber() > cards.length) {
                            this.engine.addCard({
                                id: "".concat(this.playerId, "-top-engine"),
                                type: 111,
                                location: 'engine',
                                effect: 'heat',
                                state: ''
                            }, undefined, {
                                autoUpdateCardNumber: false,
                                autoRemovePreviousCards: false,
                            });
                        }
                        this.engine.addCards(cards, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        });
                        return [4 /*yield*/, this.discard.addCards(cards, undefined, {
                                autoRemovePreviousCards: false,
                            }, 250)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.spinOut = function (stresses) {
        var promise = null;
        if (this.currentPlayer) {
            promise = this.hand.addCards(stresses.map(function (id) { return ({
                id: id,
                type: 110,
                effect: 'stress',
                location: 'hand',
                state: ''
            }); }));
        }
        this.setCurrentGear(1);
        return promise !== null && promise !== void 0 ? promise : Promise.resolve(true);
    };
    PlayerTable.prototype.drawCardsPublic = function (n) {
        return __awaiter(this, void 0, void 0, function () {
            var isReshuffled, count, before, after;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isReshuffled = this.deck.getCardNumber() < n;
                        if (!!isReshuffled) return [3 /*break*/, 1];
                        count = this.deck.getCardNumber() - n;
                        this.deck.setCardNumber(count, count > 0 ? this.fakeDeckCard : null);
                        return [2 /*return*/, Promise.resolve(true)];
                    case 1:
                        before = this.deck.getCardNumber();
                        after = this.discard.getCardNumber() - (n - before);
                        this.deck.setCardNumber(this.discard.getCardNumber(), this.fakeDeckCard);
                        this.discard.setCardNumber(0);
                        return [4 /*yield*/, this.deck.shuffle(10, function (card, index) { return card.id = -1000 - index; })];
                    case 2:
                        _a.sent();
                        this.deck.setCardNumber(after, this.fakeDeckCard);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.drawCardsPrivate = function (cards) {
        return this.addCardsFromDeck(cards, this.hand);
    };
    PlayerTable.prototype.scrapCards = function (cards) {
        return __awaiter(this, void 0, void 0, function () {
            var i, card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < cards.length)) return [3 /*break*/, 6];
                        card = cards[i];
                        if (!card.isReshuffled) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.moveDiscardToDeckAndShuffle()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.deck.addCard(card, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        });
                        return [4 /*yield*/, this.discard.addCard(card)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.resolveBoost = function (cards, card) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.scrapCards(cards)];
                    case 1:
                        _a.sent();
                        if (!card.isReshuffled) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.moveDiscardToDeckAndShuffle()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.deck.addCard(card, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        });
                        return [4 /*yield*/, this.inplay.addCard(card)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.salvageCards = function (cards, discardCards) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.discard.setCardNumber(discardCards.length + cards.length, discardCards[0]);
                        cards.forEach(function (salvagedCard) { return _this.discard.addCard(salvagedCard, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        }); });
                        return [4 /*yield*/, this.deck.addCards(cards, undefined, { visible: false, }, true)];
                    case 1:
                        _a.sent();
                        this.deck.setCardNumber(this.deck.getCardNumber(), this.fakeDeckCard);
                        return [4 /*yield*/, this.deck.shuffle(10, function (card, index) { return card.id = -1000 - index; })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.moveDiscardToDeckAndShuffle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cardNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.deck.setCardNumber(0);
                        cardNumber = this.discard.getCardNumber();
                        return [4 /*yield*/, this.deck.addCards(this.discard.getCards())];
                    case 1:
                        _a.sent();
                        this.discard.setCardNumber(0);
                        this.deck.setCardNumber(cardNumber, this.fakeDeckCard);
                        return [4 /*yield*/, this.deck.shuffle(10, function (card, index) { return card.id = -1000 - index; })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerTable.prototype.addCardsFromDeck = function (cards, to, addCardSettings, shift) {
        if (addCardSettings === void 0) { addCardSettings = undefined; }
        if (shift === void 0) { shift = 250; }
        return __awaiter(this, void 0, void 0, function () {
            var shuffleIndex, cardsBefore, cardsAfter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shuffleIndex = cards.findIndex(function (card) { return card.isReshuffled; });
                        if (!(shuffleIndex === -1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, to.addCards(cards, { fromStock: this.deck, }, addCardSettings, shift)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        cardsBefore = cards.slice(0, shuffleIndex);
                        cardsAfter = cards.slice(shuffleIndex);
                        return [4 /*yield*/, to.addCards(cardsBefore, { fromStock: this.deck, }, addCardSettings, shift)];
                    case 3:
                        _a.sent();
                        this.moveDiscardToDeckAndShuffle();
                        this.deck.addCards(cardsAfter, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        });
                        return [4 /*yield*/, to.addCards(cardsAfter, { fromStock: this.deck, }, addCardSettings, shift)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                }
            });
        });
    };
    return PlayerTable;
}());
var LegendTable = /** @class */ (function () {
    function LegendTable(game, legendCard) {
        this.game = game;
        var html = "\n        <div id=\"legend-table\">\n            <div id=\"legend-board\" class=\"player-board\">\n                <div id=\"legend-deck\" class=\"deck\"></div>\n                <div id=\"legend-discard\" class=\"discard\"></div>\n            </div>\n        </div>\n        ";
        dojo.place(html, document.getElementById('tables'));
        this.deck = new Deck(this.game.legendCardsManager, document.getElementById("legend-deck"), {
            topCard: [],
        });
        this.discard = new Deck(this.game.legendCardsManager, document.getElementById("legend-discard"), {
            topCard: legendCard,
        });
    }
    LegendTable.prototype.newLegendCard = function (card) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deck.addCard(card, undefined, { visible: false, autoRemovePreviousCards: false, })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.discard.addCard(card)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return LegendTable;
}());
var ANIMATION_MS = 500;
var MIN_NOTIFICATION_MS = 1200;
var ACTION_TIMER_DURATION = 5;
var LOCAL_STORAGE_ZOOM_KEY = 'Heat-zoom';
var LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'Heat-jump-to-folded';
var CONSTRUCTORS_COLORS = ['12151a', '376bbe', '26a54e', 'e52927', '979797', 'face0d']; // copy of gameinfos
function sleep(ms) {
    return new Promise(function (r) { return setTimeout(r, ms); });
}
var Heat = /** @class */ (function () {
    function Heat() {
        this.playersTables = [];
        this.handCounters = [];
        this.engineCounters = [];
        this.speedCounters = [];
        this.lapCounters = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        this._notif_uid_to_log_id = [];
        this._notif_uid_to_mobile_log_id = [];
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Heat.prototype.setup = function (gamedatas) {
        var _this = this;
        var _a;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        // TODO TEMP
        Object.values(gamedatas.players).forEach(function (player, index) {
            //const playerId = Number(player.id);
            //if (playerId == this.getPlayerId()) {
            //    player.hand = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId);
            //}
            //player.handCount = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId).length;
        });
        if (((_a = gamedatas.circuitDatas) === null || _a === void 0 ? void 0 : _a.jpgUrl) && !gamedatas.circuitDatas.jpgUrl.startsWith('http')) {
            g_img_preload.push(gamedatas.circuitDatas.jpgUrl);
        }
        g_img_preload.push.apply(g_img_preload, Object.values(gamedatas.players).map(function (player) { return "mats/player-board-".concat(player.color, ".jpg"); }));
        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.legendCardsManager = new LegendCardsManager(this);
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: [
                new JumpToEntry(_('Main board'), 'table-center', { 'color': '#224757' })
            ],
            entryClasses: 'round-point',
            defaultFolded: true,
        });
        this.circuit = new Circuit(this, gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        this.zoomManager = new ZoomManager({
            element: document.getElementById('tables'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            defaultZoom: 0.75,
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
        });
        new HelpManager(this, {
            buttons: [
                new BgaHelpPopinButton({
                    title: _("Card help").toUpperCase(),
                    html: this.getHelpHtml(),
                    buttonBackground: '#341819',
                }),
            ]
        });
        this.setupNotifications();
        this.setupPreferences();
        this.onScreenWidthChange = function () { return _this.circuit.setAutoZoom(); };
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Heat.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        log('Entering state: ' + stateName, args.args);
        if ((_a = args.args) === null || _a === void 0 ? void 0 : _a.descSuffix) {
            this.changePageTitle(args.args.descSuffix);
        }
        if ((_b = args.args) === null || _b === void 0 ? void 0 : _b.optionalAction) {
            var base = args.args.descSuffix ? args.args.descSuffix : '';
            this.changePageTitle(base + 'skippable');
        }
        if ( /* TODO? this._activeStates.includes(stateName) ||*/this.isCurrentPlayerActive()) {
            if (((_c = args.args) === null || _c === void 0 ? void 0 : _c.optionalAction) && !args.args.automaticAction) {
                this.addSecondaryActionButton('btnPassAction', _('Pass'), function () { return _this.takeAction('actPassOptionalAction'); }, 'restartAction');
            }
            // Undo last steps
            (_e = (_d = args.args) === null || _d === void 0 ? void 0 : _d.previousSteps) === null || _e === void 0 ? void 0 : _e.forEach(function (stepId) {
                var logEntry = $('logs').querySelector(".log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
                if (logEntry) {
                    _this.onClick(logEntry, function () { return _this.undoToStep(stepId); });
                }
                logEntry = document.querySelector(".chatwindowlogs_zone .log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
                if (logEntry) {
                    _this.onClick(logEntry, function () { return _this.undoToStep(stepId); });
                }
            });
            // Restart turn button
            if (((_f = args.args) === null || _f === void 0 ? void 0 : _f.previousEngineChoices) >= 1 && !args.args.automaticAction) {
                if ((_g = args.args) === null || _g === void 0 ? void 0 : _g.previousSteps) {
                    var lastStep_1 = Math.max.apply(Math, args.args.previousSteps);
                    if (lastStep_1 > 0)
                        this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), function () { return _this.undoToStep(lastStep_1); }, 'restartAction');
                }
                // Restart whole turn
                this.addDangerActionButton('btnRestartTurn', _('Restart turn'), function () {
                    _this.stopActionTimer();
                    _this.takeAction('actRestart');
                }, 'restartAction');
            }
        }
        /* TODO? if (this.isCurrentPlayerActive() && args.args) {
            // Anytime buttons
            args.args.anytimeActions?.forEach((action, i) => {
                let msg = action.desc;
                msg = msg.log ? this.fsr(msg.log, msg.args) : _(msg);
                msg = this.formatString(msg);

                this.addPrimaryActionButton(
                'btnAnytimeAction' + i,
                msg,
                () => this.takeAction('actAnytimeAction', { id: i }, false),
                'anytimeActions'
                );
            });
        }*/
        switch (stateName) {
            case 'uploadCircuit':
                this.onEnteringStateUploadCircuit(args.args);
                break;
            case 'chooseUpgrade':
                this.onEnteringChooseUpgrade(args.args);
                break;
            case 'swapUpgrade':
                this.onEnteringSwapUpgrade(args.args);
                break;
        }
    };
    /*
     * Add a blue/grey button if it doesn't already exists
     */
    Heat.prototype.addPrimaryActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.addActionButton(id, text, callback, zone, false, 'blue');
    };
    Heat.prototype.addSecondaryActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.addActionButton(id, text, callback, zone, false, 'gray');
    };
    Heat.prototype.addDangerActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.addActionButton(id, text, callback, zone, false, 'red');
    };
    Heat.prototype.changePageTitle = function (suffix, save) {
        if (suffix === void 0) { suffix = null; }
        if (save === void 0) { save = false; }
        if (suffix == null) {
            suffix = 'generic';
        }
        if (!this.gamedatas.gamestate['descriptionmyturn' + suffix]) {
            return;
        }
        if (save) {
            this.gamedatas.gamestate.descriptionmyturngeneric = this.gamedatas.gamestate.descriptionmyturn;
            this.gamedatas.gamestate.descriptiongeneric = this.gamedatas.gamestate.description;
        }
        this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate['descriptionmyturn' + suffix];
        if (this.gamedatas.gamestate['description' + suffix])
            this.gamedatas.gamestate.description = this.gamedatas.gamestate['description' + suffix];
        this.updatePageTitle();
    };
    Heat.prototype.onEnteringStateUploadCircuit = function (args) {
        var _this = this;
        // this.clearInterface();
        document.getElementById('table-center').insertAdjacentHTML('beforebegin', "\n        <div id=\"circuit-dropzone-container\">\n            <div id=\"circuit-dropzone\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z\"/></svg>\n\n            <input type=\"file\" id=\"circuit-input\" />\n            <label for=\"circuit-input\">".concat(_('Choose circuit'), "</label>\n            <h5>").concat(_('or drag & drop your .heat file here'), "</h5>\n            </div>\n        </div>\n        "));
        $('circuit-input').addEventListener('change', function (e) { return _this.uploadCircuit(e.target.files[0]); });
        var dropzone = $('circuit-dropzone-container');
        var toggleActive = function (b) {
            return function (e) {
                e.preventDefault();
                dropzone.classList.toggle('active', b);
            };
        };
        dropzone.addEventListener('dragenter', toggleActive(true));
        dropzone.addEventListener('dragover', toggleActive(true));
        dropzone.addEventListener('dragleave', toggleActive(false));
        dropzone.addEventListener('drop', function (e) {
            toggleActive(false)(e);
            _this.uploadCircuit(e.dataTransfer.files[0]);
        });
    };
    Heat.prototype.uploadCircuit = function (file) {
        var _this = this;
        var reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', function (e) {
            var content = e.target.result;
            var circuit = JSON.parse(content);
            _this.takeAction('actUploadCircuit', { circuit: JSON.stringify(circuit), method: 'post' });
        });
    };
    Heat.prototype.initMarketStock = function () {
        var _this = this;
        if (!this.market) {
            document.getElementById('table-center').insertAdjacentHTML('beforebegin', "\n                <div id=\"market\"></div>\n            ");
            this.market = new LineStock(this.cardsManager, document.getElementById("market"));
            this.market.onSelectionChange = function (selection) { return _this.onMarketSelectionChange(selection); };
        }
    };
    Heat.prototype.onEnteringChooseUpgrade = function (args) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));
        this.market.setSelectionMode(this.isCurrentPlayerActive() ? 'single' : 'none');
    };
    Heat.prototype.onEnteringSwapUpgrade = function (args) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));
        this.market.setSelectionMode(this.isCurrentPlayerActive() ? 'single' : 'none');
        if (this.isCurrentPlayerActive()) {
            var hand = this.getCurrentPlayerTable().hand;
            hand.removeAll();
            hand.addCards(Object.values(args.owned));
            hand.setSelectionMode('single');
        }
    };
    Heat.prototype.onEnteringPlanification = function (args) {
        if (args._private) {
            this.getCurrentPlayerTable().setHandSelectable(this.isCurrentPlayerActive() ? 'multiple' : 'none', args._private.cards, args._private.selection);
        }
    };
    Heat.prototype.onEnteringChooseSpeed = function (args) {
        var _this = this;
        Object.entries(args.speeds).forEach(function (entry) {
            return _this.circuit.addMapIndicator(entry[1], function () { return _this.actChooseSpeed(Number(entry[0])); });
        });
    };
    Heat.prototype.onEnteringSlipstream = function (args) {
        var _this = this;
        Object.entries(args.cells).forEach(function (entry) {
            return _this.circuit.addMapIndicator(entry[1][0], function () { return _this.actSlipstream(Number(entry[0])); });
        });
    };
    Heat.prototype.onEnteringDiscard = function (args) {
        this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
    };
    Heat.prototype.onEnteringSalvage = function (args) {
        if (!this.market) {
            document.getElementById('table-center').insertAdjacentHTML('beforebegin', "\n                <div id=\"market\"></div>\n            ");
            this.market = new LineStock(this.cardsManager, document.getElementById("market"));
            this.market.onSelectionChange = function (selection) {
                document.getElementById("actSalvage_button").classList.toggle('disabled', selection.length > args.n);
            };
        }
        // negative ids to not mess with deck pile
        this.market.addCards(Object.values(args._private.cards).map(function (card) { return (__assign(__assign({}, card), { id: -card.id })); }));
        this.market.setSelectionMode(this.isCurrentPlayerActive() ? 'multiple' : 'none');
    };
    Heat.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        this.removeActionButtons();
        document.getElementById('customActions').innerHTML = '';
        document.getElementById('restartAction').innerHTML = '';
        switch (stateName) {
            case 'planification':
                this.onLeavingPlanification();
                break;
            case 'chooseSpeed':
            case 'slipstream':
                this.onLeavingChooseSpeed();
                break;
            case 'discard':
                this.onLeavingHandSelection();
                break;
            case 'salvage':
                this.onLeavingSalvage();
                break;
        }
    };
    Heat.prototype.onLeavingChooseSpeed = function () {
        this.circuit.removeMapIndicators();
    };
    Heat.prototype.onLeavingPlanification = function () {
        this.onLeavingHandSelection();
        this.circuit.removeMapIndicators();
    };
    Heat.prototype.onLeavingHandSelection = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setHandSelectable('none');
    };
    Heat.prototype.onLeavingSalvage = function () {
        var _a;
        (_a = document.getElementById('market')) === null || _a === void 0 ? void 0 : _a.remove();
        this.market = null;
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Heat.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        switch (stateName) {
            case 'planification':
                this.onEnteringPlanification(args);
                break;
        }
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'chooseUpgrade':
                    this.addActionButton("actChooseUpgrade_button", _('Take selected card'), function () { return _this.actChooseUpgrade(); });
                    document.getElementById("actChooseUpgrade_button").classList.add('disabled');
                    break;
                case 'swapUpgrade':
                    this.addActionButton("actSwapUpgrade_button", _('Swap selected cards'), function () { return _this.actSwapUpgrade(); });
                    document.getElementById("actSwapUpgrade_button").classList.add('disabled');
                    this.addActionButton("actPassSwapUpgrade_button", _('Pass'), function () { return _this.actPassSwapUpgrade(); }, null, null, 'red');
                    break;
                case 'planification':
                    this.addActionButton("actPlanification_button", '', function () { return _this.actPlanification(); });
                    this.onHandCardSelectionChange(this.getCurrentPlayerTable().hand.getSelection());
                    break;
                case 'chooseSpeed':
                    var chooseSpeedArgs = args;
                    this.onEnteringChooseSpeed(chooseSpeedArgs);
                    Object.entries(chooseSpeedArgs.speeds).forEach(function (entry) {
                        _this.addActionButton("chooseSpeed".concat(entry[0], "_button"), _('Move ${cell} cell(s)').replace('${cell}', "".concat(entry[0])), function () { return _this.actChooseSpeed(Number(entry[0])); });
                        _this.linkButtonHoverToMapIndicator(document.getElementById("chooseSpeed".concat(entry[0], "_button")), entry[1]);
                    });
                    break;
                case 'slipstream':
                    var slipstreamArgs = args;
                    this.onEnteringSlipstream(slipstreamArgs);
                    Object.entries(slipstreamArgs.cells).forEach(function (entry) {
                        _this.addActionButton("chooseSpeed".concat(entry[0], "_button"), _('Move ${cell} cell(s)').replace('${cell}', "".concat(entry[0])), function () { return _this.actSlipstream(Number(entry[0])); });
                        _this.linkButtonHoverToMapIndicator(document.getElementById("chooseSpeed".concat(entry[0], "_button")), entry[1][0]);
                    });
                    this.addActionButton("actPassSlipstream_button", _('Pass'), function () { return _this.actSlipstream(0); });
                    break;
                case 'react':
                    var reactArgs_1 = args;
                    this.addActionButton("actPassReact_button", _('Pass'), function () { return _this.actPassReact(); });
                    if (!reactArgs_1.canPass) {
                        document.getElementById("actPassReact_button").classList.add('disabled');
                    }
                    Object.entries(reactArgs_1.symbols).forEach(function (entry, index) {
                        var type = entry[0];
                        var numbers = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
                        numbers.forEach(function (number) {
                            var label = "";
                            var tooltip = "";
                            switch (type) {
                                case 'accelerate':
                                    //label = `+1 [Speed]<br>${this.cardImageHtml(this.getCurrentPlayerTable().inplay.getCards().find(card => card.id == number), { constructor_id: this.getConstructorId() })}`;
                                    label = "+".concat(reactArgs_1.flippedCards, " [Speed]<br>(").concat(_(_this.getCurrentPlayerTable().inplay.getCards().find(function (card) { return card.id == number; }).text), ")");
                                    tooltip = _this.getGarageModuleIconTooltip('accelerate', reactArgs_1.flippedCards);
                                    break;
                                case 'adjust':
                                    label = "<div class=\"icon adjust\" style=\"color: #".concat(number > 0 ? '438741' : 'a93423', ";\">").concat(number > 0 ? "+".concat(number) : number, "</div>");
                                    tooltip = _this.getGarageModuleIconTooltip('adjust', number);
                                    break;
                                case 'adrenaline':
                                    label = "+".concat(number, " [Speed]");
                                    tooltip = "\n                                    <strong>".concat(_("Adrenaline"), "</strong>\n                                    <br><br>\n                                    ").concat(_("Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space)."), "\n                                    <br><br>\n                                    <i>").concat(_("Note: Adrenaline cannot be saved for future rounds"), "</i>");
                                    break;
                                case 'cooldown':
                                    label = "".concat(number, " [Cooldown]");
                                    var heats = _this.getCurrentPlayerTable().hand.getCards().filter(function (card) { return card.effect == 'heat'; }).length;
                                    if (heats < number) {
                                        label += "(- ".concat(heats, " [Heat])");
                                    }
                                    tooltip = _this.getGarageModuleIconTooltip('cooldown', number) + _("You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).");
                                    break;
                                case 'direct':
                                    label = "<div class=\"icon direct\"></div><br>(".concat(_(_this.getCurrentPlayerTable().inplay.getCards().find(function (card) { return card.id == number; }).text), ")");
                                    tooltip = _this.getGarageModuleIconTooltip('direct', 1);
                                    break;
                                case 'heat':
                                    label = "<div class=\"icon forced-heat\">".concat(number, "</div>");
                                    tooltip = _this.getGarageModuleIconTooltip('heat', number);
                                    break;
                                case 'heated-boost':
                                    label = "[Boost] > [Speed] (1[Heat])";
                                    tooltip = "\n                                    <strong>".concat(_("Boost"), "</strong>\n                                    <br><br>\n                                    ").concat(_("You may boost once per turn to increase your speed. If you decide to Boost, pay 1 Heat to flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly."), "\n                                    <br><br>\n                                    <i>").concat(_("Note: Boost increases your Speed value for the purpose of the Check Corner step."), "</i>");
                                    break;
                                case 'reduce':
                                    label = "<div class=\"icon reduce-stress\">".concat(number, "</div>");
                                    tooltip = _this.getGarageModuleIconTooltip('reduce', number);
                                    break;
                                case 'refresh':
                                    label = "<div class=\"icon refresh\"></div>";
                                    tooltip = _this.getGarageModuleIconTooltip('refresh', 1);
                                    break;
                                case 'salvage':
                                    label = "<div class=\"icon salvage\">".concat(number, "</div>");
                                    tooltip = _this.getGarageModuleIconTooltip('salvage', number);
                                    break;
                                case 'scrap':
                                    label = "<div class=\"icon scrap\">".concat(number, "</div>");
                                    tooltip = _this.getGarageModuleIconTooltip('scrap', number);
                                    break;
                            }
                            var callback = function () { return _this.actReact(type, Array.isArray(entry[1]) ? number : undefined); };
                            if (type == 'refresh') {
                                if (!reactArgs_1.canPass) {
                                    callback = function () { return _this.showMessage(_("You must resolve the mandatory reactions before Refresh !"), 'error'); };
                                }
                                else if (Object.keys(reactArgs_1.symbols).some(function (t) { return t != 'refresh'; })) {
                                    callback = function () { return _this.confirmationDialog(_("If you use Refresh now, it will skip the other optional reactions."), function () { return _this.actReact(type, Array.isArray(entry[1]) ? number : undefined); }); };
                                }
                            }
                            _this.addActionButton("actReact".concat(type, "_").concat(number, "_button"), formatTextIcons(label), callback);
                            _this.setTooltip("actReact".concat(type, "_").concat(number, "_button"), tooltip);
                        });
                    });
                    break;
                case 'discard':
                    this.onEnteringDiscard(args);
                    this.addActionButton("actDiscard_button", '', function () { return _this.actDiscard(); });
                    this.onHandCardSelectionChange([]);
                    break;
                case 'salvage':
                    this.onEnteringSalvage(args);
                    this.addActionButton("actSalvage_button", _('Salvage selected cards'), function () { return _this.actSalvage(); });
                    document.getElementById("actSalvage_button").classList.add('disabled');
            }
        }
        else {
            switch (stateName) {
                case 'planification':
                    this.addActionButton("actCancelSelection_button", _('Cancel'), function () { return _this.actCancelSelection(); }, null, null, 'gray');
                    break;
            }
        }
    };
    Heat.prototype.linkButtonHoverToMapIndicator = function (btn, cellId) {
        var mapIndicator = document.getElementById("map-indicator-".concat(cellId));
        btn.addEventListener('mouseenter', function () { return mapIndicator === null || mapIndicator === void 0 ? void 0 : mapIndicator.classList.add('hover'); });
        btn.addEventListener('mouseleave', function () { return mapIndicator === null || mapIndicator === void 0 ? void 0 : mapIndicator.classList.remove('hover'); });
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Heat.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    Heat.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    };
    Heat.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Heat.prototype.getConstructorId = function () {
        var _this = this;
        return Number(Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); }).id);
    };
    Heat.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    Heat.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    Heat.prototype.getCurrentPlayerTable = function () {
        var _this = this;
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === _this.getPlayerId(); });
    };
    Heat.prototype.getGameStateName = function () {
        return this.gamedatas.gamestate.name;
    };
    Heat.prototype.getGarageModuleIconTooltip = function (symbol, number) {
        switch (symbol) {
            case 'accelerate':
                return "\n                    <strong>".concat(_("Accelerate"), "</strong>\n                    <br>\n                    ").concat(_("You may increase your Speed by ${number} for every card flipped this turn (from Upgrades, Stress and Boost). If you do, you must increase it for all the flipped cards.").replace('${number}', number), "\n                ");
            case 'adjust':
                return "\n                    <strong>".concat(_("Adjust Speed Limit"), "</strong>\n                    <br>\n                    ").concat((number > 0 ? _("Speed limit is ${number} higher.") : _("Speed limit is ${number} lower.")).replace('${number}', number), "\n                ");
            case 'boost':
                return "\n                    <strong>".concat(_("Boost"), "</strong>\n                    <br>\n                    ").concat(_("Flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly."), "\n                    <br>\n                    <i>").concat(_("Note: Boost increases your Speed value for the purpose of the Check Corner step."), "</i>\n                ");
            case 'cooldown':
                return "\n                    <strong>".concat(_("Cooldown"), "</strong>\n                    <br>\n                    ").concat(_("Cooldown allows you to take ${number} Heat card(s) from your hand and put it back in your Engine (so you can use the Heat card again). ").replace('${number}', number), "\n                ");
            case 'direct':
                return "\n                    <strong>".concat(_("Direct Play"), "</strong>\n                    <br>\n                    ").concat(_("You may play this card from your hand. If you do, it applies as if you played it normally, including Speed and mandatory/optional icons."), "\n                ");
            case 'heat':
                return "\n                    <strong>".concat(_("Heat"), "</strong>\n                    <br>\n                    ").concat(_("Take ${number} Heat cards from the Engine and move them to your discard pile.").replace('${number}', number), "\n                ");
            case 'reduce':
                return "\n                    <strong>".concat(_("Reduce Stress"), "</strong>\n                    <br>\n                    ").concat(_("You may immediately discard up to ${number} Stress cards from your hand to the discard pile.").replace('${number}', number), "\n                ");
            case 'refresh':
                return "\n                    <strong>".concat(_("Refresh"), "</strong>\n                    <br>\n                    ").concat(_("You may place this card back on top of your draw deck at the end of the React step."), "\n                ");
            case 'salvage':
                return "\n                    <strong>".concat(_("Salvage"), "</strong>\n                    <br>\n                    ").concat(_("You may look through your discard pile and choose up to ${number} cards there. These cards are shuffled into your draw deck.").replace('${number}', number), "\n                ");
            case 'scrap':
                return "\n                    <strong>".concat(_("Scrap"), "</strong>\n                    <br>\n                    ").concat(_("Take ${number} cards from the top of your draw deck and flip them into your discard pile.").replace('${number}', number), "\n                ");
            case 'slipstream':
                return "\n                    <strong>".concat(_("Slipstream boost"), "</strong>\n                    <br>\n                    ").concat(_("If you choose to Slipstream, your typical 2 Spaces may be increased by ${number}.").replace('${number}', number), "\n                ");
        }
    };
    Heat.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
    };
    Heat.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.no - b.no; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    Heat.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        var constructors = Object.values(gamedatas.constructors);
        constructors.filter(function (constructor) { return constructor.ai; }).forEach(function (constructor) {
            document.getElementById('player_boards').insertAdjacentHTML('beforeend', "\n            <div id=\"overall_player_board_".concat(constructor.pId, "\" class=\"player-board current-player-board\">\t\t\t\t\t\n                <div class=\"player_board_inner\" id=\"player_board_inner_982fff\">\n                    \n                    <div class=\"emblemwrap\" id=\"avatar_active_wrap_").concat(constructor.id, "\">\n                        <div src=\"img/gear.png\" alt=\"\" class=\"avatar avatar_active legend_avatar\" id=\"avatar_active_").concat(constructor.id, "\" style=\"--constructor-id: ").concat(constructor.id, "\"></div>\n                    </div>\n                                               \n                    <div class=\"player-name\" id=\"player_name_").concat(constructor.id, "\">\n                        ").concat(constructor.name, "\n                    </div>\n                    <div id=\"player_board_").concat(constructor.pId, "\" class=\"player_board_content\">\n                        <div class=\"player_score\">\n                            <span id=\"player_score_").concat(constructor.pId, "\" class=\"player_score_value\">-</span> <i class=\"fa fa-star\" id=\"icon_point_").concat(constructor.id, "\"></i>           \n                        </div>\n                    </div>\n                </div>\n            </div>"));
        });
        constructors.forEach(function (constructor) {
            var html = constructor.ai ? '' : "<div class=\"counters\">\n                <div id=\"playerhand-counter-wrapper-".concat(constructor.id, "\" class=\"playerhand-counter\">\n                    <div class=\"player-hand-card\"></div> \n                    <span id=\"playerhand-counter-").concat(constructor.id, "\"></span>\n                </div>\n                <div id=\"engine-counter-wrapper-").concat(constructor.id, "\" class=\"engine-counter\">\n                    <div class=\"engine icon\"></div>\n                    <span id=\"engine-counter-").concat(constructor.id, "\"></span>\n                </div>\n            </div>");
            html += "\n            <div class=\"counters\">\n                <div id=\"speed-counter-wrapper-".concat(constructor.id, "\" class=\"speed-counter\">\n                    <div class=\"speed icon\"></div>\n                    <span id=\"speed-counter-").concat(constructor.id, "\">-</span>\n                </div>\n                <div id=\"lap-counter-wrapper-").concat(constructor.id, "\" class=\"lap-counter\">\n                    <div class=\"flag icon\"></div>\n                    <span id=\"lap-counter-").concat(constructor.id, "\">-</span> / <span class=\"nbr-laps\">").concat(gamedatas.nbrLaps || '?', "</span>\n                </div>\n            </div>\n            <div class=\"counters\">\n                <div>\n                    <div id=\"order-").concat(constructor.id, "\" class=\"order-counter\">\n                        ").concat(constructor.no + 1, "\n                    </div>\n                </div>\n                <div id=\"podium-wrapper-").concat(constructor.id, "\" class=\"podium-counter\">\n                    <div class=\"podium icon\"></div>\n                    <span id=\"podium-counter-").concat(constructor.id, "\"></span>\n                </div>\n            </div>");
            dojo.place(html, "player_board_".concat(constructor.pId));
            if (!constructor.ai) {
                _this.handCounters[constructor.id] = new ebg.counter();
                _this.handCounters[constructor.id].create("playerhand-counter-".concat(constructor.id));
                _this.handCounters[constructor.id].setValue(constructor.handCount);
                _this.engineCounters[constructor.id] = new ebg.counter();
                _this.engineCounters[constructor.id].create("engine-counter-".concat(constructor.id));
                _this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
            }
            _this.speedCounters[constructor.id] = new ebg.counter();
            _this.speedCounters[constructor.id].create("speed-counter-".concat(constructor.id));
            if (constructor.speed !== null && constructor.speed >= 0) {
                _this.speedCounters[constructor.id].setValue(constructor.speed);
            }
            _this.lapCounters[constructor.id] = new ebg.counter();
            _this.lapCounters[constructor.id].create("lap-counter-".concat(constructor.id));
            _this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(gamedatas.nbrLaps, constructor.turn + 1)));
            if (constructor.carCell < 0) {
                _this.setRank(constructor.id, -constructor.carCell);
            }
        });
        this.setTooltipToClass('playerhand-counter', _('Hand cards count'));
        this.setTooltipToClass('engine-counter', _('Engine cards count'));
        this.setTooltipToClass('speed-counter', _('Speed'));
        this.setTooltipToClass('lap-counter', _('Laps'));
        this.setTooltipToClass('order-counter', _('Player order'));
        this.setTooltipToClass('podium-counter', _('Rank'));
    };
    Heat.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
        if (gamedatas.isLegend) {
            this.legendTable = new LegendTable(this, gamedatas.legendCard);
        }
    };
    Heat.prototype.getPlayerConstructor = function (playerId) {
        return Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == playerId; });
    };
    Heat.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId], this.getPlayerConstructor(playerId));
        this.playersTables.push(table);
    };
    Heat.prototype.getHelpHtml = function () {
        var html = "\n        <div id=\"help-popin\">\n            <h1>".concat(_("Assets"), "</h2>\n            TODO\n        </div>");
        return html;
    };
    Heat.prototype.getPossibleSpeeds = function (selectedCards, args) {
        var speeds = [0];
        selectedCards.forEach(function (card) {
            var t = [];
            var cSpeeds = args.speeds[card.id];
            if (!Array.isArray(cSpeeds)) {
                cSpeeds = [cSpeeds];
            }
            cSpeeds.forEach(function (cSpeed) {
                speeds.forEach(function (speed) {
                    t.push(cSpeed + speed);
                });
            });
            speeds = t;
        });
        return speeds;
    };
    Heat.prototype.onHandCardSelectionChange = function (selection) {
        var _this = this;
        if (this.gamedatas.gamestate.name == 'planification') {
            var table = this.getCurrentPlayerTable();
            var gear = table.getCurrentGear();
            var minAllowed = Math.max(1, gear - 2);
            var maxAllowed = Math.min(4, gear + 2);
            var allowed = selection.length >= minAllowed && selection.length <= maxAllowed;
            var useHeat = allowed && Math.abs(selection.length - gear) == 2;
            var label = allowed ?
                _('Set gear to ${gear} and play selected cards').replace('${gear}', "".concat(selection.length)) + (useHeat ? formatTextIcons(' (+1 [Heat])') : '') :
                _('Select between ${min} and ${max} cards').replace('${min}', "".concat(minAllowed)).replace('${max}', "".concat(maxAllowed));
            document.getElementById("player-table-".concat(table.playerId, "-gear")).dataset.gear = "".concat(allowed ? selection.length : gear);
            var button = document.getElementById('actPlanification_button');
            button.innerHTML = label;
            // we let the user able to click, so the back will explain in the error why he can't
            /*if (allowed && useHeat && this.engineCounters[this.getConstructorId()].getValue() == 0) {
                allowed = false;
            }*/
            button.classList.toggle('disabled', !allowed);
            this.circuit.removeMapIndicators();
            var privateArgs_1 = this.gamedatas.gamestate.args._private;
            if (selection.length && privateArgs_1) {
                var totalSpeeds = this.getPossibleSpeeds(selection, privateArgs_1);
                var stressCardsSelected_1 = selection.filter(function (card) { return card.effect == 'stress'; }).length > 0;
                totalSpeeds.forEach(function (totalSpeed) { return _this.circuit.addMapIndicator(privateArgs_1.cells[totalSpeed], undefined, stressCardsSelected_1); });
            }
        }
        else if (this.gamedatas.gamestate.name == 'discard') {
            var label = selection.length ?
                _('Discard ${number} selected cards').replace('${number}', "".concat(selection.length)) :
                _('No additional discard');
            var button = document.getElementById('actDiscard_button');
            button.innerHTML = label;
        }
        else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
    };
    Heat.prototype.onMarketSelectionChange = function (selection) {
        if (this.gamedatas.gamestate.name == 'chooseUpgrade') {
            document.getElementById("actChooseUpgrade_button").classList.toggle('disabled', selection.length != 1);
        }
        else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
    };
    Heat.prototype.checkSwapUpgradeSelectionState = function () {
        var _a, _b, _c, _d, _e;
        var marketSelection = (_b = (_a = this.market) === null || _a === void 0 ? void 0 : _a.getSelection()) !== null && _b !== void 0 ? _b : [];
        var handSelection = (_e = (_d = (_c = this.getCurrentPlayerTable()) === null || _c === void 0 ? void 0 : _c.hand) === null || _d === void 0 ? void 0 : _d.getSelection()) !== null && _e !== void 0 ? _e : [];
        document.getElementById("actSwapUpgrade_button").classList.toggle('disabled', marketSelection.length != 1 || handSelection.length != 1);
    };
    Heat.prototype.actChooseUpgrade = function () {
        if (!this.checkAction('actChooseUpgrade')) {
            return;
        }
        this.takeAction('actChooseUpgrade', {
            cardId: this.market.getSelection()[0].id,
        });
    };
    Heat.prototype.actSwapUpgrade = function () {
        if (!this.checkAction('actSwapUpgrade')) {
            return;
        }
        this.takeAction('actSwapUpgrade', {
            marketCardId: this.market.getSelection()[0].id,
            ownedCardId: this.getCurrentPlayerTable().hand.getSelection()[0].id,
        });
    };
    Heat.prototype.actPassSwapUpgrade = function () {
        if (!this.checkAction('actPassSwapUpgrade')) {
            return;
        }
        this.takeAction('actPassSwapUpgrade');
    };
    Heat.prototype.actPlanification = function () {
        if (!this.checkAction('actPlan')) {
            return;
        }
        var selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        this.takeAction('actPlan', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return card.id; })),
        });
    };
    Heat.prototype.actCancelSelection = function () {
        this.takeAction('actCancelSelection');
    };
    Heat.prototype.actChooseSpeed = function (speed) {
        if (!this.checkAction('actChooseSpeed')) {
            return;
        }
        this.takeAction('actChooseSpeed', {
            speed: speed
        });
    };
    Heat.prototype.actSlipstream = function (speed) {
        if (!this.checkAction('actSlipstream')) {
            return;
        }
        this.takeAction('actSlipstream', {
            speed: speed
        });
    };
    Heat.prototype.actPassReact = function () {
        if (!this.checkAction('actPassReact')) {
            return;
        }
        this.takeAction('actPassReact');
    };
    Heat.prototype.actReact = function (symbol, arg) {
        if (!this.checkAction('actReact')) {
            return;
        }
        this.takeAction('actReact', {
            symbol: symbol,
            arg: arg
        });
    };
    Heat.prototype.actDiscard = function () {
        if (!this.checkAction('actDiscard')) {
            return;
        }
        var selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        this.takeAction('actDiscard', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return card.id; })),
        });
    };
    Heat.prototype.actSalvage = function () {
        if (!this.checkAction('actSalvage')) {
            return;
        }
        var selectedCards = this.market.getSelection();
        this.takeAction('actSalvage', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return -card.id; })),
        });
    };
    /*public actConfirmPartialTurn() {
        if(!(this as any).checkAction('actConfirmPartialTurn')) {
            return;
        }

        this.takeAction('actConfirmPartialTurn');
    }
    
    public actRestart() {
        if(!(this as any).checkAction('actRestart')) {
            return;
        }

        this.takeAction('actRestart');
    }*/
    Heat.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        var method = data.method === undefined ? 'get' : data.method;
        this.ajaxcall("/heat/heat/".concat(action, ".html"), data, this, function () { }, undefined, method);
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    Heat.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        dojo.connect(this.notifqueue, 'addToLog', function () {
            _this.addLogClass();
        });
        var notifs = [
            'loadCircuit',
            'chooseUpgrade',
            'swapUpgrade',
            'endDraftRound',
            'reformingDeckWithUpgrades',
            'updatePlanification',
            'reveal',
            'moveCar',
            'updateTurnOrder',
            'payHeats',
            'adrenaline',
            'spinOut',
            'discard',
            'pDiscard',
            'draw',
            'pDraw',
            'clearPlayedCards',
            'cooldown',
            'finishRace',
            'endOfRace',
            'newLegendCard',
            'scrapCards',
            'resolveBoost',
            'accelerate',
            'salvageCards',
        ];
        notifs.forEach(function (notifName) {
            dojo.subscribe(notifName, _this, function (notifDetails) {
                log("notif_".concat(notifName), notifDetails.args);
                var promise = _this["notif_".concat(notifName)](notifDetails.args);
                var promises = promise ? [promise] : [];
                var minDuration = 1;
                var msg = /*this.formatString(*/ _this.format_string_recursive(notifDetails.log, notifDetails.args) /*)*/;
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    // If there is some text, we let the message some time, to be read 
                    minDuration = MIN_NOTIFICATION_MS;
                }
                // tell the UI notification ends, if the function returned a promise. 
                Promise.all(__spreadArray(__spreadArray([], promises, true), [sleep(minDuration)], false)).then(function () { return _this.notifqueue.onSynchronousNotificationEnd(); });
            });
            _this.notifqueue.setSynchronous(notifName, undefined);
        });
        if (isDebug) {
            notifs.forEach(function (notifName) {
                if (!_this["notif_".concat(notifName)]) {
                    console.warn("notif_".concat(notifName, " function is not declared, but listed in setupNotifications"));
                }
            });
            Object.getOwnPropertyNames(Heat.prototype).filter(function (item) { return item.startsWith('notif_'); }).map(function (item) { return item.slice(6); }).forEach(function (item) {
                if (!notifs.some(function (notifName) { return notifName == item; })) {
                    console.warn("notif_".concat(item, " function is declared, but not listed in setupNotifications"));
                }
            });
        }
        this.notifqueue.setIgnoreNotificationCheck('discard', function (notif) {
            return _this.getPlayerIdFromConstructorId(notif.args.constructor_id) == _this.getPlayerId() && notif.args.n;
        });
        this.notifqueue.setIgnoreNotificationCheck('draw', function (notif) {
            return _this.getPlayerIdFromConstructorId(notif.args.constructor_id) == _this.getPlayerId();
        });
    };
    Heat.prototype.notif_loadCircuit = function (args) {
        var _a;
        var circuit = args.circuit;
        (_a = document.getElementById("circuit-dropzone-container")) === null || _a === void 0 ? void 0 : _a.remove();
        //document.querySelectorAll('.nbr-laps').forEach(elem => elem.innerHTML == `${circuit.}`)
        this.circuit.loadCircuit(circuit);
    };
    Heat.prototype.notif_chooseUpgrade = function (args) {
        var constructor_id = args.constructor_id, card = args.card;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        if (playerId == this.getPlayerId()) {
            this.getCurrentPlayerTable().hand.addCard(card);
        }
        else {
            this.market.removeCard(card);
        }
    };
    Heat.prototype.notif_swapUpgrade = function (args) {
        var _a, _b;
        var constructor_id = args.constructor_id, card = args.card, card2 = args.card2;
        (_a = this.market) === null || _a === void 0 ? void 0 : _a.addCard(card2);
        if (constructor_id == this.getConstructorId()) {
            this.getCurrentPlayerTable().hand.addCard(card);
        }
        else {
            (_b = this.market) === null || _b === void 0 ? void 0 : _b.addCard(card);
        }
    };
    Heat.prototype.notif_endDraftRound = function () {
        var _a;
        (_a = this.market) === null || _a === void 0 ? void 0 : _a.removeAll();
    };
    Heat.prototype.notif_reformingDeckWithUpgrades = function () {
        var _a, _b;
        (_a = document.getElementById('market')) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this.getCurrentPlayerTable()) === null || _b === void 0 ? void 0 : _b.hand.removeAll();
        this.market = null;
    };
    Heat.prototype.notif_updatePlanification = function (args) {
        // TODO
    };
    Heat.prototype.notif_reveal = function (args) {
        var _a;
        var constructor_id = args.constructor_id, gear = args.gear, heat = args.heat;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.setCurrentGear(gear);
        var cards = Object.values(args.cards);
        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(-cards.length);
        var promises = [playerTable.setInplay(cards)];
        if (heat) {
            promises.push(playerTable.discard.addCard(heat));
        }
        this.speedCounters[constructor_id].setValue(cards.map(function (card) { var _a; return (_a = card.speed) !== null && _a !== void 0 ? _a : 0; }).reduce(function (a, b) { return a + b; }, 0));
        return Promise.all(promises);
    };
    Heat.prototype.notif_moveCar = function (args) {
        var constructor_id = args.constructor_id, cell = args.cell, path = args.path;
        return this.circuit.moveCar(constructor_id, cell, path);
    };
    Heat.prototype.notif_updateTurnOrder = function (args) {
        var constructor_ids = args.constructor_ids;
        constructor_ids.forEach(function (constructorId, index) { return document.getElementById("order-".concat(constructorId)).innerHTML = "".concat(index + 1); });
    };
    Heat.prototype.payHeats = function (constructorId, cards) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var playerId, playerTable;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerId = this.getPlayerIdFromConstructorId(constructorId);
                        playerTable = this.getPlayerTable(playerId);
                        (_a = this.engineCounters[constructorId]) === null || _a === void 0 ? void 0 : _a.incValue(-cards.length);
                        return [4 /*yield*/, playerTable.payHeats(cards)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_payHeats = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, cards, corner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, cards = args.cards, corner = args.corner;
                        this.circuit.showCorner(corner, 'darkorange');
                        return [4 /*yield*/, this.payHeats(constructor_id, Object.values(cards))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Heat.prototype.notif_adrenaline = function (args) {
        var constructor_id = args.constructor_id;
        this.speedCounters[constructor_id].incValue(1);
    };
    Heat.prototype.notif_spinOut = function (args) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, cards, corner, cell, stresses, nCellsBack, playerId, playerTable;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        constructor_id = args.constructor_id, cards = args.cards, corner = args.corner, cell = args.cell, stresses = args.stresses, nCellsBack = args.nCellsBack;
                        this.circuit.showCorner(corner, 'red');
                        return [4 /*yield*/, this.payHeats(constructor_id, Object.values(cards))];
                    case 1:
                        _b.sent();
                        if (!this.animationManager.animationsActive()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.circuit.spinOutWithAnimation(constructor_id, cell, nCellsBack)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.circuit.moveCar(constructor_id, cell);
                        _b.label = 4;
                    case 4:
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(stresses.length);
                        return [4 /*yield*/, playerTable.spinOut(stresses)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Heat.prototype.getPlayerIdFromConstructorId = function (constructorId) {
        var _a;
        return (_a = this.gamedatas.constructors[constructorId]) === null || _a === void 0 ? void 0 : _a.pId;
    };
    Heat.prototype.notif_draw = function (args) {
        var _a;
        var constructor_id = args.constructor_id;
        var n = Number(args.n);
        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(n);
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.drawCardsPublic(n);
    };
    Heat.prototype.notif_discard = function (args) {
        var _a;
        var constructor_id = args.constructor_id, cards = args.cards;
        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(-args.n);
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.discard.addCards(Object.values(cards));
    };
    Heat.prototype.notif_pDraw = function (args) {
        var _a;
        var constructor_id = args.constructor_id;
        var cards = Object.values(args.cards);
        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(cards.length);
        var playerTable = this.getCurrentPlayerTable();
        playerTable.drawCardsPrivate(cards);
    };
    Heat.prototype.notif_pDiscard = function (args) {
        var _a;
        var constructor_id = args.constructor_id;
        var cards = Object.values(args.cards);
        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(-cards.length);
        this.getCurrentPlayerTable().discard.addCards(cards);
    };
    Heat.prototype.notif_clearPlayedCards = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, cardIds, playerId, playerTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, cardIds = args.cardIds;
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        return [4 /*yield*/, playerTable.clearPlayedCards(cardIds)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_cooldown = function (args) {
        var _a, _b;
        var constructor_id = args.constructor_id, cards = args.cards;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        (_a = this.handCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(-cards.length);
        playerTable.cooldown(cards);
        (_b = this.engineCounters[constructor_id]) === null || _b === void 0 ? void 0 : _b.incValue(cards.length);
    };
    Heat.prototype.notif_finishRace = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, pos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, pos = args.pos;
                        if (!this.animationManager.animationsActive()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.circuit.finishRace(constructor_id, pos)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.circuit.moveCar(constructor_id, -pos);
                        _a.label = 3;
                    case 3:
                        this.setRank(constructor_id, pos);
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.setScore = function (playerId, score) {
        if (this.scoreCtrl[playerId]) {
            this.scoreCtrl[playerId].toValue(score);
        }
        else {
            document.getElementById("player_score_".concat(playerId)).innerText = "".concat(score);
        }
    };
    Heat.prototype.notif_endOfRace = function (args) {
        var _this = this;
        var scores = args.scores[this.gamedatas.circuitDatas.id];
        Object.entries(scores).forEach(function (_a) {
            var constructorId = _a[0], score = _a[1];
            return _this.setScore(_this.gamedatas.constructors[constructorId].pId, score);
        });
    };
    Heat.prototype.notif_newLegendCard = function (args) {
        return this.legendTable.newLegendCard(args.card);
    };
    Heat.prototype.notif_scrapCards = function (args) {
        var constructor_id = args.constructor_id, cards = args.cards;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).scrapCards(Object.values(cards));
    };
    Heat.prototype.notif_resolveBoost = function (args) {
        var _a;
        var constructor_id = args.constructor_id, cards = args.cards, card = args.card;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.speedCounters[constructor_id].incValue((_a = card.speed) !== null && _a !== void 0 ? _a : 0);
        return this.getPlayerTable(playerId).resolveBoost(Object.values(cards), card);
    };
    Heat.prototype.notif_accelerate = function (args) {
        var constructor_id = args.constructor_id, speed = args.speed;
        this.speedCounters[constructor_id].incValue(speed);
    };
    Heat.prototype.notif_salvageCards = function (args) {
        var constructor_id = args.constructor_id, cards = args.cards, discard = args.discard;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).salvageCards(Object.values(cards), Object.values(discard));
    };
    Heat.prototype.setRank = function (constructorId, pos) {
        var playerId = this.getPlayerIdFromConstructorId(constructorId);
        document.getElementById("overall_player_board_".concat(playerId)).classList.add('finished');
        document.getElementById("podium-wrapper-".concat(constructorId)).classList.add('finished');
        document.getElementById("podium-counter-".concat(constructorId)).innerHTML = '' + pos;
    };
    /*
    * [Undocumented] Called by BGA framework on any notification message
    * Handle cancelling log messages for restart turn
    */
    /* @Override */
    Heat.prototype.onPlaceLogOnChannel = function (msg) {
        var currentLogId = this.notifqueue.next_log_id;
        var currentMobileLogId = this.next_log_id;
        var res = this.inherited(arguments);
        this._notif_uid_to_log_id[msg.uid] = currentLogId;
        this._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
        this._last_notif = {
            logId: currentLogId,
            mobileLogId: currentMobileLogId,
            msg: msg,
        };
        return res;
    };
    Heat.prototype.cancelLogs = function (notifIds) {
        var _this = this;
        notifIds.forEach(function (uid) {
            if (_this._notif_uid_to_log_id.hasOwnProperty(uid)) {
                var logId = _this._notif_uid_to_log_id[uid];
                if ($('log_' + logId)) {
                    dojo.addClass('log_' + logId, 'cancel');
                }
            }
            if (_this._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
                var mobileLogId = _this._notif_uid_to_mobile_log_id[uid];
                if ($('dockedlog_' + mobileLogId)) {
                    dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
                }
            }
        });
    };
    Heat.prototype.addLogClass = function () {
        var _a;
        if (this._last_notif == null) {
            return;
        }
        var notif = this._last_notif;
        var type = notif.msg.type;
        if (type == 'history_history') {
            type = notif.msg.args.originalType;
        }
        if ($('log_' + notif.logId)) {
            dojo.addClass('log_' + notif.logId, 'notif_' + type);
            var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
            (_a = this[methodName]) === null || _a === void 0 ? void 0 : _a.call(this, notif);
        }
        if ($('dockedlog_' + notif.mobileLogId)) {
            dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
        }
    };
    Heat.prototype.onClick = function (elem, callback) {
        elem.addEventListener('click', callback);
    };
    Heat.prototype.onAddingNewUndoableStepToLog = function (notif) {
        var _this = this;
        var _a, _b, _c, _d;
        if (!$("log_".concat(notif.logId))) {
            return;
        }
        var stepId = notif.msg.args.stepId;
        $("log_".concat(notif.logId)).dataset.step = stepId;
        if ($("dockedlog_".concat(notif.mobileLogId))) {
            $("dockedlog_".concat(notif.mobileLogId)).dataset.step = stepId;
        }
        if ((_d = (_c = (_b = (_a = this.gamedatas) === null || _a === void 0 ? void 0 : _a.gamestate) === null || _b === void 0 ? void 0 : _b.args) === null || _c === void 0 ? void 0 : _c.previousSteps) === null || _d === void 0 ? void 0 : _d.includes(parseInt(stepId))) {
            this.onClick($("log_".concat(notif.logId)), function () { return _this.undoToStep(stepId); });
            if ($("dockedlog_".concat(notif.mobileLogId))) {
                this.onClick($("dockedlog_".concat(notif.mobileLogId)), function () { return _this.undoToStep(stepId); });
            }
        }
    };
    Heat.prototype.undoToStep = function (stepId) {
        this.stopActionTimer();
        this.checkAction('actRestart');
        this.takeAction('actUndoToStep', { stepId: stepId } /*, false*/);
    };
    Heat.prototype.stopActionTimer = function () {
        console.warn('TODO');
    };
    Heat.prototype.coloredConstructorName = function (constructorName) {
        return "<span style=\"font-weight: bold; color: #".concat(CONSTRUCTORS_COLORS[Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.name == constructorName; }).id], "\">").concat(constructorName, "</span>");
    };
    Heat.prototype.cardImageHtml = function (card, args) {
        var _this = this;
        var _a, _b;
        var constructorId = (_a = args.constructor_id) !== null && _a !== void 0 ? _a : (_b = Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); })) === null || _b === void 0 ? void 0 : _b.id;
        return "<div class=\"log-card-image\" style=\"--personal-card-background-y: ".concat(constructorId * 100 / 6, "%;\">").concat(this.cardsManager.getHtml(card), "</div>");
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Heat.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                for (var property in args) {
                    /*if (['card_names'].includes(property) && args[property][0] != '<') {
                        args[property] = `<strong>${_(args[property])}</strong>`;
                    }*/
                }
                if (args.card_image === '' && args.card) {
                    args.card_image = "<div class=\"log-card-set\">".concat(this.cardImageHtml(args.card, args), "</div>");
                }
                if (args.card_image2 === '' && args.card2) {
                    args.card_image2 = "<div class=\"log-card-set\">".concat(this.cardImageHtml(args.card2, args), "</div>");
                }
                if (args.finishIcon === '') {
                    args.finishIcon = "<div class=\"turn icon\"></div>";
                }
                if (args.cards_images === '' && args.cards) {
                    args.cards_images = "<div class=\"log-card-set\">".concat(Object.values(args.cards).map(function (card) { return _this.cardImageHtml(card, args); }).join(''), "</div>");
                }
                var constructorKeys = Object.keys(args).filter(function (key) { return key.substring(0, 16) == 'constructor_name'; });
                constructorKeys.filter(function (key) { return args[key][0] != '<'; }).forEach(function (key) {
                    args[key] = _this.coloredConstructorName(args[key]);
                });
                log = formatTextIcons(_(log));
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return Heat;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.heat", ebg.core.gamegui, new Heat());
});
