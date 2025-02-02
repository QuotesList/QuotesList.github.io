getAllQuotes()
    .then(data => {
        let wordMap = {}
        let sentences = []
        data.quotes.forEach(quote => {
            if (quote.isGroup) {
                quote.quote.split('\n').forEach(x => {
                    if (x.includes(':')) {
                        sentences.push([x.slice(x.indexOf(':') + 1), quote.elo])
                    } else if (x.includes('~')) {
                        sentences.push([x.slice(0, x.indexOf('~')), quote.elo])
                    }
                })
            } else {
                if (quote.quote.includes('~')) {
                    sentences.push([quote.quote.slice(0, quote.quote.indexOf('~')), quote.elo])
                } else if (quote.quote.includes('-')) {
                    sentences.push([quote.quote.slice(0, quote.quote.indexOf('-')), quote.elo])
                } else {
                    sentences.push([quote.quote, quote.elo])
                }
            }
        })
        sentences = sentences.map(x => {
            let sentence = x[0]
            sentence = sentence.replaceAll('"', ' ')
            sentence = sentence.replaceAll('?', ' ')
            sentence = sentence.replaceAll("'", '')
            sentence = sentence.replaceAll(/[^\x20-\x7E]/g, '');
            sentence = sentence.replaceAll(/\s*\(.*?\)\s*/g, ' ')
            sentence = sentence.replaceAll(/\s*\*.*?\*\s*/g, ' ')
            sentence = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/\s{2,}/g,' ')
            sentence = sentence.trim().toLowerCase()
            sentence = sentence.replace(/\s+/g, ' ')
            return [sentence, x[1]]
        })
        sentences.forEach(sentence => {
            sentence[0].split(' ').forEach(word => {
                if (wordMap[word] === undefined) {
                    wordMap[word] = {
                        totalElo: sentence[1],
                        numTimes: 1
                    }
                } else {
                    wordMap[word].numTimes += 1
                    wordMap[word].totalElo += sentence[1]
                }
            })
        })
        Object.keys(wordMap).forEach(key => {
            wordMap[key].averageElo = (wordMap[key].totalElo / wordMap[key].numTimes)
        })
        let words = Object.keys(wordMap).filter(x => wordMap[x].numTimes >= 3)
        words.sort((a, b) => {
            return (wordMap[b].averageElo - wordMap[a].averageElo)
        })
        words = words.map((x, n) => `${n + 1}. ${x.slice(0, 1).toUpperCase()}${x.slice(1)} (${Math.round(wordMap[x].averageElo * 100) / 100})`)
        document.getElementById('word-leaderboard').innerHTML = words.join('<br>')
    })
