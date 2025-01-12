var gQuoteList = []
var gAuthorList = []

getSearch("")
    .then(data => {
        gQuoteList = JSON.parse(JSON.stringify(data.quotes))
        gQuoteList.sort((a, b) => (b.id - a.id))
        let list = ''
        gQuoteList.forEach(quote => {
            list += `<div class="quote"><span class="quote">${escapeText(quote.quote).replaceAll('\n', '<br>')}</span> \
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
    let quote = gQuoteList.find(x => x.id === id)
    if (quote === undefined) {
        console.error(`Could not find quote "${id}"`)
        return
    }
    document.getElementById('qtext').value = quote.quote
    $('#editModal').show()
}

const updateAuthorList = authorList => {
    if (!Array.isArray(authorList)) {
        return
    }
    gAuthorList = JSON.parse(JSON.stringify(authorList))
    let authors = ''
    authorList.forEach((author, idx) => {
        let isNew = false
        if (Array.isArray(author)) {
            author = author[0]
            isNew = true
        }
        authors += `<li class="clearfix"><span class="authorName">${author}&ensp;</span>`
        if (isNew) {
            authors += '<i class="fa fa-user-plus" aria-hidden="true"></i>'
        }
        authors += `<div class="name-btn-div float-right"><button class="name-btn name-edit-btn" onclick="editName('${author}')"> \
            <i class="fa fa-pencil" aria-hidden="true"></i></button> \
            <button class="name-btn name-delete-btn" onclick="deleteName('${author}')"> \
            <i class="fa fa-trash" aria-hidden="true"></i></button></li></div>\n`
        authors += `<div id=editModal${idx}" class="modal fade" role="dialog"><div class="modal-dialog"> \
            <div class="modal-content"><div class="modal-header"><h4 class="modal-title">Edit</h4> \
            <button type="button" class="close" data-dismiss="modal">&times;</button></div> \
            <div class="modal-body"><span>TEST_CONTENT</span><br> \
            <button type="button" class="btn btn-default float-right" id="edit${idx}" data-dismiss="modal" onclick="editName(this, ${author})">Save</button> \
            </div></div></div></div>\n`
    })
    authors += '</li>\n'
    document.getElementById('authorList').innerHTML = authors
}

const submitQuoteForm = () => {
    if (gAuthorList.length < 1) {
        alert('At least one speaker is required!')
        return
    }
    document.getElementById('submit-btn').disabled = true
    let authorList = JSON.parse(JSON.stringify(gAuthorList));
    authorList = authorList.map(x => {
        if (Array.isArray(x)) {
            return x[0]
        }
        return x
    })
    let qEl = document.getElementById('qtext')
    postQuote(qEl.value, authorList)
        .then(() => {
            $('#submitModal').hide()
            qEl.value = ""
            alert('Quote Submitted!')
            document.getElementById('parse-btn').disabled = false
        })
        .catch(err => {
            alert('Failed to submit quote!')
            console.error('Submission failed!', err)
            document.getElementById('submit-btn').disabled = false
        })
}

const searchForPerson = () => {
    let person = prompt('Enter search term:')
    getNameGuesses([person], true)
        .then(data => {
            document.getElementById('submit-btn').disabled = true
            document.getElementById('searchPersonBtn').disabled = true
            document.getElementById('addPersonBtn').disabled = true
            let el = document.getElementById('searchOptions')
            el.innerHTML = ''
            data.allGuesses.forEach(x => {
                el.innerHTML += `<option value="${x}">${x}</option>`
            })
            el.value = data.best
            document.getElementById('dropdownWrapper').classList.remove('hidden')
        })
}

const submitSearchResult = () => {
    let person = document.getElementById('searchOptions').value
    person = person.trim()
    document.getElementById('dropdownWrapper').classList.add('hidden')
    document.getElementById('submit-btn').disabled = false
    document.getElementById('searchPersonBtn').disabled = false
    document.getElementById('addPersonBtn').disabled = false
    if (person.length > 0 && !gAuthorList.includes(person)) {
        updateAuthorList([...gAuthorList, person])
    }
}

const deleteName = (name) => {
    gAuthorList = gAuthorList.filter(x => {
        let item = x
        if (Array.isArray(x)) {
            item = x[0]
        }
        return (item.trim() !== name.trim())
    })
    updateAuthorList(gAuthorList)
}

const addNewPerson = () => {
    let person = prompt('Enter person\'s name:')
    updateAuthorList([...gAuthorList, [person]])
}

const editName = (originalName) => {
    let person = prompt('Enter updated name:', originalName)
    updateAuthorList(gAuthorList.map(x => {
        let item = x
        if (Array.isArray(x)) {
            item = x[0]
        }
        if (item.trim() === originalName.trim()) {
            return [person]
        }
        else {
            return x
        }
    }))
}