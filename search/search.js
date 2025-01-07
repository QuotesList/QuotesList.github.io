const runSearch = () => {
    try {
        getSearch(document.getElementById('searchInput').value)
            .then(data => {
                let str = ""
                data.quotes.sort((a, b) => (b.id - a.id))
                data.quotes.forEach(x => {
                    str += `${x.quote.trim().replaceAll('\n', '<br>')}<br><br>`
                })
                document.getElementById('results-wrapper').innerHTML = str
                document.getElementById('num-results').innerHTML = `${data.quotes.length} Quote${(data.quotes.length === 1) ? '' : 's'}`
            })
    }
    catch (err) {
        console.error(err)
        document.getElementById('results-wrapper').innerHTML = ''
        document.getElementById('num-results').innerHTML = ''
    }
}
