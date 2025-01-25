const standardGET = (endpoint, query) => {
    if (query === undefined || typeof query != "string") {
        query = ""
    } else {
        query = `&${query}`
    }
    const url = new URL(`http${USE_HTTPS? 's' : ''}://${gServer}/api/${endpoint}?pwd=${gPass}${query}`)
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
    if (typeof numQuotes != "number") {
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

const getNameGuesses = (searchList, verbose) => {
    if (!Array.isArray(searchList)) {
        searchList = []
    }
    let searchStr = searchList.join(',').replaceAll('?', '').replaceAll('&', '').trim()
    if (verbose) {
        return standardGET('guess', `names=${searchStr}&verbose=true`)
    } else {
        return standardGET('guess', `names=${searchStr}`)
    }
}

const getGame = () => standardGET('game')
const getLeaderboard = () => standardGET('leaderboard')
const getAttributions = () => standardGET('attributions')
const getAllQuotes = () => standardGET('all')

const standardPOST = (endpoint, body, query) => {
    if (query === undefined || typeof query != "string") {
        query = ""
    } else {
        query = `&${query}`
    }
    const url = new URL(`http${USE_HTTPS? 's' : ''}://${gServer}/api/${endpoint}?pwd=${gPass}${query}`)
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
    return standardPOST('quote', {quote, authors})
}

const postEdit = (quote, id) => {
    return standardPOST('edit', {quote, id})
}

const postVote = (good, bad) => {
    standardPOST('vote', {
        yesId: good,
        noId: bad
    })
}
