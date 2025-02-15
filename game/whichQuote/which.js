let gameScore = new GameScore(WHICH_DID_THEY_SAY)

var gIdA = -1 /* Correct */
var gIdB = -1
var gCorrectAnswer = 1

var quoteMap = {}
var groupSet = new Set([])

const updateScores = () => {
    if (gameScore.possiblePoints > 0) {
        $('#roundNum').text(gameScore.possiblePoints + 1)
        $('#correctCount').text(gameScore.currentPoints)
    }
}

$(document).ready(updateScores)

const setupGame = () => {
    let name = $('#which-person').text()
    let randomNum = getRandomInt(Object.keys(quoteMap).length) + 1
    while ([gIdA, gIdB].includes(randomNum) || groupSet.has(randomNum) || quoteMap[randomNum].authors.trim() === name) {
        randomNum = getRandomInt(Object.keys(quoteMap).length) + 1
    }
    let lastId1 = gIdA
    gIdA = randomNum
    name = quoteMap[gIdA].authors.trim()
    randomNum = getRandomInt(Object.keys(quoteMap).length) + 1
    while ([gIdA, gIdB, lastId1].includes(randomNum) || groupSet.has(randomNum) || quoteMap[randomNum].authors.trim() === name) {
        randomNum = getRandomInt(Object.keys(quoteMap).length) + 1
    }
    gIdB = randomNum
    $('#which-person').text(name)
    gCorrectAnswer = getRandomInt(2) + 1
    if (gCorrectAnswer === 1) {
        $('#quote-card-1').text(quoteMap[gIdA].shortened)
        $('#quote-card-2').text(quoteMap[gIdB].shortened)
    } else {
        $('#quote-card-1').text(quoteMap[gIdB].shortened)
        $('#quote-card-2').text(quoteMap[gIdA].shortened)
    }
}

const makeGuess = (quotePicked) => {
    if (quotePicked === gCorrectAnswer) {
        gameScore.addScore(1, 1)
        alert('Correct!')
    } else {
        gameScore.addScore(0, 1)
        alert('Incorrect :(')
    }
    updateScores()
    setupGame()
}

getAllQuotes()
    .then(data => {
        let groupIds = []
        data.quotes.forEach(quote => {
            quoteMap[quote.id] = copyObject(quote)
            if (quote.isGroup) {
                groupIds.push(quote.id)
            } else {
                let text = quote.quote
                if (text.includes('~')) {
                    text = text.slice(0, text.indexOf('~'))
                } else if (text.includes('-')) {
                    text = text.slice(0, text.indexOf('-'))
                } else if (text.includes(':')) {
                    text = text.slice(text.indexOf(':') + 1)
                }
                quoteMap[quote.id].shortened = text.trim()
            }
        })
        groupSet = new Set(groupIds)
        $(document).ready(setupGame)
    })
