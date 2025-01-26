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
    if (isDesktop() && WordCloud.isSupported) {
        let list = []
        const randomWeight = () => {
            return Math.floor(Math.random() * (35-10+1)) + 10;
        }
        getAllQuotes().then(data => {
            data.quotes.forEach(quote => {
                if (!quote.isGroup && !quote.quote.trim().includes('\n')) {
                    let text = quote.quote
                    if (text.includes('~')) {
                        text = text.slice(0, text.indexOf('~'))
                    } else if (text.includes('-')) {
                        text = text.slice(0, text.indexOf('-'))
                    }
                    list.push([text.trim(), randomWeight(), quote])
                }
            })
            shuffleArray(list)
            WordCloud(document.getElementById('quoteCanvas'), {
                list,
                shuffle: true,
                minRotation: -1,
                maxRotation: 1,
                rotateRatio: 0.6,
                click: (item, dim, evt) => {
                    alert(`${item[0]}\nSpeaker: ${item[2].authors}\nQuote ${item[2].id} / ${data.numQuotes}`)
                }
            })
        })
    }
    else {
        document.getElementById('general-buttons').classList.remove('hidden')
    }
}

if (isMobile()) {
    document.getElementById('bodyPanel').classList.add('is-mobile')
}

if (isRealSite()) {
    gServer = MAIN_SITE_URL
    let input = document.getElementById('serverInput')
    input.classList.add('hidden')
    input.value = MAIN_SITE_URL
    document.getElementById('input-break').classList.add('hidden')
}
