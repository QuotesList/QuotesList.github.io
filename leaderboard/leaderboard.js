var openModalId = undefined
var stats = {}
var people = []
var eloMap = {}
var attributions = []
var attributionCache = {}
var distanceMap = {}
var distanceStats = {}

const TROPHY_COLORS = ['gold', 'silver', 'bronze']
const BEST_NOUN_TEXT = 'Best/Most Common Noun'

jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

const updateMostUniqueWord = (id) => {
    if ($(`span#unique_word_${id}`).text().trim().length < 1) {
        let person = $(`span#key_${id}`).text()
        let extraWords = Object.keys(stats[person].wordsSpoken).map(x => x.trim().toLowerCase())
        extraWords = extraWords.filter(word => /^[a-zA-Z]+$/.test(word) && !reverseWordFrequencySet.has(word))
        let candidates = []
        let longestWord = Object.keys(stats[person].wordsSpoken).reduce((longest, word) => word.length > longest.length ? word : longest, "")
        if (longestWord !== undefined && longestWord.length > 0) {
            candidates.push(longestWord.toLowerCase())
        }
        let bestWord = undefined
        if (extraWords.length > 0) {
            let word = extraWords.reduce((longest, word) => 
                !word.endsWith('s') && word.length > (longest?.length || 0) ? word : longest, undefined
            )?.toLowerCase()
            if (word && !candidates.includes(word.toLowerCase())) {
                candidates.push(word.toLowerCase())
            }
        }
        if (bestWord === undefined) {
            let options = new Set(Object.keys(stats[person].wordsSpoken).map(x => x.trim().toLowerCase()))
            bestWord = reverseWordFrequencyList.find(word => options.has(word))
        }
        if (bestWord === undefined) {
            if (Object.keys(stats[person].wordsSpoken).length > 0) {
                let word = Object.keys(stats[person].wordsSpoken)[0].toLowerCase().trim()
                if (!candidates.includes(word.toLowerCase())) {
                    candidates.push(word.toLowerCase())
                }
            }
        } else if (!candidates.includes(bestWord.toLowerCase().trim())) {
            candidates.push(bestWord.toLowerCase().trim())
        }
        $(`#unique_word_${id}`).text(
            `Most Unique Words: ${
                (candidates.length > 0)?
                    `"${candidates.sort().map(x => x.slice(0, 1).toUpperCase() + x.slice(1)).join('", "')}"`
                    : '(None Found!)'
            }`)
    }
}

function disableScrolling() {
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('keydown', preventArrowKeys, { passive: false })
}

function enableScrolling() {
    window.removeEventListener('wheel', preventScroll)
    window.removeEventListener('touchmove', preventScroll)
    window.removeEventListener('keydown', preventArrowKeys)
}

function preventScroll(event) {
    event.preventDefault()
}

function preventArrowKeys(event) {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Space"].includes(event.key)) {
        event.preventDefault()
    }
}

const openModal = (evt) => {
    evt.stopPropagation()
    if (openModalId === undefined) {
        let id = `modal_${$(evt.target).parent().data('name').replaceAll(' ', '_').toLowerCase()}`
        $(`#${id}`).show()
        openModalId = id
        updateMostUniqueWord(id)
        disableScrolling()
    }
}

const closeModal = () => {
    $(`#${openModalId}`).hide()
    openModalId = undefined
    enableScrolling()
}

const addModalClicks = () => {
    $('tr.leaderboard-person').click(openModal)
}

const sortByElo = (isAvg, a, b) => {
    let eloA = a.totalElo
    let eloB = b.totalElo
    if (isAvg) {
        eloA /= a.numQuotes
        eloB /= b.numQuotes
    }
    return eloA - eloB
}

const sortByVelocity = (a, b, granularity) => {
    attributionCache = {}
    const getVelocity = (stats) => {
        let numRecentQuotes = attributionCache[stats.name]
        if (numRecentQuotes === undefined) {
            numRecentQuotes = attributions.slice(-granularity)
                .filter(attr => (attr.map(x => x.trim().toLowerCase()).includes(stats.name.trim().toLowerCase()))).length
            attributionCache[stats.name] = numRecentQuotes
        }
        return numRecentQuotes
    }
    return (getVelocity(b) - getVelocity(a)) || (b.lastQuoteId - a.lastQuoteId)
}

