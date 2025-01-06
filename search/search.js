const runSearch = () => {
    try {
        alert(document.getElementById('searchInput').value)
        getSearch(document.getElementById('searchInput').value)
            .then(data => {
                let str = ""
                data.quotes.forEach(x => {
                    str += `${x.quote.trim()}<br><br>`
                })
                document.getElementById('results-wrapper').innerHTML = str
            })
    }
    catch (err) {
        console.error(err)
        document.getElementById('results-wrapper').innerHTML = ''
    }
}
