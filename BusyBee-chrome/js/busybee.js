// Storage Manager to interact with localstorage
var SM = (function () {

    var my = {};

    my.get = function (key) {
        return localStorage.getItem(key);
    }
    my.put = function (key, value) {
        return localStorage.setItem(key, value);
    }
    my.delete = function (key) {
        return localStorage.removeItem(key);
    }
    return my;
}());

// Setters, Getters for variables stored in localstorage
var BusyBee = (function (SM) {
    var my = {};

    my.blockTheseSites = {}
    my.blockpageTabs = {}

    // Blocking enabled/disabled
    if(!SM.get("enabled")) {
        SM.put("enabled", "true");
    }
    my.getEnabled = function() {
        return SM.get("enabled");
    }
    my.setEnabled = function(bool) {
        SM.put("enabled", bool);
        return SM.get("enabled");
    }

    // Popup or Block modes
    if(!SM.get("mode")) {
        SM.put("mode", "popup");
    }
    my.getMode = function() {
        return SM.get("mode");
    }
    my.setMode = function(type) {
        SM.put("mode", type);
        return SM.get("mode");
    }

    // Reset time for Popup Mode
    if(!SM.get("minutes")) {
        SM.put("minutes", JSON.stringify(5));
    }
    my.getResetTime = function() {
        return parseInt(SM.get("minutes"));
    }
    my.setResetTime = function(minutes) {
        SM.put("minutes", JSON.stringify(minutes));
        return SM.get("minutes");
    }

    // Blocklist
    if(!SM.get("blocklist")) {
        SM.put("blocklist", JSON.stringify(my.blockTheseSites));
    }
    my.getBlockedSites = function() {
        return JSON.parse(SM.get("blocklist"));
    }
    my.addBlockedSite = function(site) {
        my.blockedSites = JSON.parse(SM.get("blocklist"));
        my.blockedSites[site] = site;
        SM.put("blocklist", JSON.stringify(my.blockedSites));
    }
    my.removeBlockedSite = function(site) {
        my.blockedSites = JSON.parse(SM.get("blocklist"));
        delete my.blockedSites[site];
        SM.put("blocklist", JSON.stringify(my.blockedSites));
    }

    // List of tabs for blockpages
    if(!SM.get("blockpageTabs")) {
        SM.put("blockpageTabs", JSON.stringify(my.blockpageTabs));
    }
    my.getBlockpageTabs = function() {
        return JSON.parse(SM.get("blockpageTabs"));
    }
    my.addBlockpageTab = function(id, tab) {
        my.blockedTabs = JSON.parse(SM.get("blockpageTabs"));
        my.blockedTabs[id] = tab;
        SM.put("blockpageTabs", JSON.stringify(my.blockedTabs));
    }
    my.removeBlockpageTab = function (id, tab) {
        my.blockedTabs = JSON.parse(SM.get("blockpageTabs"));
        delete my.blockedTabs[id];
        SM.put("blockpageTabs", JSON.stringify(my.blockedTabs));
    }

    return my;
}(SM));