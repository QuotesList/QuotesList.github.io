var openModalId = undefined
var stats = {}
var people = []
var eloMap = {}
var attributions = []
var attributionCache = {}

const MEDALS_INCLUDE_TROPHIED = true
const NUM_MEDAL_SPOTS = 10 // Top Ten People

const updateMostUniqueWord = (id) => {
    let uniqueWord = $(`span#unique_word_${id}`).text()
    if (uniqueWord.trim().length < 1) {
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
            ).toLowerCase()
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
        if (candidates.length > 0) {
            candidates.sort()
            candidates = candidates.map(x => x.slice(0, 1).toUpperCase() + x.slice(1)).join('", "')
            $(`#unique_word_${id}`).text(`Most Unique Words: "${candidates}"`)
        } else {
            $(`#unique_word_${id}`).text('Most Unique Words: None Found!')
        }
    }
}

function disableScrolling() {
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventArrowKeys, { passive: false });
}

function enableScrolling() {
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    window.removeEventListener('keydown', preventArrowKeys);
}

function preventScroll(event) {
    event.preventDefault();
}

function preventArrowKeys(event) {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Space"].includes(event.key)) {
        event.preventDefault();
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
    let velocityA = getVelocity(a)
    let velocityB = getVelocity(b)
    if (velocityA === velocityB) {
        return b.lastQuoteId - a.lastQuoteId
    }
    return velocityB - velocityA
}

const sortByQuoteElo = (a, b, first) => {
    let eloA = eloMap[(first? a.firstQuoteId : a.lastQuoteId)]
    let eloB = eloMap[(first? b.firstQuoteId : b.lastQuoteId)]
    return eloB - eloA
}

var kebabSortFunctions = {
    bestRank: (a, b) => {
        if (a.highestLeaderboardPosition === b.highestLeaderboardPosition) {
            return b.firstQuoteId - a.firstQuoteId
        }
        return a.highestLeaderboardPosition - b.highestLeaderboardPosition
    },
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
    lastElo: (a, b) => sortByQuoteElo(a, b, false)
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
        })
        people.sort((a, b) => (data.stats[a].currentLeaderboardPosition - data.stats[b].currentLeaderboardPosition))
        $(document).ready(() => {
            people.forEach((person, n) => {
                let stats = data.stats[person]
                let modalId = `modal_${person.toLowerCase().trim().replaceAll(' ', '_')}`
                let numTotalWords = 0
                let mostSpokenWord = ''
                let timesSpoken = -1
                Object.keys(stats.wordsSpoken).forEach(word => {
                    numTotalWords += stats.wordsSpoken[word]
                    if (stats.wordsSpoken[word] > timesSpoken) {
                        timesSpoken = stats.wordsSpoken[word]
                        mostSpokenWord = word.slice(0, 1).toUpperCase() + word.slice(1)
                    }
                })
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
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal()">
                                        <span aria-hidden="true" class="close-btn">&times;&nbsp;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <i class="text-center fa fa-comment float-right" aria-hidden="true" title="View ${person}'s Quotes" onclick="window.location.assign('/person/?${person}')">
                                        <br><em class="text-small">View Quotes</em>
                                    </i>
                                    <h5>Number of Quotes: ${stats.numQuotes}</h5>
                                    <h5 class="mobile-only">Numer of Solo Quotes: ${stats.numSolo}</h5>
                                    <h5>Number of Words Spoken: ${numTotalWords}</h5>
                                    <h5>Number of Unique Words Spoken: ${Object.keys(stats.wordsSpoken).length}</h5>
                                    <!--h5>Most Spoken Word: "${mostSpokenWord}"</h5-->
                                    <h5>First Quote Number: ${stats.firstQuoteId}</h5>
                                    <h5>Most Recent Quote Number: ${stats.lastQuoteId}</h5>
                                    <h5>Highest Leaderboard Position: ${stats.highestLeaderboardPosition}</h5>
                                    <h5>Current Leaderboard Position: ${stats.currentLeaderboardPosition}</h5>
                                    <h5 id="unique_word_${modalId}"></h5>
                                </div>
                            </div>
                        </div>
                    </div>`
                )
            })
            addModalClicks()
            Array.from(['gold', 'silver', 'bronze']).forEach((color, n) => {
                $(`#leaderboard-pos-${n + 1}`).append(`&ensp;<i class="fa-solid fa-trophy ${color}"></i>`)
            })
            /*for (let i = (MEDALS_INCLUDE_TROPHIED? 1 : 4); i <= NUM_MEDAL_SPOTS; i++) {
                let el = $('#leaderboard-pos-' + i)
                if (el.length > 0) {
                    el.next().append('&nbsp;<i class="fa-solid fa-medal"></i>')
                }
            }*/
            $('#leaderboard-pos-69').append('<span class="nice-text">&nbsp;Nice.</span>')

            Array.from(document.getElementsByClassName('modal-content')).forEach(modal => {
                modal.addEventListener('click', (evt) => {
                    evt.stopPropagation()
                })
            })
            $('body').click(() => {
                closeModal()
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
        })
    })
