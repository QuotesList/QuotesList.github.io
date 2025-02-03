let posMap = {}
let potentialAttributions = []
let attributionMap = {}
let ourQuotes = []

let currentKey = 'original'
let currentQuote = { id: -1, options: {} }

let score = 0
let total = 0

const setAllButtonsEnabled = (enabled) => {
    Array.from(document.getElementsByClassName('gameBtn')).forEach(el => {
        el.disabled = !enabled
    })
}

const setup = () => {
    let quoteEl = document.getElementById('quote')
    if (ourQuotes.length < 1) {
        alert('Error finding quote!')
        return
    }
    let lastId = currentQuote.id
    while (lastId === currentQuote.id) {
        currentQuote = randomArrayItem(ourQuotes)
    }
    currentKey = randomArrayItem(Object.keys(currentQuote.options))
    quoteEl.innerHTML = `${currentQuote.options[currentKey]}<br>`
    setAllButtonsEnabled(true)
}

getAllQuotes()
    .then(data => {
        let sentences = []
        data.quotes.forEach(quote => {
            let lines = quote.quote.split('\n').map(line => {
                if (quote.isGroup) {
                    if (line.includes(':')) {
                        sentences.push(line.slice(line.indexOf(':') + 1).trim())
                    }
                } else if (quote.quote.includes('~')) {
                    sentences.push(line.slice(0, line.indexOf('~')).trim())
                } else if (quote.quote.includes('-')) {
                    sentences.push(line.slice(0, line.indexOf('-')).trim())
                }

                if (!quote.isGroup && quote.quote.includes('~')) {
                    let authorText = quote.quote.slice(quote.quote.indexOf('~')).trim()
                    if (!potentialAttributions.includes(authorText)) {
                        potentialAttributions.push(authorText)
                        attributionMap[authorText] = quote.authors
                    }
                }
            })
        })
        sentences = sentences.map(x => x.replaceAll('"', '').trim())
        sentences.forEach(sentence => {
            let tagMap = tagPOS(sentence)
            if (tagMap !== undefined) {
                Object.keys(tagMap).forEach(term => {
                    if (tagMap[term].length >= 1) {
                        let tag = tagMap[term].join('|')
                        if (tag.includes('Noun') || tag.includes('Adjective')) {
                            if (posMap[tag] === undefined) {
                                posMap[tag] = []
                            }
                            if (!posMap[tag].includes(term)) {
                                posMap[tag].push(term)
                            }
                        }
                    }
                })
            }
        })
        let goodQuotes = []
        data.quotes.forEach(quote => {
            if (!quote.isGroup && !quote.quote.trim().includes('\n') && quote.quote.includes('~')) {
                quote.quote = quote.quote.trim().replace(/\s+/g, ' ')
                let authorText = quote.quote.slice(quote.quote.indexOf('~')).trim()
                let text = quote.quote.slice(0, quote.quote.indexOf('~')).replaceAll('"', '').replaceAll('  ', ' ').trim()
                let potentialTags = tagPOS(text)
                let builder = []
                let probability = 1.0
                text.split(' ').forEach(word => {
                    let pos = potentialTags[word]
                    if (Math.random() <= probability && word.length > 3 && pos !== undefined && typeof pos.join == 'function' && posMap[pos.join('|')] !== undefined) {
                        probability = 0.2
                        let tag = pos.join('|')
                        let item = randomArrayItem(posMap[tag])
                        if (item === undefined) {
                            builder.push(word)
                        } else {
                            if (item.trim().toLowerCase() === word.trim().toLowerCase()) {
                                probability -= 0.2
                            }
                            builder.push(item)
                        }
                    } else {
                        builder.push(word)
                    }
                })
                let article = (quote.quote.includes('"'))? '"' : ''
                let subAuthor = authorText
                while (subAuthor === authorText || attributionMap[subAuthor] === attributionMap[authorText]) {
                    subAuthor = randomArrayItem(potentialAttributions)
                }
                builder = builder.join(' ')
                if (quote.quote.replace(/[^a-zA-Z0-9 ~]/g, '').toLowerCase().trim() !== `${builder} ${authorText}`.replace(/[^a-zA-Z0-9 ~]/g, '').toLowerCase().trim()) {
                    goodQuotes.push({
                        options: {
                            original: quote.quote,
                            replacement: `${article}${builder}${article} ${authorText}`,
                            misattributed: `${article}${text}${article} ${subAuthor}`,
                            bothBad: `${article}${builder}${article} ${subAuthor}`,
                        },
                        id: quote.id
                    })
                }
            }
        })
        ourQuotes = copyObject(goodQuotes)
    })
    .then(() => {
        setup()
    })

const submitGuess = (el) => {
    setAllButtonsEnabled(false)
    let correct = (el.id === currentKey)
    if (correct) {
        score += 1
    }
    total += 1
    document.getElementById('score').innerHTML = score
    document.getElementById('total').innerHTML = total
    let message = 'Correct!'
    if (!correct) {
        message = `Incorrect :(\n\nAnswer was: ${document.getElementById(currentKey).innerHTML}`
    }
    message += `\n\n${currentQuote.options.original.trim()}`
    alert(message)
    setup()
}
