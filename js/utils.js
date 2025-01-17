const keyWrapper = function (event, fn) {
    if (event.keyCode == 13) {
        fn()
        return false
    }
    return true
}

var escapeText = function escape (htmlStr) { 
    return htmlStr.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");        
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const copyObject = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

var getUserAgent = function() {
    return navigator.userAgent;
}

var isTablet = function () {
    return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(getUserAgent());
}

var isMobile = function () {
    return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(getUserAgent());
}

var isDesktop = function () {
    return !isTablet() && !isMobile();
}

const logOut = () => {
    deleteAuth()
    gLevel = 0
    if (typeof populatePage !== 'undefined') {
        populatePage(gLevel)
    } else {
        window.location.href = '/'
    }
}

const randomArrayItem = (arr) => {
    if (arr === undefined || !Array.isArray(arr) || arr.length <= 1) {
        return
    }
    return arr[Math.floor(Math.random() * arr.length)]
}
