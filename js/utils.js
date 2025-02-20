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

var isDesktop = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches

const randomArrayItem = (arr) => {
    if (arr === undefined || !Array.isArray(arr) || arr.length <= 1) {
        return
    }
    return arr[Math.floor(Math.random() * arr.length)]
}

const shuffleArray = (arr) => {
    if (!Array.isArray(arr) || arr.length < 2) {
        return
    }
    let currentIndex = arr.length
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
    }
}

const pluralize = (count, word, suffix = 's') => `${word}${(count === 1)? '' : suffix}`
