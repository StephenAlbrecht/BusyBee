/*******************************************************************************

    BusyBee - A browser extension to block distracting websites.
    Copyright (C) 2018 Stephen Albrecht

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/StephenAlbrecht/BusyBee
*/

const EXTENSION_ID = chrome.runtime.id;
var blocked = {'hostname': ""};

if(BusyBee.getEnabled() === "false") {
    chrome.alarms.get("tempDisable", function(alarm) {
        if(alarm === undefined) {
            chrome.browserAction.setIcon({path: "/images/honeybee-g16.png"});
        }
    });
}

// Listener for first run
chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason === "install") {
        chrome.tabs.create({"url" : "/html/firstRun.html"});
    }
});

// Listener for Active Tab to set appropriate icon
chrome.tabs.onActivated.addListener(function() {
    setIcon();
});

// Listener to determine if page should be blocked.
chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
    let flag = { onBlockedSite : false };
    let tabURL = tab.url;
    let urlObj = new URL(tabURL);
    let domain = urlObj.hostname;
    if(tabURL === BLOCKPAGE_URL) {
        flag.onBlockedSite = true;
    }
    for (site in BusyBee.getBlockedSites()) {
        site = replaceAll(site, "&amp;", "&");
        if (tabURL.match(site) || site.match(tabURL) || tabURL.includes(site) || site.includes(tabURL)) {
            flag.onBlockedSite = true;
            blocked.hostname = site;
            if(BusyBee.getEnabled() != "true") {
                return;
            }
            chrome.alarms.get(blocked.hostname, function(alarm) { 
                if(BusyBee.getMode() === "popup") {
                    if(alarm === undefined) {
                        chrome.browserAction.setIcon({path: "/images/honeybee16.png"});
                        chrome.tabs.executeScript(tabId, {
                            file: "/js/dialog.js"
                        });
                    }
                    else {
                        chrome.browserAction.setIcon({path: "/images/honeybee-t16.png"});
                    }
                } else {
                    chrome.tabs.update(tabId, {"url" : BLOCKPAGE_URL}, function() {
                        BusyBee.addBlockpageTab(tabId, tab);
                    });
                }
            });
        }
    }
    // tab isn't on blocked site and is in blockpageTabs, remove it
    let blockpageTabs = BusyBee.getBlockpageTabs();
    if(blockpageTabs[tabId] != undefined && !flag.onBlockedSite) {
        BusyBee.removeBlockpageTab(tabId);
    }
});

// Listener for commands from dialog, blockpage, and popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    let tabURL = sender.url;
    let urlObj = new URL(tabURL);
    let domain = urlObj.hostname;
    for (site in BusyBee.getBlockedSites()) {
        site = replaceAll(site, "&amp;", "&");
        if (tabURL.match(site)) {
            domain = site;
            break;
        }
    }
    if (message.command === "busybee-close-tab") {
        closeTab(sender.tab.id);
        BusyBee.removeBlockpageTab(sender.tab.id);
    } else if (message.command === "busybee-create-timer") {
        chrome.browserAction.setIcon({path: "/images/honeybee-t16.png"});
        clearBlockedDomain(domain);
        chrome.alarms.create(domain, { delayInMinutes: BusyBee.getResetTime() });
        console.log("Alarm created: " + domain)
    } else if(message.command === "busybee-remove") {
        BusyBee.removeBlockedSite(domain);
        chrome.alarms.clear(domain);
        clearBlockedDomain(domain);
        console.log("Removed " + domain);        
    } else if (message.command === "busybee-disable") {
        chrome.browserAction.setIcon({path: "/images/honeybee-g16.png"});
        clearAllBlockedDomains();
        BusyBee.setEnabled("false");
        chrome.alarms.clearAll();
        console.log("Blocking disabled.")
    } else if (message.command === "busybee-temp-disable") {
        console.log("Disabling for " + BusyBee.getResetTime() + " minute(s)")
    }
});

// Listener for firing alarms
chrome.alarms.onAlarm.addListener(function(alarm) {
    console.log("Alarm fired: " + alarm.name)
    if(alarm.name == "tempDisable") {
        chrome.browserAction.setIcon({path: "/images/honeybee16.png"});
        BusyBee.setEnabled("true");
        executeAllBlockedDomains();
    } else {
        chrome.browserAction.setIcon({path: "/images/honeybee16.png"});
        executeBlockedDomain(alarm.name);
    }
});

// Listener for tab closure to update blockpageTabs
chrome.tabs.onRemoved.addListener(function (tabId) {
    BusyBee.removeBlockpageTab(tabId);
});