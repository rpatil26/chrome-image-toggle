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

//Listen when any tab activates, get the tab state 
var hidden = false;
chrome.tabs.onActivated.addListener(function(selectInfo) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var tab = tabs[0];
        chrome.browserAction.enable(tabs[0].id);
        if (!tab || tab.url.match(/chrome:\/\//gi)) {
            chrome.browserAction.disable(tabs[0].id);
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, {
            getState: true
        }, function(response) {
            hidden = response && response.hidden;
            chrome.browserAction.setBadgeText({
                text: hidden ? "off" : ""
            });
        });
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (sender.tab && sender.tab.selected || sender.tab.highlighted) {
        hidden = request && request.hidden;
        chrome.browserAction.setBadgeText({
            text: hidden ? "off" : ""
        });    
    }
  });


//Block/Unblock on click of an icon
chrome.browserAction.onClicked.addListener(function(tab) { //Fired when User Clicks ICON
    chrome.tabs.sendMessage(tab.id, {
        toggle: true
    }, function(response) {
        hidden = response.hidden; //toggle hidden
        chrome.browserAction.setBadgeText({
            text: hidden ? "off" : ""
        });
    });
});

// Inject script in open tabs
chrome.windows.getAll({
    populate: true
}, function(windows) {
    var manifest = chrome.app.getDetails(),
        openTabs;
    windows.forEach(function(window) {
        openTabs = window.tabs;
        openTabs.forEach(function(tab) {
            if (tab && !tab.url.match(/chrome[\-a-zA-Z0-9]*:/gi)) {
                chrome.tabs.executeScript(tab.id, {
                    file: manifest.content_scripts[0].js[0]
                });
            } else {
                chrome.browserAction.disable(tab.id);
            }
        });
    });
});
