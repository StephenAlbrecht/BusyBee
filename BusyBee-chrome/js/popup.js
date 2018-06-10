let blocked = {'host': ""};

$(document).ready(function () {
    $("#version").text(chrome.runtime.getManifest().version);

    if(BusyBee.getEnabled() == "true") {
        $("#on-off-switch").prop("checked", true);
    } else {
        $("#on-off-switch").prop("checked", false);
    }

    if(BusyBee.getResetTime() == 1) {
        $("#resetTime").text(BusyBee.getResetTime() + " minute");
    } else {
        $("#resetTime").text(BusyBee.getResetTime() + " minutes");
    }

    /* Determines state of the add/remove buttons 
     * if on blockpage, get URL info from blockpageTabs and show remove btn
     * if on a bad domain, don't display any button
     * otherwise, check if on a blocked domain and show button accordingly */
    chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
        let tabURL = tab[0].url;
        let urlObj;
        let domain;
        if(tabURL === BLOCKPAGE_URL) {
            let blockpageTabs = BusyBee.getBlockpageTabs();
            let currentTab = blockpageTabs[tab[0].id];
            tabURL = currentTab.url;
        } else {
            if(isBadDomain(tabURL)) {
                $("#add_site_btn").css("display", "none");
                $("#remove_site_btn").css("display", "none");
            }
        }
        urlObj = new URL(tabURL);
        domain = urlObj.host;
        for (site in BusyBee.getBlockedSites()) {
            site = replaceAll(site, "&amp;", "&");
            if (domain.match(site) || site.match(domain) || domain.includes(site) || site.includes(domain)) {
                blocked.host = site;
                $(".tbtn").toggle();
                return;
            }
        }
    });

    $("#on-off-switch").on("click", function() {
        if($(this).prop("checked") == true) {
            BusyBee.setEnabled("true");
            chrome.alarms.clear("tempDisable");
            chrome.browserAction.setIcon({path: "/images/honeybee16.png"});
            executeAllBlockedDomains();
        } else {
            BusyBee.setEnabled("false");
            chrome.alarms.clearAll();
            chrome.browserAction.setIcon({path: "/images/honeybee-g16.png"});
            clearAllBlockedDomains();
        }
    });

    $("#add_site_btn").on("click", function () {
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            let tabURL = tabs[0].url;
            let urlObj = new URL(tabURL);
            let domain = urlObj.host;
            if(isBadDomain(tabURL)) {
                $("#feedback").replaceWith('<p id="feedback">Domain cannot be blocked</p>');
                return;
            }
            BusyBee.addBlockedSite(domain);
            blocked.host = domain;
            chrome.extension.getBackgroundPage().blocked.host = domain;
            $(".tbtn").toggle();
            $("#feedback").replaceWith('<p id="feedback">'+ domain +' added to Blocklist</p>');
            executeBlockedDomain(domain);
        });
    });

    $("#remove_site_btn").on("click", function () {
        chrome.browserAction.setIcon({path: "/images/honeybee16.png"});
        BusyBee.removeBlockedSite(blocked.host);
        $(".tbtn").toggle();
        $("#feedback").replaceWith('<p id="feedback">'+ blocked.host +' removed from Blocklist</p>');
        chrome.alarms.clear(blocked.host);
        clearBlockedDomain(blocked.host);
    });

    $("#temp_disable_btn").on("click", function () {
        $("#on-off-switch").prop("checked", false);
        BusyBee.setEnabled("false");
        chrome.browserAction.setIcon({path: "/images/honeybee-gt16.png"});
        clearAllBlockedDomains();
        chrome.alarms.clearAll();
        chrome.alarms.create("tempDisable", { delayInMinutes: BusyBee.getResetTime() });
        chrome.runtime.sendMessage(chrome.runtime.id, {command : "busybee-temp-disable"});
    });

    $("#settings_btn").on("click", function () {
        if (chrome.runtime.openOptionsPage()) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('/html/options.html'));
        }
    });

    /* Listeners */
    
    // chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    //     // if (message.command === "busybee-remove") {
    //     //     $(".tbtn").toggle();
    //     //     $("#feedback").replaceWith('<p id="feedback">'+ blocked.host +' removed from Blocklist</p>');
    //     // }
    //     if (message.command === "busybee-disable") {
    //         $("#powerCheckbox").prop("checked", false);
    //     }
    // });

    // Listener for tempDisable to turn on power if popup is open.
    chrome.alarms.onAlarm.addListener(function(alarm) {
        if(alarm.name === "tempDisable") {
            $("#on-off-switch").prop("checked", true);
        }
    });
});

/* Returns true if domain is a BusyBee page or a chrome:// url. */
function isBadDomain(url) {
    let extensionUrl = "chrome-extension://" + chrome.runtime.id;
    if (extensionUrl.includes(url) || url.includes(extensionUrl) || url.includes("chrome://")) {
        return true;
    } else {
        return false;
    }
}