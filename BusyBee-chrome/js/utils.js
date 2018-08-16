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

const BLOCKPAGE_URL = chrome.runtime.getURL("/html/blockpage.html");

/* Sets icon to color timer if the current site is a domain with an active alarm */
function setIcon() {
    if(BusyBee.getEnabled() !== "true") {
        return;
    } else {
        chrome.browserAction.setIcon({path: "/images/honeybee16.png"});
        chrome.tabs.query({"highlighted": true}, function(tabs) {
            for(let i = 0; i < tabs.length; i++) {    
                for(site in BusyBee.getBlockedSites()) {
                    site = replaceAll(site, "&amp;", "&");
                    if(tabs[i].url.match(site)) {
                        chrome.alarms.get(site, function(alarm) {
                            if(alarm != undefined) {
                                chrome.browserAction.setIcon({path: "/images/honeybee-t16.png"});
                            }
                        });
                    }
                }
            }
        });
    }
}

/* Injects dialog.js into page if in popup mode, else logs the tab information in blockpageTabs
 * and navigates to blockpage.html */
function blockTab(tabId, tab) {
    if(BusyBee.getMode() === "popup") {
        chrome.tabs.executeScript(tabId, {
            file: "/js/dialog.js"
        });
    } else {
        BusyBee.addBlockpageTab(tabId, tab);
        chrome.tabs.update(tabId, {"url" : BLOCKPAGE_URL});
    }
}

/* sets modal display to none */
function closeDialog(tabId) {
    chrome.tabs.executeScript(tabId, {
        code: "modal.style.display = 'none';"
    });
}

/* closes the referenced tab and, if the window will close, opens a new tab */
function closeTab(tabId) {
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
        if (tabs.length === 1) {
            chrome.tabs.create({"url" : "about:newtab"});
        }
        chrome.tabs.remove(tabId);
    });
}

/* blocks all tabs which match the given hostname */
function executeBlockedDomain(hostname) {
    if(BusyBee.getEnabled() != "true") {
        return;
    }
    hostname = replaceAll(hostname, "&amp;", "&");
    let tabIds = {};
    let tabList = {};
    chrome.tabs.query({"url" : "<all_urls>"}, function(tabs) {
        for(let i = 0, j = 0, k = 0, l = 0; i < tabs.length; i++) {
            if (tabs[i].url.match(hostname) || hostname.match(tabs[i].url) || tabs[i].url.includes(hostname) || hostname.includes(tabs[i].url)) {

                tabIds[j] = tabs[i].id;
                tabList[j] = tabs[i];
                j++;
                blockTab(tabIds[k++], tabList[l++]);
            }
        }
    });
}

/* blocks all tabs which match a blocklist entry */
function executeAllBlockedDomains() {
    if(BusyBee.getEnabled() != "true") {
        return;
    }
    let tabIds = {};
    let tabList = {};
    chrome.tabs.query({"url" : "<all_urls>"}, function(tabs) {
        for(let i = 0, j = 0, k = 0, l = 0; i < tabs.length; i++) {
            for(site in BusyBee.getBlockedSites()) {
                site = replaceAll(site, "&amp;", "&");
                if (tabs[i].url.match(site)) {
                    tabIds[j] = tabs[i].id;
                    tabList[j] = tabs[i];
                    j++;
                    blockTab(tabIds[k++], tabList[l++]);
                }
            }
        }
    });
}

/* for each blockpage, send message to clear if the attempted url matches hostname */
function clearBlockedDomain(hostname) {
    hostname = replaceAll(hostname, "&amp;", "&");
    let tabIds = {};
    chrome.tabs.query({"url" : "<all_urls>"}, function(tabs) {
        for(let i = 0, j = 0, k = 0; i < tabs.length; i++) {
            if(tabs[i].url === BLOCKPAGE_URL) {
                chrome.runtime.sendMessage({command : hostname});
                continue;
            }
            if (tabs[i].url.match(hostname) || hostname.match(tabs[i].url || tabs[i].url.includes(hostname)) || hostname.includes(tabs[i].url)) {
                tabIds[j] = tabs[i].id;
                j++;
                if (BusyBee.getMode() === "popup") {
                    closeDialog(tabIds[k++]);
                }
            }
        }
    });
}

/* for each blockpage, send message to clear */
function clearAllBlockedDomains() {
    let tabIds = {};
    chrome.tabs.query({"url" : "<all_urls>"}, function(tabs) {
        for(let i = 0, j = 0, k = 0; i < tabs.length; i++) {
            if(tabs[i].url === BLOCKPAGE_URL) {
                chrome.runtime.sendMessage({command : "busybee-clear-blockpage"});
                continue;
            }
            for(site in BusyBee.getBlockedSites()) {
                site = replaceAll(site, "&amp;", "&");
                if (tabs[i].url.match(site) || site.match(tabs[i].url)) {
                    tabIds[j] = tabs[i].id;
                    j++;
                    closeDialog(tabIds[k++]);
                }
            }
        }
    });
}

/* both functions work together to replace all key characters in regexs. Used in BusyBee
 * mostly to replace characters during data retrieval so the original value is preserved.
 * ex: links with &not in them will be replaced with a ¬ during JSON.parse, so it can't be
 * compared to URLs. This is used to replace & with &amp; and back */
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}    
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}