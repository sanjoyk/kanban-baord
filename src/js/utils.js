const $ = (selector) => {
    if (/^#\w+/.test(selector)) {
        return document.querySelectorAll(selector)[0];
    } else {
        return document.querySelectorAll(selector);
    }
}

