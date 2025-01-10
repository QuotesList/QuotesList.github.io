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

const submitForm = () => {
    let quote = document.getElementById('qtext').value
    if (typeof quote != 'string' || quote.trim().length < 2) {
        alert('You must provide a quote!')
        return
    }
    let isGroup = isGroupQuote(quote)
    if (isGroup === undefined) {
        alert('Could not read quote!')
        return
    }
    let authors = suggestAuthors(isGroup, quote)
    getSearch(authors)
        .then(suggestions => {
            console.log(suggestions) //
            alert(JSON.stringify(suggestions)) // TODO
        })
        .catch(err => {
            console.error('Could not get search results.', err)
            alert('Could not get speaker suggestions!')
        })

    //     postQuote(quote, names)
}
