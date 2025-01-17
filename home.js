const submitCredentials = () => {
    let pass = document.getElementById('passwordInput').value
    let server = document.getElementById('serverInput').value
    if (pass.trim().length < 1 || server.trim().length < 1) {
        alert("Please provide a server URL and password!")
        return
    }
    tryAuth(pass, server)
        .then(data => {
            onLoaded(data.level)
        })
        .catch(err => {
            console.error(err)
            alert(err.err)
        })
}

const onLoadCallback = (level) => {
    if (level === 0) {
        return
    }
    if ((isDesktop() || isTablet()) && WordCloud.isSupported) {
        let list = []
        const randomWeight = (min, max) => {
            return Math.floor(Math.random() * (30-10+1)) + 10;
        }
        getAllQuotes().then(data => {
            data.quotes.forEach(quote => {
                if (!quote.isGroup && !quote.quote.trim().includes('\n')) {
                    console.log(quote.quote)
                    list.push([quote.quote.trim(), randomWeight()])
                }
            })
            shuffleArray(list)
            console.log(list)
            WordCloud(document.getElementById('quoteCanvas'), {
                list,
                shuffle: true,
                minRotation: -20,
                maxRotation: 20
            })
        })
    }
    else if (isMobile() || !WordCloud.isSupported) {
        document.getElementById('general-buttons').classList.remove('hidden')
    }
    else {
        document.getElementById('general-buttons').classList.remove('hidden')
        console.error('Unknown user agent?', getUserAgent())
    }
}

if (isMobile()) {
    document.getElementById('bodyPanel').classList.add('is-mobile')
}
