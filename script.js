"use strict";
// ==UserScript==
// @name         pbiExtend
// @version      4.2
// @description  try to take over the world!
// @author       You
// @match        https://app.powerbi.com/*
// @match        http://((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/Reports/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
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
//工具单例类
var Util = /** @class */ (function () {
    function Util() {
    }
    ;
    /**
     * 忽略容器元素是否在dom树上自动插入dom
     * @param {HTMLElement} dom - 插入的dom。
     * @param {string} containerSelector - 容器选择器。
     */
    Util.dynamicInsertDom = function (dom, containerSelector) {
        var id = setInterval(function () {
            var containerElement = document.querySelector(containerSelector);
            if (containerElement) {
                containerElement.appendChild(dom);
                clearInterval(id);
            }
        }, 500);
    };
    return Util;
}());
var BaseFullScreen = /** @class */ (function () {
    function BaseFullScreen(extend) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        this.bindExtend = extend;
    }
    return BaseFullScreen;
}());
var FsDirectElement = /** @class */ (function (_super) {
    __extends(FsDirectElement, _super);
    function FsDirectElement(extend, option) {
        var _this = _super.call(this, extend) || this;
        _this.fsSelector = option.fsSelector;
        return _this;
    }
    FsDirectElement.prototype.fullScreen = function () {
        var _a;
        (_a = document.querySelector(this.fsSelector)) === null || _a === void 0 ? void 0 : _a.requestFullscreen();
    };
    return FsDirectElement;
}(BaseFullScreen));
var FsContentElement = /** @class */ (function (_super) {
    __extends(FsContentElement, _super);
    function FsContentElement(extend, option) {
        var _this = _super.call(this, extend) || this;
        _this.fsSelector = option.fsSelector;
        return _this;
    }
    FsContentElement.prototype.fullScreen = function () {
        var _a, _b, _c;
        (_c = (_b = (_a = document.getElementsByTagName('iframe')[0]) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.document.querySelector(this.fsSelector)) === null || _c === void 0 ? void 0 : _c.requestFullscreen();
    };
    return FsContentElement;
}(BaseFullScreen));
//专注模式
var FocusMode = /** @class */ (function (_super) {
    __extends(FocusMode, _super);
    function FocusMode(extend, option) {
        var _this = _super.call(this, extend) || this;
        _this.fsToggleOptions = option.fsToggleOptions;
        return _this;
    }
    Object.defineProperty(FocusMode.prototype, "focused", {
        get: function () {
            return !!parseInt((window.localStorage.getItem('pbiexFsMode' + this.bindExtend.reportID) || '0'));
        },
        set: function (value) {
            window.localStorage.setItem('pbiexFsMode' + this.bindExtend.reportID, value ? '1' : '0');
            this.fsToggle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FocusMode.prototype, "fsToggle", {
        //是否全屏
        get: function () {
            return this._fsToggle;
        },
        set: function (bol) {
            var _this = this;
            this._fsToggle = bol;
            if (this.fsToggleOptions) {
                this.fsToggleOptions.forEach(function (item) {
                    item.toggle.forEach(function (toggleItem) {
                        _this.findElementWithRetry(item.selector, 500).then(function () {
                            var togDom = document.querySelector(item.selector);
                            if (togDom) {
                                if (bol) {
                                    toggleItem.oldValue = togDom.style[toggleItem.styleName];
                                    togDom.style[toggleItem.styleName] = toggleItem.newValue;
                                }
                                else {
                                    togDom.style[toggleItem.styleName] = toggleItem.oldValue;
                                }
                            }
                        });
                    });
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    FocusMode.prototype.findElementWithRetry = function (selector, interval) {
        return new Promise(function (resolve, reject) {
            var retries = 0;
            var findElement = function () {
                var element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                }
                else {
                    retries++;
                    setTimeout(findElement, interval);
                }
            };
            findElement();
        });
    };
    FocusMode.prototype.fullScreen = function () {
        this.fsToggle = !this.fsToggle;
        document.addEventListener('fullscreenchange', function (event) {
            if (!document.fullscreenElement && this.fsToggle) {
                this.bindExtend.showMenu();
            }
            else if (document.fullscreenElement && this.fsToggle) {
                event.stopPropagation();
                this.bindExtend.backMenu();
                this.bindExtend.hideMenu();
            }
        }.bind(this), true);
    };
    return FocusMode;
}(BaseFullScreen));
var FsBodyElement = /** @class */ (function (_super) {
    __extends(FsBodyElement, _super);
    function FsBodyElement(extend, option) {
        var _this = _super.call(this, extend) || this;
        _this.fsToggleOptions = option.fsToggleOptions;
        return _this;
    }
    Object.defineProperty(FsBodyElement.prototype, "fsToggle", {
        //是否全屏
        get: function () {
            return this._fsToggle;
        },
        set: function (bol) {
            this._fsToggle = bol;
            if (this.fsToggleOptions) {
                this.fsToggleOptions.forEach(function (item) {
                    item.toggle.forEach(function (toggleItem) {
                        var togDom = document.querySelector(item.selector);
                        if (togDom) {
                            if (bol) {
                                toggleItem.oldValue = togDom.style[toggleItem.styleName];
                                togDom.style[toggleItem.styleName] = toggleItem.newValue;
                            }
                            else {
                                togDom.style[toggleItem.styleName] = toggleItem.oldValue;
                            }
                        }
                    });
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    FsBodyElement.prototype.fullScreen = function () {
        var _this = this;
        document.addEventListener('fullscreenchange', function (event) {
            if (!document.fullscreenElement && _this.fsToggle) {
                _this.fsToggle = false;
                ExtendCreator.getCurExtend().showMenu();
            }
            else if (document.fullscreenElement && _this.fsToggle) {
                event.stopPropagation();
                ExtendCreator.getCurExtend().backMenu();
                ExtendCreator.getCurExtend().hideMenu();
            }
        }, true);
        this.fsToggle = true;
        document.body.requestFullscreen();
    };
    return FsBodyElement;
}(BaseFullScreen));
var FullScreenCreator = /** @class */ (function () {
    function FullScreenCreator(fsStrategy) {
        this.fsStrategy = fsStrategy;
    }
    FullScreenCreator.prototype.fullScreen = function () {
        this.fsStrategy.fullScreen();
    };
    return FullScreenCreator;
}());
//插件菜单
var ExtendMenus = /** @class */ (function () {
    function ExtendMenus(extend) {
        this.subMenus = [];
        this.dropdownMenuDom = document.createElement('div');
        this.dropdownListDom = document.createElement('ul');
        this.bindExtend = extend;
    }
    ExtendMenus.prototype.menuClick = function () {
        var _a;
        var dropdownMenuDom = this.dropdownMenuDom;
        if (dropdownMenuDom && dropdownMenuDom.classList.contains('clicked')) {
            this.bindExtend.backMenu();
            this.bindExtend.refreshCreator.refreshSpace = parseInt((_a = document.getElementById('ex-rf-input')) === null || _a === void 0 ? void 0 : _a.value);
            this.bindExtend.refreshCreator.startRefresh();
        }
        else {
            this.bindExtend.expandMenu();
        }
    };
    ExtendMenus.prototype.add = function (MenuDom) {
        var _a;
        this.subMenus.push(MenuDom);
        (_a = this.dropdownListDom) === null || _a === void 0 ? void 0 : _a.appendChild(this.subMenus[this.subMenus.length - 1]);
    };
    ExtendMenus.prototype.initSubMenu = function () {
        //全屏
        var fsMenu = document.createElement('li');
        fsMenu.innerHTML = "<svg t=\"1689147509002\" class=\"icon\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"7910\" width=\"15\" height=\"15.51\">\n<path fill=\"#BDD2EF\" d=\"M716.5 853.4H316.1c-77.6 0-140.7-63.1-140.7-140.7V312.3c0-77.6 63.1-140.7 140.7-140.7h400.4c77.6 0 140.7 63.1 140.7 140.7v400.4c0.1 77.6-63.1 140.7-140.7 140.7zM316.1 267.7c-24.6 0-44.6 20-44.6 44.6v400.4c0 24.6 20 44.6 44.6 44.6h400.4c24.6 0 44.6-20 44.6-44.6V312.3c0-24.6-20-44.6-44.6-44.6H316.1z\" \n                        p-id=\"7911\"></path><path d=\"M192.1 895.3h232.1c32.5 0 58.8-26.3 58.8-58.8 0-32.4-26.3-58.8-58.8-58.8H334L463.7 648c22.9-22.9 22.9-60.2 0-83.1-22.9-22.9-60.2-22.9-83.1 0L250.9 694.7v-90.2c0-16.2-6.6-30.9-17.2-41.5-10.6-10.6-25.3-17.2-41.5-17.2-32.5 0-58.8 26.3-58.8 58.8v232.1c-0.1 32.3 26.3 58.6 58.7 58.6zM835.9 131.1H603.8c-32.5 0-58.8 26.3-58.8 58.8 0 32.4 26.3 58.8 58.8 58.8H694L564.3 378.3c-22.9 22.9-22.9 60.2 0 83.1 22.9 22.9 60.2 22.9 83.1 0l129.7-129.7v90.2c0 16.2 6.6 30.9 17.2 41.5 10.6 10.6 25.3 17.2 41.5 17.2 32.5 0 58.8-26.3 58.8-58.8V189.9c0.1-32.5-26.3-58.8-58.7-58.8z\" fill=\"#2867CE\" p-id=\"7912\"></path><span>\u5168\u5C4F</span></span></svg>";
        this.add(fsMenu);
        fsMenu.onclick = this.bindExtend.fullScreen.bind(this.bindExtend);
        //刷新間隔
        var rfMenu = document.createElement('li');
        rfMenu.innerHTML = '<svg t="1689207800044" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" p-id="4205" width="15" height="15.51"><path d="M512 972.8C276.48 972.8 85.333333 781.653333 85.333333 546.133333S276.48 119.466667 512 119.466667s426.666667 191.146667 426.666667 426.666666-191.146667 426.666667-426.666667 426.666667z m0-785.066667C314.026667 187.733333 153.6 348.16 153.6 546.133333s160.426667 358.4 358.4 358.4 358.4-160.426667 358.4-358.4-160.426667-358.4-358.4-358.4z" fill="rgb(var(--ext-primary-color))" p-id="4206"></path><path d="M512 580.266667c-8.533333 0-17.066667-3.413333-23.893333-10.24L310.613333 392.533333c-13.653333-13.653333-13.653333-34.133333 0-47.786666 13.653333-13.653333 34.133333-13.653333 47.786667 0l153.6 153.6 182.613333-182.613334c13.653333-13.653333 34.133333-13.653333 47.786667 0 13.653333 13.653333 13.653333 34.133333 0 47.786667L535.893333 570.026667c-6.826667 6.826667-15.36 10.24-23.893333 10.24z" fill="#EB4AF4" p-id="4207"></path></svg><span>刷新間隔<input id="ex-rf-input" type="number" />分钟</span>';
        this.add(rfMenu);
    };
    ExtendMenus.prototype.init = function () {
        var exMenu = document.createElement('div');
        exMenu.id = 'ex-dropdown';
        this.dropdownMenuDom = document.createElement('div');
        this.dropdownMenuDom.id = 'ex-dropdown-menu';
        this.dropdownMenuDom.innerHTML = "<svg t=\"1689216252460\" class=\"icon\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"12229\" width=\"15\" height=\"15.51\"><path d=\"M627.2 960h-460.8c-25.6 0-51.2-12.8-70.4-25.6-19.2-19.2-32-44.8-32-70.4v-115.2c6.4-19.2 12.8-38.4 32-51.2 12.8-6.4 19.2-12.8 32-12.8s25.6 6.4 44.8 12.8h19.2c12.8 6.4 19.2 6.4 32 6.4s25.6 0 32-6.4c12.8-6.4 19.2-12.8 25.6-19.2s12.8-19.2 19.2-25.6C307.2 640 307.2 633.6 307.2 620.8s0-25.6-6.4-32c-6.4-12.8-12.8-19.2-19.2-25.6s-19.2-12.8-25.6-19.2C243.2 537.6 236.8 537.6 224 537.6s-19.2 0-32 6.4h-6.4c-6.4 6.4-19.2 6.4-25.6 12.8-12.8 6.4-25.6 6.4-38.4 6.4-19.2 0-32-12.8-38.4-25.6s-12.8-25.6-12.8-44.8V396.8c0-25.6 12.8-51.2 32-70.4s44.8-32 70.4-32H256c-6.4-19.2-6.4-32-6.4-51.2 0-25.6 6.4-51.2 12.8-70.4l38.4-57.6c19.2-19.2 38.4-32 57.6-38.4 25.6-12.8 44.8-12.8 70.4-12.8s51.2 6.4 70.4 12.8l57.6 38.4c19.2 19.2 32 38.4 38.4 57.6 12.8 25.6 12.8 44.8 12.8 70.4 0 19.2 0 38.4-6.4 51.2h25.6c25.6 0 51.2 12.8 70.4 32s25.6 44.8 25.6 70.4V460.8c19.2-6.4 38.4-6.4 57.6-6.4 25.6 0 44.8 6.4 70.4 12.8 19.2 6.4 38.4 25.6 57.6 38.4 19.2 19.2 32 38.4 38.4 57.6s12.8 44.8 12.8 70.4-6.4 51.2-12.8 70.4-19.2 38.4-38.4 57.6-38.4 32-57.6 38.4-44.8 12.8-70.4 12.8c-19.2 0-38.4 0-57.6-6.4v51.2c0 25.6-12.8 51.2-25.6 70.4-19.2 19.2-44.8 32-70.4 32z\" fill=\"#ffffff\" p-id=\"12230\"></path></svg>";
        this.dropdownListDom = document.createElement('ul');
        this.dropdownListDom.id = 'ex-dropdownList';
        exMenu.appendChild(this.dropdownMenuDom);
        exMenu.appendChild(this.dropdownListDom);
        this.initSubMenu();
        this.dropdownMenuDom.onclick = this.menuClick.bind(this);
        Util.dynamicInsertDom(exMenu, this.bindExtend.contentSelector);
        // (function d(){
        //     const id=setInterval(() => {
        //         if (document.querySelector(this.bindExtend.contentSelector)) {
        //             console.log(this.dropdownListDom)
        //
        //             console.log(exMenu)
        //             document.querySelector(this.bindExtend.contentSelector)!.appendChild(exMenu)
        //             clearInterval(id)
        //         }
        //         // document.body.appendChild(exMenu)
        //     }, 2500)
        // }).bind(this)()
    };
    return ExtendMenus;
}());
/**
 * 刷新模式1：网页刷新button
 * 刷新模式2：网页重载
 **/
var BaseRefresh = /** @class */ (function () {
    function BaseRefresh() {
        this.refreshID = 0;
    }
    Object.defineProperty(BaseRefresh.prototype, "refreshSpace", {
        get: function () {
            var space = window.localStorage.getItem('pbiexRefreshSpace' + ExtendCreator.getCurExtend().reportID);
            return space ? Math.max(parseInt(space), 1) : 0;
        },
        set: function (num) {
            window.localStorage.setItem('pbiexRefreshSpace' + ExtendCreator.getCurExtend().reportID, num ? Math.max(num, 1).toString() : '');
        },
        enumerable: false,
        configurable: true
    });
    BaseRefresh.prototype.startRefresh = function () {
        var _this = this;
        if (this.refreshSpace > 0) {
            if (this.refreshID > 0) {
                clearInterval(this.refreshID);
            }
            this.refreshID = setInterval(function () {
                _this.refreshData();
            }, this.refreshSpace * 60 * 1000);
        }
    };
    return BaseRefresh;
}());
var ButtonRefresh = /** @class */ (function (_super) {
    __extends(ButtonRefresh, _super);
    function ButtonRefresh(refreshSelector) {
        var _this = _super.call(this) || this;
        _this.refreshID = 0;
        _this.refreshSelector = refreshSelector;
        return _this;
    }
    ButtonRefresh.prototype.refreshData = function () {
        var _a;
        (_a = document.querySelector(this.refreshSelector)) === null || _a === void 0 ? void 0 : _a.click();
    };
    return ButtonRefresh;
}(BaseRefresh));
var PageRefresh = /** @class */ (function (_super) {
    __extends(PageRefresh, _super);
    function PageRefresh() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PageRefresh.prototype.refreshData = function () {
        window.location.reload();
    };
    return PageRefresh;
}(BaseRefresh));
var RefreshCreator = /** @class */ (function (_super) {
    __extends(RefreshCreator, _super);
    function RefreshCreator(refreshStrategy) {
        var _this = _super.call(this) || this;
        _this._refreshStrategy = refreshStrategy;
        return _this;
    }
    RefreshCreator.prototype.refreshData = function () {
        this._refreshStrategy.refreshData();
    };
    RefreshCreator.prototype.startRefresh = function () {
        var _this = this;
        if (this.refreshSpace > 0) {
            if (this.refreshID > 0) {
                clearInterval(this.refreshID);
            }
            this.refreshID = setInterval(function () {
                _this.refreshData();
            }, this.refreshSpace * 60 * 1000);
        }
    };
    return RefreshCreator;
}(BaseRefresh));
//插件基类
var BaseExtend = /** @class */ (function () {
    function BaseExtend() {
        var _this = this;
        this.refreshID = 0;
        //全屏
        this.fullScreen = function () {
            _this.fullScreenCreator.fullScreen();
        };
        this.menus = new ExtendMenus(this);
    }
    BaseExtend.prototype.init = function () {
        this.menus.init();
    };
    //菜單展开
    BaseExtend.prototype.expandMenu = function () {
        var _a, _b, _c, _d;
        var element = document.getElementById('ex-dropdownList');
        if (element) {
            // element.style.display = 'block';
        }
        (_a = document.getElementById('ex-dropdown-menu')) === null || _a === void 0 ? void 0 : _a.classList.add('clicked');
        (_d = (_c = (_b = document.getElementById('ex-dropdown-menu')) === null || _b === void 0 ? void 0 : _b.firstElementChild) === null || _c === void 0 ? void 0 : _c.firstElementChild) === null || _d === void 0 ? void 0 : _d.setAttribute('d', 'M1022.503684 339.908142v-17.102296c0-0.732956-4.031256-24.431852-6.107963-32.372204a164.487444 164.487444 0 0 0-17.835252-29.929019l-7.512795-8.001432L788.324382 37.747211l-5.802565-6.107963a120.815508 120.815508 0 0 0-82.823979-31.150611l-6.901998-0.488637H184.735476A183.971846 183.971846 0 0 0 1.130108 184.094005v655.75091a184.155085 184.155085 0 0 0 183.727528 184.094005h654.162839a184.155085 184.155085 0 0 0 183.727527-184.094005V339.908142zM184.002521 98.216045h505.067462v96.627975a105.301282 105.301282 0 0 1-104.995885 105.240203H288.937325a105.301282 105.301282 0 0 1-104.995884-105.240203zM839.75343 926.51691H484.819699v-251.098359h-189.346853v251.098359H184.002521V635.350313a85.511482 85.511482 0 0 1 85.511482-85.511482h484.911184a85.511482 85.511482 0 0 1 85.511482 85.511482v291.044438z');
        var inputElement = document.getElementById('ex-rf-input');
        if (inputElement) {
            inputElement.value = this.refreshCreator.refreshSpace.toString();
        }
    };
    //菜单显示
    BaseExtend.prototype.showMenu = function () {
        var dropListElement = document.getElementById('ex-dropdownList');
        if (dropListElement) {
            // dropListElement.style.display = 'none'
        }
        var dropMenuElement = document.getElementById('ex-dropdown-menu');
        if (dropMenuElement) {
            dropMenuElement.style.display = 'flex';
        }
    };
    //菜單收缩
    BaseExtend.prototype.backMenu = function () {
        var _a, _b;
        var dropListElement = document.getElementById('ex-dropdownList');
        if (dropListElement) {
            // dropListElement.style.display = 'none'
        }
        var dropMenuElement = document.getElementById('ex-dropdown-menu');
        if (dropMenuElement) {
            dropMenuElement.classList.remove('clicked');
        }
        (_b = (_a = dropMenuElement === null || dropMenuElement === void 0 ? void 0 : dropMenuElement.firstElementChild) === null || _a === void 0 ? void 0 : _a.firstElementChild) === null || _b === void 0 ? void 0 : _b.setAttribute('d', 'M627.2 960h-460.8c-25.6 0-51.2-12.8-70.4-25.6-19.2-19.2-32-44.8-32-70.4v-115.2c6.4-19.2 12.8-38.4 32-51.2 12.8-6.4 19.2-12.8 32-12.8s25.6 6.4 44.8 12.8h19.2c12.8 6.4 19.2 6.4 32 6.4s25.6 0 32-6.4c12.8-6.4 19.2-12.8 25.6-19.2s12.8-19.2 19.2-25.6C307.2 640 307.2 633.6 307.2 620.8s0-25.6-6.4-32c-6.4-12.8-12.8-19.2-19.2-25.6s-19.2-12.8-25.6-19.2C243.2 537.6 236.8 537.6 224 537.6s-19.2 0-32 6.4h-6.4c-6.4 6.4-19.2 6.4-25.6 12.8-12.8 6.4-25.6 6.4-38.4 6.4-19.2 0-32-12.8-38.4-25.6s-12.8-25.6-12.8-44.8V396.8c0-25.6 12.8-51.2 32-70.4s44.8-32 70.4-32H256c-6.4-19.2-6.4-32-6.4-51.2 0-25.6 6.4-51.2 12.8-70.4l38.4-57.6c19.2-19.2 38.4-32 57.6-38.4 25.6-12.8 44.8-12.8 70.4-12.8s51.2 6.4 70.4 12.8l57.6 38.4c19.2 19.2 32 38.4 38.4 57.6 12.8 25.6 12.8 44.8 12.8 70.4 0 19.2 0 38.4-6.4 51.2h25.6c25.6 0 51.2 12.8 70.4 32s25.6 44.8 25.6 70.4V460.8c19.2-6.4 38.4-6.4 57.6-6.4 25.6 0 44.8 6.4 70.4 12.8 19.2 6.4 38.4 25.6 57.6 38.4 19.2 19.2 32 38.4 38.4 57.6s12.8 44.8 12.8 70.4-6.4 51.2-12.8 70.4-19.2 38.4-38.4 57.6-38.4 32-57.6 38.4-44.8 12.8-70.4 12.8c-19.2 0-38.4 0-57.6-6.4v51.2c0 25.6-12.8 51.2-25.6 70.4-19.2 19.2-44.8 32-70.4 32z');
    };
    //菜单隐藏
    BaseExtend.prototype.hideMenu = function () {
        var dropListElement = document.getElementById('ex-dropdownList');
        if (dropListElement) {
            // dropListElement.style.display = 'none'
        }
        var dropMenuElement = document.getElementById('ex-dropdown-menu');
        if (dropMenuElement) {
            dropMenuElement.style.display = 'none';
        }
    };
    return BaseExtend;
}());
//官网入口
var WebExtend = /** @class */ (function (_super) {
    __extends(WebExtend, _super);
    function WebExtend() {
        var _this = _super.call(this) || this;
        // contentSelector = '#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > div';
        _this.contentSelector = 'body';
        _this.init();
        var fsToggleOptions = [
            //顶部菜单栏
            {
                selector: '#pbiThemed0 > top-bar > tri-header',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //页面栏
            {
                selector: '#content > tri-shell > tri-item-renderer > tri-extension-page-outlet > div:nth-child(2) > report > exploration-container > div > div > docking-container > div > div > exploration-fluent-navigation',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //左边菜单栏
            {
                selector: '#rootContent > tri-shell-panel-outlet > tri-item-renderer-panel > tri-extension-panel-outlet > mat-sidenav-container > mat-sidenav-content > div > app-navigation-pane',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //报表菜单栏
            {
                selector: '#exploration-container-app-bars',
                toggle: [{ styleName: 'zIndex', oldValue: '', newValue: '-1' }]
            },
            //底栏
            {
                selector: '#content > tri-shell > tri-item-renderer > tri-extension-page-outlet > div:nth-child(2) > report > exploration-container > div > div > docking-container > div > pbi-status-bar',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //筛选器
            {
                selector: '#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > outspace-pane',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            { selector: '.explorationHost', toggle: [{ styleName: 'top', oldValue: '', newValue: '0px' }] }
        ];
        _this.refreshCreator = new RefreshCreator(new ButtonRefresh('#reportAppBarRefreshBtn'));
        _this.fullScreenCreator = new FullScreenCreator(new FocusMode(_this, { fsToggleOptions: fsToggleOptions }));
        _this.menus.subMenus[0].innerHTML = "<svg class=\"icon\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"4205\" width=\"15\" height=\"15.51\"><path d=\"M592.896 851.968H457.728c-217.088 0-394.24-177.152-394.24-394.24S239.616 63.488 457.728 63.488s394.24 177.152 394.24 394.24v135.168h-81.92V457.728c0-172.032-140.288-312.32-312.32-312.32S145.408 285.696 145.408 457.728s140.288 312.32 312.32 312.32h135.168v81.92z\" fill=\"#437DFF\" p-id=\"1552\"></path><path d=\"M571.71968 630.23104l57.92768-57.92768 330.9056 330.89536-57.92768 57.92768z\" fill=\"#437DFF\" p-id=\"1553\"></path><path d=\"M699.392 457.728h-61.44c0-136.192-126.976-187.392-206.848-187.392v-61.44c111.616 1.024 268.288 77.824 268.288 248.832zM382.976 676.864c-45.056-5.12-98.304-45.056-130.048-97.28-27.648-46.08-33.792-93.184-18.432-133.12l57.344 22.528c-11.264 29.696 3.072 61.44 13.312 78.848 23.552 38.912 61.44 65.536 83.968 68.608l-6.144 60.416z\" p-id=\"1554\"></path></svg>\n<span>\u4E13\u6CE8\u6A21\u5F0F</span>\n<label class=\"switch\"><input type=\"checkbox\" >\n  <div class=\"slider round\"></div>\n</label>";
        // this.menus.subMenus[0].querySelector('input')!.onclick=this.menus.subMenus[0].onclick
        _this.menus.subMenus[0].querySelector('input').checked = _this.fullScreenCreator.fsStrategy.focused;
        _this.fullScreenCreator.fsStrategy.focused = _this.fullScreenCreator.fsStrategy.focused;
        _this.menus.subMenus[0].onclick = null;
        _this.menus.dropdownMenuDom.onclick = function () {
            var _a;
            var dropdownMenu = document.getElementById('ex-dropdown-menu');
            if (dropdownMenu && dropdownMenu.classList.contains('clicked')) {
                this.backMenu();
                this.refreshCreator.refreshSpace = parseInt((_a = document.getElementById('ex-rf-input')) === null || _a === void 0 ? void 0 : _a.value);
                this.refreshCreator.startRefresh();
                this.fullScreenCreator.fsStrategy.focused = this.menus.subMenus[0].querySelector('input').checked;
            }
            else {
                this.expandMenu();
            }
        }.bind(_this);
        return _this;
    }
    Object.defineProperty(WebExtend.prototype, "reportID", {
        get: function () {
            return window.location.href.split('/')[6];
        },
        enumerable: false,
        configurable: true
    });
    WebExtend.prototype.menuBackEvent = function () {
        window.addEventListener('click', function (event) {
            var _a;
            var element = document.getElementById('ex-dropdown');
            var targetElement = event.target;
            if (element && targetElement) {
                if (!element.contains(targetElement) &&
                    !((_a = document.querySelector(ExtendCreator.getCurExtend().refreshCreator.refreshSelector)) === null || _a === void 0 ? void 0 : _a.contains(targetElement))) {
                    ExtendCreator.getCurExtend().backMenu();
                }
            }
        });
    };
    return WebExtend;
}(BaseExtend));
//公网入口
var PublicNetExtend = /** @class */ (function (_super) {
    __extends(PublicNetExtend, _super);
    function PublicNetExtend() {
        var _this = _super.call(this) || this;
        _this.contentSelector = 'body';
        _this.fsToggleOptions = [
            //顶部菜单栏
            {
                selector: '#pbiThemed0 > top-bar > tri-header',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //页面底栏
            {
                selector: '#embedWrapperID > div.logoBarWrapper > logo-bar > div > div',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //页面底栏
            {
                selector: '#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > div > div.displayAreaViewport',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //底栏
            {
                selector: '#reportLandingContainer > div > exploration-container > div > div > docking-container > div > pbi-status-bar',
                toggle: [{ styleName: 'display', oldValue: '', newValue: 'none' }]
            },
            //报表容器
            {
                selector: '#reportLandingContainer',
                toggle: [{ styleName: 'height', oldValue: '', newValue: '100%' },
                    { styleName: 'width', oldValue: '', newValue: '100%' }]
            }
        ];
        _this.init();
        _this.fullScreenCreator = new FullScreenCreator(new FocusMode(_this, { fsToggleOptions: _this.fsToggleOptions }));
        _this.refreshCreator = new RefreshCreator(new PageRefresh());
        _this.menus.subMenus[0].innerHTML = "<svg class=\"icon\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"4205\" width=\"15\" height=\"15.51\"><path d=\"M592.896 851.968H457.728c-217.088 0-394.24-177.152-394.24-394.24S239.616 63.488 457.728 63.488s394.24 177.152 394.24 394.24v135.168h-81.92V457.728c0-172.032-140.288-312.32-312.32-312.32S145.408 285.696 145.408 457.728s140.288 312.32 312.32 312.32h135.168v81.92z\" fill=\"#437DFF\" p-id=\"1552\"></path><path d=\"M571.71968 630.23104l57.92768-57.92768 330.9056 330.89536-57.92768 57.92768z\" fill=\"#437DFF\" p-id=\"1553\"></path><path d=\"M699.392 457.728h-61.44c0-136.192-126.976-187.392-206.848-187.392v-61.44c111.616 1.024 268.288 77.824 268.288 248.832zM382.976 676.864c-45.056-5.12-98.304-45.056-130.048-97.28-27.648-46.08-33.792-93.184-18.432-133.12l57.344 22.528c-11.264 29.696 3.072 61.44 13.312 78.848 23.552 38.912 61.44 65.536 83.968 68.608l-6.144 60.416z\" p-id=\"1554\"></path></svg>\n<span>\u4E13\u6CE8\u6A21\u5F0F</span>\n<label class=\"switch\"><input type=\"checkbox\" >\n  <div class=\"slider round\"></div>\n</label>";
        // this.menus.subMenus[0].querySelector('input')!.onclick=this.menus.subMenus[0].onclick
        _this.menus.subMenus[0].querySelector('input').checked = _this.fullScreenCreator.fsStrategy.focused;
        _this.fullScreenCreator.fsStrategy.focused = _this.fullScreenCreator.fsStrategy.focused;
        _this.menus.subMenus[0].onclick = null;
        _this.menus.dropdownMenuDom.onclick = function () {
            var _a;
            var dropdownMenu = document.getElementById('ex-dropdown-menu');
            if (dropdownMenu && dropdownMenu.classList.contains('clicked')) {
                this.backMenu();
                this.refreshCreator.refreshSpace = parseInt((_a = document.getElementById('ex-rf-input')) === null || _a === void 0 ? void 0 : _a.value);
                this.refreshCreator.startRefresh();
                this.fullScreenCreator.fsStrategy.focused = this.menus.subMenus[0].querySelector('input').checked;
            }
            else {
                this.expandMenu();
            }
        }.bind(_this);
        return _this;
    }
    Object.defineProperty(PublicNetExtend.prototype, "reportID", {
        get: function () {
            return window.location.href.split('/')[3].split('=')[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PublicNetExtend.prototype, "fsSelector", {
        get: function () {
            return '';
        },
        enumerable: false,
        configurable: true
    });
    PublicNetExtend.prototype.menuBackEvent = function () {
        window.addEventListener('click', function (event) {
            var element = document.getElementById('ex-dropdown');
            var targetElement = event.target;
            if (element && targetElement) {
                if (!element.contains(targetElement)) {
                    ExtendCreator.getCurExtend().backMenu();
                }
            }
        });
    };
    return PublicNetExtend;
}(BaseExtend));
//服务器版入口
var LocalExtend = /** @class */ (function () {
    function LocalExtend() {
    }
    return LocalExtend;
}());
//365入口
var M365Extend = /** @class */ (function () {
    function M365Extend() {
    }
    return M365Extend;
}());
//SharePoint入口
var SharePointExtend = /** @class */ (function () {
    function SharePointExtend() {
    }
    return SharePointExtend;
}());
//插件创建
var ExtendCreator = /** @class */ (function () {
    function ExtendCreator() {
    }
    //根据特征返回当前入口的插件对象
    ExtendCreator.getCurExtend = function () {
        if (!this.curExtend) {
            var mediaType = window.location.href.split('/')[2];
            switch (true) {
                case mediaType === 'app.powerbi.com'
                    && (window.location.href.split('/')[3].split('?')[0] === 'view'
                        || /^\d*?(\.\d*?)*?$/.test(window.location.href.split('/')[3].split('?')[0])):
                    this.curExtend = new PublicNetExtend();
                    return this.curExtend;
                case mediaType === 'app.powerbi.com':
                    this.curExtend = new WebExtend();
                    return this.curExtend;
                case /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(mediaType):
                    // return new LocalExtend()
                    break;
                default:
                    this.curExtend = new PublicNetExtend();
                    return this.curExtend;
            }
        }
        return this.curExtend;
    };
    return ExtendCreator;
}());
//插件操作
var ExtendOperator = /** @class */ (function () {
    function ExtendOperator() {
        var _this = this;
        this.oldHref = window.location.href;
        this.obServerFunc = function () {
            if (window.location.href !== _this.oldHref) {
                _this.curExtend.refreshCreator.startRefresh();
                _this.oldHref = window.location.href;
            }
            // if((<FocusMode>this.curExtend.fullScreenCreator.fsStrategy).focused
            //     &&(<FocusMode>this.curExtend.fullScreenCreator.fsStrategy).fsToggle){
            //     (<FocusMode>this.curExtend.fullScreenCreator.fsStrategy).fsToggle=
            //         (<FocusMode>this.curExtend.fullScreenCreator.fsStrategy).focused
            // }
            requestAnimationFrame(_this.obServerFunc);
        };
        this.curExtend = ExtendCreator.getCurExtend();
    }
    ExtendOperator.prototype.init = function () {
        this.addStyle();
        // this.createAuth()
        this.curExtend.refreshCreator.startRefresh();
        this.curExtend.menuBackEvent();
        this.obServerFunc();
    };
    ExtendOperator.prototype.createAuth = function () {
        var loginDialog = document.createElement('dialog');
        loginDialog.setAttribute('id', 'loginDialog');
        var loginForm = document.createElement('form');
        var usernameInput = document.createElement('input');
        usernameInput.setAttribute('type', 'text');
        usernameInput.setAttribute('placeholder', '用户名');
        loginForm.appendChild(usernameInput);
        var passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'password');
        passwordInput.setAttribute('placeholder', '密码');
        loginForm.appendChild(passwordInput);
        var loginButton = document.createElement('div');
        loginButton.textContent = '登录';
        loginButton.addEventListener('click', function () {
            // 获取用户名和密码
            var username = usernameInput.value;
            var password = passwordInput.value;
            // 构建请求参数
            var requestData = {
                username: username,
                password: password
            };
            // 发送POST请求
            fetch('http://localhost:8086/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            })
                .then(function (response) { return response.json(); })
                .then(function (data) {
                console.log('响应数据:', data);
                var newDiv = document.createElement('div');
                newDiv.setAttribute('id', 'authDiv');
                newDiv.style.display = 'none';
                newDiv.textContent = data.username;
                document.body.appendChild(newDiv);
                // 在这里可以根据响应数据执行相应的操作
            })
                .catch(function (error) {
                console.error('发生错误:', error);
            });
            // 关闭登录窗口
            loginDialog.close();
        });
        loginForm.appendChild(loginButton);
        loginDialog.appendChild(loginForm);
        document.body.appendChild(loginDialog);
        var style = document.createElement('style');
        style.textContent = "\n    #loginDialog {\n        width: 300px;\n        padding: 20px;\n        border: 1px solid #ccc;\n        border-radius: 5px;\n        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n        background-color: #fff;\n        text-align: center;\n    }\n\n    form {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n    }\n\n    input {\n        width: 100%;\n        margin-bottom: 10px;\n        padding: 8px;\n        box-sizing: border-box;\n    }\n\n    button {\n        background-color: #4CAF50;\n        color: #fff;\n        padding: 10px;\n        border: none;\n        border-radius: 3px;\n        cursor: pointer;\n    }\n\n    button:hover {\n        background-color: #45a049;\n    }\n";
        document.head.appendChild(style);
        loginDialog.showModal();
    };
    ExtendOperator.prototype.addStyle = function () {
        var style = document.createElement('style');
        style.innerHTML = "\n                    :root{\n                        --ext-primary-color:26 86 219\n                    }\n                    #ex-dropdown{\n                      position:absolute !important;\n                      left:0;\n                      top:0;\n                      width:2em;\n                      height:2em;\n                      z-index:999999;\n                    }\n                    #ex-dropdown-menu {\n                      width:100%;\n                      height:100%;\n                      border-bottom-right-radius:2em;\n                      display: flex;\n                      align-items: center;\n                      justify-content: center;\n                      background-image: linear-gradient(315deg,rgba(0, 249, 229) 0,rgba(103, 114, 255) 91%);\n                      opacity:0.9;\n                      cursor: pointer;\n                      transition:382ms;\n                      overflow: hidden;\n                      position: relative;\n                    }\n                    #ex-dropdown-menu:hover{\n                      /*filter: brightness(0.5);*/\n                      /*background-image: linear-gradient(315deg,rgba(0, 249, 229,1) 0,rgba(103, 114, 255,1) 91%);*/\n                      opacity:1;\n                    }\n                    #ex-dropdown-menu:before {\n                        content: \"\";\n                        position: absolute;\n                        width: 20px;\n                        height: 20px;\n                        background-color: rgba(0, 0, 0, 0.1);\n                        border-radius: 50%;\n                        transform: scale(0, 0);   /* \u8D77\u59CB\u72B6\u6001\u8BBE\u4E3A 0 */\n                        transition: transform 800ms ease-in;\n                    }\n            \n                    #ex-dropdown-menu:active:before {\n                        transform: scale(20, 20);  /* \u653E\u5927\u5230 20 \u500D */\n                    }\n                    #ex-dropdown-menu.clicked{\n                      border-radius:2em;\n                      width:150%;\n                      height:150%;\n                      opacity:0.8;\n                    }\n                    #ex-dropdown-menu.clicked:hover{\n                      opacity:1;\n                      /*filter: brightness(0.75);*/\n                    }\n                    #ex-dropdown-menu.clicked:hover path{\n                      fill:white\n                    }\n                    #ex-dropdown-menu>svg{\n                      /*margin: 15% 0 0 25%;*/\n                    }\n                    input[type=\"number\"]::-webkit-inner-spin-button,\n                    input[type=\"number\"]::-webkit-outer-spin-button {\n                      -webkit-appearance: none;\n                      margin: 0;\n                    }\n                    #ex-dropdown li>svg{\n                      margin-right:5px\n                    }\n                    #ex-rf-input{\n                      border: 0px;\n                      background:  transparent;\n                      width: 20px;\n                      border-bottom: 1px solid rgb(var(--ext-primary-color));\n                      outline:none;\n                      text-align: center;\n                    }\n                    #ex-dropdownList {\n                      position: absolute;\n                      list-style-type: none;\n                      width: auto;\n                      white-space: nowrap;\n                      background-color: rgba(255, 255, 255,0.9);\n                      padding: 0;\n                      transform: scale(0);\n                      overflow:hidden;\n                      transform-origin: top left;\n                      transition: transform 382ms;\n                      border-radius:8px;\n                      backdrop-filter: blur(10px);\n                      box-shadow: 0 2px 10px rgb(0 0 0 / 25%);\n                    }\n                    #ex-dropdown-menu.clicked + #ex-dropdownList{\n                      transform: scale(1);\n                    }\n                    #ex-dropdownList li {\n                      padding: 8px 12px;\n                      cursor: pointer;\n                      display: flex;\n                      align-items: center;\n                      transition: 250ms;\n                      box-sizing: border-box;\n                      height:40px;\n                    }\n                    #ex-dropdownList li:hover {\n                      /*background-color: rgba(58, 132, 255,0.8);*/\n                      background-color: rgb(232,233,235);\n                    }\n                    .switch {\n                      position: relative;\n                      display: inline-block;\n                      width: 60px;\n                      height: 34px;\n                      transform:scale(0.7);\n                    }\n                    \n                    .switch input {\n                        display:none;\n                    }\n                    \n                    .slider {\n                      position: absolute;\n                      cursor: pointer;\n                      top: 0;\n                      left: 0;\n                      right: 0;\n                      bottom: 0;\n                      background-color: #ccc;\n                      -webkit-transition: 382ms;\n                      transition: .4s;\n                    }\n                    \n                    .slider:before {\n                      position: absolute;\n                      content: \"\";\n                      height: 26px;\n                      width: 26px;\n                      left: 4px;\n                      bottom: 4px;\n                      background-color: white;\n                      -webkit-transition: 382ms;\n                      transition: 382ms;\n                    }\n                    \n                    input:checked + .slider {\n                      background-color: rgb(var(--ext-primary-color));\n                    }\n                    \n                    input:focus + .slider {\n                      box-shadow: 0 0 1px rgba(103, 114, 255);\n                    }\n                    \n                    input:checked + .slider:before {\n                      -webkit-transform: translateX(26px);\n                      -ms-transform: translateX(26px);\n                      transform: translateX(26px);\n                    }\n                    \n                    /* Rounded sliders */\n                    .slider.round {\n                      border-radius: 99999px;\n                    }\n                    .slider.round:before {\n                      border-radius: 50%;\n                    }\n                    ";
        document.head.appendChild(style);
    };
    return ExtendOperator;
}());
if (!/^\d*?(\.\d*?)*?$/.test(window.location.href.split('/')[3].split('?')[0])) {
    var extendOperator = new ExtendOperator();
    extendOperator.init();
    //test
    window['pbiExtend'] = ExtendCreator.getCurExtend();
    //即时效率看板
    if (['21adcecb-6afe-4733-8607-da5cd8b84101', 'eyJrIjoiZDBhYjI1ZjYtZDAzOC00NmVjLWI4YjktOTEyNDA5ZjFhZWE5IiwidCI6IjRmODIyODk5LWRjMTctNDAxMy04NjFkLTNjNTJiODQ4MDQ4ZSIsImMiOjEwfQ%3D%3D']
        .includes(ExtendCreator.getCurExtend().reportID)) {
        var divContainer_1 = document.createElement('div');
        divContainer_1.textContent = '全屏';
        divContainer_1.className = 'jsxl-button';
        divContainer_1.onclick = new FullScreenCreator(new FsBodyElement(ExtendCreator.getCurExtend(), { fsToggleOptions: ExtendCreator.getCurExtend().fsToggleOptions })).fsStrategy.fullScreen.bind(ExtendCreator.getCurExtend().fullScreenCreator.fsStrategy);
        document.addEventListener('fullscreenchange', function (event) {
            if (document.fullscreenElement) {
                divContainer_1.style.display = 'none';
            }
            else {
                divContainer_1.style.display = 'block';
            }
        }, true);
        var jsxlStyle = document.createElement('style');
        jsxlStyle.innerHTML = "\n                        .jsxl-button{\n                            color:#dddddd;\n                            background: linear-gradient(to bottom, #0E318B00, #2F61DE);\n                            transition:1s;\n                            border-bottom-left-radius: 3px;\n                            width:75px;\n                            position:absolute;\n                            right:0;\n                            top:0;\n                            cursor:pointer;\n                            text-align: center;\n                            padding:2px;\n                            font-size:14px;\n                        }\n                        .jsxl-button:hover{\n                            box-shadow:0 0 5px #3474D3;\n                            background: #2F61DE;\n                            transition:1s;\n                        }\n                        ";
        document.head.appendChild(jsxlStyle);
        var containerSelector = "#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > div > div.displayArea.disableAnimations.fitToPage";
        Util.dynamicInsertDom(divContainer_1, containerSelector);
    }
}
