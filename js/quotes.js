const serverPresent = () => {
    return true
}

const getQuotes = numQuotes => {
    if (typeof numQuotes == "number") {
        numQuotes = 1
    }
    const password = "pass2" // TODO
    const port = "8008"
    const server = "http://server.seidman-ad.am"
    const url = new URL(`${server}:${port}/quotes?pwd=${password}&numQuotes=${numQuotes}`)
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

const getGame = () => {
    const password = "pass2" // TODO
    const port = "8008"
    const server = "http://server.seidman-ad.am"
    const url = new URL(`${server}:${port}/game?pwd=${password}`)
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
