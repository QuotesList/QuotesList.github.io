const TROPHY_COLORS = ['gold', 'silver', 'bronze']
let authorMap = {}, currentPeople = {}

function loadLeaderboard() {
    let builder = Object.keys(authorMap).filter(x => authorMap[x] > 1).sort((a, b) => authorMap[b] - authorMap[a] || a.localeCompare(b))
    let rank = 1, idxMap = {}
    builder.forEach((x, i) => {
        if (i > 0 && authorMap[x] < authorMap[builder[i - 1]]) {
            rank = i + 1
        }
        idxMap[authorMap[x]] = rank
    })
    $('#leaderboard-content').html(builder.map(x => `
        <tr class="streak-row" data-name="${x}">
            <td class="rank-${idxMap[authorMap[x]]}">${idxMap[authorMap[x]]}</td>
            <td>${x}</td>
            <td>${authorMap[x]} Quotes</td>
        </tr>
    `).join(''))
    $('tr.streak-row').each((_, el) => {
        $(el).click(() => {
            window.location.assign('./quotes/?' + $(el).data('name'))
        })
    })
    Array.from(TROPHY_COLORS).forEach((color, i) => {
        $(`.rank-${i + 1}`).append(`&ensp;<i class="fa-solid fa-trophy ${color}"></i>`)
    })
    $(`.rank-69`).append('<span class="nice-text">&nbsp;Nice.</span>')
}

function loadQuotePage(quotes) {
    let author = window.location.href
    if (!author.includes('?')) {
        alert('No argument!')
        return
    }
    author = decodeURI(author.slice(author.lastIndexOf('?') + 1)).trim()
    if (author.length < 1 || !Object.keys(authorMap).includes(author)) {
        alert('Invalid name!')
        return
    }
    $('#name-text').text(author)
    $('#num-found-text').text(authorMap[author])
    let builder = [false, ...quotes.map((quote) => quote.authors.split(',').map(x => x.trim()).includes(author))]
    let idx, streak = authorMap[author]
    for (idx = 0; idx < builder.length - (streak - 1); idx++) {
        let found = builder[idx]
        if (found) {
            for (let i = 1; i < streak; i++) {
                found = (found && builder[idx + i])
                if (!found) break
            }
        }
        if (found) break
    }
    if (idx >= builder.length - (streak - 1)) {
        alert('Error in calculation!')
        return
    }
    quotes = quotes.filter((quote) => quote.id >= idx && quote.id < (idx + streak)).map(x => x.quote.trim().replaceAll('\n', '<br>'))
    $('#quote-list').html(quotes.join('<br><br>'))
}

let allQuotes = getAllQuotes()

$(document).ready(() => {
    
    allQuotes
        .then(({ quotes }) => {
            quotes.sort((a, b) => a.id - b.id)
            quotes.forEach(({ authors, isGroup }) => {
                let authorList = isGroup ? authors.split(',').map(x => x.trim()) : [authors.trim()]
                authorList.forEach(author => {
                    authorMap[author] = Math.max((currentPeople[author] = (currentPeople[author] || 0) + 1), authorMap[author] || 0)
                })
                Object.keys(currentPeople).forEach(person => !authorList.includes(person) && delete currentPeople[person])
            })
            if ((window.location.href.split('analytics')[1] || '').includes('quotes')) {
                loadQuotePage(quotes)
            } else {
                loadLeaderboard()
            }
        })
        .catch((err) => {
            console.error(err)
            alert('Error loading page!')
        })
})