const sortByQuoteElo = (a, b, first) => {
    let eloA = eloMap[(first? a.firstQuoteId : a.lastQuoteId)]
    let eloB = eloMap[(first? b.firstQuoteId : b.lastQuoteId)]
    return eloB - eloA
}

const sortByQuoteDistance = (a, b, total) => { // TODO combine stats and add to modal
    let key = 'largest'
    if (total) {
        key = 'total'
    }
    return distanceStats[b.name][key] - distanceStats[a.name][key]
}

var kebabSortFunctions = {
    bestRank: (a, b) => (a.highestLeaderboardPosition - b.highestLeaderboardPosition) || (b.firstQuoteId - a.firstQuoteId),
    avgEloAsc: (a, b) => sortByElo(true, a, b),
    avgEloDesc: (a, b) => sortByElo(true, b, a),
    totalEloAsc: (a, b) => sortByElo(false, a, b),
    totalEloDesc: (a, b) => sortByElo(false, b, a),
    soloQuotes: (a, b) => b.numSolo - a.numSolo,
    groupQuotes: (a, b) => b.numGroup - a.numGroup,
    velocityFine: (a, b) => sortByVelocity(a, b, 100),
    velocityMed: (a, b) => sortByVelocity(a, b, 200),
    velocityCoarse: (a, b) => sortByVelocity(a, b, 400),
    velocityExtra: (a, b) => sortByVelocity(a, b, 800),
    firstElo: (a, b) => sortByQuoteElo(a, b, true),
    lastElo: (a, b) => sortByQuoteElo(a, b, false),
    distTotal: (a, b) => sortByQuoteDistance(a, b, true),
    distLargest: (a, b) => sortByQuoteDistance(a, b, false)
}

function maxDistance(arr) {
    if (!Array.isArray(arr) || arr.length < 2) return 0
    let maxGap = 0
    for (let i = 1; i < arr.length; i++) {
        const gap = arr[i] - arr[i - 1]
        if (gap > maxGap) {
            maxGap = gap
        }
    }
    return maxGap
}

