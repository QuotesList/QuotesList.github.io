getAllQuotes()
    .then(data => {
        let authorMap = {}
        let currentPeople = {}
        let allQuotes = copyObject(data.quotes)
        allQuotes.sort((a, b) => a.id - b.id)
        allQuotes.forEach(quote => {
            let authors = [quote.authors]
            if (quote.isGroup) {
                authors = quote.authors.split(',').map(x => x.trim())
            }
            authors.forEach(author => {
                if (authorMap[author] === undefined) {
                    authorMap[author] = 1
                    currentPeople[author] = 1
                } else if (Object.keys(currentPeople).includes(author)) {
                    currentPeople[author] += 1
                    if (authorMap[author] < currentPeople[author]) {
                        authorMap[author] = currentPeople[author]
                    }
                } else {
                    currentPeople[author] = 1
                }
            })
            Object.keys(currentPeople).forEach(person => {
                if (!authors.includes(person)) {
                    delete currentPeople[person]
                }
            })
        })
        let builder = Object.keys(authorMap)
                            .filter(x => authorMap[x] > 1)
                            .sort((a, b) => {
                                if (authorMap[a] === authorMap[b]) {
                                    return a.localeCompare(b)
                                }
                                return (authorMap[b] - authorMap[a])
                            })
        let numGroups = authorMap[builder[0]]
        let idxMap = {}
        idxMap[numGroups] = 1
        let cumm = builder.filter(x => authorMap[x] === builder[0]).length + 1
        for (let i = (numGroups); i > 1; i--) {
            idxMap[i] = cumm
            cumm += builder.filter(x => authorMap[x] === i).length
        }
        return builder.map(x => `${idxMap[authorMap[x]]}. ${x} (${authorMap[x]} quotes)`)
    })
    .then(leaderboard => {
        let el = document.getElementById('leaderboard')
        el.innerHTML = leaderboard.join('<br>\n')
    })
