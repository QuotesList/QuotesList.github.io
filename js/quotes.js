const serverPresent = () => {
    return true
}

const password = "pass2" // TODO
const server = "https://quotes.adamseidman.com"

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

const getQuotes = numQuotes => {
    if (typeof numQuotes == "number") {
        numQuotes = 1
    }
    return standardGET('quotes', `numQuotes=${numQuotes}`)
}

const getGame = () => standardGET('game')
const getLeaderboard = () => standardGET('leaderboard')
const getAttributions = () => standardGET('attributions')
