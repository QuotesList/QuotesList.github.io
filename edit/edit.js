var gQuoteList = []
var gLastEditId = -1

getAllQuotes()
    .then(data => {
        gQuoteList = copyObject(data.quotes)
        gQuoteList.sort((a, b) => (b.id - a.id))
        gQuoteList.forEach((quote) => {
            $('#quote-edit-content').append(`
                <tr id="row-${quote.id}" class="quote-row" data-quote="${quote.quote.trim().replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()}">
                    <td>${quote.id}</td>
                    <td id="quote-${quote.id}">${quote.quote.trim().replaceAll('\n', '<br>')}</td>
                    <td>
                        <button type="button" class="btn edit-btn" onclick="editClicked(${quote.id})">
                            <i class="fa fa-pencil" aria-hidden="true"></i>
                        </button>
                    </td>
                </tr>
            `)
        })
        $('i.filter-menu').click((evt) => {
            $(evt.target).toggleClass('pressed')
            if ($(evt.target).hasClass('pressed')) {
                let text = prompt('Enter filter text:')
                if (text !== null && text.trim().length > 0) {
                    text = text.trim().replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
                    $('tr.quote-row').each((n, el) => {
                        $(el).toggleClass('hidden', !$(el).data('quote').includes(text))
                    })
                } else {
                    $(evt.target).toggleClass('pressed')
                }
            } else {
                $('tr.quote-row').each((n, el) => {
                    $(el).toggleClass('hidden', false)
                })
            }
        })
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
    document.getElementById('submit-btn').disabled = false
    $('#edit-modal').show()
}

const submitQuoteForm = () => {
    document.getElementById('submit-btn').disabled = true
    let qEl = document.getElementById('qtext')
    postEdit(qEl.value, gLastEditId)
        .then(() => {
            $('#edit-modal').hide()
            $(`td#quote-${gLastEditId}`).html(escapeText(qEl.value).trim().replaceAll('\n', '<br>'))
            $(`tr#quote-${gLastEditId}`).data('quote', escapeText(qEl.value).trim().replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase())
            gQuoteList.forEach(quote => {
                if (quote.id === gLastEditId) {
                    quote.quote = qEl.value
                }
            })
            qEl.value = ""
            alert('Quote edit submitted.')
        })
        .catch(err => {
            alert('Failed to edit quote!')
            console.error('Edit failed!', err)
            document.getElementById('submit-btn').disabled = false
        })
}
