var gameScore = new GameScore(GUESS_THE_SPEAKER)

const updateScores = (isWin) => {
    if (isWin === true) {
        gameScore.addScore(1, 1)
    } else if (isWin === false) {
        gameScore.addScore(0, 1)
    }
    $('#correctCount').text(gameScore.currentPoints)
    $('#roundNum').text(gameScore.possiblePoints + 1)
}

if (gameScore.possiblePoints > 0) {
    $(document).ready(() => {
        updateScores()
    })
}

function shuffle(array) {
    let currentIndex = array.length;
  
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
}

const loadQuotes = () => {
    getGame()
        .then(game => {
            console.log(game)
            document.getElementById('card1').innerHTML = game.quote.quote.replaceAll('\r\n', '<br>') + '<br>'
            let buttonsText = []
            let i = 0
            game.options.forEach(x => {
                buttonsText.push(`<div class="col-lg-2"><button class="btn btn-yellow w-100" onclick="resetGame(${i++ === 0},'${game.options[0]}')">${x.trim()}</button></div><br>`)
            })
            shuffle(buttonsText)
            document.getElementById('card2').innerHTML = buttonsText.join('')
        })
}

const resetGame = (correct, author) => {
    if (correct) {
        alert('Correct!')
    } else {
        let text = 'Incorrect :('
        if (author) {
            text += `\r\nThe correct answer was ${author}`
        }
        alert(text)
    }
    setTimeout(() => {
        loadQuotes()
        updateScores(correct)
    }, 100)
}

setTimeout(loadQuotes, 100)
