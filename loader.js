if (!window.location.href.includes("embed")) { //Check if the extension is loaded inside the real page
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('script.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s); //Inject script.js
    console.log("Script injected");
} else console.log("Embed detected. Don't injecting script.");