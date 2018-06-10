$(document).ready(function () {
    showBlockList();

    $("#resetTime").prop("value", BusyBee.getResetTime());

    if(BusyBee.getMode() === "popup") {
        $("#Popup_Mode").prop("checked", true);
    } else {
        $("#Block_Mode").prop("checked", true);
    }

    $("#Popup_Mode").on("change", function () {
        BusyBee.setMode("popup");
        clearAllBlockedDomains();
        executeAllBlockedDomains();
    })

    $("#Block_Mode").on("change", function () {
        BusyBee.setMode("block");
        chrome.alarms.clearAll();
        executeAllBlockedDomains();
    })

    $("#resetTime").on("input", function () {
        let minutes = parseInt($("#resetTime").val());
        if(/^\d+$/.test(minutes) && minutes > 0) {      // Passes only positive integers
            BusyBee.setResetTime(minutes);
        }
    })

    $("#addDomain").on("click", function () {
        let value = $("#newBlocklistDomain").val();
        let extensionUrl = "chrome-extension://" + chrome.runtime.id;
        if(value === "" || value === null || isEmpty(value)) {
            alert("Please add a valid domain or URL.");
            $("#newBlocklistDomain").val("");
            $("#newBlocklistDomain").focus();
            return;
        } else if (extensionUrl.includes(value) || value.includes(extensionUrl)) {
            alert("Adding this domain would cause BusyBee to block itself.");
            $("#newBlocklistDomain").val("");
            $("#newBlocklistDomain").focus();
            return;
        }
        value = value.replace(/\s+/g, '').replace('http://', '').replace('https://', '');
        value = replaceAll(value, "&", "&amp;");
        BusyBee.addBlockedSite(value);
        executeBlockedDomain(value);
        $("#newBlocklistDomain").val("");
        showBlockList();
        $("#newBlocklistDomain").focus();
    });

    $("#rmvDomain").on("click", function () {
        $("#blocklistDomainBox option:selected").each(function() {
            let item = $(this).val();
            item = replaceAll(item, "&", "&amp;");
            BusyBee.removeBlockedSite(item);
            chrome.alarms.clear(item);
            clearBlockedDomain(item);
        });
        showBlockList();
    });

    function showBlockList () {
        $("#blocklistDomainBox").children().remove();
        $.each(BusyBee.getBlockedSites(), function (index) {
            $("#blocklistDomainBox").append("<option>"+index+"</option>");
        });
    }

    function isEmpty(str){
        return !str.replace(/^\s+/g, '').length; // boolean (`true` if field is empty)
    }
});