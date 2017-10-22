//GENERAL

function getEditUrl(id) {
    return "https://www.youtube.com/edit?o=U&video_id=" + id + "&show_mt=1";
}

function getPageUrl(page) {
    return "https://www.youtube.com/my_videos?o=U&ls=LIMITED_OR_NO_ADS&pi=" + page;
}

function getParameterByName(name, url, char) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[" + char + "&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getPage(url, tag, char) {
    var page = getParameterByName(tag, url, char); //Check if the page is in the url
    if (page == null || page == undefined) {
        page = getParameterByName("pi",
                document.getElementsByClassName("yt-uix-button  yt-uix-pager-button yt-uix-button-toggled yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default")[0].href,
                '?'); //If not get it from the button at the bottom page
    }
    return parseInt(page);
}

function nextId(ids, url, tag, char) {
    console.log("Going to next id");
    url.replace(getEditUrl(ids.shift()) + "#&page=" + getPage(url, tag, char) + "&ids=" + ids.toString());
}

function nextPage(url, tag, char) {
    console.log("Going to next page");
    url.replace(getPageUrl(getPage(url.href, tag, char) + 1));
}

//DASHBOARD

function getVideoIds() {
    var ids = [];
    console.log("Getting video ids");
    try {
        var classes = document.getElementsByClassName("yt-uix-sessionlink vm-video-monetization-link"); //get all videos
        for (i = 0; i < classes.length; i++)
            if (classes[i].getElementsByClassName("vm-video-monetization-limited-or-no-ads vm-video-monetization-icon yt-uix-tooltip-reverse yt-uix-tooltip yt-sprite").length > 0)
                ids.push(getParameterByName("video_id", classes[i].href, '?')); //if classes[i] is a demonetized video, push its id inside ids
    } catch (e) { console.log(e) }
    return ids;
}

function ended() {
    return document.getElementsByClassName("yt-uix-button  yt-uix-pager-button yt-uix-button-toggled yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default").length > 0;
}

function dashboard(url) {
    console.log("Wait for page loaded");
    if (document.getElementsByClassName("yt-uix-button  yt-uix-pager-button yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default") == 0)
        setTimeout(function () { dashboard(url); }, 250); //loop until page is loaded
    else {
        if (ended()) {
            console.log("Trying to get the video list");
            if (document.getElementsByClassName("vm-video-title-content yt-uix-sessionlink").length <= 0)
                setTimeout(function () { dashboard(url); }, 500); //check if the videos list is loaded
            else {
                var ids = getVideoIds();
                if (ids.length > 0) nextId(ids, url, "pi", '?'); //go to the first id
                else nextPage(url, "pi", '?'); //if no demonetized video, go to the next page
            }
        } else {
            url.replace("https://www.youtube.com/channel/UCmMWUz0QZ7WhIBx-1Dz-IGg");
            alert("RLAFY - Done!\nRequested manual review for all of your videos!\n\nProgrammed by Stranck. Please consider to leave a star on my github :D");
        }
    }
}

//EDIT

function checkIfDemonetized() {
    return document.getElementsByClassName("vm-video-monetized vm-video-monetization-icon yt-uix-tooltip-reverse yt-uix-tooltip yt-sprite").length == 0 &&
        document.getElementsByClassName("ad-friendly-appeal-status-label").length == 0;
}

function getLateralText(element, className) {
    var father = element.parentElement.parentElement, ret;
    try{
        ret = father.getElementsByClassName(className)[0].innerHTML;
    } catch (e) {
        ret = father.innerHTML;;
    }
    return ret;
}

function getCheckbutton(className, secondClassName, text) {
    var elements = document.getElementsByClassName(className), i = elements.length - 1;
    while (i >= 0 && getLateralText(elements[i], secondClassName).localeCompare(text)) i--;
    return elements[i];
}

function getButton(className, innerText) {
    var elements = document.getElementsByClassName(className), i = 0;
    while (i < elements.length && elements[i].children[0].innerHTML.localeCompare(innerText)) i++;
    return elements[i];
}

function requestReview(operation, url, attempts) {
    var element;
    console.log("Click step: " + operation);
    switch (operation) {
        case 0: {
            element = getButton("yt-uix-button yt-uix-button-size-default yt-uix-button-primary ad-friendly-appeal-button", "Request manual review\n");
            break;  //Request manual review
        }
        case 1: {
            element = getCheckbutton("yt-uix-form-input-checkbox ng-pristine ng-untouched ng-valid", "ad-friendly-appeal-check-label", 
                "I confirm that my video is <a href=\"  //support.google.com/youtube/answer/6162278?hl=en-GB&#10;\" target=\"_blank\">suitable for all advertisers</a>.\n");
            break; //I confirm that my video is suitable for all advertisers
        }
        case 2: {
            element = getButton("yt-uix-button yt-uix-button-size-default yt-uix-button-primary", "Submit for review\n");
            break; //Submit for review
        }
    }
    attempts++;
    if (element != undefined && element != null) { //if the button exist
        try {
            element.click(); //click it
            operation++; //go to next button
        } catch (e) {
            console.log(e);
        }
    }
    if (attempts > 64) url.reload();
        else if (operation < 3) setTimeout(function () { requestReview(operation, url, attempts); }, 100);
}

function edit(url, attemps) {
    console.log("Waiting for edit page load");
    if (attemps > 3) url.reload();
        else attemps++;
    if (document.getElementsByClassName("vm-video-monetized vm-video-monetization-icon yt-uix-tooltip-reverse yt-uix-tooltip yt-sprite").length == 0 &&
       document.getElementsByClassName("vm-video-monetization-limited-or-no-ads vm-video-monetization-icon yt-uix-tooltip-reverse yt-uix-tooltip yt-sprite").length == 0)
           setTimeout(function () { edit(url, attemps); }, 250); //loop until a monetization sprite is loaded
    else {
        if (checkIfDemonetized()) {
            console.log("Requesting manual review");
            requestReview(0, url, 0);
            setTimeout(function () { edit(url, attemps); }, 8000);
        } else {
            console.log("Already requested / not demonetized");
            var ids = getParameterByName("ids", url.href, '#').split(','); //get all ids
            if (ids[0].localeCompare("")) { //if there is one
                nextId(ids, url, "page", '#'); //go to next id
            } else nextPage(url, "page", '#'); //else go to next page
        }
    }
}

//ENTRY POINT

var url = window.location;
if (url.href.includes("my_videos")) {
    console.log("Detected my_videos page");
    if (!url.href.includes("LIMITED_OR_NO_ADS")) url.replace(getPageUrl(1));
        else setTimeout(function () { dashboard(url); }, 500);
} else if (url.href.includes("edit")) {
    console.log("Detected edit page");
    edit(url, 0);
}