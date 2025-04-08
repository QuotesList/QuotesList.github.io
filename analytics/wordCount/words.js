function cleanString(str) {
    if (str.trim().split('\n').length > 1) {
        str = str.split('\n').map(x => {
            x = x.replaceAll('"', '').trim()
            return x.includes(':')? x.slice(x.indexOf(':') + 1) : x
        }).join(' ')
    }
    str = str.replace(/\(.*?\)|\[.*?\]|\*.*?\*/g, '')
    if (str.includes('~')) {
        str = str.slice(0, str.indexOf('~'))
    } else if (str.includes(':')) {
        str = str.slice(str.indexOf(':') + 1)
    } else if (str.includes('-')) {
        str = str.slice(0, str.indexOf('-'))
    }
    return str.replace(/[,.?!-""]/g, '')
}

function loadGraph(stats, numQuotes) {
    let data = []
    for (let i = 0; i < Math.max(...Object.keys(stats).map(Number)); i++) {
        data.push({
            name: i + ' Words',
            y: stats[i] || 0
        })
    }
    Highcharts.chart('container', {
        chart: { type: 'column' },
        title: { text: 'Quote Distribution by Number of Words' },
        subtitle: {
            text: 'Click any column to see corresponding quotes!'
        },
        yAxis: {
            title: { text: 'Number of Quotes' }
        },
        legend: { enabled: false },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span> ' +
                '<b>{point.y}</b> of <b>' + numQuotes + '</b> Quotes<br/>'
        },
        series: [{
            name: '# of Words',
            colorByPoint: true,
            data
        }]
    })
    $('g.highcharts-tracker > path.highcharts-point').each((numWords, el) => {
        $(el).click(() => {
            if (stats[numWords] < 1) {
                alert(`There are no quotes with ${numWords} words!`)
            } else {
                window.location.assign('./quotes/?' + numWords)
            }
        })
    })
}

function loadQuotes(quotes) {
    let numWords = window.location.href
    if (!numWords.includes('?')) {
        alert('No argument!')
        return
    }
    numWords = +numWords.slice(numWords.indexOf('?') + 1).trim()
    if (isNaN(numWords)) {
        alert('Argument invald!')
        return
    }
    quotes = quotes.filter(quote => quote.count === numWords).sort((a, b) => b.id - a.id)
    $('#num-words-text').text(numWords)
    $('#num-found-text').text(quotes.length + ' found')
    $('#quote-list').html(quotes.map(x => x.quote.replaceAll('\n', '<br>')).join('<br><br>'))
}

getAllQuotes()
    .then(({ quotes, numQuotes }) => {
        let stats = {}
        quotes.forEach(quote => {
            let count = cleanString(quote.quote).split(' ').filter(x => x.length).length
            stats[count] = (stats[count] || 0) + 1
            quote.count = count
        })
        $(document).ready(() => {
            if ((window.location.href.split('analytics')[1] || '').includes('quotes')) {
                loadQuotes(quotes)
            } else {
                loadGraph(stats, numQuotes)
            }
        })
    })
