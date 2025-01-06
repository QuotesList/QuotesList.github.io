function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

const loadQuotes = () => {
    getGame()
        .then(game => {
            console.log(111)
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
        let el = document.getElementById('correctCount')
        el.innerHTML = `${parseInt(el.innerHTML) + 1}`
    } else {
        let text = 'Incorrect :('
        if (author) {
            text += `\r\nThe correct answer was ${author}`
        }
        alert(text)
    }
    setTimeout(() => {
        loadQuotes()
        let el = document.getElementById('roundNum')
        el.innerHTML = `${parseInt(el.innerHTML) + 1}`
    }, 100)
}

setTimeout(loadQuotes, 100)
