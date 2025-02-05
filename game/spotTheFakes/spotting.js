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
                let probability = 1.0
                let cacheMap = {}

                const preserveCaseAndPunctuation = (original, replacement) => {
                    if (original[0] === original[0].toUpperCase()) {
                        replacement = replacement[0].toUpperCase() + replacement.slice(1);
                    }
                    return replacement;
                }

                let builder = text.replace(/\b\w+['’]?\w*\b|\w+/g, (word) => {
                    let lowerWord = word.toLowerCase().trim();
                    let cachedReplacement = cacheMap[lowerWord];
                    
                    if (cachedReplacement !== undefined) {
                        found = true
                        return preserveCaseAndPunctuation(word, cachedReplacement);
                    }
                
                    let pos = potentialTags[word];
                    if (
                        word.length > 3 &&
                        pos !== undefined &&
                        typeof pos.join === 'function' &&
                        posMap[pos.join('|')] !== undefined &&
                        (Math.random() <= probability || probability === 1.0)
                    ) {
                        let tag = pos.join('|')
                        let replacement = randomArrayItem(posMap[tag])
                        if (replacement !== undefined) {
                            cacheMap[lowerWord] = replacement.toLowerCase()
                            probability *= 0.25
                            return preserveCaseAndPunctuation(word, replacement)
                        }
                    }
                    return word
                })

                let article = (quote.quote.includes('"'))? '"' : ''
                let subAuthor = authorText
                while (subAuthor === authorText || attributionMap[subAuthor] === attributionMap[authorText]) {
                    subAuthor = randomArrayItem(potentialAttributions)
                }
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

const adjacentMap = {
    original: ['replacement', 'misattributed'],
    replacement: ['original', 'bothBad'],
    misattributed: ['original', 'bothBad'],
    bothBad: ['replacement', 'misattributed']
}

const submitGuess = (el) => {
    setAllButtonsEnabled(false)
    let numPoints = 0
    let message = 'Incorrect :('
    if (el.id === currentKey) {
        numPoints = 1
        message = 'Correct!'
    } else if (adjacentMap[currentKey].includes(el.id)) {
        numPoints = 0.5
        message = 'Half Correct  (+0.5)'
    }
    total += 1
    score += numPoints
    document.getElementById('score').innerHTML = score
    document.getElementById('total').innerHTML = total
    if (numPoints < 1) {
        message += `\n\nAnswer was: ${document.getElementById(currentKey).innerHTML}`
    }
    message += `\n\n${currentQuote.options.original.trim()}`
    alert(message)
    setup()
}
