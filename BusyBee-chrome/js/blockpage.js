let attemptedUrl;
let attemptedTitle;
const EXTENSION_ID = chrome.runtime.id;

$(document).ready(function () {
    chrome.tabs.getCurrent(function(tab) {
        let blockpageTabs = BusyBee.getBlockpageTabs();
        if(blockpageTabs[tab.id] === undefined) {
            history.back();
        }
        attemptedUrl = blockpageTabs[tab.id].url;
        attemptedTitle = blockpageTabs[tab.id].title.replace('http://', '').replace('https://', '');
        let shortenedUrl = shortUrl(attemptedUrl);
        $("#hostname").text(shortenedUrl);
        $("title").text(attemptedTitle);
    });
    
    $("#remove_site_btn").on("click", function () {
        let urlObj = new URL(attemptedUrl);
        let domain = urlObj.hostname;
        for(site in BusyBee.getBlockedSites()) {
            site = replaceAll(site, "&amp;", "&");
            if(domain.match(site) || site.match(domain)) {
                BusyBee.removeBlockedSite(site);
                chrome.alarms.clear(site);
                clearBlockedDomain(site);
                break;
            }
        }
        chrome.tabs.getCurrent(function(tab) {
            BusyBee.removeBlockpageTab(tab.id);
            chrome.tabs.update(tab.id, { "url": attemptedUrl });
        });
    });

    $("#disable_btn").on("click", function () {
        BusyBee.setEnabled("false");
        chrome.browserAction.setIcon({path: "/images/honeybee-g16.png"});
        chrome.alarms.clearAll();
        clearAllBlockedDomains();
        chrome.tabs.getCurrent(function(tab) {
            BusyBee.removeBlockpageTab(tab.id);
            chrome.tabs.update(tab.id, { "url": attemptedUrl });
        });
    });

    $("#close_tab_btn").on("click", function () {
        chrome.tabs.getCurrent(function(tab) {
            BusyBee.removeBlockpageTab(tab.id);
        });
        chrome.runtime.sendMessage(EXTENSION_ID, {command : "busybee-close-tab"});
    })
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    let urlObj = new URL(attemptedUrl);
    let domain = urlObj.hostname;
    if(message.command === "busybee-clear-blockpage" || message.command.match(domain) || domain.match(message.command)) {
        chrome.tabs.getCurrent(function(tab) {
            BusyBee.removeBlockpageTab(tab.id);
            chrome.tabs.update(tab.id, { "url": attemptedUrl });
        });
    }
});


// functions to shorten long attempted URLs
function shortUrl(u) {
    if(u.length < 50) {
        return u.replace('http://', '').replace('https://', '').replace(/.$/,"");
    }
    uend = u.slice(u.length - 15);
    ustart = u.replace('http://', '').replace('https://', '').substr(0, 32);
    var shorter = ustart + '...' + uend;
    return shorter;
  }