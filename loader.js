var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s); //Inject script.js
console.log("Script injected");