// const getNewQuotes = () => {
//     const url = new URL("http://localhost:3000/quotes?pwd=pass1&numQuotes=2")
//     fetch(url)
//     .then(response => response.json())
//     .then(json => {
//         document.getElementById('card1').innerHTML = json.quotes[0].quote.replaceAll('\r\n', '<br>')
//         document.getElementById('card2').innerHTML = json.quotes[1].quote.replaceAll('\r\n', '<br>')
//     })
// }

// getNewQuotes()

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
        test()
        let el = document.getElementById('roundNum')
        el.innerHTML = `${parseInt(el.innerHTML) + 1}`
    }, 200)
}

const test = () => {
    const url = new URL("http://server.seidman-ad.am:8008/game?pwd=pass1")
    fetch(url)
        .then(response => response.json())
        .then(json => {
            document.getElementById('card1').innerHTML = json.quote.quote.replaceAll('\r\n', '<br>') + '<br>'
            let buttonsText = []
            let i = 0
            json.options.forEach(x => {
                buttonsText.push(`<button onclick="resetGame(${i++ === 0},'${json.options[0]}')">${x.trim()}</button><br>`)
            })
            shuffle(buttonsText)
            document.getElementById('card2').innerHTML = buttonsText.join('<br>')
        })
}


setTimeout(test, 100)
