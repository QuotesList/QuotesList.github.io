var gAuthorList = []

const isCharacter = (char, charList) => {
    if (typeof char != 'string') return false
    if (char.length < 1) return false
    if (char.length > 1) {
        char = char.charAt(0)
    }
    if (typeof charList != 'string' && !Array.isArray(charList)) {
        return false
    }
    if (!Array.isArray(charList)) {
        charList = [charList]
    }
    return charList.includes(char)
}

const isQuote = char => {
    return isCharacter(char, '"')
}

const isHypen = char => {
    return isCharacter(char, ['-', '~'])
}

const isColon = char => {
    return isCharacter(char, ':')
}

const isGroupQuote = quote => {
    if (typeof quote != 'string' || quote.trim().length < 3) {
        return
    }
    for (let i = quote.length - 2; i > 0; i--) {
        let char = quote.charAt(i)
        if (isHypen(char)) {
            return false
        }
        else if (isQuote(char) || isColon(char)) {
            break
        }
    }
    for (let i = 0; i < (quote.length - 1); i++) {
        let char = quote.charAt(i)
        if (isQuote(char)) {
            return false
        }
        else if (isColon(char)) {
            return true
        }
    }
    return false
}

const suggestAuthors = (isGroup, quote) => {
    if (isGroup) {
        let authorMap = {}
        let lines = quote.replaceAll(',', '').split('\n')
        lines.forEach(line => {
            if (line.includes(':')) {
                let author = line.split(':')[0].trim()
                if (authorMap[author.toLowerCase()] === undefined) {
                    authorMap[author.toLowerCase()] = author
                }
            }
        })
        return Object.values(authorMap)
    }
    else {
        let delim = '~'
        if (!quote.includes(delim)) {
            delim = '-'
            if (!quote.includes(delim)) {
                return []
            }
        }
        let pieces = quote.split(delim)
        if (pieces.length < 2) {
            return []
        }
        return [pieces.pop()]
    }
}

var escapeText = function escape (htmlStr) { 
    return htmlStr.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");        

}

const updateAuthorList = authorList => {
    if (!Array.isArray(authorList)) {
        return
    }
    gAuthorList = JSON.parse(JSON.stringify(authorList))
    let authors = ''
    authorList.forEach((author, idx) => {
        if (Array.isArray(author)) {
            author = author[0]
            // TODO This means its a new author. It will need some kind of symbol
        }
        authors += `<li class="clearfix"><span class="authorName">${author}&ensp;</span>`
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

const submitParseForm = () => {
    document.getElementById('parse-btn').disabled = true
    let quote = document.getElementById('qtext').value
    if (typeof quote != 'string' || quote.trim().length < 2) {
        alert('You must provide a quote!')
        return
    }
    let isGroup = isGroupQuote(quote)
    if (typeof isGroup != 'boolean') {
        alert('Could not read quote!')
        return
    }
    let authors = suggestAuthors(isGroup, quote)
    getNameGuesses(authors)
        .then(suggestions => {
            document.getElementById('submit-btn').disabled = false
            document.getElementById('quoteToSubmit').innerHTML = escapeText(quote).replaceAll('\n', '<br>')
            document.getElementById('isGroupCheckbox').checked = isGroup
            updateAuthorList(Object.values(suggestions))
            $('#submitModal').show()
        })
        .catch(err => {
            console.error('Could not get search results.', err)
            alert('Could not get speaker suggestions!')
        })
}

const submitQuoteForm = () => {
    document.getElementById('submit-btn').disabled = true
    $('#submitModal').hide()
    document.getElementById('qtext').value = ""
    alert('Quote Submitted! (kind of)') // TODO
    document.getElementById('parse-btn').disabled = false
}

// TODO
const searchForPerson = () => {
    let person = prompt('Enter search term:')
    getNameGuesses(person, true)
        .then(data => {
            let el = document.getElementById('dropdown-options')
            el.innerHTML = ''
            data.allGuesses.forEach(x => {
                el.innerHTML += `<a class="dropdown-item" href="#">${x}</a>`
            })
            $('#searchModal').show()
        })
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
