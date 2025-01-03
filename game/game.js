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
            document.getElementById('card1').innerHTML = game.quote.quote.replaceAll('\r\n', '<br>') + '<br>'
            let buttonsText = []
            let i = 0
            game.options.forEach(x => {
                buttonsText.push(`<button class="btn btn-primary" onclick="resetGame(${i++ === 0},'${game.options[0]}')">${x.trim()}</button><br>`)
            })
            shuffle(buttonsText)
            document.getElementById('card2').innerHTML = buttonsText.join('<br>')
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

// const test = () => {
//     const url = new URL("http://server.seidman-ad.am:8008/game?pwd=pass1")
//     fetch(url)
//         .then(response => response.json())
//         .then(json => {
//             document.getElementById('card1').innerHTML = json.quote.quote.replaceAll('\r\n', '<br>') + '<br>'
//             let buttonsText = []
//             let i = 0
//             json.options.forEach(x => {
//                 buttonsText.push(`<button onclick="resetGame(${i++ === 0},'${json.options[0]}')">${x.trim()}</button><br>`)
//             })
//             shuffle(buttonsText)
//             document.getElementById('card2').innerHTML = buttonsText.join('<br>')
//         })
// }


setTimeout(loadQuotes, 100)
