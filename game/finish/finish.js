let allQuotes = []
let currentQuote = { id: -1 }
let score = 0
let maxScore = 0
let inGame = true

const MIN_WORDS = 7

let getErasedQuote = (quote) => {
    let words = quote.replace(/\s+/g, ' ').trim().split(' ')
    if (words.length < 4) {
        return [words.join(' '), '']
    }
    let htmlWords = copyObject(words)
    let built = []
    let indexes = [0, words.length - 1]
    while (Math.abs(indexes[0] - indexes[1]) > (words.length / 2) || Math.abs(indexes[0] - indexes[1]) < 2) {
        indexes = [getRandomInt(words.length), getRandomInt(words.length)]
        while (indexes[0] == indexes[1]) {
            indexes[1] = getRandomInt(words.length)
        }
    }
    indexes.sort()
    for (let i = indexes[0]; i < indexes[1]; i += 1) {
        built.push(words[i].replace(/[^a-zA-Z]/g, '').toLowerCase())
        htmlWords[i] = `<strong>${words[i]}</strong>`
        words[i] = `<strong>${words[i].replace(/[a-zA-Z]/g, '_')}</strong>`
    }
    return [words, built, htmlWords].map(x => x.join(' '))
}

let setupGame = () => {
    let lastId = currentQuote.id
    do {
        currentQuote = copyObject(randomArrayItem(allQuotes))
    } while (currentQuote.id === lastId || !currentQuote.censored.includes('_'))
    document.getElementById('quote').innerHTML = currentQuote.censored
    document.getElementById('submitBtn').disabled = false
    document.getElementById('game-entry').disabled = false
}

getAllQuotes()
    .then(data => {
        allQuotes = data.quotes
            .filter(x => !x.isGroup && x.quote.split(' ').length >= MIN_WORDS)
            .map(quote => {
                let authorText = ''
                if (quote.quote.includes('~')) {
                    authorText = quote.quote.slice(quote.quote.indexOf('~'))
                    quote.quote = quote.quote.slice(0, quote.quote.indexOf('~'))
                } else {
                    authorText = quote.quote.slice(quote.quote.indexOf('-'))
                    quote.quote = quote.quote.slice(0, quote.quote.indexOf('-'))
                }
                [quote.censored, quote.missingWords, quote.html] = getErasedQuote(quote.quote)
                quote.censored += ` ${authorText}`
                quote.html += ` ${authorText}`
                quote.quote = (quote.quote + authorText).replace(/\s+/g, ' ').trim()
                return quote
            })
        if (allQuotes.length < 3) {
            alert('Very few quotes found!\r\nGame performance may be poor.')
        }
        setupGame()
    })

const levenshteinDistance = (word1, word2) => {
    let dp = Array(word1.length + 1).fill(null).map(() => Array(word2.length + 1).fill(0))

    for (let i = 0; i <= word1.length; i++) dp[i][0] = i
    for (let j = 0; j <= word2.length; j++) dp[0][j] = j

    for (let i = 1; i <= word1.length; i++) {
        for (let j = 1; j <= word2.length; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
            }
        }
    }
    return dp[word1.length][word2.length]
}

const letterMatchScore = (word1, word2) => {
    let matches = 0
    let length = Math.max(word1.length, word2.length)

    for (let i = 0; i < length; i++) {
        if (word1[i] === word2[i]) matches++
    }

    return matches / length
}

const getPhraseSimilarity = (phrase1, phrase2) => {
    let words1 = phrase1.split(' ')
    let words2 = phrase2.split(' ')

    if (phrase1 === phrase2) return 10
    if (words1.length !== words2.length) return 0

    let totalScore = 0

    for (let i = 0; i < words1.length; i++) {
        let word1 = words1[i]
        let word2 = words2[i]

        if (word1 === word2) {
            totalScore += 1
        } else {
            let levDist = levenshteinDistance(word1, word2)
            let letterScore = letterMatchScore(word1, word2)

            let typoPenalty = 1 - (levDist / Math.max(word1.length, word2.length))
            let wordSimilarity = Math.max(typoPenalty, letterScore)

            totalScore += wordSimilarity
        }
    }
    return Math.round((totalScore / words1.length) * 10.0)
}

let submit = () => {
    let submitBtn = document.getElementById('submitBtn')
    let input = document.getElementById('game-entry')
    let quote = document.getElementById('quote')

    if (submitBtn.disabled || (inGame && input.disabled)) {
        return
    }
    input.disabled = true
    submitBtn.disabled = true

    if (inGame) {
        let guessText = input.value.replace(/\s+/g, ' ').trim().replace(/[^a-zA-Z\s]/g, '').toLowerCase()

        let guessScore = getPhraseSimilarity(guessText, currentQuote.missingWords)
        score += guessScore
        maxScore += 10

        document.getElementById('totalScore').innerHTML = score
        document.getElementById('maxScore').innerHTML = maxScore
        document.getElementById('scoreAdjustment').innerHTML = `&nbsp; (+${guessScore})`

        quote.innerHTML = `${currentQuote.html}`
        submitBtn.innerHTML = 'Refresh &nbsp; <i class="fa fa-refresh"></i>'
    } else {
        document.getElementById('scoreAdjustment').innerHTML = ''
        input.value = ''
        setupGame()
        submitBtn.innerHTML = 'Submit'
    }
    inGame = !inGame
    submitBtn.disabled = false
}
