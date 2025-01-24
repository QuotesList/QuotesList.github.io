getAllQuotes()
    .then(data => {
        let groupQuotes = data.quotes.filter(x => x.isGroup)
        let matchups = []
        groupQuotes.forEach(quote => {
            let authors = quote.authors.split(',').map(x => x.trim())
            authors.sort()
            authors.flatMap((v, i) => authors.slice(i + 1).map(w => [v, w])).forEach(match => {
                matchups.push(match.join(', '))
            })
        })
        let matchMap = {}
        matchups.forEach(match => {
            if (matchMap[match] === undefined) {
                matchMap[match] = 1
            } else {
                matchMap[match] += 1
            }
        })
        return matchMap
    })
    .then(map => {
        let matches = Object.keys(map)
        matches.sort((a, b) => {
            return (map[b] - map[a])
        })
        let countedIndexes = []
        let indexCounts = {'a': 1}
        matches = matches.map((x, n) => {
            let count = map[x]
            let place = 0
            let sum = Object.values(indexCounts).map(x => parseInt(x)).reduce((a, b) => a + b, 0)
            if (countedIndexes.includes(count)) {
                console.log('a')
                sum -= indexCounts[count]
                indexCounts[count] += 1
                place = sum
            } else {
                countedIndexes.push(count)
                console.log('b')
                place = sum
                indexCounts[count] = 1
            }
            // return `${n + 1}. ${x} (${count} quote${(count > 1)? 's' : ''})`
            return `${place}. ${x} (${count} quote${(count > 1)? 's' : ''})`
        })
        return matches.join('<br>\n')
    })
    .then(matchString => {
        let leaderboard = document.getElementById('combo-leaderboard')
        leaderboard.innerHTML = matchString
    })
