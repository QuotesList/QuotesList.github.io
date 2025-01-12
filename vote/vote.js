var gId1 = -1
var gId2 = -1

const setUpVote = () => {
    getQuotes(2)
        .then(data => {
            if (data.numQuotes !== 2 || !Array.isArray(data.quotes)) {
                alert('Could not get valid quotes!')
                return
            }
            gId1 = data.quotes[0].id
            gId2 = data.quotes[1].id
            document.getElementById('quote-card-1').innerHTML = escapeText(data.quotes[0].quote).replaceAll('\n', '<br>')
            document.getElementById('quote-card-2').innerHTML = escapeText(data.quotes[1].quote).replaceAll('\n', '<br>')
            Array.from(document.getElementsByClassName('voteButton')).forEach(x => {
                x.disabled = false
            })
        })
        .catch(err => {
            alert('Error retrieving quotes!')
            console.error('No quotes.', err)
        })
}

setUpVote()

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