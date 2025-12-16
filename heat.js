var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        }
        else {
            last = now;
            callback.apply(context, args);
        }
    };
}
var advThrottle = function (func, delay, options) {
    if (options === void 0) { options = { leading: true, trailing: false }; }
    var timer = null, lastRan = null, trailingArgs = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) { //called within cooldown period
            lastRan = this; //update context
            trailingArgs = args; //save for later
            return;
        }
        if (options.leading) { // if leading
            func.call.apply(// if leading
            func, __spreadArray([this], args, false)); //call the 1st instance
        }
        else { // else it's trailing
            lastRan = this; //update context
            trailingArgs = args; //save for later
        }
        var coolDownPeriodComplete = function () {
            if (options.trailing && trailingArgs) { // if trailing and the trailing args exist
                func.call.apply(// if trailing and the trailing args exist
                func, __spreadArray([lastRan], trailingArgs, false)); //invoke the instance with stored context "lastRan"
                lastRan = null; //reset the status of lastRan
                trailingArgs = null; //reset trailing arguments
                timer = setTimeout(coolDownPeriodComplete, delay); //clear the timout
            }
            else {
                timer = null; // reset timer
            }
        };
        timer = setTimeout(coolDownPeriodComplete, delay);
    };
};
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
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
            settings.element.addEventListener('transitionend', advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, }));
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        this.throttleTime = (_e = settings.throttleTime) !== null && _e !== void 0 ? _e : 100;
        window.addEventListener('resize', advThrottle(function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        }, this.throttleTime, { leading: true, trailing: true, }));
        if (window.ResizeObserver) {
            new ResizeObserver(advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, })).observe(settings.element);
        }
        if ((_f = this.settings.autoZoom) === null || _f === void 0 ? void 0 : _f.expectedWidth) {
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
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        /**
         * Returns the zoom levels
         */
        get: function () {
            return this._zoomLevels;
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
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
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
     * Sets the available zoomLevels and new zoom to the provided values.
     * @param zoomLevels the new array of zoomLevels that can be used.
     * @param newZoom if provided the zoom will be set to this value, if not the last element of the zoomLevels array will be set as the new zoom
     */
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
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
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
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
     * Unsafe method as this is not protected by throttle. Surround with  `advThrottle(() => this.zoomOrDimensionChanged(), this.throttleTime, { leading: true, trailing: true, })` to avoid spamming recomputation.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.offsetWidth / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.offsetHeight * this._zoom, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
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
/**
 * Just does nothing for the duration
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = /** @class */ (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
        return __awaiter(this, void 0, void 0, function () {
            var settings, _a;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_b = settings.animationStart) === null || _b === void 0 ? void 0 : _b.call(settings, animation);
                        (_c = settings.element) === null || _c === void 0 ? void 0 : _c.classList.add((_d = settings.animationClass) !== null && _d !== void 0 ? _d : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_f = (_e = this.settings) === null || _e === void 0 ? void 0 : _e.duration) !== null && _f !== void 0 ? _f : 500, scale: (_h = (_g = this.zoomManager) === null || _g === void 0 ? void 0 : _g.zoom) !== null && _h !== void 0 ? _h : undefined });
                        _a = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _a.result = _o.sent();
                        (_k = (_j = animation.settings).animationEnd) === null || _k === void 0 ? void 0 : _k.call(_j, animation);
                        (_l = settings.element) === null || _l === void 0 ? void 0 : _l.classList.remove((_m = settings.animationClass) !== null && _m !== void 0 ? _m : 'bga-animations_animated');
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
     * Creates the stock and register it on the manager.
     *
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
     * Removes the stock and unregister it on the manager.
     */
    CardStock.prototype.remove = function () {
        var _a;
        this.manager.removeStock(this);
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    };
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
        var _a, _b, _c, _d, _e;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        var needsCreation = true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
                needsCreation = false;
                if (!updateInformations) {
                    element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
                }
            }
        }
        else if ((_c = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _c === void 0 ? void 0 : _c.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
                needsCreation = false;
            }
        }
        if (needsCreation) {
            var element = this.getCardElement(card);
            if (needsCreation && element) {
                console.warn("Card ".concat(this.manager.getId(card), " already exists, not re-created."));
            }
            // if the card comes from a stock but is not found in this stock, the card is probably hudden (deck with a fake top card)
            var fromBackSide = !(settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) && !(animation === null || animation === void 0 ? void 0 : animation.originalSide) && (animation === null || animation === void 0 ? void 0 : animation.fromStock) && !((_d = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _d === void 0 ? void 0 : _d.contains(card));
            var createdVisible = fromBackSide ? false : (_e = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _e !== void 0 ? _e : this.manager.isCardVisible(card);
            var newElement = element !== null && element !== void 0 ? element : this.manager.createCardElement(card, createdVisible);
            promise = this.moveFromElement(card, newElement, animation, settingsWithIndex);
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
        var fromRect = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = fromRect ? this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        }) : Promise.resolve(false);
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
    CardStock.prototype.addCards = function (cards_1, animation_1, settings_1) {
        return __awaiter(this, arguments, void 0, function (cards, animation, settings, shift) {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            if (shift === void 0) { shift = false; }
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
                                promises.push(new Promise(function (resolve) {
                                    setTimeout(function () { return _this.addCard(cards[i], animation, settings).then(function (result) { return resolve(result); }); }, i * shift);
                                }));
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
        var promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);
        return promise;
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
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = cards.map(function (card) { return _this.removeCard(card, settings); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var cards;
            return __generator(this, function (_a) {
                cards = this.getCards();
                return [2 /*return*/, this.removeCards(cards, settings)];
            });
        });
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
     * Unselect all cards
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
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            var _a;
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
    /**
     * Changes the sort function of the stock.
     *
     * @param sort the new sort function. If defined, the stock will be sorted with this new function.
     */
    CardStock.prototype.setSort = function (sort) {
        this.sort = sort;
        if (this.sort && this.cards.length) {
            this.cards.sort(this.sort);
            var previouslyMovedCardDiv = this.getCardElement(this.cards[this.cards.length - 1]);
            this.element.appendChild(previouslyMovedCardDiv);
            for (var i = this.cards.length - 2; i >= 0; i--) {
                var movedCardDiv = this.getCardElement(this.cards[i]);
                this.element.insertBefore(movedCardDiv, previouslyMovedCardDiv);
                previouslyMovedCardDiv = movedCardDiv;
            }
        }
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _this = _super.call(this, manager, element) || this;
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
        _this.fakeCardGenerator = (_a = settings === null || settings === void 0 ? void 0 : settings.fakeCardGenerator) !== null && _a !== void 0 ? _a : manager.getFakeCardGenerator();
        _this.thicknesses = (_b = settings.thicknesses) !== null && _b !== void 0 ? _b : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_c = settings.cardNumber) !== null && _c !== void 0 ? _c : 0);
        _this.autoUpdateCardNumber = (_d = settings.autoUpdateCardNumber) !== null && _d !== void 0 ? _d : true;
        _this.autoRemovePreviousCards = (_e = settings.autoRemovePreviousCards) !== null && _e !== void 0 ? _e : true;
        var shadowDirection = (_f = settings.shadowDirection) !== null && _f !== void 0 ? _f : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard);
        }
        else if (settings.cardNumber > 0) {
            _this.addCard(_this.getFakeCard());
        }
        if (settings.counter && ((_g = settings.counter.show) !== null && _g !== void 0 ? _g : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                console.warn("Deck card counter created without a cardNumber");
            }
            _this.createCounter((_h = settings.counter.position) !== null && _h !== void 0 ? _h : 'bottom', (_j = settings.counter.extraClasses) !== null && _j !== void 0 ? _j : 'round', settings.counter.counterId);
            if ((_k = settings.counter) === null || _k === void 0 ? void 0 : _k.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
            }
        }
        _this.setCardNumber((_l = settings.cardNumber) !== null && _l !== void 0 ? _l : 0);
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
     * @param topCard the deck top card. If unset, will generated a fake card (default). Set it to null to not generate a new topCard.
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = undefined; }
        var promise = Promise.resolve(false);
        var oldTopCard = this.getTopCard();
        if (topCard !== null && cardNumber > 0) {
            var newTopCard = topCard || this.getFakeCard();
            if (!oldTopCard || this.manager.getId(newTopCard) != this.manager.getId(oldTopCard)) {
                promise = this.addCard(newTopCard, undefined, { autoUpdateCardNumber: false });
            }
        }
        else if (cardNumber == 0 && oldTopCard) {
            promise = this.removeCard(oldTopCard, { autoUpdateCardNumber: false });
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
        return promise;
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1, null);
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
    Deck.prototype.removeAll = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _a, _b;
            return __generator(this, function (_c) {
                promise = _super.prototype.removeAll.call(this, __assign(__assign({}, settings), { autoUpdateCardNumber: (_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : false }));
                if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _b !== void 0 ? _b : true) {
                    this.setCardNumber(0, null);
                }
                return [2 /*return*/, promise];
            });
        });
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
    Deck.prototype.shuffle = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var animatedCardsMax, animatedCards, elements, getFakeCard, uid, i, newCard, newElement, pauseDelayAfterAnimation;
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        animatedCardsMax = (_a = settings === null || settings === void 0 ? void 0 : settings.animatedCardsMax) !== null && _a !== void 0 ? _a : 10;
                        this.addCard((_b = settings === null || settings === void 0 ? void 0 : settings.newTopCard) !== null && _b !== void 0 ? _b : this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 4];
                        elements = [this.getCardElement(this.getTopCard())];
                        getFakeCard = function (uid) {
                            var newCard;
                            if (settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter) {
                                newCard = {};
                                settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter(newCard, uid);
                            }
                            else {
                                newCard = _this.fakeCardGenerator("".concat(_this.element.id, "-shuffle-").concat(uid));
                            }
                            return newCard;
                        };
                        uid = 0;
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = void 0;
                            do {
                                newCard = getFakeCard(uid++);
                            } while (this.manager.getCardElement(newCard)); // To make sure there isn't a fake card remaining with the same uid
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _d.sent();
                        pauseDelayAfterAnimation = (_c = settings === null || settings === void 0 ? void 0 : settings.pauseDelayAfterAnimation) !== null && _c !== void 0 ? _c : 500;
                        if (!(pauseDelayAfterAnimation > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.manager.animationManager.play(new BgaPauseAnimation({ duration: pauseDelayAfterAnimation }))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2 /*return*/, true];
                    case 4: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    Deck.prototype.getFakeCard = function () {
        return this.fakeCardGenerator(this.element.id);
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
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
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
 * A stock with manually placed cards
 */
var ManualPositionStock = /** @class */ (function (_super) {
    __extends(ManualPositionStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
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
                    return compare * direction;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]);
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
        this.updateMainTimeoutId = [];
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
    CardManager.prototype.removeStock = function (stock) {
        var index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
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
            return Promise.resolve(false);
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            var updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.animationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
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
    CardManager.prototype.getFakeCardGenerator = function () {
        var _this = this;
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.fakeCardGenerator) !== null && _b !== void 0 ? _b : (function (deckId) { return ({ id: _this.getId({ id: "".concat(deckId, "-fake-top-card") }) }); });
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
        .replace(/\[Boost\]/ig, '<div class="boost icon"></div>')
        .replace(/\[\+\]/ig, '<div class="boost icon"></div>');
}
var CARD_WIDTH = 225;
var CARD_HEIGHT = 363;
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
            cardWidth: CARD_WIDTH,
            cardHeight: CARD_HEIGHT,
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    CardsManager.prototype.setupFrontDiv = function (card, div, ignoreTooltip) {
        var _a;
        if (ignoreTooltip === void 0) { ignoreTooltip = false; }
        var type = card.type;
        div.dataset.type = '' + type; // for debug purpose only
        div.classList.toggle('upgrade-card', type < 80);
        div.classList.toggle('sponsor-card', type >= 80 && type < 100);
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
            if (type < 80) {
                // upgrade
                var imagePosition = type - 1;
                var image_items_per_row = 10;
                var row = Math.floor(imagePosition / image_items_per_row);
                var xBackgroundPercent = (imagePosition - row * image_items_per_row) * 100;
                var yBackgroundPercent = row * 100;
                div.style.backgroundPosition = "-".concat(xBackgroundPercent, "% -").concat(yBackgroundPercent, "%");
            }
            else {
                // sponsor
                var imagePosition = type - 80;
                var xBackgroundPercent = imagePosition * 100;
                div.style.backgroundPositionX = "-".concat(xBackgroundPercent, "%");
            }
            div.innerHTML = "<div class=\"text\">".concat((_a = _(card.text)) !== null && _a !== void 0 ? _a : '', "</div>");
        }
        if (!ignoreTooltip) {
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
        if (card.symbols && !div.querySelector('.card-symbols')) {
            div.insertAdjacentHTML('beforeend', "<div class='card-symbols'></div>");
            var div2_1 = div.querySelector('.card-symbols');
            if (card.speed > 0 || card.symbols.boost === undefined) {
                div2_1.insertAdjacentHTML('beforeend', "<div class='card-symbol symbol-speed' id ='".concat(card.id, "-speed'></div>"));
            }
            Object.entries(card.symbols).forEach(function (_a) {
                var symbol = _a[0], n = _a[1];
                div2_1.insertAdjacentHTML('beforeend', "<div class='card-symbol symbol-".concat(symbol, "' id ='").concat(card.id, "-").concat(symbol, "'></div>"));
            });
        }
    };
    CardsManager.prototype.getGarageModuleTextTooltip = function (card) {
        switch (card.type) {
            // 4 wheel drive
            case 1:
            case 2:
            case 3:
            case 47:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('This early system was designed to transfer all the force from the engine into the tarmac through all four wheels but it resulted in poor handling. These cards have the potential of high Speed or Cooldown but also reduce control because they add [+] symbols.'));
            // Body
            case 4:
            case 5:
            case 6:
            case 18:
            case 19:
            case 20:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('A safer car with better balance that does not understeer. These cards allow you to discard Stress cards.'));
            // Brakes
            case 7:
            case 8:
            case 9:
            case 10:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('Brakes are all about how late you can make a decision to overtake or step on the brake, and still stay on the track. These cards have variable speed where you make a decision as you reveal the cards.'));
            // Cooling systems
            case 11:
            case 12:
            case 13:
            case 21:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('Provides a more stable and clean drive ; a better fuel economy and less stress to the car. These are cooldown cards.'));
            // R.P.M.
            case 14:
            case 15:
            case 16:
            case 17:
            case 29:
            case 30:
            case 31:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('A powerful engine allows your car to respond faster. When played at key moments, those cards make it easier for you to accelerate past opponents. They are cards that help you slipstream and overtake all over the track, but are most effective in and around corners.'));
            // Fuel
            case 22:
            case 23:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('Racing fuel is highly regulated. These are the super fuel “illegal“ cards.'));
            // Gas pedal
            case 24:
            case 25:
            case 26:
            case 27:
            case 28:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('The car reacts more quickly to pressure on the accelerator. These cards increase your overall speed.'));
            // Suspension
            case 32:
            case 33:
            case 34:
            case 35:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('Giving you a smoother drive, these cards can be played round after round.'));
            // tires
            case 36:
            case 37:
            case 38:
            case 39:
            case 40:
            case 41:
                return "<strong>".concat(_(card.text), "</strong><br>\n            ").concat(_('It is about grip through width and durability. These cards allow you to go faster on corners or sacrifice the grip for a lot of cooldown.'));
            // turbocharger
            case 42:
            case 43:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('A bigger engine giving you more horsepower and a higher top speed but also increasing weight and wear. These are the highest valued cards and require you to pay Heat.'));
            // wings
            case 44:
            case 45:
            case 46:
                return "<strong>".concat(_(card.text), "</strong><br>\n                ").concat(_('Creates downforce in corners but it lowers the top speed. These cards help you drive faster in corners but they are also unreliable, thus requiring Heat.'));
            case 101:
            case 102:
            case 103:
            case 104:
                return "<strong>".concat(_('Speed card'), "</strong><br>\n                ").concat(_('Speed:'), " <strong>").concat(Number(card.type) - 100, "</strong>\n                ");
            case 100:
            case 105:
                return "<strong>".concat(_('Starting upgrade'), "</strong><br>\n                ").concat(_('Speed:'), " ").concat(Number(card.type) - 100, "\n                ");
            default:
                return "<strong>".concat(_(card.text), "</strong>");
        }
    };
    CardsManager.prototype.getTooltip = function (card) {
        var _this = this;
        switch (card.effect) {
            case 'heat':
                return "<strong>".concat(_('Heat card'), "</strong>");
            case 'stress':
                return "<strong>".concat(_('Stress card'), "</strong>");
            case 'basic_upgrade':
            case 'advanced_upgrade':
                var tooltip = this.getGarageModuleTextTooltip(card);
                var icons = Object.entries(card.symbols)
                    .map(function (_a) {
                    var symbol = _a[0], number = _a[1];
                    return _this.game.getGarageModuleIconTooltipWithIcon(symbol, number);
                })
                    .join('<br>');
                if (icons != '') {
                    tooltip += "<br><br>".concat(icons);
                }
                return formatTextIcons(tooltip);
            case 'sponsor':
                var symbols = structuredClone(card.symbols);
                symbols['one-time'] = 1;
                return "<strong>".concat(_(card.text), "</strong>\n                <br><br>\n                ").concat(Object.entries(symbols)
                    .map(function (_a) {
                    var symbol = _a[0], number = _a[1];
                    return _this.game.getGarageModuleIconTooltipWithIcon(symbol, number);
                })
                    .join('<br>'), "\n                ");
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
        var _a;
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
            if (type < 80) {
                // upgrade
                className = 'upgrade-card';
                var imagePosition = type - 1;
                var image_items_per_row = 10;
                var row = Math.floor(imagePosition / image_items_per_row);
                var xBackgroundPercent = (imagePosition - row * image_items_per_row) * 100;
                var yBackgroundPercent = row * 100;
                style = "background-position: -".concat(xBackgroundPercent, "% -").concat(yBackgroundPercent, "%;");
            }
            else {
                // sponsor
                className = 'sponsor-card';
                var imagePosition = type - 80;
                var xBackgroundPercent = imagePosition * 100;
                style = "background-position-x: -".concat(xBackgroundPercent, "%");
            }
        }
        var html = "<div class=\"card personal-card\" data-side=\"front\">\n            <div class=\"card-sides\">\n                <div class=\"card-side front ".concat(className, "\" ").concat(col !== null ? "data-col=\"".concat(col, "\"") : '', " style=\"").concat(style, "\">").concat(type < 100 ? "<div class=\"text\">".concat((_a = _(card.text)) !== null && _a !== void 0 ? _a : '', "</div>") : '', "\n                </div>\n            </div>\n        </div>");
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
            cardWidth: 363,
            cardHeight: 225,
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    LegendCardsManager.prototype.setupFrontDiv = function (card, div) {
        if (!Array.isArray(card) || !Object.values(card).length) {
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
var EventCardsManager = /** @class */ (function () {
    function EventCardsManager(game) {
        this.game = game;
    }
    EventCardsManager.prototype.getTexts = function (card) {
        switch (card) {
            case 1:
                return {
                    title: _('New grandstand inauguration'),
                    rule: _('First three drivers to cross the Finish Line on the 1st lap immediately gain a Sponsorship card.'),
                    year: '1961',
                    race: 1,
                    country: _('GREAT BRITAIN'),
                };
            case 2:
                return {
                    title: _('New speed record!'),
                    rule: _('Each time you reach a Speed of 15 or more, immediately gain a Sponsorship card.'),
                    year: '1961',
                    race: 2,
                    country: _('USA'),
                };
            case 3:
                return {
                    title: _('Drivers’ strike'),
                    rule: _('This race is one lap shorter than usual. The winner of this race is awarded 2 extra Championship points.'),
                    year: '1961',
                    race: 3,
                    country: _('ITALY'),
                };
            case 4:
                return {
                    title: _('Engine restrictions lifted'),
                    rule: _('All drivers start the race with an extra Heat card from the reserve in their Engine spot.'),
                    year: '1962',
                    race: 1,
                    country: _('ITALY'),
                };
            case 5:
                return {
                    title: _('Record crowds'),
                    rule: _('This race is one lap longer than usual and hand size is increased to 8 cards.'),
                    year: '1962',
                    race: 2,
                    country: _('GREAT BRITAIN'),
                };
            case 6:
                return {
                    title: _('Corruption in rules committee'),
                    rule: _('The top 3 finishers of this race are awarded an extra Championship point.'),
                    year: '1962',
                    race: 3,
                    country: _('FRANCE'),
                };
            case 7:
                return {
                    title: _('New title sponsor'),
                    rule: _('No Special Rules.'),
                    year: '1963',
                    race: 1,
                    country: _('USA'),
                };
            case 8:
                return {
                    title: _('First live televised race'),
                    rule: _('If you pass 3 cars in a single round, immediately gain a Sponsorship card.'),
                    year: '1963',
                    race: 2,
                    country: _('GREAT BRITAIN'),
                };
            case 9:
                return {
                    title: _('New safety regulations'),
                    rule: _('All drivers start the race with 2 less Heat cards and 1 less Stress card than usual. Hand size is reduced to 6 cards.'),
                    year: '1963',
                    race: 3,
                    country: _('FRANCE'),
                };
            case 10:
                return {
                    title: _('Title sponsor withdraws future unknown'),
                    rule: _('All drivers start the race with an extra Stress card from the reserve in their Deck. If you spin out, you are eliminated from the race and score 0 Championship points.'),
                    year: '1963',
                    race: 4,
                    country: _('ITALY'),
                };
            case 11:
                return {
                    title: _('Going global'),
                    rule: _('In Press Corners, you gain 2 Sponsorship cards instead of one.'),
                    year: '1964',
                    race: 1,
                    country: _('JAPAN'),
                };
            case 12:
                return {
                    title: _('Turbulent winds'),
                    rule: _('You may only Slipstream if you are in 3rd or 4th gear.'),
                    year: '1964',
                    race: 2,
                    country: _('FRANCE'),
                };
            case 13:
                return {
                    title: _('Chicanes for increased safety'),
                    rule: _('For this race, you may discard Heat cards during step 8.'),
                    year: '1964',
                    race: 3,
                    country: _('MEXICO'),
                };
            case 14:
                return {
                    title: _('Sudden heavy rain delays race'),
                    rule: _('Nobody benefits from Adrenaline this race.'),
                    year: '1964',
                    race: 4,
                    country: _('JAPAN'),
                };
            case 15:
                return {
                    title: _('Hold on tight'),
                    rule: _('A maximum of 1 card may be discarded per turn.'),
                    year: '1965',
                    race: 1,
                    country: _('GREAT BRITAIN'),
                };
            case 16:
                return {
                    title: _('Smile and wave'),
                    rule: _('In Press Corners, you may only gain a Sponsorship card if driving slower than the speed limit.'),
                    year: '1965',
                    race: 2,
                    country: _('USA'),
                };
            case 17:
                return {
                    title: _('Tunnel vision'),
                    rule: _('For this race, you may discard Stress cards during Step 8.'),
                    year: '1965',
                    race: 3,
                    country: _('ESPAÑA'),
                };
            case 18:
                return {
                    title: _('The pressure cooker'),
                    rule: _('This race is one lap longer than usual. Each time you complete a lap, remove a Heat card from the game. (Step 8, remove from: Engine > Hand > Discard > Deck.'),
                    year: '1965',
                    race: 4,
                    country: _('NEDERLAND'),
                };
        }
    };
    EventCardsManager.prototype.getHtml = function (card) {
        var texts = this.getTexts(card);
        var html = "<div id=\"event-card-".concat(card, "\" class=\"card event-card\" data-side=\"front\">\n            <div class=\"card-sides\">\n                <div class=\"card-side front\" data-index=\"").concat(card, "\">\n                    <div class=\"title-and-rule\">\n                        <div class=\"title\">").concat(texts.title, "</div>\n                        <div class=\"rule bga-autofit\">").concat(texts.rule, "</div>\n                    </div>\n                    <div class=\"bottom-line\">\n                        <span class=\"year\">").concat(texts.year, "</span>\n                        \u2022\n                        <span class=\"race\">").concat(_('RACE ${number}').replace('${number}', '' + texts.race), "</span>\n                        \u2022\n                        <span class=\"country\">").concat(texts.country, "</span>\n                    </div>\n                </div>\n            </div>\n        </div>");
        return html;
    };
    EventCardsManager.prototype.getTooltip = function (card) {
        var texts = this.getTexts(card);
        var html = "\n            <div><strong>".concat(texts.title, "</strong></div><br>\n\n            <div>").concat(texts.rule, "</div><br>\n            \n            <div class=\"bottom-line\">\n                <span class=\"year\">").concat(texts.year, "</span>\n                \u2022\n                <span class=\"race\">").concat(_('RACE ${number}').replace('${number}', '' + texts.race), "</span>\n                \u2022\n                <span class=\"country\">").concat(texts.country, "</span>\n            </div>\n        ");
        return html;
    };
    return EventCardsManager;
}());
var MAP_WIDTH = 1650;
var MAP_HEIGHT = 1100;
var LEADERBOARD_POSITIONS = {
    8: {
        1: { x: 0, y: 0, a: 0 },
        2: { x: -77, y: 52, a: 0 },
        3: { x: 77, y: 52, a: 0 },
        4: { x: 0, y: 128, a: 0 },
        5: { x: 0, y: 180, a: 0 },
        6: { x: 0, y: 232, a: 0 },
        7: { x: 0, y: 284, a: 0 },
        8: { x: 0, y: 336, a: 0 },
    },
    12: {
        1: { x: 0, y: 0, a: 0 },
        2: { x: -77, y: 52, a: 0 },
        3: { x: 77, y: 52, a: 0 },
        4: { x: 0, y: 128, a: 0 },
        5: { x: 0, y: 180, a: 0 },
        6: { x: 0, y: 232, a: 0 },
        7: { x: -77, y: 284, a: 0 },
        8: { x: 0, y: 284, a: 0 },
        9: { x: 77, y: 284, a: 0 },
        10: { x: -77, y: 336, a: 0 },
        11: { x: 0, y: 336, a: 0 },
        12: { x: 77, y: 336, a: 0 },
    },
};
var WEATHER_TOKENS_ON_SECTOR_TENT = [0, 4, 5];
var EVENTS_PRESS_CORNERS = {
    1: [0],
    2: [1],
    3: [2],
    4: [4],
    5: [2, 4],
    6: [2],
    7: [0],
    8: [1, 3],
    9: [3],
    10: [3],
};
var JAPAN_BELOW_TUNNEL_CELLS = [971, 975, 1033, 1037];
function moveCarAnimationDuration(cells, totalSpeed) {
    return totalSpeed <= 0 || cells < +0 ? 0 : Math.round((5500 / (20 + totalSpeed)) * cells);
}
function getSvgPathElement(pathCells) {
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
    var newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newpath.setAttributeNS(null, 'd', path);
    return newpath;
}
// Wrapper for the animation that use requestAnimationFrame
var CarAnimation = /** @class */ (function () {
    function CarAnimation(car, pathCells, totalSpeed) {
        this.car = car;
        this.pathCells = pathCells;
        this.totalSpeed = totalSpeed;
        this.newpath = getSvgPathElement(pathCells);
    }
    CarAnimation.prototype.start = function () {
        var _this = this;
        this.duration = moveCarAnimationDuration(this.pathCells.length, this.totalSpeed);
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
        this.circuitDiv = document.getElementById('circuit');
        if ((_a = gamedatas.circuitDatas) === null || _a === void 0 ? void 0 : _a.jpgUrl) {
            this.loadCircuit(gamedatas.circuitDatas);
            this.createWeather(this.gamedatas.weather);
            Object.values(this.gamedatas.constructors)
                .filter(function (constructor) { var _a; return ((_a = constructor.paths) === null || _a === void 0 ? void 0 : _a.length) > 0; })
                .forEach(function (constructor) {
                return constructor.paths.filter(function (path) { return (path === null || path === void 0 ? void 0 : path.length) > 1; }).forEach(function (path) { return _this.addMapPath(path, false); });
            });
        }
    }
    Circuit.prototype.loadCircuit = function (circuitDatas) {
        var _this = this;
        var _a, _b;
        this.circuitDatas = circuitDatas;
        this.circuitDiv.style.backgroundImage = "url('".concat(this.circuitDatas.jpgUrl.startsWith('http') ? this.circuitDatas.jpgUrl : "".concat(g_gamethemeurl, "img/").concat(this.circuitDatas.jpgUrl), "')");
        this.createCorners(this.circuitDatas.corners);
        this.createPressTokens(this.circuitDatas.pressCorners);
        Object.values(this.gamedatas.constructors).forEach(function (constructor) { return _this.createCar(constructor); });
        // JAPAN TUNNEL
        if (circuitDatas.id == 'Japan') {
            this.circuitDiv.insertAdjacentHTML('beforeend', "<div id='japan-tunnel'></div>");
        }
        else {
            (_a = $('japan-tunnel')) === null || _a === void 0 ? void 0 : _a.remove();
        }
        // ESPANA TUNNEL
        if (circuitDatas.id == 'Espana') {
            this.circuitDiv.insertAdjacentHTML('beforeend', "<div id='espana-tunnel'></div>");
        }
        else {
            (_b = $('espana-tunnel')) === null || _b === void 0 ? void 0 : _b.remove();
        }
    };
    Circuit.prototype.newCircuit = function (circuitDatas) {
        this.circuitDiv.innerHTML = '';
        this.loadCircuit(circuitDatas);
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
        (cornerDiv.id = "corner-".concat(corner.id)), cornerDiv.classList.add('corner');
        cornerDiv.style.setProperty('--x', "".concat(corner.x, "px"));
        cornerDiv.style.setProperty('--y', "".concat(corner.y, "px"));
        cornerDiv.appendChild(document.createTextNode(String(corner.speed)));
        this.circuitDiv.insertAdjacentElement('beforeend', cornerDiv);
    };
    Circuit.prototype.createPressTokens = function (pressCorners) {
        var _this = this;
        pressCorners === null || pressCorners === void 0 ? void 0 : pressCorners.forEach(function (cornerId) { return _this.createPressToken(cornerId); });
    };
    Circuit.prototype.createPressToken = function (cornerId) {
        var corner = this.circuitDatas.corners[cornerId];
        var corners = Object.values(this.circuitDatas.corners);
        var closeCornerToTheRight = corners.find(function (otherCorner) {
            return (otherCorner.x != corner.x || otherCorner.y != corner.y) &&
                Math.sqrt(Math.pow(corner.tentX - otherCorner.tentX, 2) + Math.pow(corner.tentY - otherCorner.tentY, 2)) < 100 &&
                otherCorner.x > corner.x;
        });
        var pressIconDiv = document.createElement('div');
        pressIconDiv.id = "press-icon-".concat(cornerId);
        pressIconDiv.classList.add("press-icon");
        if (closeCornerToTheRight) {
            pressIconDiv.classList.add("left-side");
        }
        pressIconDiv.style.setProperty('--x', "".concat(corner.tentX, "px"));
        pressIconDiv.style.setProperty('--y', "".concat(corner.tentY, "px"));
        pressIconDiv.innerHTML = "<i class=\"fa fa-camera\"></i>";
        this.circuitDiv.insertAdjacentElement('beforeend', pressIconDiv);
        this.game.setTooltip(pressIconDiv.id, "\n        <div class=\"press-token\"></div><br><br>\n        \n        <strong>".concat(_('Press Corner'), "</strong><br><br>\n        ").concat(_('The international press is waiting in a specific corner for something spectacular to happen. This gives all players a permanent challenge throughout the race.'), "\n        <br>\n        ").concat(_('To gain a Sponsorship card this way you must either:'), "<br>\n        <ul class=\"press-corner-ul\">\n            <li>").concat(_('Cross the Corner Line thanks to your Slipstream move (Speed is irrelevant in this case).'), "</li>\n            <li>").concat(_('Exceed the Speed Limit of the Press Corner (potentially modified by a Road Conditions token) by 2 or more.'), "</li>\n        </ul>\n        <br>\n        ").concat(_('Note: You cannot gain more than one Sponsorship card each time you go through a Press Corner.'), "        \n        "));
    };
    Circuit.prototype.createWeather = function (weather) {
        if (weather === null || weather === void 0 ? void 0 : weather.tokens) {
            this.createWeatherCard(weather.card, this.circuitDatas.weatherCardPos);
            this.createWeatherTokens(weather.tokens, this.circuitDatas.corners, weather.card);
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
        this.game.setTooltip(weatherCardDiv.id, "".concat(this.game.getWeatherCardSetupTooltip(type), "<br><br>").concat(this.game.getWeatherCardEffectTooltip(type)));
    };
    Circuit.prototype.createWeatherTokens = function (tokens, corners, cardType) {
        var _this = this;
        Object.entries(tokens)
            .filter(function (_a) {
            var cornerId = _a[0], type = _a[1];
            return type !== null && type !== undefined;
        })
            .forEach(function (_a) {
            var cornerId = _a[0], type = _a[1];
            var corner = corners[cornerId];
            if (corner) {
                _this.createWeatherToken(type, cardType, Number(cornerId), corner);
            }
            else {
                console.warn(cornerId, "doesn't exists ", corners);
            }
        });
    };
    Circuit.prototype.createWeatherToken = function (type, cardType, cornerId, corner) {
        var _this = this;
        var field = WEATHER_TOKENS_ON_SECTOR_TENT.includes(type) ? 'sectorTent' : 'tent';
        var x = corner["".concat(field, "X")];
        var y = corner["".concat(field, "Y")];
        var weatherTokenDiv = document.createElement('div');
        weatherTokenDiv.id = "weather-token-".concat(type, "-").concat(document.querySelectorAll(".weather-token[id^=\"weather-token-\"]").length);
        weatherTokenDiv.classList.add('weather-token');
        weatherTokenDiv.dataset.tokenType = "".concat(type);
        weatherTokenDiv.style.setProperty('--x', "".concat(x, "px"));
        weatherTokenDiv.style.setProperty('--y', "".concat(y, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', weatherTokenDiv);
        this.game.setTooltip(weatherTokenDiv.id, this.game.getWeatherTokenTooltip(type, cardType));
        if ([2, 3].includes(type)) {
            var cornerDiv = document.getElementById("corner-".concat(cornerId));
            if (cornerDiv) {
                var clone = document.createElement('div');
                clone.id = "".concat(cornerDiv.id, "-old-value");
                clone.classList.add('corner', 'old-value');
                clone.style.setProperty('--x', "".concat(corner.x - 20, "px"));
                clone.style.setProperty('--y', "".concat(corner.y - 20, "px"));
                clone.dataset.strike = "".concat(type === 3 ? 'up' : 'down');
                document.getElementById('circuit').appendChild(clone);
                clone.innerHTML = "&nbsp; ".concat(cornerDiv.innerText, " &nbsp;");
                cornerDiv.innerText = "".concat(Number(cornerDiv.innerText) + (type === 3 ? 1 : -1));
                cornerDiv.dataset.adjust = "".concat(type === 3 ? 'up' : 'down');
            }
        }
        if (field === 'sectorTent') {
            corner.sector.forEach(function (cellId) { return _this.addSectorIndicator(cellId, weatherTokenDiv, x - 30, y - 30); });
        }
    };
    Circuit.prototype.getPodiumPosition = function (pos) {
        return __assign(__assign({}, this.circuitDatas.podium[pos - 1]), { a: 0 });
    };
    Circuit.prototype.getCellPosition = function (carCell) {
        if (carCell < 0) {
            return this.getPodiumPosition(-carCell);
        }
        return this.circuitDatas.cells[carCell];
    };
    Circuit.prototype.createCar = function (constructor) {
        var _a;
        var car = document.getElementById("car-".concat(constructor.id));
        if (!car) {
            car = document.createElement('div');
            (car.id = "car-".concat(constructor.id)), car.classList.add('car');
            if (constructor.pId === this.game.getPlayerId()) {
                car.classList.add('current');
            }
            car.style.setProperty('--constructor-id', "".concat(constructor.id));
            this.circuitDiv.insertAdjacentElement('beforeend', car);
            var html = "<div class=\"constructor-avatar ".concat(constructor.ai ? 'legend' : 'player', "\" style=\"");
            if (constructor.ai) {
                html += "--constructor-id: ".concat(constructor.id, ";");
            }
            else {
                // ? Custom image : Bga Image
                //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                html += "background-image: url('".concat(document.getElementById("avatar_".concat(constructor.pId)).src, "');");
            }
            this.game.setTooltip(car.id, "".concat(html, "\"></div> <strong style=\"color: #").concat(CONSTRUCTORS_COLORS[constructor.id], ";\">").concat(_(constructor.name), "</strong>"));
        }
        var cell = this.getCellPosition(constructor.carCell);
        if (cell) {
            car.style.setProperty('--x', "".concat(cell.x, "px"));
            car.style.setProperty('--y', "".concat(cell.y, "px"));
            car.style.setProperty('--r', "".concat((_a = cell.a) !== null && _a !== void 0 ? _a : 0, "deg"));
            this.updateCarZIndex(car, constructor.carCell);
        }
    };
    Circuit.prototype.isPassingBelowTunnel = function (cellOrPath) {
        var _this = this;
        if (this.circuitDatas.id != 'Japan') {
            return false;
        }
        if (Array.isArray(cellOrPath)) {
            return cellOrPath.reduce(function (acc, t) { return acc || _this.isPassingBelowTunnel(t); }, false);
        }
        else {
            return JAPAN_BELOW_TUNNEL_CELLS.includes(cellOrPath);
        }
    };
    Circuit.prototype.updateCarZIndex = function (car, cellOrPath) {
        // JAPAN TUNNEL
        if (this.isPassingBelowTunnel(cellOrPath)) {
            car.style.zIndex = '1';
        }
        else {
            car.style.zIndex = '';
        }
    };
    Circuit.prototype.moveCar = function (constructorId, carCell, path, totalSpeed) {
        return __awaiter(this, void 0, void 0, function () {
            var car, e_1, cell;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.removeMapIndicators();
                        car = document.getElementById("car-".concat(constructorId));
                        if (!((path === null || path === void 0 ? void 0 : path.length) > 1 && this.game.animationManager.animationsActive())) return [3 /*break*/, 6];
                        this.addMapPath(path, true, totalSpeed);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.moveCarWithAnimation(car, path, totalSpeed)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.moveCar(constructorId, carCell)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        e_1 = _a.sent();
                        return [2 /*return*/, this.moveCar(constructorId, carCell)];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        if ((path === null || path === void 0 ? void 0 : path.length) > 1) {
                            this.addMapPath(path, false);
                        }
                        cell = this.getCellPosition(carCell);
                        if (!cell) {
                            console.warn('Cell not found (moveCar) : cell ', carCell, 'constructorId', constructorId);
                        }
                        car.style.setProperty('--x', "".concat(cell.x, "px"));
                        car.style.setProperty('--y', "".concat(cell.y, "px"));
                        car.style.setProperty('--r', "".concat(cell.a, "deg"));
                        this.updateCarZIndex(car, carCell);
                        return [2 /*return*/, Promise.resolve(true)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Circuit.prototype.spinOutWithAnimation = function (constructorId, carCell, cellsDiff) {
        var _this = this;
        this.removeMapIndicators();
        return new Promise(function (resolve) {
            var car = document.getElementById("car-".concat(constructorId));
            var time = moveCarAnimationDuration(cellsDiff, cellsDiff);
            car.style.setProperty('--transition-time', "".concat(time, "ms"));
            car.classList.add('with-transition');
            car.clientWidth;
            var cell = _this.getCellPosition(carCell);
            if (!cell) {
                console.warn('Cell not found (spinOutWithAnimation) : cell ', carCell, 'constructorId', constructorId);
            }
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
            var cell = _this.getPodiumPosition(pos);
            if (!cell) {
                console.warn('Cell not found (finishRace) : cell ', pos, 'constructorId', constructorId);
            }
            car.style.setProperty('--x', "".concat(cell.x, "px"));
            car.style.setProperty('--y', "".concat(cell.y, "px"));
            car.style.setProperty('--r', "".concat(cell.a, "deg"));
            setTimeout(function () {
                car.classList.remove('with-transition');
                resolve(true);
            }, time + 200);
        });
    };
    Circuit.prototype.addMapIndicator = function (cellId, clickCallback, speed, stress) {
        if (speed === void 0) { speed = 0; }
        if (stress === void 0) { stress = false; }
        var mapIndicator = document.createElement('div');
        mapIndicator.id = "map-indicator-".concat(cellId);
        mapIndicator.classList.add('map-indicator');
        var cell = this.circuitDatas.cells[cellId];
        mapIndicator.style.setProperty('--x', "".concat(cell.x, "px"));
        mapIndicator.style.setProperty('--y', "".concat(cell.y, "px"));
        this.circuitDiv.insertAdjacentElement('beforeend', mapIndicator);
        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
            mapIndicator.classList.add('clickable');
        }
        if (speed) {
            mapIndicator.innerHTML = "".concat(speed);
        }
        if (stress) {
            mapIndicator.classList.add('stress');
        }
        return mapIndicator;
    };
    Circuit.prototype.addSectorIndicator = function (cellId, weatherTokenDiv, weatherX, weatherY) {
        var sectorIndicator = document.createElement('div');
        sectorIndicator.id = "sector-indicator-".concat(cellId);
        sectorIndicator.classList.add('sector-indicator');
        var cell = this.circuitDatas.cells[cellId];
        sectorIndicator.style.setProperty('--x', "".concat(cell.x - weatherX, "px"));
        sectorIndicator.style.setProperty('--y', "".concat(cell.y - weatherY, "px"));
        weatherTokenDiv.insertAdjacentElement('beforeend', sectorIndicator);
        return sectorIndicator;
    };
    Circuit.prototype.addCornerHeatIndicator = function (cornerId, heat) {
        if (heat > 0) {
            var cornerHeatIndicator = document.createElement('div');
            cornerHeatIndicator.id = "corner-heat-indicator-".concat(cornerId);
            cornerHeatIndicator.innerHTML = "".concat(heat);
            cornerHeatIndicator.classList.add('corner-heat-indicator', 'icon', 'heat');
            var corner = this.circuitDatas.corners[cornerId];
            cornerHeatIndicator.style.setProperty('--x', "".concat(corner.x, "px"));
            cornerHeatIndicator.style.setProperty('--y', "".concat(corner.y, "px"));
            this.circuitDiv.insertAdjacentElement('beforeend', cornerHeatIndicator);
            document.getElementById("corner-".concat(cornerId)).style.setProperty('--color', 'red');
        }
    };
    Circuit.prototype.removeMapIndicators = function () {
        this.circuitDiv.querySelectorAll('.map-indicator').forEach(function (elem) { return elem.remove(); });
    };
    Circuit.prototype.removeCornerHeatIndicators = function () {
        this.circuitDiv.querySelectorAll('.corner').forEach(function (elem) { return elem.style.removeProperty('--color'); });
        this.circuitDiv.querySelectorAll('.corner-heat-indicator').forEach(function (elem) { return elem.remove(); });
    };
    Circuit.prototype.addMapPath = function (pathCellIds, animated, totalSpeed) {
        try {
            var pathCells = this.getCellsInfos(pathCellIds);
            var path = getSvgPathElement(pathCells);
            // Compute zIndex => special case of tunnel
            var zIndex = this.isPassingBelowTunnel(pathCellIds) ? '1' : '3';
            //let cell = this.circuitDatas.cells[cellId];
            //mapPath.style.setProperty('--x', `${cell.x}px`);
            //mapPath.style.setProperty('--y', `${cell.y}px`);
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.appendChild(path);
            svg.id = "car-path-".concat(this.circuitDiv.querySelectorAll('.car-path').length);
            svg.setAttribute('width', '1650');
            svg.setAttribute('height', '1100');
            svg.style.zIndex = zIndex;
            svg.classList.add('car-path');
            if (animated) {
                var animationDuration = moveCarAnimationDuration(pathCellIds.length, totalSpeed);
                var pathLength = Math.round(path.getTotalLength());
                svg.style.setProperty('--animation-duration', "".concat(animationDuration, "ms"));
                svg.style.setProperty('--path-length', "".concat(pathLength));
                svg.classList.add('animated');
            }
            this.circuitDiv.insertAdjacentElement('afterbegin', svg);
        }
        catch (e) {
            console.warn('Impossible to load map path');
        }
    };
    Circuit.prototype.removeMapPaths = function () {
        this.circuitDiv.querySelectorAll('.car-path').forEach(function (elem) { return elem.remove(); });
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
    Circuit.prototype.moveCarWithAnimation = function (car, pathCellIds, totalSpeed) {
        var pathCells = this.getCellsInfos(pathCellIds);
        this.updateCarZIndex(car, pathCellIds);
        var animation = new CarAnimation(car, pathCells, totalSpeed);
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
    Circuit.prototype.setEliminatedPodium = function (position) {
        var cell = this.getPodiumPosition(position);
        this.circuitDiv.insertAdjacentHTML('beforeend', "<div class=\"eliminated-podium\" style=\"--x: ".concat(cell.x, "px; --y: ").concat(cell.y, "px;\">\u274C</div>"));
    };
    Circuit.prototype.refreshUI = function (constructor) {
        var _this = this;
        this.createCar(constructor);
        this.removeMapPaths();
        constructor.paths.filter(function (path) { return (path === null || path === void 0 ? void 0 : path.length) > 1; }).forEach(function (path) { return _this.addMapPath(path, false); });
    };
    return Circuit;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PERSONAL_CARDS_SORTING = function (a, b) { return Number(a.type) - Number(b.type); };
function manualPositionFitUpdateDisplay(element, cards, lastCard, stock) {
    var MARGIN = 8;
    element.style.setProperty('--width', "".concat(CARD_WIDTH * cards.length + MARGIN * (cards.length - 1), "px"));
    var halfClientWidth = element.clientWidth / 2;
    var cardDistance = CARD_WIDTH + MARGIN;
    var containerWidth = element.clientWidth;
    var uncompressedWidth = (cards.length * CARD_WIDTH) + ((cards.length - 1) * MARGIN);
    if (uncompressedWidth > containerWidth) {
        cardDistance = cardDistance * containerWidth / uncompressedWidth;
    }
    cards.forEach(function (card, index) {
        var cardDiv = stock.getCardElement(card);
        var cardLeft = halfClientWidth + cardDistance * (index - (cards.length - 1) / 2);
        cardDiv.style.left = "".concat(cardLeft - CARD_WIDTH / 2, "px");
    });
}
// new ManualPositionStock(cardsManager, document.getElementById('manual-position-fit-stock'), undefined, manualPositionFitUpdateDisplay);
var InPlayStock = /** @class */ (function (_super) {
    __extends(InPlayStock, _super);
    function InPlayStock(game, constructor) {
        var _this = _super.call(this, game.cardsManager, document.getElementById("player-table-".concat(constructor.pId, "-inplay")), {
            sort: PERSONAL_CARDS_SORTING,
        }, manualPositionFitUpdateDisplay) || this;
        _this.playerId = constructor.pId;
        _this.addCards(Object.values(constructor.inplay));
        _this.toggleInPlay(); // in case inplay is empty, addCard is not called
        _this.onSelectionChange = function (selection) { return game.onInPlayCardSelectionChange(selection); };
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
        _super.prototype.cardRemoved.call(this, card);
        this.toggleInPlay();
    };
    return InPlayStock;
}(ManualPositionStock));
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, constructor) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        this.constructorId = constructor.id;
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\" style=\"--player-color: #").concat(player.color, "; --personal-card-background-y: ").concat(constructor.id * 100 / 7, "%;\">\n            <div id=\"player-table-").concat(this.playerId, "-name\" class=\"name-wrapper\">").concat(player.name, "</div>\n        ");
        if (this.currentPlayer) {
            html += "\n            <div class=\"block-with-text hand-wrapper\">\n                <div class=\"block-label\">".concat(_('Your hand'), "</div>\n                <div id=\"player-table-").concat(this.playerId, "-hand\" class=\"hand cards\"></div>\n            </div>");
        }
        html += "\n            <div id=\"player-table-".concat(this.playerId, "-board\" class=\"player-board\" data-color=\"").concat(player.color, "\">\n                <div id=\"player-table-").concat(this.playerId, "-deck\" class=\"deck\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-engine\" class=\"engine\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-discard\" class=\"discard\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-gear\" class=\"gear\" data-color=\"").concat(player.color, "\" data-gear=\"").concat(this.currentGear, "\"></div>\n                <div id=\"player-table-").concat(this.playerId, "-inplay-wrapper\" class=\"inplay-wrapper\">\n                <div class=\"hand-wrapper\">\n                    <div class=\"block-label\">").concat(_('Cards in play'), "</div>\n                        <div id=\"player-table-").concat(this.playerId, "-inplay\" class=\"inplay\"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ");
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        if (this.currentPlayer) {
            this.hand = new LineStock(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-hand")), {
                sort: PERSONAL_CARDS_SORTING,
            });
            this.hand.onSelectionChange = function (selection) { return _this.game.onHandCardSelectionChange(selection); };
            this.hand.addCards(constructor.hand);
        }
        this.deck = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-deck")), {
            cardNumber: constructor.deckCount,
            counter: {
                extraClasses: 'round',
            }
        });
        var engineCards = Object.values(constructor.engine);
        this.engine = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-engine")), {
            cardNumber: engineCards.length,
            topCard: engineCards[0], // TODO check if ordered
            counter: {
                extraClasses: 'round',
            },
            fakeCardGenerator: function (deckId) { return ({
                id: "".concat(deckId, "-top-engine"),
                type: 111,
                location: 'engine',
                effect: 'heat',
                state: ''
            }); },
        });
        var discardCards = Object.values(constructor.discard);
        this.discard = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-discard")), {
            cardNumber: discardCards.length,
            topCard: discardCards[0], // TODO check if ordered
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
        this.hand.unselectAll();
        selectedCardsIds === null || selectedCardsIds === void 0 ? void 0 : selectedCardsIds.forEach(function (id) { return _this.hand.selectCard(cards.find(function (card) { return Number(card.id) == id; })); });
    };
    PlayerTable.prototype.getCurrentGear = function () {
        return this.currentGear;
    };
    PlayerTable.prototype.setCurrentGear = function (gear) {
        this.currentGear = gear;
        document.getElementById("player-table-".concat(this.playerId, "-gear")).dataset.gear = "".concat(gear);
    };
    PlayerTable.prototype.setInplay = function (cards) {
        this.inplay.removeAll();
        return this.inplay.addCards(cards);
    };
    PlayerTable.prototype.clearPlayedCards = function (cardIds, sponsorIds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.inplay.removeCards(sponsorIds.map(function (sponsorId) { return ({ id: sponsorId }); }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.discard.addCards(this.inplay.getCards())];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerTable.prototype.cooldown = function (cards) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.addCards(cards)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerTable.prototype.payHeats = function (cards) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.discard.addCards(cards, { fromStock: this.engine })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
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
    PlayerTable.prototype.drawCardsPublic = function (n, areSponsors, deckCount) {
        return __awaiter(this, void 0, void 0, function () {
            var isReshuffled, count, before, after;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (areSponsors) {
                            return [2 /*return*/];
                        }
                        isReshuffled = this.deck.getCardNumber() < n;
                        if (!!isReshuffled) return [3 /*break*/, 1];
                        count = this.deck.getCardNumber() - n;
                        this.deck.setCardNumber(deckCount !== null && deckCount !== void 0 ? deckCount : count);
                        return [2 /*return*/, Promise.resolve(true)];
                    case 1:
                        before = this.deck.getCardNumber();
                        after = this.discard.getCardNumber() - (n - before);
                        this.deck.setCardNumber(this.discard.getCardNumber());
                        this.discard.setCardNumber(0);
                        return [4 /*yield*/, this.deck.shuffle()];
                    case 2:
                        _a.sent();
                        this.deck.setCardNumber(deckCount !== null && deckCount !== void 0 ? deckCount : after);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.drawCardsPrivate = function (cards, areSponsors, deckCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (areSponsors) {
                            return [2 /*return*/, this.hand.addCards(cards)];
                        }
                        return [4 /*yield*/, this.addCardsFromDeck(cards, this.hand)];
                    case 1:
                        _a.sent();
                        if (deckCount !== undefined) {
                            this.deck.setCardNumber(deckCount);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerTable.prototype.scrapCards = function (cards, deckCount) {
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
                        this.deck.addCard({ id: card.id }, undefined, {
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
                    case 6:
                        if (deckCount !== undefined) {
                            this.deck.setCardNumber(deckCount);
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.resolveBoost = function (cards, card, deckCount) {
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
                        this.deck.addCard({ id: card.id }, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        });
                        return [4 /*yield*/, this.inplay.addCard(card)];
                    case 4:
                        _a.sent();
                        if (deckCount !== undefined) {
                            this.deck.setCardNumber(deckCount);
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.salvageCards = function (cards, discardCards, deckCount) {
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
                        return [4 /*yield*/, this.deck.addCards(cards.map(function (card) { return ({ id: card.id }); }), undefined, undefined, true)];
                    case 1:
                        _a.sent();
                        this.deck.setCardNumber(deckCount !== null && deckCount !== void 0 ? deckCount : this.deck.getCardNumber());
                        return [4 /*yield*/, this.deck.shuffle()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.superCoolCards = function (cards, discardCards) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.discard.setCardNumber(discardCards.length + cards.length, discardCards[0]);
                        cards.forEach(function (heatCard) { return _this.discard.addCard(heatCard, undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        }); });
                        return [4 /*yield*/, this.engine.addCards(cards)];
                    case 1:
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
                        this.deck.setCardNumber(cardNumber);
                        return [4 /*yield*/, this.deck.shuffle()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerTable.prototype.addCardsFromDeck = function (cards, to) {
        return __awaiter(this, void 0, void 0, function () {
            var shuffleIndex, cardsBefore, cardsAfter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shuffleIndex = cards.findIndex(function (card) { return card.isReshuffled; });
                        if (!(shuffleIndex === -1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, to.addCards(cards, { fromStock: this.deck, }, undefined, 250)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        cardsBefore = cards.slice(0, shuffleIndex);
                        cardsAfter = cards.slice(shuffleIndex);
                        return [4 /*yield*/, to.addCards(cardsBefore, { fromStock: this.deck, }, undefined, 250)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.moveDiscardToDeckAndShuffle()];
                    case 4:
                        _a.sent();
                        this.deck.addCards(cardsAfter.map(function (card) { return ({ id: card.id }); }), undefined, {
                            autoUpdateCardNumber: false,
                            autoRemovePreviousCards: false,
                        });
                        return [4 /*yield*/, to.addCards(cardsAfter, { fromStock: this.deck, }, undefined, 250)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, true];
                }
            });
        });
    };
    PlayerTable.prototype.refreshHand = function (hand) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.hand.removeAll();
                return [2 /*return*/, this.hand.addCards(hand)];
            });
        });
    };
    PlayerTable.prototype.refreshUI = function (constructor) {
        return __awaiter(this, void 0, void 0, function () {
            var engineCards, discardCards;
            return __generator(this, function (_a) {
                this.deck.setCardNumber(constructor.deckCount);
                engineCards = Object.values(constructor.engine);
                this.engine.setCardNumber(engineCards.length, engineCards[0]);
                discardCards = Object.values(constructor.discard);
                this.discard.setCardNumber(discardCards.length, discardCards[0]);
                this.inplay.removeAll();
                this.inplay.addCards(Object.values(constructor.inplay));
                return [2 /*return*/];
            });
        });
    };
    return PlayerTable;
}());
var LegendTable = /** @class */ (function () {
    function LegendTable(game, legendCard) {
        this.game = game;
        var html = "\n        <div id=\"legend-table\">\n            <div id=\"legend-board\" class=\"player-board\">\n                <div id=\"legend-deck\" class=\"deck\"></div>\n                <div id=\"legend-discard\" class=\"discard\"></div>\n            </div>\n        </div>\n        ";
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        this.deck = new Deck(this.game.legendCardsManager, document.getElementById("legend-deck"), {
            cardNumber: 10,
            autoUpdateCardNumber: false,
            topCard: [],
            fakeCardGenerator: function () { return []; },
        });
        this.discard = new Deck(this.game.legendCardsManager, document.getElementById("legend-discard"), {
            cardNumber: legendCard ? 1 : 0,
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
var ChampionshipTable = /** @class */ (function () {
    function ChampionshipTable(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.gamedatas = gamedatas;
        var html = "\n        <div id=\"championship-table\">\n            <div id=\"championship-circuits-progress\" style=\"--race-count: ".concat(gamedatas.championship.circuits.length, ";\"><div></div>");
        gamedatas.championship.circuits.forEach(function (_, index) {
            return html += "\n                <div id=\"circuit-progress-".concat(index, "\" class=\"circuit-progress ").concat(gamedatas.championship.index > index ? 'finished' : '', "\">\n                    <div id=\"current-circuit-progress-").concat(index, "\" class=\"current-circuit-progress\"></div>\n                </div>");
        });
        html += "\n            </div>\n            <div id=\"championship-circuits\" data-folded=\"true\" style=\"--race-count: ".concat(gamedatas.championship.circuits.length, ";\">\n            <div class=\"championship-name\">\n                ").concat(_(gamedatas.championship.name), "\n                <button type=\"button\" id=\"scorepad-button\" class=\"bgabutton bgabutton_blue\"><div class=\"scorepad-icon\"></div></button>\n            </div>");
        gamedatas.championship.circuits.forEach(function (circuit, index) {
            return html += "\n            <div class=\"championship-circuit ".concat(gamedatas.championship.index == index ? 'current' : '', "\" data-index=\"").concat(index, "\">\n                <span class=\"circuit-name\">").concat(_(circuit.name), "</span>\n                ").concat(_this.game.eventCardsManager.getHtml(circuit.event), "\n            </div>\n            ");
        });
        html += "\n            </div>\n            <div id=\"current-championship-card-text\"></div>\n        </div>\n        ";
        document.getElementById('top').insertAdjacentHTML('afterbegin', html);
        /*document.querySelectorAll('.title-and-rule').forEach(titleAndRule => {
            const title = titleAndRule.querySelector('.title');
            if (title.clientHeight > 0) {
                (titleAndRule.querySelector('.rule') as HTMLDivElement).style.height = `${134 - title.clientHeight}px`;
            }
        });*/
        var championshipCircuits = document.getElementById('championship-circuits');
        championshipCircuits.addEventListener('click', function () {
            championshipCircuits.dataset.folded = (championshipCircuits.dataset.folded == 'false').toString();
        });
        this.setRaceProgress(gamedatas.progress);
        gamedatas.championship.circuits.forEach(function (circuit) { return _this.game.setTooltip("event-card-".concat(circuit.event), _this.game.eventCardsManager.getTooltip(circuit.event)); });
        document.getElementById('scorepad-button').addEventListener('click', function (e) { return _this.showScorepad(e); });
        this.setCurrentChampionshipCardText(gamedatas.championship.index);
    }
    ChampionshipTable.prototype.newChampionshipRace = function (index) {
        this.setRaceFinished(index - 1);
        document.querySelectorAll('.championship-circuit').forEach(function (elem) { return elem.classList.toggle('current', Number(elem.dataset.index) == index); });
        this.gamedatas.championship.index = index;
        this.setCurrentChampionshipCardText(index);
    };
    ChampionshipTable.prototype.setCurrentChampionshipCardText = function (index) {
        var event = this.gamedatas.championship.circuits[index].event;
        document.getElementById('current-championship-card-text').innerText = this.game.eventCardsManager.getTexts(event).rule;
    };
    ChampionshipTable.prototype.setRaceProgress = function (progress) {
        document.getElementById("current-circuit-progress-".concat(this.gamedatas.championship.index)).style.width = "".concat(Math.min(100, progress * 100), "%");
    };
    ChampionshipTable.prototype.setRaceFinished = function (index) {
        document.getElementById("circuit-progress-".concat(index)).classList.add('finished');
    };
    ChampionshipTable.prototype.getScorepadHtml = function (constructors, scores) {
        var html = "\n            <div class=\"scorepad-image\">\n                <table>\n                <tr class=\"names\">\n                    <th></th>";
        constructors.forEach(function (constructor) {
            html += "<td>";
            if (constructor) {
                html += "<div class=\"name\"><div class=\"constructor-avatar ".concat(constructor.ai ? 'legend' : 'player', "\" style=\"");
                if (constructor.ai) {
                    html += "--constructor-id: ".concat(constructor.id, ";");
                }
                else {
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    html += "background-image: url('".concat(document.getElementById("avatar_".concat(constructor.pId)).src, "');");
                }
                html += "\"></div><br><strong style=\"color: #".concat(CONSTRUCTORS_COLORS[constructor.id], ";\">").concat(_(constructor.name), "</strong></div>");
            }
            html += "</td>";
        });
        for (var i = constructors.length; i < 6; i++) {
            html += "<td></td>";
        }
        html += "</tr>";
        this.gamedatas.championship.circuits.forEach(function (circuit, index) {
            html += "\n            <tr>\n                <th>".concat(_(circuit.name), "</th>");
            constructors.forEach(function (constructor) {
                var _a;
                html += "<td class=\"score\">";
                if (((_a = scores[index]) === null || _a === void 0 ? void 0 : _a[constructor.id]) !== undefined) {
                    html += "".concat(scores[index][constructor.id]);
                    if (index > 0) {
                        html += "<div class=\"subTotal\">".concat(Array.from(Array(index + 1)).map(function (_, subIndex) { return scores[subIndex][constructor.id]; }).reduce(function (a, b) { return a + b; }, 0), "</div>");
                    }
                }
                html += "</td>";
            });
            for (var i = constructors.length; i < 6; i++) {
                html += "<td></td>";
            }
            html += "</tr>";
        });
        html += "</table></div>\n        ";
        return html;
    };
    ChampionshipTable.prototype.chunk = function (arr, chunkSize) {
        if (chunkSize === void 0) { chunkSize = 6; }
        var chunks = [];
        for (var i = 0; i < arr.length; i += chunkSize) {
            chunks.push(arr.slice(i, i + chunkSize));
        }
        return chunks;
    };
    ChampionshipTable.prototype.showScorepad = function (e) {
        var _this = this;
        e.stopImmediatePropagation();
        var scorepadDialog = new ebg.popindialog();
        scorepadDialog.create('scorepadDialog');
        scorepadDialog.setTitle(_(this.gamedatas.championship.name));
        var padConstructors = this.chunk(Object.values(this.gamedatas.constructors));
        var html = "<div id=\"scorepad-popin\">".concat(padConstructors.map(function (pad) { return _this.getScorepadHtml(pad, _this.gamedatas.scores); }).join(''), "</div>");
        // Show the dialog
        scorepadDialog.setContent(html);
        scorepadDialog.show();
    };
    return ChampionshipTable;
}());
var ANIMATION_MS = 500;
var MIN_NOTIFICATION_MS = 1200;
var ACTION_TIMER_DURATION = 5;
var LOCAL_STORAGE_ZOOM_KEY = 'Heat-zoom';
var LOCAL_STORAGE_CIRCUIT_ZOOM_KEY = 'Heat-circuit-zoom';
var LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'Heat-jump-to-folded';
var CONSTRUCTORS_COLORS = ['12151a', '376bbe', '26a54e', 'e52927', '979797', 'face0d', 'f37321', '811b8f']; // copy of gameinfos
var SYMBOLS_WITH_POSSIBLE_HALF_USAGE = ['cooldown', 'reduce', 'scrap'];
var HAND_CARD_TYPE_FOR_EFFECT = {
    reduce: 'stress',
    cooldown: 'heat',
};
// @ts-ignore
GameGui = (function () {
    // this hack required so we fake extend GameGui
    function GameGui() { }
    return GameGui;
})();
var Heat = /** @class */ (function (_super) {
    __extends(Heat, _super);
    function Heat() {
        var _this = _super.call(this) || this;
        _this.playersTables = [];
        _this.cornerCounters = [];
        _this.gearCounters = [];
        _this.engineCounters = [];
        _this.speedCounters = [];
        _this.lapCounters = [];
        _this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        _this._notif_uid_to_log_id = [];
        _this._notif_uid_to_mobile_log_id = [];
        Object.assign(_this, _this.bga);
        return _this;
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
        var _a, _b;
        this.gameArea.getElement().insertAdjacentHTML('beforeend', "\n      <link rel=\"stylesheet\" href=\"https://use.typekit.net/jim0ypy.css\">\n\n      <div id=\"top\">\n      </div>\n\n      <div id=\"table-center\">\n          <div id=\"circuit\"></div>\n      </div>\n      <div id=\"tables\"></div>  \n    ");
        log('Starting game setup');
        this.gamedatas = gamedatas;
        // Create a new div for buttons to avoid BGA auto clearing it
        // @ts-ignore
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        // @ts-ignore
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');
        if (((_a = gamedatas.circuitDatas) === null || _a === void 0 ? void 0 : _a.jpgUrl) && !gamedatas.circuitDatas.jpgUrl.startsWith('http')) {
            g_img_preload.push(gamedatas.circuitDatas.jpgUrl);
        }
        //g_img_preload.push(...Object.values(gamedatas.players).map(player => `mats/player-board-${player.color}.jpg`));
        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", 'generalactions', 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", 'customActions', 'after');
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.legendCardsManager = new LegendCardsManager(this);
        this.eventCardsManager = new EventCardsManager(this);
        var jumpToEntries = [new JumpToEntry(_('Circuit'), 'table-center', { color: '#222222' })];
        if (gamedatas.isLegend) {
            jumpToEntries.push(new JumpToEntry(_('Legends'), 'legend-board', { color: '#39464c' }));
        }
        if (gamedatas.championship) {
            jumpToEntries.unshift(new JumpToEntry(_('Championship'), 'championship-table', { color: '#39464c' }));
        }
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: jumpToEntries,
            entryClasses: 'round-point',
            defaultFolded: true,
        });
        this.circuit = new Circuit(this, gamedatas);
        if (gamedatas.championship) {
            this.championshipTable = new ChampionshipTable(this, gamedatas);
        }
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        var constructorId = this.getConstructorId();
        var constructor = this.gamedatas.constructors[constructorId];
        if (constructorId !== null && ((_b = constructor === null || constructor === void 0 ? void 0 : constructor.planification) === null || _b === void 0 ? void 0 : _b.length) && constructor.speed < 0) {
            this.updatePlannedCards(constructor.planification);
        }
        this.circuitZoomManager = new ZoomManager({
            element: document.getElementById('table-center'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            defaultZoom: 0.625,
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            autoZoom: {
                expectedWidth: 1550,
            },
        });
        this.tablesZoomManager = new ZoomManager({
            element: document.getElementById('tables'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            defaultZoom: 1,
            localStorageZoomKey: LOCAL_STORAGE_CIRCUIT_ZOOM_KEY,
            autoZoom: {
                expectedWidth: 1200,
            },
        });
        new HelpManager(this, {
            buttons: [
                new BgaHelpPopinButton({
                    title: _('Help'),
                    html: this.getHelpHtml(),
                    buttonBackground: '#d61b1a',
                }),
            ],
        });
        this.setupNotifications();
        window['BgaAutofit'].init();
        log('Ending game setup');
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    Heat.prototype.addDangerActionButton = function (id, text, callback, zone) {
        if (zone === void 0) { zone = 'customActions'; }
        if (!$(id))
            this.statusBar.addActionButton(text, callback, { id: id, destination: $(zone), color: 'alert' });
    };
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Heat.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        log('Entering state: ' + stateName, args.args);
        if ((_a = args.args) === null || _a === void 0 ? void 0 : _a.descSuffix) {
            this.changePageTitle(args.args.descSuffix);
        }
        if ((_b = args.args) === null || _b === void 0 ? void 0 : _b.optionalAction) {
            var base = args.args.descSuffix ? args.args.descSuffix : '';
            this.changePageTitle(base + 'skippable');
        }
        if (this.players.isCurrentPlayerActive()) {
            if ((_c = args.args) === null || _c === void 0 ? void 0 : _c.previousSteps) {
                document
                    .getElementById('logs')
                    .querySelectorAll(".log.notif_newUndoableStep")
                    .forEach(function (undoNotif) {
                    var _a;
                    if (!((_a = args.args) === null || _a === void 0 ? void 0 : _a.previousSteps.includes(Number(undoNotif.dataset.step)))) {
                        undoNotif.style.display = 'none';
                    }
                });
            }
            // Undo last steps
            (_e = (_d = args.args) === null || _d === void 0 ? void 0 : _d.previousSteps) === null || _e === void 0 ? void 0 : _e.forEach(function (stepId) {
                var logEntry = $('logs').querySelector(".log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
                if (logEntry) {
                    _this.onClick(logEntry, function (e) { return _this.undoToStep(stepId, e); });
                }
                logEntry = document.querySelector(".chatwindowlogs_zone .log.notif_newUndoableStep[data-step=\"".concat(stepId, "\"]"));
                if (logEntry) {
                    _this.onClick(logEntry, function (e) { return _this.undoToStep(stepId, e); });
                }
            });
            // Restart turn button
            //if (args.args?.previousEngineChoices >= 1 && !args.args.automaticAction) {
            if (((_f = args.args) === null || _f === void 0 ? void 0 : _f.undoableSteps) && args.args.undoableSteps.length) {
                var lastStep_1 = Math.max.apply(Math, args.args.undoableSteps);
                if (lastStep_1 > 0) {
                    this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), function (e) { return _this.undoToStep(lastStep_1, e); }, 'restartAction');
                }
                // Restart whole turn
                this.addDangerActionButton('btnRestartTurn', _('Restart turn'), function () {
                    //this.stopActionTimer();
                    _this.actions.performAction('actRestartTurn');
                }, 'restartAction');
            }
            //}
        }
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
            case 'planification':
                this.updatePlannedCards((_h = (_g = args.args._private) === null || _g === void 0 ? void 0 : _g.selection) !== null && _h !== void 0 ? _h : []);
                break;
            case 'react':
                this.onEnteringReact(args.args);
                break;
            case 'oldReact':
                this.onEnteringOldReact(args.args);
                break;
            case 'gameEnd':
                (_j = document.getElementById('leave-text-action')) === null || _j === void 0 ? void 0 : _j.remove();
                break;
        }
    };
    Heat.prototype.changePageTitle = function (suffix, save) {
        var _a, _b;
        if (suffix === void 0) { suffix = null; }
        if (save === void 0) { save = false; }
        var title = this.players.isCurrentPlayerActive()
            ? (_a = this.gamedatas.gamestate['descriptionmyturn' + suffix]) !== null && _a !== void 0 ? _a : this.gamedatas.gamestate['descriptionmyturn']
            : (_b = this.gamedatas.gamestate['description' + suffix]) !== null && _b !== void 0 ? _b : this.gamedatas.gamestate['description'];
        this.statusBar.setTitle(title, this.gamedatas.gamestate.args);
    };
    Heat.prototype.onEnteringStateUploadCircuit = function (args) {
        var _this = this;
        // this.clearInterface();
        document.getElementById('circuit').insertAdjacentHTML('beforeend', "\n        <div id=\"circuit-dropzone-container\">\n            <div id=\"circuit-dropzone\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z\"/></svg>\n\n            <input type=\"file\" id=\"circuit-input\" />\n            <label for=\"circuit-input\">".concat(_('Choose circuit'), "</label>\n            <h5>").concat(_('or drag & drop your .heat file here'), "</h5>\n            </div>\n        </div>\n        "));
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
            _this.ajaxcall(
            // @ts-ignore
            "/".concat(_this.game_name, "/").concat(_this.game_name, "/actUploadCircuit.html"), { circuit: JSON.stringify(circuit), lock: true }, _this, function () { }, undefined, // @ts-ignore
            'post');
        });
    };
    Heat.prototype.initMarketStock = function () {
        var _this = this;
        var _a;
        if (!this.market) {
            var constructor = Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); });
            document.getElementById('top').insertAdjacentHTML('afterbegin', "\n                <div id=\"market\" style=\"--personal-card-background-y: ".concat((((_a = constructor === null || constructor === void 0 ? void 0 : constructor.id) !== null && _a !== void 0 ? _a : 0) * 100) / 7, "%;\"></div>\n            "));
            this.market = new LineStock(this.cardsManager, document.getElementById("market"));
            this.market.onSelectionChange = function (selection) { return _this.onMarketSelectionChange(selection); };
        }
    };
    Heat.prototype.onEnteringChooseUpgrade = function (args) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));
        this.market.setSelectionMode(this.players.isCurrentPlayerActive() ? 'single' : 'none');
    };
    Heat.prototype.onEnteringSwapUpgrade = function (args) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));
        this.market.setSelectionMode(this.players.isCurrentPlayerActive() ? 'single' : 'none');
        if (this.players.isCurrentPlayerActive()) {
            var hand = this.getCurrentPlayerTable().hand;
            hand.removeAll();
            hand.addCards(Object.values(args.owned));
            hand.setSelectionMode('single');
        }
    };
    Heat.prototype.onEnteringSnakeDiscard = function (args) {
        var playerTable = this.getCurrentPlayerTable();
        playerTable.inplay.unselectAll();
        playerTable.inplay.setSelectionMode(this.players.isCurrentPlayerActive() ? 'single' : 'none');
        var cards = playerTable.inplay.getCards();
        if (args._private.choice) {
            playerTable.inplay.selectCard(cards.find(function (card) { return Number(card.id) == Number(args._private.choice); }));
        }
    };
    Heat.prototype.onEnteringPlanification = function (args) {
        this.circuit.removeMapPaths();
        if (args._private) {
            this.getCurrentPlayerTable().setHandSelectable(this.players.isCurrentPlayerActive() ? 'multiple' : 'none', args._private.cards, args._private.selection);
        }
    };
    Heat.prototype.onEnteringReact = function (args) {
        var _this = this;
        this.circuit.removeCornerHeatIndicators();
        if (args.heatCosts) {
            Object.entries(args.heatCosts).forEach(function (_a) {
                var cornerId = _a[0], heat = _a[1];
                return _this.circuit.addCornerHeatIndicator(Number(cornerId), heat);
            });
        }
    };
    Heat.prototype.onEnteringOldReact = function (args) {
        var _this = this;
        this.circuit.removeCornerHeatIndicators();
        if (args.heatCosts) {
            Object.entries(args.heatCosts).forEach(function (_a) {
                var cornerId = _a[0], heat = _a[1];
                return _this.circuit.addCornerHeatIndicator(Number(cornerId), heat);
            });
        }
    };
    Heat.prototype.updatePlannedCards = function (plannedCardsIds) {
        var _a;
        document.querySelectorAll(".planned-card").forEach(function (elem) { return elem.classList.remove('planned-card'); });
        if (plannedCardsIds === null || plannedCardsIds === void 0 ? void 0 : plannedCardsIds.length) {
            var hand_1 = (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.hand;
            if (hand_1) {
                var cards_1 = hand_1.getCards();
                plannedCardsIds === null || plannedCardsIds === void 0 ? void 0 : plannedCardsIds.forEach(function (id) {
                    var _a;
                    var card = cards_1.find(function (card) { return Number(card.id) == id; });
                    if (card) {
                        (_a = hand_1.getCardElement(card)) === null || _a === void 0 ? void 0 : _a.classList.add('planned-card');
                    }
                });
            }
        }
    };
    Heat.prototype.onEnteringChooseSpeed = function (args) {
        var _this = this;
        this.circuit.removeMapPaths();
        Object.entries(args.speeds).forEach(function (_a) {
            var speedStr = _a[0], speedChoice = _a[1];
            var speed = Number(speedStr);
            _this.circuit.addMapIndicator(speedChoice.cell, function () { return _this.actChooseSpeed(speed, speedChoice.choices[0]); }, speed);
        });
    };
    Heat.prototype.onEnteringSlipstream = function (args) {
        var _this = this;
        this.circuit.removeCornerHeatIndicators();
        if (args.currentHeatCosts) {
            Object.entries(args.currentHeatCosts).forEach(function (_a) {
                var cornerId = _a[0], heat = _a[1];
                return _this.circuit.addCornerHeatIndicator(Number(cornerId), heat);
            });
        }
        Object.entries(args.speeds).forEach(function (_a) {
            var speedStr = _a[0], speedChoice = _a[1];
            return _this.circuit.addMapIndicator(speedChoice, function () { return _this.actSlipstream(Number(speedStr)); }, _this.speedCounters[_this.getConstructorId()].getValue(), false);
        });
    };
    Heat.prototype.onEnteringPayHeats = function (args) {
        var inplay = this.getCurrentPlayerTable().inplay;
        var ids = Object.keys(args.payingCards).map(Number);
        inplay.setSelectionMode('multiple', inplay.getCards().filter(function (card) { return ids.includes(card.id); }));
    };
    Heat.prototype.onEnteringDiscard = function (args) {
        this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
    };
    Heat.prototype.onEnteringSalvage = function (args) {
        var _this = this;
        var _a;
        if (!this.market) {
            var constructor = Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); });
            document.getElementById('top').insertAdjacentHTML('afterbegin', "\n                <div id=\"market\" style=\"--personal-card-background-y: ".concat((((_a = constructor === null || constructor === void 0 ? void 0 : constructor.id) !== null && _a !== void 0 ? _a : 0) * 100) / 7, "%;\"></div>\n            "));
            this.market = new LineStock(this.cardsManager, document.getElementById("market"));
            this.market.onSelectionChange = function (selection) {
                document.getElementById("actSalvage_button").classList.toggle('disabled', selection.length > args.n);
            };
        }
        // negative ids to not mess with deck pile
        this.market.addCards(Object.values(args._private.cards).map(function (card) { return (__assign(__assign({}, card), { id: -card.id })); }));
        this.market.setSelectionMode(this.players.isCurrentPlayerActive() ? 'multiple' : 'none');
    };
    Heat.prototype.onEnteringSuperCool = function (args) {
        var _this = this;
        var _a;
        if (!this.market) {
            var constructor = Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); });
            document.getElementById('top').insertAdjacentHTML('afterbegin', "\n                <div id=\"market\" style=\"--personal-card-background-y: ".concat((((_a = constructor === null || constructor === void 0 ? void 0 : constructor.id) !== null && _a !== void 0 ? _a : 0) * 100) / 7, "%;\"></div>\n            "));
            this.market = new LineStock(this.cardsManager, document.getElementById("market"));
        }
        // negative ids to not mess with deck pile
        this.market.addCards(Object.values(args._private.cards).map(function (card) { return (__assign(__assign({}, card), { id: -card.id })); }));
        this.market.setSelectionMode('none');
    };
    Heat.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        this.statusBar.removeActionButtons();
        document.getElementById('customActions').innerHTML = '';
        document.getElementById('restartAction').innerHTML = '';
        switch (stateName) {
            case 'snakeDiscard':
                this.onLeavingSnakeDiscard();
                break;
            case 'planification':
                this.onLeavingPlanification();
                break;
            case 'chooseSpeed':
                this.onLeavingChooseSpeed();
                break;
            case 'react':
                this.onLeavingReact();
                break;
            case 'slipstream':
                this.onLeavingSlipstream();
                break;
            case 'payHeats':
                this.onLeavingPayHeats();
                break;
            case 'discard':
                this.onLeavingHandSelection();
                break;
            case 'salvage':
                this.onLeavingSalvage();
                break;
            case 'superCool':
                this.onLeavingSuperCool();
                break;
        }
    };
    Heat.prototype.onLeavingSnakeDiscard = function () {
        if (this.players.isCurrentPlayerActive()) {
            var playerTable = this.getCurrentPlayerTable();
            playerTable.inplay.setSelectionMode('none');
        }
    };
    Heat.prototype.onLeavingChooseSpeed = function () {
        this.circuit.removeMapIndicators();
    };
    Heat.prototype.onLeavingReact = function () {
        document.querySelectorAll('.hand-wrapper .action-button').forEach(function (elem) { return elem.remove(); });
    };
    Heat.prototype.onLeavingSlipstream = function () {
        this.circuit.removeMapIndicators();
        this.circuit.removeCornerHeatIndicators();
    };
    Heat.prototype.onLeavingPlanification = function () {
        this.onLeavingHandSelection();
        this.circuit.removeMapIndicators();
    };
    Heat.prototype.onLeavingHandSelection = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setHandSelectable('none');
    };
    Heat.prototype.onLeavingPayHeats = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.inplay.setSelectionMode('none');
    };
    Heat.prototype.onLeavingSalvage = function () {
        var _a;
        (_a = this.market) === null || _a === void 0 ? void 0 : _a.remove();
        this.market = null;
    };
    Heat.prototype.onLeavingSuperCool = function () {
        var _a;
        (_a = this.market) === null || _a === void 0 ? void 0 : _a.remove();
        this.market = null;
    };
    Heat.prototype.createChooseSpeedButtons = function (args) {
        var _this = this;
        Object.entries(args.speeds).forEach(function (_a) {
            var speedStr = _a[0], speedChoice = _a[1];
            var speed = Number(speedStr);
            var label = _('Move ${cell} cell(s)').replace('${cell}', "".concat(speed));
            if (speedChoice.heatCosts) {
                label += " (".concat(speedChoice.heatCosts, "[Heat])");
            }
            var button = _this.statusBar.addActionButton(formatTextIcons(label), function () {
                return _this.actChooseSpeed(speed, speedChoice.choices[0]);
            });
            _this.linkButtonHoverToMapIndicator(button, speedChoice.cell);
        });
    };
    Heat.prototype.createSlipstreamButtons = function (args) {
        var _this = this;
        Object.entries(args.speeds).forEach(function (_a) {
            var speedStr = _a[0], speedChoice = _a[1];
            var speed = Number(speedStr);
            var label = _('Move ${cell} cell(s)').replace('${cell}', "".concat(speed));
            /*if (args.heatCosts[speed]) {
                      label += ` (${args.heatCosts[speed]}[Heat])`;
                  }*/
            var confirmationMessage = _this.getSlipstreamConfirmation(args, speed);
            var finalAction = function () { return _this.actSlipstream(speed); };
            var callback = confirmationMessage ? function () { return _this.confirmationDialog(confirmationMessage, finalAction); } : finalAction;
            var button = _this.statusBar.addActionButton(formatTextIcons(label), callback);
            _this.linkButtonHoverToMapIndicator(button, speedChoice);
        });
    };
    Heat.prototype.showHeatCostConfirmations = function () {
        return !this.userPreferences.get(201);
    };
    Heat.prototype.getAdrenalineConfirmation = function (currentHeatCost, adrenalineWillCrossNextCorner, nextCornerSpeedLimit, nextCornerExtraHeatCost, boostInfos) {
        var confirmationMessage = null;
        adrenalineWillCrossNextCorner = this.cornerCounters[this.getConstructorId()].getValue() == 0 && adrenalineWillCrossNextCorner;
        var adrenalineCostOnCurrentCorner = (boostInfos === null || boostInfos === void 0 ? void 0 : boostInfos[1]) ? Object.values(boostInfos[1]).reduce(function (a, b) { return a + b; }, 0) : 0;
        if (adrenalineWillCrossNextCorner || currentHeatCost > 0 || adrenalineCostOnCurrentCorner > 0) {
            var newSpeed = this.speedCounters[this.getConstructorId()].getValue() + 1;
            var newHeatCost = currentHeatCost > 0 ? currentHeatCost + 1 : 0;
            var newCornerCost = 0;
            if (adrenalineWillCrossNextCorner) {
                newCornerCost = Math.max(0, newSpeed - nextCornerSpeedLimit);
                if (newCornerCost > 0 && nextCornerExtraHeatCost) {
                    newCornerCost++;
                }
                newHeatCost += newCornerCost;
            }
            else if (adrenalineCostOnCurrentCorner) {
                newHeatCost = adrenalineCostOnCurrentCorner;
            }
            if (newHeatCost > 0) {
                if (adrenalineWillCrossNextCorner) {
                    confirmationMessage =
                        _('The Adrenaline reaction will make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).')
                            .replace('${speed}', "<strong>".concat(newSpeed, "</strong>"))
                            .replace('${speedLimit}', "<strong>".concat(nextCornerSpeedLimit, "</strong>")) + "<br>";
                }
                else {
                    confirmationMessage = '';
                }
                if (currentHeatCost > 0) {
                    confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
                        .replace('${heat}', "<strong>".concat(currentHeatCost, "</strong>"))
                        .replace('${newHeat}', "<strong>".concat(newHeatCost, "</strong>"));
                }
                else {
                    confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace('${newHeat}', "<strong>".concat(newHeatCost, "</strong>"));
                }
                confirmationMessage += "<br><br>\n                ".concat(_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', "<strong>".concat(this.engineCounters[this.getConstructorId()].getValue(), "</strong>")));
            }
        }
        return confirmationMessage;
    };
    Heat.prototype.getBoostConfirmation = function (currentHeatCost, nextCornerSpeedLimit, nextCornerExtraHeatCost, boostInfos, paid) {
        var mayCrossCorner = this.cornerCounters[this.getConstructorId()].getValue() < 4;
        var confirmationMessage = null;
        var boostCostOnCurrentCorner = (boostInfos === null || boostInfos === void 0 ? void 0 : boostInfos[4]) ? Object.values(boostInfos[4]).reduce(function (a, b) { return a + b; }, 0) : 0;
        if (mayCrossCorner || currentHeatCost > 0 || boostCostOnCurrentCorner > 0) {
            var newSpeedMax = this.speedCounters[this.getConstructorId()].getValue() + 4;
            var newHeatCostMax = boostCostOnCurrentCorner + (paid ? 1 : 0);
            var newCornerCostMax = 0;
            if (mayCrossCorner) {
                newCornerCostMax = Math.max(0, newSpeedMax - nextCornerSpeedLimit);
                if (newCornerCostMax > 0 && nextCornerExtraHeatCost) {
                    newCornerCostMax++;
                }
                newHeatCostMax += newCornerCostMax;
            }
            if (newHeatCostMax > 0) {
                if (mayCrossCorner) {
                    confirmationMessage =
                        _('The Boost reaction may make you cross a <strong>new</strong> corner at a speed up to ${speed} (Corner speed limit: ${speedLimit}).')
                            .replace('${speed}', "<strong>".concat(newSpeedMax, "</strong>"))
                            .replace('${speedLimit}', "<strong>".concat(nextCornerSpeedLimit, "</strong>")) + "<br>";
                }
                else {
                    confirmationMessage = '';
                }
                if (currentHeatCost > 0) {
                    confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change up to ${newHeat} Heat(s).')
                        .replace('${heat}', "<strong>".concat(currentHeatCost, "</strong>"))
                        .replace('${newHeat}', "<strong>".concat(newHeatCostMax, "</strong>"));
                }
                else {
                    confirmationMessage += _('You will have to pay up to ${newHeat} Heat(s).').replace('${newHeat}', "<strong>".concat(newHeatCostMax, "</strong>"));
                }
                confirmationMessage += "<br><br>\n                ".concat(_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', "<strong>".concat(this.engineCounters[this.getConstructorId()].getValue(), "</strong>")));
            }
        }
        return confirmationMessage;
    };
    Heat.prototype.getDirectPlayConfirmation = function (currentHeatCost, nextCornerSpeedLimit, directPlayCosts, card) {
        var willCrossCorner = this.cornerCounters[this.getConstructorId()].getValue() < card.speed;
        var newHeatCost = Object.values(directPlayCosts[card.id]).reduce(function (a, b) { return a + b; }, 0);
        var confirmationMessage = null;
        if (currentHeatCost < newHeatCost) {
            var newSpeed = this.speedCounters[this.getConstructorId()].getValue() + card.speed;
            if (willCrossCorner) {
                confirmationMessage =
                    _('The Direct Play reaction may make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).')
                        .replace('${speed}', "<strong>".concat(newSpeed, "</strong>"))
                        .replace('${speedLimit}', "<strong>".concat(nextCornerSpeedLimit, "</strong>")) + "<br>";
            }
            else {
                confirmationMessage = '';
            }
            if (currentHeatCost > 0) {
                confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
                    .replace('${heat}', "<strong>".concat(currentHeatCost, "</strong>"))
                    .replace('${newHeat}', "<strong>".concat(newHeatCost, "</strong>"));
            }
            else {
                confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace('${newHeat}', "<strong>".concat(newHeatCost, "</strong>"));
            }
            confirmationMessage += "<br><br>\n            ".concat(_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', "<strong>".concat(this.engineCounters[this.getConstructorId()].getValue(), "</strong>")));
        }
        return confirmationMessage;
    };
    Heat.prototype.getSlipstreamConfirmation = function (reactArgs, slipstream) {
        var confirmationMessage = null;
        var slipstreamWillCrossNextCorner = this.cornerCounters[this.getConstructorId()].getValue() < slipstream && reactArgs.slipstreamWillCrossNextCorner[slipstream];
        if (slipstreamWillCrossNextCorner) {
            var speed = this.speedCounters[this.getConstructorId()].getValue();
            var newHeatCost = reactArgs.heatCosts[slipstream];
            if (newHeatCost > reactArgs.currentHeatCost) {
                confirmationMessage =
                    _('The Slipstream move will make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).')
                        .replace('${speed}', "<strong>".concat(speed, "</strong>"))
                        .replace('${speedLimit}', "<strong>".concat(reactArgs.nextCornerSpeedLimit, "</strong>")) + "<br>";
                if (reactArgs.currentHeatCost > 0) {
                    confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
                        .replace('${heat}', "<strong>".concat(reactArgs.currentHeatCost, "</strong>"))
                        .replace('${newHeat}', "<strong>".concat(newHeatCost, "</strong>"));
                }
                else {
                    confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace('${newHeat}', "<strong>".concat(newHeatCost, "</strong>"));
                }
                confirmationMessage += "<br><br>\n                    ".concat(_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', "<strong>".concat(this.engineCounters[this.getConstructorId()].getValue(), "</strong>")));
            }
        }
        return confirmationMessage;
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Heat.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        log('onUpdateActionButtons: ' + stateName, args);
        switch (stateName) {
            case 'snakeDiscard':
                this.onEnteringSnakeDiscard(args);
                break;
            case 'planification':
                this.onEnteringPlanification(args);
                break;
        }
        if (this.players.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'chooseUpgrade':
                    this.statusBar.addActionButton(_('Take selected card'), function () { return _this.actChooseUpgrade(); }, {
                        id: "actChooseUpgrade_button",
                    });
                    document.getElementById("actChooseUpgrade_button").classList.add('disabled');
                    break;
                case 'swapUpgrade':
                    this.statusBar.addActionButton(_('Swap selected cards'), function () { return _this.actSwapUpgrade(); }, { id: "actSwapUpgrade_button" });
                    document.getElementById("actSwapUpgrade_button").classList.add('disabled');
                    this.statusBar.addActionButton(_('Pass'), function () { return _this.actPassSwapUpgrade(); }, {
                        id: "actPassSwapUpgrade_button",
                        color: 'alert',
                    });
                    break;
                case 'snakeDiscard':
                    this.statusBar.addActionButton(_('Discard selected card'), function () { return _this.actSnakeDiscard(); }, {
                        id: "actSnakeDiscard_button",
                    });
                    this.checkSnakeDiscardSelectionState();
                    break;
                case 'planification':
                    var planificationArgs = args;
                    this.statusBar.addActionButton('', function () { return _this.actPlanification(); }, { id: "actPlanification_button" });
                    if (planificationArgs._private.canMulligan) {
                        this.statusBar.addActionButton(_('Mulligan') + formatTextIcons(' (1[Heat])'), function () { return _this.actions.performAction('actMulligan'); }, {
                            id: 'mulligan-btn',
                            color: 'alert',
                            confirm: _('Spend 1 Heat to draw a new hand?'),
                        });
                    }
                    this.onHandCardSelectionChange(this.getCurrentPlayerTable().hand.getSelection());
                    if ((_a = planificationArgs._private) === null || _a === void 0 ? void 0 : _a.canSkipEndRace) {
                        var giveUpMessage_1 = _('If you give up, you will be ranked last.');
                        if (planificationArgs.nPlayersLeft > 1) {
                            giveUpMessage_1 += '<br><br>' + _('You are not the only player remaining, so there is still hope!');
                        }
                        this.statusBar.addActionButton(_('I want to give up this race'), function () { return _this.confirmationDialog(giveUpMessage_1, function () { return _this.actGiveUp(); }); }, { color: 'secondary' });
                    }
                    break;
                case 'chooseSpeed':
                    var chooseSpeedArgs = args;
                    this.onEnteringChooseSpeed(chooseSpeedArgs);
                    this.createChooseSpeedButtons(chooseSpeedArgs);
                    break;
                case 'slipstream':
                    var slipstreamArgs = args;
                    if (args.speeds) {
                        this.onEnteringSlipstream(slipstreamArgs);
                        this.createSlipstreamButtons(slipstreamArgs);
                    }
                    this.statusBar.addActionButton(_('Pass'), function () { return _this.actSlipstream(0); });
                    break;
                case 'react':
                    this.onUpdateActionButtons_react(args);
                    break;
                case 'oldReact':
                    this.onUpdateActionButtons_oldReact(args);
                    break;
                case 'payHeats':
                    this.onEnteringPayHeats(args);
                    this.statusBar.addActionButton(formatTextIcons(_('Keep selected cards (max: ${number} [Heat])').replace('${number}', args.heatInReserve)), function () { return _this.actPayHeats(_this.getCurrentPlayerTable().inplay.getSelection()); }, { id: "actPayHeats_button" });
                    this.onInPlayCardSelectionChange([]);
                    break;
                case 'checkCorner':
                    if (args.spinOut) {
                        this.statusBar.addActionButton(_('SPIN OUT'), function () { return _this.actCheckCorner(); }, { color: 'alert' });
                    }
                    else {
                        this.statusBar.addActionButton(_('Pay'), function () { return _this.actCheckCorner(); }, { autoclick: true });
                    }
                    break;
                case 'discard':
                    this.onEnteringDiscard(args);
                    if ((_c = (_b = args._private) === null || _b === void 0 ? void 0 : _b.refreshedIds) === null || _c === void 0 ? void 0 : _c.length) {
                        (_d = args._private) === null || _d === void 0 ? void 0 : _d.refreshedIds.forEach(function (number) {
                            var refreshCard = _this.getCurrentPlayerTable()
                                .inplay.getCards()
                                .find(function (card) { return card.id == number; });
                            var label = "<div class=\"icon refresh\"></div>".concat(_('Place back on deck'), "<br>\n                            ").concat(_this.cardImageHtml(refreshCard, { constructor_id: _this.getConstructorId() }));
                            var tooltip = _this.getGarageModuleIconTooltipWithIcon('refresh', 1);
                            _this.statusBar.addActionButton(formatTextIcons(label), function () { return _this.actRefresh(number); }, {
                                id: "actRefresh_".concat(number, "_button"),
                            });
                            _this.setTooltip("actRefresh_".concat(number, "_button"), formatTextIcons(tooltip));
                        });
                    }
                    this.statusBar.addActionButton(_('No additional discard'), function () { return _this.actDiscard([]); }, {
                        color: 'alert',
                        confirm: ((_f = (_e = args._private) === null || _e === void 0 ? void 0 : _e.refreshedIds) === null || _f === void 0 ? void 0 : _f.length)
                            ? _("Are you sure you don't want to refresh some of the played cards?")
                            : null,
                        id: 'actNoDiscard_button',
                    });
                    this.statusBar.addActionButton('', function () { return _this.actDiscard(_this.getCurrentPlayerTable().hand.getSelection()); }, {
                        confirm: ((_h = (_g = args._private) === null || _g === void 0 ? void 0 : _g.refreshedIds) === null || _h === void 0 ? void 0 : _h.length)
                            ? _("Are you sure you don't want to refresh some of the played cards?")
                            : null,
                        id: 'actDiscard_button',
                    });
                    this.onHandCardSelectionChange([]);
                    break;
                case 'salvage':
                    this.onEnteringSalvage(args);
                    this.statusBar.addActionButton(_('Salvage selected cards'), function () { return _this.actSalvage(); }, { id: "actSalvage_button" });
                    break;
                case 'superCool':
                    this.onEnteringSuperCool(args);
                    var _loop_3 = function (i) {
                        this_1.statusBar.addActionButton("<div class=\"icon super-cool\">".concat(i, "</div>"), function () { return _this.actSuperCool(i); }, {
                            id: "actSuperCool".concat(i, "_button"),
                        });
                        if (i > args._private.max) {
                            document.getElementById("actSuperCool".concat(i, "_button")).classList.add('disabled');
                        }
                    };
                    var this_1 = this;
                    for (var i = args.n; i >= 0; i--) {
                        _loop_3(i);
                    }
                    break;
                case 'confirmEndOfRace':
                    this.statusBar.addActionButton(_('Seen'), function () { return _this.actConfirmResults(); }, { id: "seen_button" });
                    break;
            }
        }
        else {
            switch (stateName) {
                case 'snakeDiscard':
                    this.statusBar.addActionButton(_('Cancel'), function () { return _this.actions.performAction('actCancelSnakeDiscard', undefined, { checkAction: false }); }, {
                        id: "actCancelSnakeDiscard_button",
                        color: 'secondary',
                    });
                    break;
                case 'planification':
                    if (!this.gamedatas.isDeferredRounds) {
                        this.statusBar.addActionButton(_('Cancel'), function () { return _this.actCancelSelection(); }, {
                            id: "actCancelSelection_button",
                            color: 'secondary',
                        });
                    }
                    break;
            }
        }
    };
    Heat.prototype.getMandatoryZone = function (destination) {
        var mandatoryZoneId = "".concat(destination ? destination.id : '', "mandatory-buttons");
        var mandatoryZone = document.getElementById(mandatoryZoneId);
        if (!mandatoryZone) {
            mandatoryZone = document.createElement('div');
            mandatoryZone.classList.add('mandatory-buttons');
            mandatoryZone.id = mandatoryZoneId;
            mandatoryZone.innerHTML = "<div class=\"mandatory icon\"></div>";
            (destination !== null && destination !== void 0 ? destination : document.getElementById('generalactions')).insertAdjacentElement('afterbegin', mandatoryZone);
        }
        return mandatoryZone;
    };
    Heat.prototype.addReactButton = function (type, entries, symbolInfos, cumulative, args, forcedN) {
        var _this = this;
        var label = "";
        var tooltip = "";
        var confirmationMessage = null;
        var enabled = symbolInfos.doable;
        var number = forcedN;
        if (forcedN === undefined && entries.every(function (entry) { return symbolInfos.entries[entry].n !== undefined; })) {
            number = entries
                .map(function (entry) { return symbolInfos.entries[entry]; })
                .map(function (symbolEntry) { return symbolEntry.n; })
                .reduce(function (a, b) { return a + b; }, 0);
            if (symbolInfos.max !== undefined) {
                number = Math.min(number, symbolInfos.max);
            }
        }
        var destination = cumulative ? null : document.getElementById("".concat(entries[0], "-").concat(type));
        switch (type) {
            case 'accelerate':
                var nFlipped = symbolInfos.flippedCards;
                label = "+".concat(nFlipped, " [Speed]");
                /*const accelerateCard = this.getCurrentPlayerTable()
                  .inplay.getCards()
                  .find((card) => card.id == Number(entries[0]));
                if (!destination) {
                  label += `<br>${this.cardImageHtml(accelerateCard, { constructor_id: this.getConstructorId() })}`;
                }*/
                tooltip = this.getGarageModuleIconTooltipWithIcon('accelerate', nFlipped);
                break;
            case 'adjust':
                label = "<div class=\"icon adjust\" style=\"color: #".concat(number > 0 ? '438741' : 'a93423', ";\">").concat(number > 0 ? "+".concat(number) : number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('adjust', number);
                break;
            case 'adrenaline':
                label = "+".concat(number, " [Speed]");
                tooltip = "\n                                    <strong>".concat(_('Adrenaline'), "</strong>\n                                    <br><br>\n                                    ").concat(_('Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space).'), "\n                                    <br><br>\n                                    <i>").concat(_('Note: Adrenaline cannot be saved for future rounds'), "</i>");
                confirmationMessage = args.crossedFinishLine
                    ? null
                    : this.getAdrenalineConfirmation(args.currentHeatCost, args.adrenalineWillCrossNextCorner, args.nextCornerSpeedLimit, args.nextCornerExtraHeatCost, args.boostInfos);
                break;
            case 'cooldown':
                label = "".concat(number, " [Cooldown]");
                var heats = this.getCurrentPlayerTable()
                    .hand.getCards()
                    .filter(function (card) { return card.effect == 'heat'; }).length;
                if (heats < number) {
                    label += "(- ".concat(heats, " [Heat])");
                }
                tooltip =
                    this.getGarageModuleIconTooltipWithIcon('cooldown', number) +
                        _('You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).');
                break;
            case 'direct':
                label = "<div class=\"icon direct\"></div>";
                var directCard = this.getCurrentPlayerTable()
                    .hand.getCards()
                    .find(function (card) { return card.id == Number(entries[0]); });
                /*if (!destination) {
                      if (directCard) {
                        label = `<br>${this.cardImageHtml(directCard, { constructor_id: this.getConstructorId() })}`;
                      } else {
                        console.warn('card not found in hand to display direct card', number, directCard);
                      }
                    }*/
                tooltip = this.getGarageModuleIconTooltipWithIcon('direct', 1);
                confirmationMessage =
                    args.crossedFinishLine || !directCard
                        ? null
                        : this.getDirectPlayConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, symbolInfos.heatCosts, directCard);
                break;
            case 'heat':
                label = "<div class=\"icon forced-heat\">".concat(number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('heat', number);
                break;
            case 'boost':
            case 'heated-boost':
                var paid = type == 'heated-boost' && symbolInfos.heated;
                label = "[Boost] > [Speed]";
                if (paid) {
                    label += " (1[Heat])";
                }
                tooltip = "\n                                    <strong>".concat(_('Boost'), "</strong>\n                                    <br><br>\n                                    ").concat(paid ? _('Regardless of which gear you are in you may pay 1 Heat to boost once per turn.') : '', "\n                                    ").concat(_('Boosting gives you a [+] symbol as reminded on the player mats. Move your car accordingly.'), "\n                                    <br><br>\n                                    <i>").concat(_('Note: [+] symbols always increase your Speed value for the purpose of the Check Corner step.'), "</i>");
                confirmationMessage = args.crossedFinishLine
                    ? null
                    : this.getBoostConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, args.nextCornerExtraHeatCost, args.boostInfos, paid);
                break;
            case 'reduce':
                label = "<div class=\"icon reduce-stress\">".concat(number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('reduce', number);
                break;
            case 'salvage':
                label = "<div class=\"icon salvage\">".concat(number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('salvage', number);
                enabled = enabled && this.getCurrentPlayerTable().discard.getCardNumber() > 0;
                break;
            case 'scrap':
                label = "<div class=\"icon scrap\">".concat(number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('scrap', number);
                break;
            case 'super-cool':
                label = "<div class=\"icon super-cool\">".concat(number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('super-cool', number);
                break;
            case 'draft':
                label = "<div class=\"icon draft\">".concat(number, "</div>");
                tooltip = this.getGarageModuleIconTooltipWithIcon('draft', number);
                break;
        }
        var mandatory = ['heat', 'scrap', 'adjust'].includes(type);
        var necessaryEntries = this.getNecessaryEntries(symbolInfos, entries, number);
        var buttonId = "actReact".concat(type, "_").concat(cumulative ? 'cumulative' : necessaryEntries.join('-'), "_").concat(number, "_button");
        var button = document.getElementById(buttonId);
        var buttonStatusBar = null;
        if (!button) {
            var noticeForButtonsOnCard = !destination && !symbolInfos.coalescable && !necessaryEntries.every(function (entry) { return isNaN(entry); });
            if (noticeForButtonsOnCard) {
                label += "".concat(_('(play on the card(s))'));
            }
            button = this.statusBar.addActionButton(formatTextIcons(label), function () { return _this.actReact(type, necessaryEntries, number); }, {
                id: buttonId,
                color: forcedN ? 'secondary' : 'primary',
                confirm: this.showHeatCostConfirmations() ? confirmationMessage : null,
                disabled: !enabled || noticeForButtonsOnCard,
                destination: destination,
            });
            if (destination && !symbolInfos.coalescable) {
                var card = type === 'direct'
                    ? this.getCurrentPlayerTable()
                        .hand.getCards()
                        .find(function (card) { return card.id == Number(entries[0]); })
                    : this.getCurrentPlayerTable()
                        .inplay.getCards()
                        .find(function (card) { return card.id == Number(entries[0]); });
                var statusBarLabel = formatTextIcons(label);
                if (card) {
                    statusBarLabel += "<br>".concat(this.cardImageHtml(card, { constructor_id: this.getConstructorId() }));
                }
                buttonStatusBar = this.statusBar.addActionButton(statusBarLabel, function () { return _this.actReact(type, necessaryEntries, number); }, {
                    id: 'status-bar-' + buttonId,
                    color: forcedN ? 'secondary' : 'primary',
                    confirm: this.showHeatCostConfirmations() ? confirmationMessage : null,
                    disabled: !enabled,
                });
            }
        }
        if (mandatory) {
            this.getMandatoryZone(destination).appendChild(button);
            if (buttonStatusBar) {
                this.getMandatoryZone(null).appendChild(buttonStatusBar);
            }
        }
        this.setTooltip(buttonId, formatTextIcons(tooltip));
        if (!enabled) {
            if (type === 'cooldown') {
                button.insertAdjacentHTML('beforeend', "\n                                        <div class=\"no-cooldown-warning\">\n                                            <div class=\"no-cooldown icon\"></div>\n                                        </div>\n                                    ");
            }
        }
        return button;
    };
    /**
     * Returns the necessary entries to match number, using as less cards as possible
     */
    Heat.prototype.getNecessaryEntries = function (symbolInfos, entries, number) {
        if (number === undefined || number === null) {
            return entries;
        }
        var enrichedEntries = [];
        entries.forEach(function (entry, index) {
            var _a, _b;
            return enrichedEntries.push({
                entry: entry,
                value: (_b = (_a = symbolInfos.entries) === null || _a === void 0 ? void 0 : _a[entry]) === null || _b === void 0 ? void 0 : _b.n,
                textSymbol: isNaN(entry) ? 1 : 0, // for example, if we have adrenaline and cardIds for cooldown, use adrenaline as priority if possible
            });
        });
        enrichedEntries.sort(function (a, b) { return b.textSymbol - a.textSymbol || b.value - a.value; });
        var selected = [];
        var total = 0;
        for (var _i = 0, enrichedEntries_1 = enrichedEntries; _i < enrichedEntries_1.length; _i++) {
            var info = enrichedEntries_1[_i];
            selected.push(info);
            total += info.value;
            if (total >= number) {
                break;
            }
        }
        return selected.map(function (info) { return info.entry; });
    };
    Heat.prototype.onUpdateActionButtons_react = function (args) {
        var _this = this;
        var _a, _b, _c;
        var ignoredTypes = ['speed', 'adjust', 'boost'];
        Object.entries(args.symbols)
            .filter(function (_a) {
            var type = _a[0], symbolSet = _a[1];
            return !ignoredTypes.includes(type);
        })
            .forEach(function (_a, index) {
            var _b;
            var type = _a[0], symbolInfos = _a[1];
            var remainingEntries = {};
            Object.entries(symbolInfos.entries)
                .filter(function (_a) {
                var _b;
                var entry = _a[0], symbolEntry = _a[1];
                return !symbolEntry.used && ((_b = symbolEntry.doable) !== null && _b !== void 0 ? _b : true);
            })
                .forEach(function (_a) {
                var entry = _a[0], symbolEntry = _a[1];
                return (remainingEntries[entry] = symbolEntry);
            });
            if (Object.keys(remainingEntries).length > 0) {
                if (symbolInfos.max !== undefined && symbolInfos.max === 0) {
                    return;
                }
                var noticeForButtonsOnCard = !symbolInfos.coalescable && !Object.keys(remainingEntries).every(function (entry) { return isNaN(entry); });
                if (!noticeForButtonsOnCard) {
                    _this.addReactButton(type, Object.keys(remainingEntries), symbolInfos, true, args);
                }
                if (symbolInfos.max !== undefined && symbolInfos.upTo) {
                    for (var n = symbolInfos.max - 1; n >= ((_b = symbolInfos.min) !== null && _b !== void 0 ? _b : 1); n--) {
                        _this.addReactButton(type, Object.keys(remainingEntries), symbolInfos, true, args, n);
                    }
                }
                if (noticeForButtonsOnCard || !Object.keys(remainingEntries).every(function (entry) { return isNaN(entry); })) {
                    Object.keys(remainingEntries).forEach(function (entry) {
                        var _a;
                        _this.addReactButton(type, [entry], symbolInfos, false, args);
                        if (symbolInfos.max !== undefined && symbolInfos.upTo) {
                            for (var n = symbolInfos.max - 1; n >= ((_a = symbolInfos.min) !== null && _a !== void 0 ? _a : 1); n--) {
                                _this.addReactButton(type, [entry], symbolInfos, false, args, n);
                            }
                        }
                    });
                }
            }
        });
        this.statusBar.addActionButton(_('Pass'), function () { return _this.actPassReact(); }, { disabled: !args.canPass });
        if (!args.symbols.heat.used && !args.symbols.heat.doable) {
            var confirmationMessage_1 = ((_a = args.symbols.cooldown) === null || _a === void 0 ? void 0 : _a.doable) && ((_b = args.symbols.cooldown) === null || _b === void 0 ? void 0 : _b.max) > 0 && !((_c = args.symbols.cooldown) === null || _c === void 0 ? void 0 : _c.used)
                ? _('You can cooldown, and it may unlock the Heat reaction. Are you sure you want to pass without cooldown?')
                : null;
            var finalAction_1 = function () { return _this.actCryCauseNotEnoughHeatToPay(); };
            var callback = confirmationMessage_1 ? function () { return _this.confirmationDialog(confirmationMessage_1, finalAction_1); } : finalAction_1;
            this.statusBar.addActionButton(_("I can't pay Heat(s)"), callback);
        }
    };
    Heat.prototype.onUpdateActionButtons_oldReact = function (args) {
        var _this = this;
        Object.entries(args.symbols).forEach(function (entry, index) {
            var type = entry[0];
            var numbers = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
            var max = null;
            if (SYMBOLS_WITH_POSSIBLE_HALF_USAGE.includes(type)) {
                max = entry[1];
                if (Object.keys(HAND_CARD_TYPE_FOR_EFFECT).includes(type)) {
                    var cardEffectType_1 = HAND_CARD_TYPE_FOR_EFFECT[type];
                    max = Math.min(max, _this.getCurrentPlayerTable()
                        .hand.getCards()
                        .filter(function (card) { return card.effect == cardEffectType_1; }).length);
                }
                numbers = [];
                for (var i = max; i >= 1; i--) {
                    if (args.doable.includes(type) || i === max) {
                        // only the max button if disabled
                        numbers.push(i);
                    }
                }
            }
            numbers.forEach(function (number) {
                var label = "";
                var tooltip = "";
                var confirmationMessage = null;
                var enabled = args.doable.includes(type);
                switch (type) {
                    case 'accelerate':
                        var accelerateCard = _this.getCurrentPlayerTable()
                            .inplay.getCards()
                            .find(function (card) { return card.id == number; });
                        label = "+".concat(args.flippedCards, " [Speed]<br>").concat(_this.cardImageHtml(accelerateCard, { constructor_id: _this.getConstructorId() }));
                        //label = `+${args.flippedCards} [Speed]<br>(${_(accelerateCard.text) })`;
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('accelerate', args.flippedCards);
                        break;
                    case 'adjust':
                        label = "<div class=\"icon adjust\" style=\"color: #".concat(number > 0 ? '438741' : 'a93423', ";\">").concat(number > 0 ? "+".concat(number) : number, "</div>");
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('adjust', number);
                        break;
                    case 'adrenaline':
                        label = "+".concat(number, " [Speed]");
                        tooltip = "\n                              <strong>".concat(_('Adrenaline'), "</strong>\n                              <br><br>\n                              ").concat(_('Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space).'), "\n                              <br><br>\n                              <i>").concat(_('Note: Adrenaline cannot be saved for future rounds'), "</i>");
                        confirmationMessage = args.crossedFinishLine
                            ? null
                            : _this.getAdrenalineConfirmation(args.currentHeatCost, args.adrenalineWillCrossNextCorner, args.nextCornerSpeedLimit, args.nextCornerExtraHeatCost, args.boostInfos);
                        break;
                    case 'cooldown':
                        label = "".concat(number, " [Cooldown]");
                        var heats = _this.getCurrentPlayerTable()
                            .hand.getCards()
                            .filter(function (card) { return card.effect == 'heat'; }).length;
                        if (heats < number) {
                            label += "(- ".concat(heats, " [Heat])");
                        }
                        tooltip =
                            _this.getGarageModuleIconTooltipWithIcon('cooldown', number) +
                                _('You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).');
                        break;
                    case 'direct':
                        var directCard = _this.getCurrentPlayerTable()
                            .hand.getCards()
                            .find(function (card) { return card.id == number; });
                        label = "<div class=\"icon direct\"></div>".concat(_('Play from hand'));
                        if (directCard) {
                            label = "<br>".concat(_this.cardImageHtml(directCard, { constructor_id: _this.getConstructorId() }));
                        }
                        else {
                            console.warn('card not found in hand to display direct card', number, directCard);
                        }
                        //label = `<div class="icon direct"></div><br>(${_(directCard?.text) })`;
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('direct', 1);
                        confirmationMessage =
                            args.crossedFinishLine || !directCard
                                ? null
                                : _this.getDirectPlayConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, args.directPlayCosts, directCard);
                        break;
                    case 'heat':
                        label = "<div class=\"icon forced-heat\">".concat(number, "</div>");
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('heat', number);
                        break;
                    case 'boost':
                    case 'heated-boost':
                        var paid = type == 'heated-boost';
                        label = "[Boost] > [Speed]";
                        if (paid) {
                            label += " (1[Heat])";
                        }
                        tooltip = "\n                              <strong>".concat(_('Boost'), "</strong>\n                              <br><br>\n                              ").concat(paid ? _('Regardless of which gear you are in you may pay 1 Heat to boost once per turn.') : '', "\n                              ").concat(_('Boosting gives you a [+] symbol as reminded on the player mats. Move your car accordingly.'), "\n                              <br><br>\n                              <i>").concat(_('Note: [+] symbols always increase your Speed value for the purpose of the Check Corner step.'), "</i>");
                        confirmationMessage = args.crossedFinishLine
                            ? null
                            : _this.getBoostConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, args.nextCornerExtraHeatCost, args.boostInfos, paid);
                        break;
                    case 'reduce':
                        label = "<div class=\"icon reduce-stress\">".concat(number, "</div>");
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('reduce', number);
                        break;
                    case 'salvage':
                        label = "<div class=\"icon salvage\">".concat(number, "</div>");
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('salvage', number);
                        enabled = enabled && _this.getCurrentPlayerTable().discard.getCardNumber() > 0;
                        break;
                    case 'scrap':
                        label = "<div class=\"icon scrap\">".concat(number, "</div>");
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('scrap', number);
                        break;
                    case 'super-cool':
                        label = "<div class=\"icon super-cool\">".concat(number, "</div>");
                        tooltip = _this.getGarageModuleIconTooltipWithIcon('super-cool', number);
                        break;
                }
                var finalAction = function () {
                    return _this.actOldReact(type, Array.isArray(entry[1]) || SYMBOLS_WITH_POSSIBLE_HALF_USAGE.includes(type) ? number : undefined);
                };
                var callback = confirmationMessage
                    ? function () { return (_this.showHeatCostConfirmations() ? _this.confirmationDialog(confirmationMessage, finalAction) : finalAction()); }
                    : finalAction;
                var mandatory = ['heat', 'scrap', 'adjust'].includes(type);
                _this.statusBar.addActionButton(formatTextIcons(label), callback, {
                    id: "actOldReact".concat(type, "_").concat(number, "_button"),
                    color: SYMBOLS_WITH_POSSIBLE_HALF_USAGE.includes(type) && number < max ? 'secondary' : undefined,
                });
                if (mandatory) {
                    var mandatoryZone = document.getElementById('mandatory-buttons');
                    if (!mandatoryZone) {
                        mandatoryZone = document.createElement('div');
                        mandatoryZone.id = 'mandatory-buttons';
                        mandatoryZone.innerHTML = "<div class=\"mandatory icon\"></div>";
                        document.getElementById('generalactions').appendChild(mandatoryZone);
                    }
                    mandatoryZone.appendChild(document.getElementById("actOldReact".concat(type, "_").concat(number, "_button")));
                }
                _this.setTooltip("actOldReact".concat(type, "_").concat(number, "_button"), formatTextIcons(tooltip));
                if (!enabled) {
                    document.getElementById("actOldReact".concat(type, "_").concat(number, "_button")).classList.add('disabled');
                    if (type === 'cooldown') {
                        document.getElementById("actOldReact".concat(type, "_").concat(number, "_button")).insertAdjacentHTML('beforeend', "\n                                  <div class=\"no-cooldown-warning\">\n                                      <div class=\"no-cooldown icon\"></div>\n                                  </div>\n                              ");
                    }
                }
            });
        });
        this.statusBar.addActionButton(_('Pass'), function () { return _this.actPassOldReact(); }, { id: "actPassOldReact_button" });
        if (!args.canPass) {
            document.getElementById("actPassReact_button").classList.add('disabled');
        }
        if (args.symbols['heat'] > 0 && !args.doable.includes('heat')) {
            var confirmationMessage_2 = args.doable.includes('cooldown')
                ? _('You can cooldown, and it may unlock the Heat reaction. Are you sure you want to pass without cooldown?')
                : null;
            var finalAction_2 = function () { return _this.actCryCauseNotEnoughHeatToPay(); };
            var callback = confirmationMessage_2 ? function () { return _this.confirmationDialog(confirmationMessage_2, finalAction_2); } : finalAction_2;
            this.statusBar.addActionButton(_("I can't pay Heat(s)"), callback, { id: "actCryCauseNotEnoughHeatToPay_button" });
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
        return this.players.getCurrentPlayerId();
    };
    Heat.prototype.getConstructorId = function () {
        var _this = this;
        var constructor = Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); });
        return constructor !== undefined ? Number(constructor === null || constructor === void 0 ? void 0 : constructor.id) : null;
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
    Heat.prototype.getGarageModuleIconTooltipWithIcon = function (symbol, number) {
        return "\n            <div>\n                <div class=\"tooltip-symbol\">\n                    <div class=\"".concat(symbol == 'heat' ? 'forced-heat' : symbol, " icon\"></div>\n                </div>\n                ").concat(formatTextIcons(this.getGarageModuleIconTooltip(symbol, number)), "\n            </div>");
    };
    Heat.prototype.getGarageModuleIconTooltip = function (symbol, number) {
        switch (symbol) {
            case 'accelerate':
                return "\n                    <strong>".concat(_('Accelerate'), "</strong>\n                    <br>\n                    ").concat(_('You may increase your Speed by ${number} for every [+] symbol used by you this turn (from Upgrades, Stress, Boost, etc). If you do, you must increase it for all [+] symbols used and this counts for corner checks.').replace('${number}', '' + number), "\n                ");
            case 'adjust':
                return "\n                    <strong>".concat(_('Adjust Speed Limit'), "</strong> <div class=\"mandatory icon\"></div>\n                    <br>\n                    ").concat(isNaN(number)
                    ? _('If you cross a corner this turn, your Speed Limit is modified by # for you; “+” means you can move faster, “-” means you must move slower.')
                    : (Number(number) < 0
                        ? _('Speed limit is ${number} lower.')
                        : _('Speed limit is ${number} higher.')).replace('${number}', '' + Math.abs(Number(number))), "\n                ");
            case 'boost':
                return "\n                    <strong>".concat(_('Boost'), "</strong>\n                    <br>\n                    ").concat(_('Flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly.'), "\n                    <br>\n                    <i>").concat(_('Note: Boost increases your Speed value for the purpose of the Check Corner step.'), "</i>\n                ");
            case 'cooldown':
                return "\n                    <strong>".concat(_('Cooldown'), "</strong>\n                    <br>\n                    ").concat(_('Cooldown allows you to take ${number} Heat card(s) from your hand and put it back in your Engine (so you can use the Heat card again). ').replace('${number}', '' + number), "\n                ");
            case 'direct':
                return "\n                    <strong>".concat(_('Direct Play'), "</strong>\n                    <br>\n                    ").concat(_('You may play this card from your hand in the React step. If you do, it applies as if you played it normally, including Speed value and mandatory/optional icons.'), "\n                ");
            case 'heat':
                return "\n                    <strong>".concat(_('Heat'), "</strong> <div class=\"mandatory icon\"></div>\n                    <br>\n                    ").concat(_('Take ${number} Heat cards from the Engine and move them to your discard pile.').replace('${number}', '' + number), "\n                ");
            case 'one-time':
                return "\n                    <strong>".concat(_('One-time use'), "</strong> <div class=\"mandatory icon\"></div>\n                    <br>\n                    ").concat(_('During the discard step, this card is removed instead of going to the discard.'), "\n                ");
            case 'reduce':
                return "\n                    <strong>".concat(_('Reduce Stress'), "</strong>\n                    <br>\n                    ").concat(_('You may immediately discard up to ${number} Stress cards from your hand to the discard pile.').replace('${number}', '' + number), "\n                ");
            case 'refresh':
                return "\n                    <strong>".concat(_('Refresh'), "</strong>\n                    <br>\n                    ").concat(_('You may place this card back on top of your draw deck instead of discarding it, when discarding cards.'), "\n                ");
            case 'salvage':
                return "\n                    <strong>".concat(_('Salvage'), "</strong>\n                    <br>\n                    ").concat(_('You may look through your discard pile and choose up to ${number} cards there. These cards are shuffled into your draw deck.').replace('${number}', '' + number), "\n                ");
            case 'scrap':
                return "\n                    <strong>".concat(_('Scrap'), "</strong> <div class=\"mandatory icon\"></div>\n                    <br>\n                    ").concat(_('Discard the top card of your draw deck ${number} times.').replace('${number}', '' + number), "\n                ");
            case 'slipstream':
                return "\n                    <strong>".concat(_('Slipstream boost'), "</strong>\n                    <br>\n                    ").concat(_('If you choose to Slipstream, your typical 2 Spaces may be increased by ${number}.').replace('${number}', '' + number), "\n                ");
            case 'super-cool':
                return "\n                    <strong>".concat(_('Super cool'), "</strong>\n                    <br>\n                    ").concat(_('You may look through your discard pile and remove up to ${number} Heat cards from it. Return these cards to your Engine spot.').replace('${number}', '' + number), "\n                    <br>\n                    <i>").concat(_('Note: If there are no Heat cards in your discard pile, the symbol is wasted (but you still got to see which cards are there).'), "</i>\n                ");
            case 'draft':
                return "\n                    <strong>".concat(_('Draft'), "</strong>\n                    <br>\n                    ").concat(_('Move your car forward on the race track up to ${number} Spaces.').replace('${number}', '' + number), "\n                    <br>\n                    <i>").concat(_('Note: All Spaces you move into/through thanks to this symbol must be completely free of other cars and the final landing Space must have at least one car in either Spot of the Space in front of it. This extra movement does not count as speed.'), "</i>\n                ");
        }
    };
    Heat.prototype.getWeatherCardSetupTooltip = function (type) {
        switch (type) {
            case 0:
                return _('Remove 1 Stress card from your deck.');
            case 1:
                return _('Place 1 extra Heat card in your Engine.');
            case 2:
                return _('Shuffle 1 extra Stress card into your deck.');
            case 3:
                return _('Remove 1 Heat card from your Engine.');
            case 4:
                return _('Shuffle 3 of your Heat cards into your draw deck.');
            case 5:
                return _('Place 3 of your Heat cards into your discard pile.');
        }
    };
    Heat.prototype.getWeatherCardEffectTooltip = function (type) {
        switch (type) {
            case 0:
                return "\n                    <strong>".concat(_('No cooling'), "</strong>\n                    <br>\n                    ").concat(_('No Cooldown allowed in this sector during the React step.'), "\n                ");
            case 1:
                return "\n                    <strong>".concat(_('No slipstream'), "</strong>\n                    <br>\n                    ").concat(_('You cannot start slipstreaming from this sector (you may slipstream into it).'), "\n                    ");
            case 2:
            case 5:
                return "<strong>".concat(_('Slipstream boost'), "</strong>\n                <br>\n                ").concat(_('If you choose to Slipstream, you may add 2 extra Spaces to the usual 2 Spaces. Your car must be located in this sector before you slipstream.'), "\n                ");
            case 3:
            case 4:
                return "<strong>".concat(_('Cooling Bonus'), "</strong>\n                <br>\n                ").concat(_('+1 Cooldown in this sector during the React step.'), "\n                ");
        }
    };
    Heat.prototype.getWeatherTokenTooltip = function (type, cardType) {
        switch (type) {
            case 0:
                return "\n                    <strong>".concat(_('Weather'), "</strong>\n                    <br>\n                    ").concat(_('Weather effect applies to this sector:'), "\n                    <br>\n                    ").concat(cardType === null ? _('See the Weather token for the effect.') : this.getWeatherCardEffectTooltip(cardType), "\n                ");
            case 1:
                return "\n                    <strong>".concat(_('Overheat'), "</strong> <div class=\"mandatory icon\"></div>\n                    <br>\n                    ").concat(_('If your Speed is higher than the Speed Limit when you cross this corner, the cost in Heat that you need to pay is increased by one.'), "\n                ");
            case 2:
                return this.getGarageModuleIconTooltip('adjust', -1);
            case 3:
                return this.getGarageModuleIconTooltip('adjust', 1);
            case 4:
                return "\n                    <strong>".concat(_('Heat control'), "</strong>\n                    <br>\n                    ").concat(_('Do not pay Heat to boost in this sector (still max one boost per turn). Your car must be in the sector when you boost.'), "\n                ");
            case 5:
                return "\n                    <strong>".concat(_('Slipstream boost'), "</strong>\n                    <br>\n                    ").concat(_('If you choose to Slipstream, you may add one extra Space to the usual 2 Spaces. Your car must be located in this sector before you slipstream.'), "\n                ");
        }
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
        constructors
            .filter(function (constructor) { return constructor.ai; })
            .forEach(function (constructor) {
            document.getElementById('player_boards').insertAdjacentHTML('beforeend', "\n            <div id=\"overall_player_board_".concat(constructor.pId, "\" class=\"player-board current-player-board\">\t\t\t\t\t\n                <div class=\"player_board_inner\" id=\"player_board_inner_982fff\">\n                    \n                    <div class=\"emblemwrap\" id=\"avatar_active_wrap_").concat(constructor.id, "\">\n                        <div src=\"img/gear.png\" alt=\"\" class=\"avatar avatar_active legend_avatar\" id=\"avatar_active_").concat(constructor.id, "\" style=\"--constructor-id: ").concat(constructor.id, "\"></div>\n                    </div>\n                                               \n                    <div class=\"player-name\" id=\"player_name_").concat(constructor.id, "\">\n                        ").concat(_(constructor.name), "\n                    </div>\n                    <div id=\"player_board_").concat(constructor.pId, "\" class=\"player_board_content\">\n                        <div class=\"player_score\">\n                            <span id=\"player_score_").concat(constructor.pId, "\" class=\"player_score_value\">-</span> <i class=\"fa fa-star\" id=\"icon_point_").concat(constructor.id, "\"></i>           \n                        </div>\n                    </div>\n                </div>\n            </div>"));
        });
        constructors.forEach(function (constructor) {
            var _a;
            var html = constructor.ai
                ? ''
                : "<div class=\"counters\">\n                <div id=\"gear-counter-wrapper-".concat(constructor.id, "\" class=\"gear-counter\">\n                    <div class=\"gear icon\"></div>\n                    <span id=\"gear-counter-").concat(constructor.id, "\"></span>\n                </div>\n                <div id=\"engine-counter-wrapper-").concat(constructor.id, "\" class=\"engine-counter\">\n                    <div class=\"engine icon\"></div>\n                    <span id=\"engine-counter-").concat(constructor.id, "\"></span>\n                </div>\n            </div>");
            html += "\n            <div class=\"counters\">\n                <div id=\"speed-counter-wrapper-".concat(constructor.id, "\" class=\"speed-counter\">\n                    <div class=\"speed icon\"></div>\n                    <span id=\"speed-counter-").concat(constructor.id, "\">-</span>\n                </div>\n                <div id=\"corner-counter-wrapper-").concat(constructor.id, "\" class=\"corner-counter\">\n                    <div class=\"corner icon\"></div> \n                    <span id=\"corner-counter-").concat(constructor.id, "\"></span>\n                </div>\n                <div id=\"lap-counter-wrapper-").concat(constructor.id, "\" class=\"lap-counter\">\n                    <div class=\"flag icon\"></div>\n                    <span id=\"lap-counter-").concat(constructor.id, "\">-</span> / <span class=\"nbr-laps\">").concat(gamedatas.nbrLaps || '?', "</span>\n                </div>\n            </div>\n            <div class=\"counters\">\n                <div>\n                    <div id=\"order-").concat(constructor.id, "\" class=\"order-counter ").concat(constructor.speed >= 0 ? 'played' : '', "\">\n                        ").concat(constructor.no + 1, "\n                    </div>\n                </div>\n                <div id=\"podium-wrapper-").concat(constructor.id, "\" class=\"podium-counter\">\n                    <div class=\"podium icon\"></div>\n                    <span id=\"podium-counter-").concat(constructor.id, "\"></span>\n                </div>\n            </div>");
            dojo.place(html, "player_board_".concat(constructor.pId));
            _this.setScore(constructor.pId, constructor.score);
            if (!constructor.ai) {
                _this.gearCounters[constructor.id] = new ebg.counter();
                _this.gearCounters[constructor.id].create("gear-counter-".concat(constructor.id));
                _this.gearCounters[constructor.id].setValue(constructor.gear);
                _this.engineCounters[constructor.id] = new ebg.counter();
                _this.engineCounters[constructor.id].create("engine-counter-".concat(constructor.id));
                _this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
            }
            _this.speedCounters[constructor.id] = new ebg.counter();
            _this.speedCounters[constructor.id].create("speed-counter-".concat(constructor.id));
            _this.setSpeedCounter(constructor.id, constructor.speed);
            _this.cornerCounters[constructor.id] = new ebg.counter();
            _this.cornerCounters[constructor.id].create("corner-counter-".concat(constructor.id));
            _this.cornerCounters[constructor.id].setValue(constructor.distanceToCorner);
            _this.lapCounters[constructor.id] = new ebg.counter();
            _this.lapCounters[constructor.id].create("lap-counter-".concat(constructor.id));
            _this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(gamedatas.nbrLaps, constructor.turn + 1)));
            if (constructor.carCell < 0) {
                var eliminated = constructor.turn < _this.gamedatas.nbrLaps || Boolean((_a = _this.gamedatas.players[constructor.pId]) === null || _a === void 0 ? void 0 : _a.zombie);
                _this.setRank(constructor.id, -constructor.carCell, eliminated);
                if (eliminated) {
                    _this.circuit.setEliminatedPodium(-constructor.carCell);
                }
            }
            if (constructor.canLeave && constructor.id == _this.getConstructorId()) {
                _this.addLeaveText();
            }
        });
        this.setTooltipToClass('corner-counter', _('Distance to the next corner'));
        this.setTooltipToClass('gear-counter', _('Gear'));
        this.setTooltipToClass('engine-counter', _('Engine cards count'));
        this.setTooltipToClass('speed-counter', _('Speed'));
        this.setTooltipToClass('lap-counter', _('Laps'));
        this.setTooltipToClass('order-counter', _('Player order'));
        this.setTooltipToClass('podium-counter', _('Rank'));
    };
    Heat.prototype.addLeaveText = function () {
        var _this = this;
        if (document.getElementById('leave-text')) {
            return;
        }
        var withAction = !this.gamedatas.players[this.getPlayerId()].eliminated;
        var html = "\n        <div id=\"leave-text\"><i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i>\n            ".concat(_('You have finished the race.'));
        if (withAction) {
            html += "\n                <span id=\"leave-text-action\">\n                ".concat(_('You can stay to see the end, or you can <leave-button> to start a new one!').replace('<leave-button>', "<button id=\"leave-button\" class=\"bgabutton bgabutton_blue\">".concat(_('Leave the game'), "</button>")), "\n                </span>");
        }
        html += "\n        </div>\n        ";
        document.getElementById('top').insertAdjacentHTML('afterbegin', html);
        if (withAction) {
            document.getElementById('leave-button').addEventListener('click', function () { return _this.actQuitGame(); });
        }
    };
    Heat.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) { return _this.createPlayerTable(gamedatas, Number(player.id)); });
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
        var _this = this;
        var html = "\n        <div id=\"help-popin\">\n            <h1>".concat(_('Mandatory symbols'), "</h1>\n            ").concat(['heat', 'scrap', 'adjust', 'one-time']
            .map(function (symbol) { return _this.getGarageModuleIconTooltipWithIcon(symbol, '#'); })
            .join('<br><br>'), "\n\n            <h1>").concat(_('Optional symbols'), "</h1>\n            ").concat(['cooldown', 'slipstream', 'reduce', 'refresh', 'salvage', 'direct', 'accelerate', 'super-cool', 'draft']
            .map(function (symbol) { return _this.getGarageModuleIconTooltipWithIcon(symbol, '#'); })
            .join('<br><br>'), "\n\n            <h1>").concat(_('Road Conditions Tokens'), "</h1>\n            <h2>").concat(_('Corner Effects'), "</h2>\n            ").concat([3, 2, 1]
            .map(function (token) { return "\n                <div>\n                    <div class=\"tooltip-symbol\">\n                        <div class=\"weather-token\" data-token-type=\"".concat(token, "\"></div>\n                    </div>\n                    ").concat(_this.getWeatherTokenTooltip(token, null), "\n                </div>\n                "); })
            .join('<br><br>'), "\n            <h2>").concat(_('Sector Effects'), "</h2>\n            ").concat([4, 5, 0]
            .map(function (token) { return "\n                <div>\n                    <div class=\"tooltip-symbol\">\n                        <div class=\"weather-token\" data-token-type=\"".concat(token, "\"></div>\n                    </div>\n                    ").concat(_this.getWeatherTokenTooltip(token, null), "\n                </div>\n                "); })
            .join('<br><br>'), "\n\n            <h1>").concat(_('Weather Tokens'), "</h1>\n\n            ").concat([0, 1, 2, 3, 4, 5]
            .map(function (type) { return "\n                <div>\n                    <div class=\"tooltip-symbol\">\n                        <div class=\"weather-card\" data-card-type=\"".concat(type, "\"></div>\n                    </div>\n                    ").concat(_this.getWeatherCardSetupTooltip(type), "<br><br>\n                    ").concat(_this.getWeatherCardEffectTooltip(type), "\n                </div>\n                "); })
            .join('<br><br>'), "\n        </div>");
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
            var privateArgs_1 = this.gamedatas.gamestate.args._private;
            var clutteredHand = privateArgs_1 === null || privateArgs_1 === void 0 ? void 0 : privateArgs_1.clutteredHand;
            var table = this.getCurrentPlayerTable();
            var gear = table.getCurrentGear();
            var maxGearChange = clutteredHand ? 1 : 2;
            var minAllowed = Math.max(1, gear - maxGearChange);
            var maxAllowed = Math.min(4, gear + maxGearChange);
            var allowed = selection.length >= minAllowed && selection.length <= maxAllowed;
            var useHeat = allowed && Math.abs(selection.length - gear) == 2 ? 1 : 0;
            if (privateArgs_1.flooded && selection.length < gear) {
                useHeat++;
            }
            var label = '';
            if (allowed) {
                label = clutteredHand
                    ? _('Unclutter hand with selected cards')
                    : "".concat(_('Play selected cards'), " (").concat(_('Gear:'), " ").concat(gear, " \u21D2 ").concat(selection.length, " ").concat(formatTextIcons(useHeat > 0 ? ", ".concat(useHeat, "[Heat]") : ''), ")");
            }
            else {
                label = _('Select between ${min} and ${max} cards').replace('${min}', "".concat(minAllowed)).replace('${max}', "".concat(maxAllowed));
            }
            document.getElementById("player-table-".concat(table.playerId, "-gear")).dataset.gear = "".concat(allowed ? selection.length : gear);
            var button = document.getElementById('actPlanification_button');
            if (button) {
                button.innerHTML = label;
                // we let the user able to click, so the back will explain in the error why he can't
                /*if (allowed && useHeat && this.engineCounters[this.getConstructorId()].getValue() == 0) {
                            allowed = false;
                        }*/
                button.classList.toggle('disabled', !allowed);
            }
            this.circuit.removeMapIndicators();
            if (selection.length && privateArgs_1 && !clutteredHand) {
                var totalSpeeds = this.getPossibleSpeeds(selection, privateArgs_1);
                var stressCardsSelected_1 = selection.some(function (card) { return privateArgs_1.boostingCardIds.includes(card.id); });
                totalSpeeds.forEach(function (totalSpeed) {
                    return _this.circuit.addMapIndicator(privateArgs_1.cells[totalSpeed], undefined, totalSpeed, stressCardsSelected_1);
                });
            }
        }
        else if (this.gamedatas.gamestate.name == 'discard') {
            var label = _('Discard ${number} selected cards').replace('${number}', "".concat(selection.length));
            var buttonDiscard = document.getElementById('actDiscard_button');
            var buttonNoDiscard = document.getElementById('actNoDiscard_button');
            if (buttonDiscard) {
                buttonDiscard.innerHTML = label;
                buttonDiscard.classList.toggle('disabled', !selection.length || selection.length > this.gamedatas.gamestate.args._private.max);
            }
            buttonNoDiscard === null || buttonNoDiscard === void 0 ? void 0 : buttonNoDiscard.classList.toggle('disabled', selection.length > 0);
        }
        else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
        else if (this.gamedatas.gamestate.name == 'snakeDiscard') {
            this.checkSnakeDiscardSelectionState();
        }
    };
    Heat.prototype.onInPlayCardSelectionChange = function (selection) {
        if (this.gamedatas.gamestate.name == 'payHeats') {
            var args_1 = this.gamedatas.gamestate.args;
            var selectionHeats = selection.map(function (card) { return args_1.payingCards[card.id]; }).reduce(function (a, b) { return a + b; }, 0);
            document
                .getElementById('actPayHeats_button')
                .classList.toggle('disabled', selectionHeats > args_1.heatInReserve || selection.length != args_1.maxPayableCards);
        }
        else if (this.gamedatas.gamestate.name == 'snakeDiscard') {
            this.checkSnakeDiscardSelectionState();
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
        document
            .getElementById("actSwapUpgrade_button")
            .classList.toggle('disabled', marketSelection.length != 1 || handSelection.length != 1);
    };
    Heat.prototype.checkSnakeDiscardSelectionState = function () {
        var _a, _b, _c;
        var playerTable = this.getCurrentPlayerTable();
        var inPlaySelection = (_b = (_a = playerTable === null || playerTable === void 0 ? void 0 : playerTable.inplay) === null || _a === void 0 ? void 0 : _a.getSelection()) !== null && _b !== void 0 ? _b : [];
        (_c = document.getElementById("actSnakeDiscard_button")) === null || _c === void 0 ? void 0 : _c.classList.toggle('disabled', inPlaySelection.length != 1);
    };
    Heat.prototype.actSnakeDiscard = function () {
        var _a, _b;
        var playerTable = this.getCurrentPlayerTable();
        var inPlaySelection = (_b = (_a = playerTable === null || playerTable === void 0 ? void 0 : playerTable.inplay) === null || _a === void 0 ? void 0 : _a.getSelection()) !== null && _b !== void 0 ? _b : [];
        this.actions.performAction('actSnakeDiscard', {
            cardId: inPlaySelection[0].id,
        });
    };
    Heat.prototype.actChooseUpgrade = function () {
        this.actions.performAction('actChooseUpgrade', {
            cardId: this.market.getSelection()[0].id,
        });
    };
    Heat.prototype.actSwapUpgrade = function () {
        this.actions.performAction('actSwapUpgrade', {
            marketCardId: this.market.getSelection()[0].id,
            ownedCardId: this.getCurrentPlayerTable().hand.getSelection()[0].id,
        });
    };
    Heat.prototype.actPassSwapUpgrade = function () {
        this.actions.performAction('actPassSwapUpgrade');
    };
    Heat.prototype.actPlanification = function () {
        var selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        this.actions.performAction('actPlan', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return card.id; })),
        });
    };
    Heat.prototype.actCancelSelection = function () {
        this.actions.performAction('actCancelSelection', undefined, { checkAction: false });
    };
    Heat.prototype.actChooseSpeed = function (speed, choice) {
        this.actions.performAction('actChooseSpeed', {
            speed: speed,
            choice: JSON.stringify(choice),
        });
    };
    Heat.prototype.actSlipstream = function (speed) {
        this.actions.performAction('actSlipstream', {
            speed: speed,
        });
    };
    Heat.prototype.actPassReact = function () {
        this.actions.performAction('actPassReact');
    };
    Heat.prototype.actPassOldReact = function () {
        this.actions.performAction('actPassOldReact');
    };
    Heat.prototype.actCryCauseNotEnoughHeatToPay = function () {
        this.actions.performAction('actCryCauseNotEnoughHeatToPay');
    };
    Heat.prototype.actReact = function (symbol, entries, n) {
        this.actions.performAction('actReact', {
            symbol: symbol,
            entries: JSON.stringify(entries),
            n: n,
        });
    };
    Heat.prototype.actOldReact = function (symbol, arg) {
        this.actions.performAction('actOldReact', {
            symbol: symbol,
            arg: arg,
        });
    };
    Heat.prototype.actRefresh = function (cardId) {
        this.actions.performAction('actRefresh', {
            cardId: cardId,
        });
    };
    Heat.prototype.actPayHeats = function (selectedCards) {
        this.actions.performAction('actPayHeats', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return card.id; })),
        });
    };
    Heat.prototype.actCheckCorner = function () {
        this.actions.performAction('actCheckCorner', {});
    };
    Heat.prototype.actDiscard = function (selectedCards) {
        this.actions.performAction('actDiscard', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return card.id; })),
        });
    };
    Heat.prototype.actSalvage = function () {
        var selectedCards = this.market.getSelection();
        this.actions.performAction('actSalvage', {
            cardIds: JSON.stringify(selectedCards.map(function (card) { return -card.id; })),
        });
    };
    Heat.prototype.actSuperCool = function (n) {
        this.actions.performAction('actSuperCool', {
            n: n,
        });
    };
    Heat.prototype.actConfirmResults = function () {
        this.actions.performAction('actConfirmResults');
    };
    Heat.prototype.actQuitGame = function () {
        this.actions.performAction('actQuitGame', undefined, { checkAction: false });
    };
    Heat.prototype.actGiveUp = function () {
        this.actions.performAction('actGiveUp');
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
            'message',
            'loadCircuit',
            'clean',
            'newMarket',
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
            'refresh',
            'discard',
            'pDiscard',
            'snakeDiscard',
            'eventRemoveHeat',
            'draw',
            'pDraw',
            'mulligan',
            'pMulligan',
            'clearPlayedCards',
            'cooldown',
            'finishTurn',
            'finishRace',
            'endOfRace',
            'newLegendCard',
            'scrapCards',
            'resolveBoost',
            'accelerate',
            'salvageCards',
            'superCoolCards',
            'directPlay',
            'eliminate',
            'newChampionshipRace',
            'startRace',
            'setupRace',
            'clutteredHand',
            'playerEliminated',
            'cryCauseNotEnoughHeatToPay',
            'setWeather',
            'clearTurn',
            'refreshUI',
            'refreshHand',
        ];
        notifs.forEach(function (notifName) {
            dojo.subscribe(notifName, _this, function (notifDetails) {
                log("notif_".concat(notifName), notifDetails.args);
                if (notifName === 'playerEliminated') {
                    return;
                }
                var promise = _this["notif_".concat(notifName)](notifDetails.args);
                var promises = promise ? [promise] : [];
                var minDuration = 1;
                var msg = _this.gameui.format_string_recursive(notifDetails.log, notifDetails.args);
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';
                    $('restartAction').innerHTML = '';
                    // If there is some text, we let the message some time, to be read
                    minDuration = MIN_NOTIFICATION_MS;
                }
                // tell the UI notification ends, if the function returned a promise.
                if (_this.animationManager.animationsActive()) {
                    Promise.all(__spreadArray(__spreadArray([], promises, true), [_this.wait(minDuration)], false)).then(function () { return _this.notifqueue.onSynchronousNotificationEnd(); });
                }
                else {
                    _this.gameui.notifqueue.setSynchronousDuration(0);
                }
            });
            if (notifName !== 'playerEliminated') {
                _this.gameui.notifqueue.setSynchronous(notifName, undefined);
            }
        });
        if (isDebug) {
            notifs.forEach(function (notifName) {
                if (!_this["notif_".concat(notifName)]) {
                    console.warn("notif_".concat(notifName, " function is not declared, but listed in setupNotifications"));
                }
            });
            Object.getOwnPropertyNames(Heat.prototype)
                .filter(function (item) { return item.startsWith('notif_'); })
                .map(function (item) { return item.slice(6); })
                .forEach(function (item) {
                if (!notifs.some(function (notifName) { return notifName == item; })) {
                    console.warn("notif_".concat(item, " function is declared, but not listed in setupNotifications"));
                }
            });
        }
        /*this.gameui.notifqueue.setIgnoreNotificationCheck('discard', (notif: Notif<any>) =>
                this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId() && notif.args.n
            );*/
        this.gameui.notifqueue.setIgnoreNotificationCheck('draw', function (notif) { return _this.getPlayerIdFromConstructorId(notif.args.constructor_id) == _this.getPlayerId(); });
        this.gameui.notifqueue.setIgnoreNotificationCheck('mulligan', function (notif) { return _this.getPlayerIdFromConstructorId(notif.args.constructor_id) == _this.getPlayerId(); });
    };
    Heat.prototype.notif_message = function () {
        // just to log them on the title bar
    };
    Heat.prototype.notif_loadCircuit = function (args) {
        var _a;
        var circuit = args.circuit;
        (_a = document.getElementById("circuit-dropzone-container")) === null || _a === void 0 ? void 0 : _a.remove();
        //document.querySelectorAll('.nbr-laps').forEach(elem => elem.innerHTML == `${circuit.}`)
        this.circuit.loadCircuit(circuit);
    };
    Heat.prototype.notif_clean = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var counters;
            return __generator(this, function (_a) {
                counters = args.counters;
                this.playersTables.forEach(function (playerTable) {
                    var _a;
                    (_a = playerTable.hand) === null || _a === void 0 ? void 0 : _a.removeAll();
                    playerTable.inplay.removeAll();
                    playerTable.discard.removeAll();
                    playerTable.discard.setCardNumber(0);
                    playerTable.engine.removeAll();
                    playerTable.engine.setCardNumber(0);
                    playerTable.deck.removeAll();
                    playerTable.deck.setCardNumber(counters[playerTable.constructorId].deckCount);
                });
                return [2 /*return*/];
            });
        });
    };
    Heat.prototype.notif_newMarket = function (args) {
        var upgrades = args.upgrades;
        if (upgrades) {
            this.playersTables.forEach(function (playerTable) {
                var playerUpdates = upgrades.filter(function (card) { return card.location == "deck-".concat(playerTable.constructorId); });
                playerTable.deck.addCards(playerUpdates, undefined, {
                    autoUpdateCardNumber: false,
                    autoRemovePreviousCards: false,
                });
                playerTable.inplay.addCards(playerUpdates);
            });
        }
    };
    Heat.prototype.notif_chooseUpgrade = function (args) {
        var constructor_id = args.constructor_id, card = args.card;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.getPlayerTable(playerId).inplay.addCard(card);
    };
    Heat.prototype.notif_swapUpgrade = function (args) {
        var _a, _b;
        var constructor_id = args.constructor_id, card = args.card, card2 = args.card2;
        (_a = this.market) === null || _a === void 0 ? void 0 : _a.addCard(card2);
        if (constructor_id == this.getConstructorId()) {
            this.getCurrentPlayerTable().inplay.addCard(card);
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
        var _a;
        (_a = this.market) === null || _a === void 0 ? void 0 : _a.remove();
        this.market = null;
        var currentPlayerTable = this.getCurrentPlayerTable();
        if (currentPlayerTable === null || currentPlayerTable === void 0 ? void 0 : currentPlayerTable.hand) {
            currentPlayerTable.deck.addCards(currentPlayerTable.hand.getCards().map(function (card) { return ({ id: card.id }); }), undefined, {
                autoUpdateCardNumber: false,
            }, 100);
            // currentPlayerTable.hand.removeAll();
        }
        var nbCards = this.gamedatas.championship ? 1 : 3;
        this.playersTables.forEach(function (playerTable) {
            playerTable.inplay.removeAll();
            playerTable.deck.setCardNumber(playerTable.deck.getCardNumber() + nbCards);
        });
    };
    Heat.prototype.notif_updatePlanification = function (args) {
        this.updatePlannedCards(args.args._private.selection);
        var mulliganBtn = document.getElementById('mulligan-btn');
        if (mulliganBtn && !args.args._private.canMulligan) {
            mulliganBtn.remove();
        }
        this.gamedatas.gamestate.args = args.args;
        this.onEnteringPlanification(args.args);
    };
    Heat.prototype.notif_reveal = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, gear, heats, playerId, playerTable, cards;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, gear = args.gear, heats = args.heats;
                        if (constructor_id === this.getConstructorId()) {
                            this.updatePlannedCards([]);
                        }
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        playerTable.setCurrentGear(gear);
                        this.gearCounters[constructor_id].toValue(gear);
                        if (!heats) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.payHeats(constructor_id, heats)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        cards = Object.values(args.cards);
                        return [4 /*yield*/, playerTable.setInplay(cards)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_moveCar = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, cell, path, totalSpeed, progress, distanceToCorner, isAi, orderCounter;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        constructor_id = args.constructor_id, cell = args.cell, path = args.path, totalSpeed = args.totalSpeed, progress = args.progress, distanceToCorner = args.distanceToCorner;
                        isAi = this.gamedatas.constructors[constructor_id].ai;
                        this.setSpeedCounter(constructor_id, totalSpeed);
                        (_a = this.championshipTable) === null || _a === void 0 ? void 0 : _a.setRaceProgress(progress);
                        return [4 /*yield*/, this.circuit.moveCar(constructor_id, cell, path, isAi ? path.length : totalSpeed)];
                    case 1:
                        _c.sent();
                        (_b = this.cornerCounters[constructor_id]) === null || _b === void 0 ? void 0 : _b.setValue(distanceToCorner);
                        if (isAi) {
                            orderCounter = document.getElementById("order-".concat(constructor_id));
                            orderCounter.classList.add('played');
                            this.circuit.removeMapPaths();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_updateTurnOrder = function (args) {
        var _this = this;
        var constructor_ids = args.constructor_ids;
        constructor_ids.forEach(function (constructorId, index) {
            var orderCounter = document.getElementById("order-".concat(constructorId));
            orderCounter.innerHTML = "".concat(index + 1);
            orderCounter.classList.remove('played');
            _this.setSpeedCounter(constructorId, -1);
        });
    };
    Heat.prototype.payHeats = function (constructorId, cards) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, playerTable;
            var _a;
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
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, cards, corner, cell, stresses, nCellsBack, playerId, playerTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, cards = args.cards, corner = args.corner, cell = args.cell, stresses = args.stresses, nCellsBack = args.nCellsBack;
                        this.circuit.showCorner(corner, 'red');
                        return [4 /*yield*/, this.payHeats(constructor_id, Object.values(cards))];
                    case 1:
                        _a.sent();
                        if (!this.animationManager.animationsActive()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.circuit.spinOutWithAnimation(constructor_id, cell, nCellsBack)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.circuit.moveCar(constructor_id, cell);
                        _a.label = 4;
                    case 4:
                        this.cornerCounters[constructor_id].toValue(0);
                        this.gearCounters[constructor_id].toValue(1);
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        this.getPlayerTable(playerId).setCurrentGear(1);
                        return [4 /*yield*/, playerTable.spinOut(stresses)];
                    case 5:
                        _a.sent();
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
        var constructor_id = args.constructor_id, areSponsors = args.areSponsors, deckCount = args.deckCount;
        var n = Number(args.n);
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.drawCardsPublic(n, areSponsors, deckCount);
    };
    Heat.prototype.notif_mulligan = function (args) {
        var constructor_id = args.constructor_id, heat = args.heat;
        this.payHeats(constructor_id, [heat]);
    };
    Heat.prototype.notif_refresh = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, card, playerId, playerTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, card = args.card;
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        return [4 /*yield*/, playerTable.deck.addCard({ id: card.id }, undefined, {
                                autoRemovePreviousCards: false,
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, playerTable.deck.removeCard(card, {
                                autoUpdateCardNumber: false,
                            })];
                    case 2:
                        _a.sent();
                        playerTable.deck.setCardNumber(playerTable.deck.getCardNumber()); // to make sure fake card is set
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_discard = function (args) {
        var constructor_id = args.constructor_id, cards = args.cards;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.discard.addCards(Object.values(cards));
    };
    Heat.prototype.notif_snakeDiscard = function (args) {
        var constructor_id = args.constructor_id, card = args.card;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.inplay.removeCard(card);
    };
    Heat.prototype.notif_eventRemoveHeat = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, card, playerId, playerTable, location, _a, engineCountBefore, diqscardCountBefore;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        constructor_id = args.constructor_id, card = args.card;
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        location = card.location.split('-')[0];
                        _a = location;
                        switch (_a) {
                            case 'engine': return [3 /*break*/, 1];
                            case 'hand': return [3 /*break*/, 3];
                            case 'deck': return [3 /*break*/, 5];
                            case 'discard': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 1:
                        engineCountBefore = playerTable.engine.getCardNumber();
                        return [4 /*yield*/, playerTable.engine.removeCard(card)];
                    case 2:
                        _b.sent();
                        playerTable.engine.setCardNumber(engineCountBefore - 1);
                        this.engineCounters[constructor_id].incValue(-1);
                        return [3 /*break*/, 8];
                    case 3: return [4 /*yield*/, playerTable.hand.removeCard(card)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 5:
                        playerTable.deck.setCardNumber(playerTable.deck.getCardNumber() - 1);
                        return [3 /*break*/, 8];
                    case 6:
                        diqscardCountBefore = playerTable.discard.getCardNumber();
                        return [4 /*yield*/, playerTable.discard.removeCard(card)];
                    case 7:
                        _b.sent();
                        playerTable.discard.setCardNumber(diqscardCountBefore - 1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_pDraw = function (args) {
        var constructor_id = args.constructor_id, areSponsors = args.areSponsors, deckCount = args.deckCount;
        var cards = Object.values(args.cards);
        //const planificationArgs = this.gamedatas.gamestate.args as EnteringPlanificationArgs;
        //planificationArgs._private.canMulligan = false;
        var playerTable = this.getCurrentPlayerTable();
        playerTable.drawCardsPrivate(cards, areSponsors, deckCount);
    };
    Heat.prototype.notif_pMulligan = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, deckCount, heat, cards, playerTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, deckCount = args.deckCount, heat = args.heat;
                        cards = Object.values(args.cards);
                        this.gamedatas.gamestate.args._private.cards = cards;
                        playerTable = this.getCurrentPlayerTable();
                        return [4 /*yield*/, playerTable.hand.removeAll()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.payHeats(constructor_id, [heat])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, playerTable.drawCardsPrivate(cards, true, deckCount)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_pDiscard = function (args) {
        var constructor_id = args.constructor_id;
        var cards = Object.values(args.cards);
        this.getCurrentPlayerTable().discard.addCards(cards);
    };
    Heat.prototype.notif_clearPlayedCards = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, cardIds, sponsorIds, playerId, playerTable, orderCounter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, cardIds = args.cardIds, sponsorIds = args.sponsorIds;
                        playerId = this.getPlayerIdFromConstructorId(constructor_id);
                        playerTable = this.getPlayerTable(playerId);
                        return [4 /*yield*/, playerTable.clearPlayedCards(cardIds, sponsorIds)];
                    case 1:
                        _a.sent();
                        orderCounter = document.getElementById("order-".concat(constructor_id));
                        orderCounter.classList.add('played');
                        this.circuit.removeMapPaths();
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_cooldown = function (args) {
        var _a;
        var constructor_id = args.constructor_id, cards = args.cards;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        var playerTable = this.getPlayerTable(playerId);
        playerTable.cooldown(cards);
        (_a = this.engineCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(cards.length);
    };
    Heat.prototype.notif_finishTurn = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var constructor_id, n, lap;
            return __generator(this, function (_a) {
                constructor_id = args.constructor_id, n = args.n, lap = args.lap;
                this.lapCounters[constructor_id].toValue(Math.min(n, lap));
                return [2 /*return*/];
            });
        });
    };
    Heat.prototype.notif_finishRace = function (args_2) {
        return __awaiter(this, arguments, void 0, function (args, eliminated) {
            var constructor_id, pos, canLeave, carCell;
            if (eliminated === void 0) { eliminated = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constructor_id = args.constructor_id, pos = args.pos, canLeave = args.canLeave;
                        if (!this.animationManager.animationsActive()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.circuit.finishRace(constructor_id, pos)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        carCell = -pos;
                        this.circuit.moveCar(constructor_id, carCell);
                        _a.label = 3;
                    case 3:
                        this.setRank(constructor_id, pos, eliminated);
                        if (eliminated) {
                            this.circuit.setEliminatedPodium(pos);
                        }
                        if (canLeave && constructor_id == this.getConstructorId()) {
                            this.addLeaveText();
                        }
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
    Heat.prototype.setSpeedCounter = function (constructorId, speed) {
        if (this.speedCounters[constructorId] && speed >= 0) {
            this.speedCounters[constructorId].toValue(speed);
        }
        else {
            document.getElementById("speed-counter-".concat(constructorId)).innerText = "".concat(speed >= 0 ? speed : '-');
        }
    };
    Heat.prototype.notif_endOfRace = function (args) {
        var _this = this;
        this.notif_updateTurnOrder({
            constructor_ids: args.order,
        });
        this.gamedatas.scores = args.scores;
        Object.values(this.gamedatas.constructors).forEach(function (constructor) {
            return _this.setScore(_this.getPlayerIdFromConstructorId(constructor.id), Object.values(args.scores)
                .map(function (circuitScores) { return circuitScores[constructor.id]; })
                .reduce(function (a, b) { return a + b; }));
        });
    };
    Heat.prototype.notif_newLegendCard = function (args) {
        return this.legendTable.newLegendCard(args.card);
    };
    Heat.prototype.notif_scrapCards = function (args) {
        var constructor_id = args.constructor_id, cards = args.cards, deckCount = args.deckCount;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).scrapCards(Object.values(cards), deckCount);
    };
    Heat.prototype.notif_resolveBoost = function (args) {
        var constructor_id = args.constructor_id, cards = args.cards, card = args.card, deckCount = args.deckCount;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).resolveBoost(Object.values(cards), card, deckCount);
    };
    Heat.prototype.notif_accelerate = function (args) { };
    Heat.prototype.notif_salvageCards = function (args) {
        var constructor_id = args.constructor_id, cards = args.cards, discard = args.discard, deckCount = args.deckCount;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).salvageCards(Object.values(cards), Object.values(discard), deckCount);
    };
    Heat.prototype.notif_superCoolCards = function (args) {
        var _a;
        var constructor_id = args.constructor_id, cards = args.cards, discard = args.discard;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        (_a = this.engineCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.incValue(Object.values(cards).length);
        return this.getPlayerTable(playerId).superCoolCards(Object.values(cards), Object.values(discard));
    };
    Heat.prototype.notif_directPlay = function (args) {
        var constructor_id = args.constructor_id, card = args.card;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).inplay.addCard(card);
    };
    Heat.prototype.notif_eliminate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cell, giveUp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cell = args.cell, giveUp = args.giveUp;
                        return [4 /*yield*/, this.notif_finishRace(__assign(__assign({}, args), { pos: -cell }), !giveUp)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Heat.prototype.notif_newChampionshipRace = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var index, circuitDatas, playerBoards;
            var _this = this;
            return __generator(this, function (_a) {
                index = args.index, circuitDatas = args.circuitDatas;
                this.championshipTable.newChampionshipRace(index);
                this.circuit.newCircuit(circuitDatas);
                playerBoards = document.getElementById("player_boards");
                this.lapCounters.forEach(function (counter) { return counter.setValue(1); });
                playerBoards.querySelectorAll('.finished').forEach(function (elem) { return elem.classList.remove('finished'); });
                playerBoards.querySelectorAll('.played').forEach(function (elem) { return elem.classList.remove('played'); });
                playerBoards.querySelectorAll('.nbr-laps').forEach(function (elem) { return (elem.innerHTML = "".concat(args.nbrLaps)); });
                Object.entries(args.distancesToCorners).forEach(function (_a) {
                    var constructorId = _a[0], distance = _a[1];
                    _this.cornerCounters[constructorId].setValue(distance);
                });
                return [2 /*return*/];
            });
        });
    };
    Heat.prototype.notif_startRace = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cells, weather;
            var _this = this;
            return __generator(this, function (_a) {
                cells = args.cells, weather = args.weather;
                Object.entries(cells).forEach(function (_a) {
                    var constructor_id = _a[0], cell = _a[1];
                    return _this.circuit.moveCar(Number(constructor_id), cell);
                });
                this.circuit.createWeather(weather);
                return [2 /*return*/];
            });
        });
    };
    Heat.prototype.notif_setupRace = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                Object.entries(args.counters).forEach(function (_a) {
                    var constructor_id = _a[0], counters = _a[1];
                    var table = _this.getPlayerTable(_this.getPlayerIdFromConstructorId(Number(constructor_id)));
                    if (table) {
                        table.inplay.removeAll();
                        table.deck.setCardNumber(counters === null || counters === void 0 ? void 0 : counters.deckCount);
                        _this.engineCounters[constructor_id].setValue(Object.values(counters.engine).length);
                        table.engine.removeAll();
                        table.engine.addCards(Object.values(counters.engine));
                        table.discard.removeAll();
                        table.discard.addCards(Object.values(counters.discard));
                        _this.gearCounters[constructor_id].setValue(1);
                        table.setCurrentGear(1);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    Heat.prototype.notif_clutteredHand = function (args) {
        var constructor_id = args.constructor_id;
        this.gearCounters[constructor_id].toValue(1);
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.getPlayerTable(playerId).setCurrentGear(1);
    };
    Heat.prototype.notif_playerEliminated = function (args) {
        var _a;
        var who_quits = args.who_quits;
        if (who_quits == this.getPlayerId()) {
            (_a = document.getElementById('leave-text-action')) === null || _a === void 0 ? void 0 : _a.remove();
        }
    };
    Heat.prototype.notif_cryCauseNotEnoughHeatToPay = function (args) {
        var _a, _b;
        var constructor_id = args.constructor_id, cell = args.cell, turn = args.turn, distance = args.distance;
        this.circuit.removeMapPaths();
        this.circuit.removeCornerHeatIndicators();
        this.circuit.moveCar(constructor_id, cell, undefined, -1);
        (_a = this.lapCounters[constructor_id]) === null || _a === void 0 ? void 0 : _a.setValue(Math.max(1, Math.min(this.gamedatas.nbrLaps, turn + 1)));
        (_b = this.cornerCounters[constructor_id]) === null || _b === void 0 ? void 0 : _b.setValue(distance);
    };
    Heat.prototype.notif_setWeather = function (args) {
        var weather = args.weather;
        this.circuit.createWeather(weather);
    };
    Heat.prototype.setRank = function (constructorId, pos, eliminated) {
        var playerId = this.getPlayerIdFromConstructorId(constructorId);
        document.getElementById("overall_player_board_".concat(playerId)).classList.add('finished');
        document.getElementById("podium-wrapper-".concat(constructorId)).classList.add('finished');
        document.getElementById("podium-counter-".concat(constructorId)).innerHTML = "".concat(eliminated ? '❌' : pos);
    };
    Heat.prototype.onClick = function (elem, callback) {
        if (!elem.classList.contains('click-binded')) {
            elem.addEventListener('click', callback);
            elem.classList.add('click-binded');
        }
    };
    Heat.prototype.undoToStep = function (stepId, e) {
        var _a, _b;
        if ((_b = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.classList.contains('cancel')) {
            return;
        }
        //this.stopActionTimer();
        //(this as any).checkAction('actRestart');
        this.actions.performAction('actUndoToStep', { stepId: stepId } /*, false*/);
    };
    Heat.prototype.notif_clearTurn = function (args) {
        this.cancelLogs(args.notifIds);
    };
    Heat.prototype.notif_refreshUI = function (args) {
        var _this = this;
        var _a;
        Object.entries(args.datas.constructors).forEach(function (_a) {
            var constructorIdStr = _a[0], constructor = _a[1];
            var constructorId = Number(constructorIdStr);
            _this.circuit.refreshUI(constructor);
            if (!constructor.ai) {
                _this.gearCounters[constructor.id].setValue(constructor.gear);
                _this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
            }
            _this.setSpeedCounter(constructor.id, constructor.speed);
            _this.cornerCounters[constructor.id].setValue(constructor.distanceToCorner);
            _this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(_this.gamedatas.nbrLaps, constructor.turn + 1)));
            var playerId = _this.getPlayerIdFromConstructorId(constructorId);
            if (playerId > 0) {
                _this.getPlayerTable(playerId).refreshUI(constructor);
            }
        });
        (_a = this.championshipTable) === null || _a === void 0 ? void 0 : _a.setRaceProgress(args.datas.progress);
        Object.values(this.gamedatas.constructors).forEach(function (constructor) {
            return _this.setScore(_this.getPlayerIdFromConstructorId(constructor.id), Object.values(args.datas.scores)
                .map(function (circuitScores) { return circuitScores[constructor.id]; })
                .reduce(function (a, b) { return a + b; }, 0));
        });
    };
    Heat.prototype.notif_refreshHand = function (args) {
        var constructor_id = args.constructor_id, hand = args.hand;
        var playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).refreshHand(hand);
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
        var _this = this;
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
            if (this[methodName]) {
                setTimeout(function () { return _this[methodName](notif); }, 50);
            }
        }
        if ($('dockedlog_' + notif.mobileLogId)) {
            dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
        }
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
        //console.warn('onAddingNewUndoableStepToLog', stepId, this.gamedatas?.gamestate?.args, notif);
        if ((_d = (_c = (_b = (_a = this.gamedatas) === null || _a === void 0 ? void 0 : _a.gamestate) === null || _b === void 0 ? void 0 : _b.args) === null || _c === void 0 ? void 0 : _c.undoableSteps) === null || _d === void 0 ? void 0 : _d.includes(parseInt(stepId))) {
            this.onClick($("log_".concat(notif.logId)), function (e) { return _this.undoToStep(stepId, e); });
            if ($("dockedlog_".concat(notif.mobileLogId))) {
                this.onClick($("dockedlog_".concat(notif.mobileLogId)), function (e) { return _this.undoToStep(stepId, e); });
            }
        }
    };
    Heat.prototype.coloredConstructorName = function (constructorName) {
        return "<span style=\"font-weight: bold; color: #".concat(CONSTRUCTORS_COLORS[Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.name == constructorName; }).id], "\">").concat(_(constructorName), "</span>");
    };
    Heat.prototype.cardImageHtml = function (card, args) {
        var _this = this;
        var _a, _b;
        var constructorId = (_a = args.constructor_id) !== null && _a !== void 0 ? _a : (_b = Object.values(this.gamedatas.constructors).find(function (constructor) { return constructor.pId == _this.getPlayerId(); })) === null || _b === void 0 ? void 0 : _b.id;
        return "<div class=\"log-card-image\" style=\"--personal-card-background-y: ".concat((constructorId * 100) / 7, "%;\" data-symbols=\"").concat(card.type < 100 ? Object.keys(card.symbols).length : 0, "\">").concat(this.cardsManager.getHtml(card), "</div>");
    };
    Heat.prototype.cardsImagesHtml = function (cards, args) {
        var _this = this;
        return Object.values(cards)
            .map(function (card) { return _this.cardImageHtml(card, args); })
            .join('');
    };
    Heat.prototype.formatArgCardImage = function (args, argName, argImageName) {
        if (args[argImageName] === '' && args[argName]) {
            var reshuffle = "<div>".concat(_('(discard is reshuffled to the deck)'), "</div>");
            args[argImageName] =
                "".concat(args[argName].isReshuffled ? reshuffle : '', "<div class=\"log-card-set\">").concat(this.cardImageHtml(args[argName], args), "</div>");
        }
    };
    Heat.prototype.formatArgCardsImages = function (args, argName, argImageName) {
        if (args[argImageName] === '' && args[argName]) {
            var cards = Object.values(args[argName]);
            var shuffleIndex = cards.findIndex(function (card) { return card.isReshuffled; });
            if (shuffleIndex === -1) {
                args[argImageName] = "<div class=\"log-card-set\">".concat(this.cardsImagesHtml(Object.values(cards), args), "</div>");
            }
            else {
                var cardsBefore = cards.slice(0, shuffleIndex);
                var cardsAfter = cards.slice(shuffleIndex);
                var reshuffle = "<div>".concat(_('(discard is reshuffled to the deck)'), "</div>");
                args[argImageName] = "\n                <div class=\"log-card-set\">".concat(this.cardsImagesHtml(cardsBefore, args), "</div>\n                ").concat(reshuffle, "\n                <div class=\"log-card-set\">").concat(this.cardsImagesHtml(cardsAfter, args), "</div>\n                ");
            }
        }
    };
    /* This enable to inject translatable styled things to logs or action bar */
    Heat.prototype.bgaFormatText = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                this.formatArgCardImage(args, 'card', 'card_image');
                this.formatArgCardImage(args, 'card2', 'card_image2');
                this.formatArgCardsImages(args, 'cards', 'cards_images');
                this.formatArgCardsImages(args, 'cards2', 'cards_images2');
                if (args.finishIcon === '') {
                    args.finishIcon = "<div class=\"flag icon\"></div>";
                }
                var constructorKeys = Object.keys(args).filter(function (key) { return key.substring(0, 16) == 'constructor_name'; });
                constructorKeys
                    .filter(function (key) { return args[key][0] != '<'; })
                    .forEach(function (key) {
                    args[key] = _this.coloredConstructorName(args[key]);
                });
                log = formatTextIcons(_(log));
                args.processed = true;
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return { log: log, args: args };
    };
    return Heat;
}(GameGui));
define([
    "dojo", "dojo/_base/declare",
    getLibUrl('bga-autofit', '1.x')
], function (dojo, declare, BgaAutofit) {
    window['BgaAutofit'] = BgaAutofit;
    return declare("bgagame.heat", ebg.core.gamegui, new Heat());
});
