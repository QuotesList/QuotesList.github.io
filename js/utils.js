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
