const standardGET = (endpoint, query) => {
    if (query === undefined || typeof query != "string") {
        query = ""
    } else {
        query = `&${query}`
    }
    const url = new URL(`https://${gServer}/api/${endpoint}?pwd=${gPass}${query}`)
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

const getSearch = searchStr => {
    if (typeof searchStr != 'string') {
        searchStr = ""
    }
    searchStr = searchStr.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/\s{2,}/g,' ')
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

const getAllQuotes = (includeStats) => {
    let query = undefined
    if (includeStats) {
        query = 'includeStats=true'
    }
    return standardGET('all', query)
}

const getWordMap = () => standardGET('words')

const getAttributions = () => {
    return new Promise((resolve, reject) => {
        getAllQuotes()
            .then(data => {
                let quotes = JSON.parse(JSON.stringify(data.quotes))
                quotes.sort((a, b) => a.id - b.id)
                quotes = quotes.map(x => x.authors.split(','))
                resolve({
                    orderedAuthors: quotes
                })
            })
            .catch(reject)
    })
}

const standardPOST = (endpoint, body, query) => {
    if (query === undefined || typeof query != "string") {
        query = ""
    } else {
        query = `&${query}`
    }
    const url = new URL(`https://${gServer}/api/${endpoint}?pwd=${gPass}${query}`)
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
