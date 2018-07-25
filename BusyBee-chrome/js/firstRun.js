let checklist = [
    {id: "#facebook",       fId: "#f-facebook",     defaultUrl: "facebook.com",    altUrl: ""},
    {id: "#youtube",        fId: "#f-youtube",      defaultUrl: "youtube.com",     altUrl: ""},
    {id: "#instagram",      fId: "#f-instagram",    defaultUrl: "instagram.com",   altUrl: ""},
    {id: "#twitter",        fId: "#f-twitter",      defaultUrl: "twitter.com",     altUrl: ""},
    {id: "#reddit",         fId: "#f-reddit",       defaultUrl: "reddit.com",      altUrl: ""},
    {id: "#pinterest",      fId: "#f-pinterest",    defaultUrl: "pinterest.com",   altUrl: ""},
    {id: "#askfm",          fId: "#f-askfm",        defaultUrl: "ask.fm",          altUrl: ""},
    {id: "#tumblr",         fId: "#f-tumblr",       defaultUrl: "tumblr.com",      altUrl: ""},
    {id: "#linkedin",       fId: "#f-linkedin",     defaultUrl: "linkedin.com",    altUrl: ""}
];

$(document).ready(function() {
    // loop through blocked sites for matches to see if any should be checked
    for(let i = 0; i < checklist.length; i++) {
        checkboxEvent(checklist[i].id, checklist[i].fId, checklist[i].defaultUrl, checklist[i].altUrl);
    }
});

/* if a blocked site matches the default, remove the blocked site first to avoid situations
 * where the matched site is mysitehere.com and it tries to remove www.mysitehere.com */
function checkboxEvent(elementId, fId, defaultUrl, altUrl) {
    for (site in BusyBee.getBlockedSites()) {
        if(defaultUrl.match(site) || site.match(defaultUrl)) {
            $(elementId).prop("checked", true);
            $(fId).text("Blocking!");
            altUrl = site;
            $(elementId).on("click", function() {
                if($(this).prop("checked") === true) {
                    $(fId).text("Blocking " + defaultUrl + "!");
                    BusyBee.addBlockedSite(defaultUrl);
                    executeBlockedDomain(defaultUrl);
                } else {
                    $(fId).text("");
                    $(fId).append("<br>");
                    BusyBee.removeBlockedSite(altUrl);
                    clearBlockedDomain(altUrl);
                    altUrl = defaultUrl;
                }
            });
            return;
        }
    }
    $(elementId).on("click", function() {
        if($(this).prop("checked") === true) {
            $(fId).text("Blocking!");
            BusyBee.addBlockedSite(defaultUrl);
            executeBlockedDomain(defaultUrl);
        } else {
            $(fId).text("");
            $(fId).append("<br>");
            BusyBee.removeBlockedSite(defaultUrl);
            clearBlockedDomain(defaultUrl);
        }
    });
}