getAllQuotes(true)
    .then(data => {
        people = Object.keys(data.stats)
        stats = copyObject(data.stats)
        attributions = copyObject(data.quotes)
        attributions.sort((a, b) => a.id - b.id)
        attributions = attributions.map(x => x.authors.trim().split(',').map(y => y.trim()))
        data.quotes.forEach(quote => {
            eloMap[quote.id] = quote.elo
            let names = quote.authors.split(',').map(x => x.trim())
            names.forEach((name) => {
                if (!Array.isArray(distanceMap[name])) {
                    distanceMap[name] = []
                }
                distanceMap[name].push(0+(quote.id))
            })
        })
        Object.keys(distanceMap).forEach(key => {
            distanceMap[key].sort((a, b) => a - b)
            let last = distanceMap[key].slice(-1).pop()
            distanceStats[key] = {
                total: last - distanceMap[key][0],
                largest: maxDistance([...distanceMap[key], last])
            }
        })
        people.sort((a, b) => (data.stats[a].currentLeaderboardPosition - data.stats[b].currentLeaderboardPosition))
        $(document).ready(() => {
            people.forEach((person, n) => {
                let stats = data.stats[person]
                let modalId = `modal_${person.toLowerCase().trim().replaceAll(' ', '_')}`
                let numTotalWords = Object.values(stats.wordsSpoken).reduce((sum, val) => sum + val, 0)
                $('#leaderboard-content').append(`
                    <tr id="open_${modalId}" data-rank="${n + 1}" data-name="${person}" class="leaderboard-person">
                        <td id="leaderboard-pos-${n + 1}">${n + 1}</td>
                        <td>${person}</td>
                        <td class="no-mobile num-quotes-slot">(${stats.numQuotes} quotes, ${stats.numSolo} solo)
                            ${(stats.numQuotes === 69 || stats.numSolo === 69)? '<span class="nice-text">Nice.</span>' : ''}
                        </td>
                        <td class="extra-data text-right" data-name="${person}"></td>
                    </tr>`
                )
                $('#leaderboard-modals').append(`
                    <div class="modal" tabindex="-1" role="dialog" id="${modalId}">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h3 class="modal-title"><span id="key_${modalId}">${person.trim()}</span>'s Stats</h3>
                                    ${(n < 10)? '&nbsp;<span class="top-medal" title="Top Ten Contributor">🎖️</span>' : ''}
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal()">
                                        <span aria-hidden="true" class="close-btn">&times;&nbsp;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <i class="text-center fa fa-comment float-right" aria-hidden="true" title="View ${person}'s Quotes" 
                                            onclick="window.location.assign('/person/?${person}')">
                                        <br><em class="text-small">View Quotes</em>
                                    </i>
                                    <h5 class="check-nice">Number of Quotes: ${stats.numQuotes}</h5>
                                    <h5 class="mobile-only check-nice">Numer of Solo Quotes: ${stats.numSolo}</h5>
                                    <h5 class="check-nice">Number of Words Spoken: ${numTotalWords}</h5>
                                    <h5 class="check-nice">Number of Unique Words Spoken: ${Object.keys(stats.wordsSpoken).length}</h5>
                                    <h5 class="check-nice">First Quote Number: ${stats.firstQuoteId}</h5>
                                    <h5 class="check-nice">Most Recent Quote Number: ${stats.lastQuoteId}</h5>
                                    <h5 class="check-nice">Largest Quote Distance: ${(stats.numQuotes >= 2)? distanceStats[person].largest : 'N/a'}</h5>
                                    <h5 class="check-nice">Highest Leaderboard Position: ${stats.highestLeaderboardPosition}</h5>
                                    <h5 class="check-nice">Current Leaderboard Position: ${stats.currentLeaderboardPosition}</h5>
                                    <h5 id="unique_word_${modalId}"></h5>
                                    <h5 id="common_noun_${modalId}">${BEST_NOUN_TEXT}: (Still searching...)</h5>
                                </div>
                            </div>
                        </div>
                    </div>`
                )
            })
            addModalClicks()
            Array.from(TROPHY_COLORS).forEach((color, n) => {
                $(`#leaderboard-pos-${n + 1}`).append(`&ensp;<i class="fa-solid fa-trophy ${color}"></i>`)
            })
            $('#leaderboard-pos-69').append('<span class="nice-text">&nbsp;Nice.</span>')

            Array.from(document.getElementsByClassName('modal-content')).forEach(modal => {
                modal.addEventListener('click', (evt) => {
                    evt.stopPropagation()
                })
            })
            $('body').click(closeModal)
            $('h5.check-nice').each((n, el) => {
                if ($(el).text().endsWith(' 69')) {
                    $(el).append('<span class="nice-text">&nbsp;Nice.</span>')
                }
            })
            $('.extra-order-by').click((evt) => {
                let el = $(evt.target)
                $('.order-by-icon').toggleClass('order-chosen', false)
                if (typeof isDesktop !== 'function' || isDesktop()) {
                    $('i.fa-ellipsis-vertical').toggleClass('order-chosen')
                }
                let rankFn = kebabSortFunctions[$(el).data('sort-type')]
                if (typeof rankFn !== 'function') {
                    alert('Unknown Ordering Option!')
                    return
                }
                $('#leaderboard-content').html($('tr.leaderboard-person').sort((a, b) => {
                    let statsA = stats[$(a).data('name')]
                    let statsB = stats[$(b).data('name')]
                    if (statsA === undefined || statsB === undefined) {
                        console.error('Could not sort!', statsA, statsB)
                        return 0
                    }
                    return rankFn(statsA, statsB)
                }))
                $('td.extra-data').each((n, el) => {
                    $(el).html(`(${n + 1})${(n === 68)? '<span class="nice-text">Nice.</span>' : ''}`)
                })
                addModalClicks()
            })
            $('.original-order-by').click((evt) => {
                $('.order-by-icon').toggleClass('order-chosen', false)
                let evtTarget = $(evt.target)
                let targetEl = $(`i#${evtTarget.data('ref-id')}`)
                if (!targetEl.hasClass(evtTarget.data('icon'))) {
                    targetEl.toggleClass('order-chosen')
                }
                targetEl.trigger('click')
            })
            $('.dropdown-item').click((evt) => {
                $('.dropdown-item').toggleClass('active', false)
                $(evt.target).toggleClass('active')
            })
            $('#order-by-rank').click((evt) => {
                $('.dropdown-item').toggleClass('active', false)
                let el = $(evt.target)
                if (el.hasClass('order-chosen')) {
                    el.toggleClass('fa-arrow-down-1-9')
                    el.toggleClass('fa-arrow-up-9-1')
                }
                $('.order-by-icon').toggleClass('order-chosen', false)
                el.toggleClass('order-chosen')
                let rankFn = (a, b) => parseInt($(b).data('rank')) - parseInt($(a).data('rank'))
                if (el.hasClass('fa-arrow-down-1-9')) {
                    rankFn = (a, b) => parseInt($(a).data('rank')) - parseInt($(b).data('rank'))
                }
                $('#leaderboard-content').html($('tr.leaderboard-person').sort(rankFn))
                addModalClicks()
                $('td.extra-data').text('')
            })
            $('#order-by-name').click((evt) => {
                $('.dropdown-item').toggleClass('active', false)
                let el = $(evt.target)
                if (el.hasClass('order-chosen')) {
                    el.toggleClass('fa-arrow-down-a-z')
                    el.toggleClass('fa-arrow-up-z-a')
                }
                $('.order-by-icon').toggleClass('order-chosen', false)
                el.toggleClass('order-chosen')
                let rankFn = (a, b) => $(a).data('name').localeCompare($(b).data('name'))
                if (el.hasClass('fa-arrow-up-z-a')) {
                    rankFn = (a, b) => $(b).data('name').localeCompare($(a).data('name'))
                }
                $('#leaderboard-content').html($('tr.leaderboard-person').sort(rankFn))
                addModalClicks()
                $('td.extra-data').text('')
            })
            $("span.nice-text").attr('title', 'This is nice.')
            setTimeout(() => {
                Object.entries(stats).forEach(([person, stat]) => {
                    let wordMap = {}
                    stat.sentences.map(sentence => sentence.toLowerCase().trim()
                        .replace(/~.*/, '').replace(/.*?:/, '').replace(/-.*/, '')
                        .replace(/\b\w*['’]\w*\b|\(.*?\)|["'“”‘’]/g, '').replace(/\s+|[.,?!;]\s*/g, ' ').trim()
                    )
                    .forEach(sentence =>
                        sentence.split(' ').filter(x => x.length > 1 && /[a-zA-Z0-9]/.test(x)).forEach(word => {
                            let pos = tagPOS(word)[Object.keys(tagPOS(word))[0]] || []
                            if (pos.join('|').startsWith('Noun|Singular') && !pos.join('|').includes('Name')) {
                                wordMap[word] = (wordMap[word] || 0) + 1
                            }
                        })
                    )
                    let keys = Object.keys(wordMap).sort((a, b) => wordMap[b] - wordMap[a])
                        .slice(0, 3).sort().map(x => `"${x.charAt(0).toUpperCase()}${x.slice(1)}"`)
                    $(`#common_noun_modal_${person.toLowerCase().trim().replaceAll(' ', '_')}`)
                        .text(`${BEST_NOUN_TEXT}${keys.length ? (keys.length > 1 ? 's' : '') + `: ${keys.join(', ')}` : 's: (None Found!)'}`)
                })
            }, 100)
        })
    })


    $.loadScript('../assets/js/data/wordfreqs.js', () => {})
