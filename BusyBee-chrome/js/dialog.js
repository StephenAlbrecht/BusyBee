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

if(document.getElementById("busybee-modal") === null) {
    let extensionId = chrome.runtime.id;

    var modal = document.createElement("div");
    modal.id = "busybee-modal";
    
    let modalContent = document.createElement("div");
    modalContent.id = "busybee-modal-content";
    modal.appendChild(modalContent);

    let modalHeader = document.createElement("div");
    modalHeader.id = "busybee-modal-header";
    modalContent.appendChild(modalHeader);

    let img = document.createElement("img");
    img.src = chrome.runtime.getURL('/images/honeybee48.png');
    modalHeader.appendChild(img);

    let h1 = document.createElement("h1");
    h1.id = "busybee-h1";
    h1.textContent = "BUZZ BUZZ!";
    modalHeader.appendChild(h1);

    let modalBody = document.createElement("div");
    modalBody.id = "busybee-modal-body";
    modalContent.appendChild(modalBody);

    let h2 = document.createElement("h2");
    h2.id = "busybee-h2";
    h2.textContent = "This site is being blocked by BusyBee!";
    modalBody.appendChild(h2);

    let p1 = document.createElement("p");
    p1.id = "busybee-p";
    p1.textContent = "Pressing Browse will let you view this site ";
    modalBody.appendChild(p1);

    let span = document.createElement("span");
    span.id = "busybee-resetTime";
    span.textContent = "until your reset timer is up.";
    p1.appendChild(span);

    let p2 = document.createElement("p");
    p2.id = "busybee-p";
    p2.textContent = "You can remove this website from your blocklist, or if you're ready " 
                + "to relax again you can turn off BusyBee until your next work session.";
    modalBody.appendChild(p2);

    let closeTabBtn = document.createElement("button");
    closeTabBtn.id = "busybee-close-tab";
    closeTabBtn.textContent = "Close Tab";
    closeTabBtn.addEventListener("click", function() {
        chrome.runtime.sendMessage(extensionId, {command : "busybee-close-tab"});
    });
    modalBody.appendChild(closeTabBtn);

    let browseBtn = document.createElement("button");
    browseBtn.id = "busybee-browse";
    browseBtn.textContent = "Browse";
    browseBtn.addEventListener("click", function() {
        chrome.runtime.sendMessage(extensionId, {command : "busybee-create-timer"});
        modal.style.display = "none";
    });
    modalBody.appendChild(browseBtn);

    let br = document.createElement("br");
    modalBody.appendChild(br);

    let removeSiteBtn = document.createElement("button");
    removeSiteBtn.id = "busybee-remove";
    removeSiteBtn.textContent = "Remove from Blocklist";
    removeSiteBtn.addEventListener("click", function() {
        chrome.runtime.sendMessage(extensionId, {command : "busybee-remove"});
        modal.style.display = "none";
    });
    modalBody.appendChild(removeSiteBtn);

    let disableBtn = document.createElement("button");
    disableBtn.id = "busybee-disable";
    disableBtn.textContent = "Turn off BusyBee";
    disableBtn.addEventListener("click", function() {
        chrome.runtime.sendMessage(extensionId, {command : "busybee-disable"});
    });
    modalBody.appendChild(disableBtn);

    document.body.appendChild(modal);
    modal.style.display = "block";
} else {
    document.getElementById('busybee-modal').style.display = 'block';
}