var gQuoteList = []
var gLastEditId = -1

getAllQuotes()
    .then(data => {
        gQuoteList = copyObject(data.quotes)
        gQuoteList.sort((a, b) => (b.id - a.id))
        let list = ''
        gQuoteList.forEach(quote => {
            list += `<div class="quote"><span class="quote" id="quote-${quote.id}">${escapeText(quote.quote).replaceAll('\n', '<br>')}</span> \
                    <button type="button" class="btn editBtn" onclick="editClicked(${quote.id})"> \
                    <i class="fa fa-pencil" aria-hidden="true"></i></button></div><br>\n`
        })
        document.getElementById('quoteList').innerHTML = list
    })
    .catch(err => {
        alert('Could not load quotes!')
        console.error('Error loading quote list', err)
    })

const editClicked = (id) => {
    gLastEditId = id
    let quote = gQuoteList.find(x => x.id === id)
    if (quote === undefined) {
        console.error(`Could not find quote "${id}"`)
        return
    }
    document.getElementById('quoteId').innerHTML = `#${id}`
    document.getElementById('qtext').value = quote.quote
    $('#editModal').show()
}

const submitQuoteForm = () => {
    document.getElementById('submit-btn').disabled = true
    let qEl = document.getElementById('qtext')
    postEdit(qEl.value, gLastEditId)
        .then(() => {
            $('#editModal').hide()
            document.getElementById(`quote-${gLastEditId}`).innerHTML = escapeText(qEl.value).replaceAll('\n', '<br>')
            qEl.value = ""
            alert('Quote edit submitted.')
        })
        .catch(err => {
            alert('Failed to edit quote!')
            console.error('Edit failed!', err)
            document.getElementById('submit-btn').disabled = false
        })
}
