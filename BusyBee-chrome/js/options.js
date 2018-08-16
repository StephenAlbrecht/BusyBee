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