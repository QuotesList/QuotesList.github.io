var gId1 = -1
var gId2 = -1

const filterHighQuotes = (quotes) => {
    if (quotes.length < 40) {
        return quotes
    }
    quotes = copyObject(quotes).sort((a, b) => a.numVotes - b.numVotes)
    return quotes.slice(0, Math.ceil(quotes.length / 10))
}

const setUpVote = () => {
    getAllQuotes()
        .then(data => {
            if (data.numQuotes < 3) {
                alert('Could not find enough quotes!')
                return
            }
            let quotes = filterHighQuotes(data.quotes)
            if (quotes === undefined || quotes.length < 3) {
                alert('Error reading quote data!')
                return
            }
            let quote1 = randomArrayItem(quotes)
            let quote2 = randomArrayItem(quotes)
            let count = 0
            while (quote2.id === quote1.id) {
                quote2 = randomArrayItem(quotes)
                if ((++count) > 1000) {
                    alert('Error. Infinite loop detected!')
                    return
                }
            }
            gId1 = quote1.id
            gId2 = quote2.id

            $('span#quote-card-1').each((n, el) => {
                $(el).html(escapeText(quote1.quote).replaceAll('\n', '<br>'))
            })
            $('span#quote-card-2').each((n, el) => {
                $(el).html(escapeText(quote2.quote).replaceAll('\n', '<br>'))
            })

            Array.from(document.getElementsByClassName(('vote-button'))).forEach(x => {
                x.disabled = false
            })
        })
        .catch(err => {
            alert('Error retrieving quotes!')
            console.error('No quotes.', err)
        })
}

$(document).ready(setUpVote)

const vote = (idx) => {
    Array.from(document.getElementsByClassName('voteButton')).forEach(x => {
        x.disabled = true
    })
    if (idx !== 1 && idx !== 2) {
        console.error(`Index: ${idx}`)
        return
    }
    if (gId1 < 1 || gId2 < 1) {
        console.error(`IDs: ${gId1} | ${gId2}`)
        return
    }
    let yesVote = (idx === 1)? gId1 : gId2
    let noVote = (gId1 + gId2) - yesVote
    console.log(`Voting ${yesVote} over ${noVote}`)
    postVote(yesVote, noVote)
    setUpVote()
}
