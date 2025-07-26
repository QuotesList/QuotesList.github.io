const TROPHY_COLORS = ['gold', 'silver', 'bronze']

function loadLeaderboard(quotes) {
    let matchups = [], groupQuotes = quotes.filter(x => x.isGroup)
    groupQuotes.forEach(quote => {
        let authors = quote.authors.split(',').map(x => x.trim()).sort()
        authors.flatMap((v, i) => authors.slice(i + 1).map(w => [v, w]))
            .forEach(match => matchups.push(match.join(', ')))
    })
    let map = {}, countedIndexes = [], indexCounts = {}
    matchups.forEach(match => map[match] = (map[match] || 0) + 1)
    $('#leaderboard-content').html(
        Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map((mapping) => {
                let count = mapping[1], sum = Object.values(indexCounts).reduce((a, b) => a + b, 0) || 0
                if (countedIndexes.includes(count)) {
                    sum -= indexCounts[count]
                } else {
                    countedIndexes.push(count)
                    indexCounts[count] = 0
                }
                indexCounts[count] += 1
                let names = mapping[0].split(',').map(x => x.trim())
                return `
                    <tr class="teamup-row" data-names="${mapping[0]}">
                        <td class="rank-${sum + 1}">${sum + 1}</td>
                        <td>${names[0]}</td>
                        <td>${names[1]}</td>
                        <td ${
                            (count > 10)? `class="rank-${count}"` : ''
                        }>
                            ${count} ${pluralize(count, 'quote')}
                        </td>
                    </tr>
                `
            })
            .join('\n')
    )
    $('tr.teamup-row').each((_, el) => {
        $(el).click(() => {
            window.location.assign('./quotes/?' + $(el).data('names'))
        })
    })
    Array.from(TROPHY_COLORS).forEach((color, i) => {
        $(`.rank-${i + 1}`).append(`&ensp;<i class="fa-solid fa-trophy ${color}"></i>`)
    })
    $(`.rank-69`).append('<span class="nice-text">&nbsp;Nice.</span>')
}

function loadQuotePage(quotes) {
    let namesText = window.location.href
    if (!namesText.includes('?')) {
        alert('No arguments!')
        return
    }
    namesText = decodeURI(namesText.slice(namesText.lastIndexOf('?') + 1))
    if ((namesText.match(/,/g) || []).length !== 1) {
        alert('Invalid number of arguments!')
        return
    }
    let names = namesText.split(',').map(x => x.trim())
    if (names[0].length < 1 || names[1].length < 1) {
        alert('Invalid arguments!')
        return
    }
    $('#first-name-text').text(names[0])
    $('#second-name-text').text(names[1])
    quotes = quotes.filter((quote) => {
        let authors = quote.authors.split(',').map(x => x.trim())
        return (authors.includes(names[0]) && authors.includes(names[1]))
    }).map(x => x.quote.replaceAll('\n', '<br>'))
    $('#num-found-text').text(`${quotes.length} found`)
    $('#quote-list').html(quotes.join('<br><br>'))
}

let allQuotes = getAllQuotes()

$(document).ready(() => {
    allQuotes
        .then(({ quotes }) => {
            if ((window.location.href.split('analytics')[1] || '').includes('quotes')) {
                loadQuotePage(quotes)
            } else {
                loadLeaderboard(quotes)
            }
        })
        .catch((err) => {
            console.error(err)
            alert('Error loading page!')
        })
})
