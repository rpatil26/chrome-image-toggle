/*
 * Copyright 2015 Rajendra Patil
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var rpatil = rpatil || {};
rpatil.ImageToggle = {
    ATTR_BACKUP_SRC: "data-backup-src",
    ATTR_BACKUP_BGIMG: "data-backup-bgImg",
    ATTR_IMG_SRC: "src",
    hideImages: function() {
        var imgs = [].slice.call(document.getElementsByTagName("img")),
            elements,
            currStyle,
            src,
            me = this,
            bgImg;
        imgs.forEach(function(img) {
            src = img.getAttribute(me.ATTR_IMG_SRC);
            if (src) {
                img.setAttribute(me.ATTR_BACKUP_SRC, "_toggled");
                img.style.visibility = "hidden";
                img.style.opacity = 0;
                //img.removeAttribute(me.ATTR_IMG_SRC);
            }
        });
        elements = [].slice.call(document.getElementsByTagName("*"));
        elements.forEach(function(elem) {
            if (elem) {
                bgImg = me.getBgImageStyle(elem);
                if (bgImg) {
                    elem.setAttribute(me.ATTR_BACKUP_BGIMG, bgImg);
                    elem.style.backgroundImage = "none";
                }
            }
        });
        this.hidden = true;
    },
    showImages: function() {
        var imgs = [].slice.call(document.getElementsByTagName("img")),
            elements,
            currStyle,
            toggled,
            me = this,
            bgImg;
        imgs.forEach(function(img) {
            toggled = img.getAttribute(me.ATTR_BACKUP_SRC);
            if (toggled) {
                img.style.visibility = "";
                img.style.opacity = "";
                img.removeAttribute(me.ATTR_BACKUP_SRC);
            }
        });
        elements = [].slice.call(document.getElementsByTagName("*"));
        elements.forEach(function(elem) {
            if (elem) {
                bgImg = elem.getAttribute(me.ATTR_BACKUP_BGIMG);
                if (bgImg) {
                    elem.style.backgroundImage = bgImg;
                    elem.removeAttribute(me.ATTR_BACKUP_BGIMG);
                }
            }
        });
        this.hidden = false;
    },
    toggleImages: function() {
        this.hidden ? this.showImages() : this.hideImages();
    },
    getBgImageStyle: function(elem) {
        var img;
        if (elem.currentStyle) {
            img = elem.currentStyle.backgroundImage
        } else if (!elem.currentStyle && window.getComputedStyle) {
            img = document.defaultView.getComputedStyle(elem, null).getPropertyValue('background-image');
        }
        if (img && img.indexOf("url") < 0) {
            return false;
        } else {
            return img;
        }
    }

};

// Show images if those were hidden earlier
rpatil.ImageToggle.showImages();

// Notify extension about the state
chrome.runtime.sendMessage({
    hidden: rpatil.ImageToggle.hidden
}, function(response) {});

// Listen for message from an extension
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.toggle) {
            rpatil.ImageToggle.toggleImages();
        }
        // Always return state
        sendResponse({
            hidden: rpatil.ImageToggle.hidden
        });
    });
