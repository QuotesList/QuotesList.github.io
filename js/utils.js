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
