const serverPresent = () => {
    return true
}

var password = "pass2" // TODO
var server = "https://quotes.adamseidman.com"
var authLevel = 0
// const server = "http://localhost:8008"

const standardGET = (endpoint, query) => {
    if (query === undefined || typeof query != "string") {
        query = ""
    } else {
        query = `&${query}`
    }
    const url = new URL(`${server}/${endpoint}?pwd=${password}${query}`)
    return new Promise((resolve, reject) => {
        try {
            fetch(url)
                .then(data => data.json())
                .then(json => resolve(json))
        } catch (error) {
            reject(error)
        }
    })
}

const stripPunctuation = str => {
    return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/\s{2,}/g,' ');
}

const getQuotes = numQuotes => {
    if (typeof numQuotes == "number") {
        numQuotes = 1
    }
    return standardGET('quotes', `numQuotes=${numQuotes}`)
}

const getSearch = searchStr => {
    if (typeof searchStr != 'string') {
        searchStr = ""
    }
    searchStr = stripPunctuation(searchStr).trim()
    return standardGET('search', `str=${searchStr}`)
}

const getGame = () => standardGET('game')
const getLeaderboard = () => standardGET('leaderboard')
const getAttributions = () => standardGET('attributions')

const standardPOST = (endpoint, body, query) => {
    if (query === undefined || typeof query != "string") {
        query = ""
    } else {
        query = `&${query}`
    }
    const url = new URL(`${server}/${endpoint}?pwd=${password}${query}`)
    return new Promise((resolve, reject) => {
        try {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            .then(data => data.json())
            .then(json => resolve(json))
        } catch (error) {
            reject(error)
        }
    })
}

const postQuote = (quote, authors) => {
    standardPOST('quote', {quote, authors})
}

const postVote = (good, bad) => {
    standardPOST('vote', {
        yesId: good,
        noId: bad
    })
}

const setAuth = (ser, pass) => {
    if (typeof ser != 'string' || typeof pass != 'string') {
        return
    }
    server = ser
    password = pass
}

const checkAuth = () => {
    return new Promise((resolve, reject) => {
        standardGET('perms')
            .then(data => {
                if (data.level !== undefined) {
                    level = data.level
                    resolve(level)
                }
                else {
                    reject(level)
                }
            })
    })
}
