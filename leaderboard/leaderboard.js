var openModalId = undefined
var stats = {}
var people = []

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

const openModal = (evt, id) => {
    evt.stopPropagation();
    if (openModalId === undefined) {
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

getAllQuotes(true)
    .then(data => {
        people = Object.keys(data.stats)
        stats = copyObject(data.stats)
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
                        <td>(${stats.numQuotes} quotes, ${stats.numSolo} solo)</td>
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
                                    <h5>Number of Quotes: ${stats.numQuotes}</h5>
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
                $(`#open_${modalId}`).click(evt => {
                    openModal(evt, modalId)
                })
            })
            Array.from(['gold', 'silver', 'bronze']).forEach((color, n) => {
                let el = $(`#leaderboard-pos-${n + 1}`)
                if (el.length > 0) {
                    el.append(`&ensp;<i class="fa-solid fa-trophy ${color}"></i>`)
                }
            })

            Array.from(document.getElementsByClassName('modal-content')).forEach(modal => {
                modal.addEventListener('click', (evt) => {
                    evt.stopPropagation()
                })
            })
            $('body').click(() => {
                closeModal()
            })
            
            $('#order-by-rank').click((evt) => {
                let el = $(evt.target)
                if (el.hasClass('order-chosen')) {
                    el.toggleClass('fa-arrow-down-1-9')
                    el.toggleClass('fa-arrow-up-9-1')
                }
                el.toggleClass('order-chosen', true)
                $('#order-by-name').toggleClass('order-chosen', false)
                let rankFn = (a, b) => parseInt($(b).data('rank')) - parseInt($(a).data('rank'))
                if (el.hasClass('fa-arrow-down-1-9')) {
                    rankFn = (a, b) => parseInt($(a).data('rank')) - parseInt($(b).data('rank'))
                }
                $('#leaderboard-content').html($('tr.leaderboard-person').sort(rankFn))
            })
            $('#order-by-name').click((evt) => {
                let el = $(evt.target)
                if (el.hasClass('order-chosen')) {
                    el.toggleClass('fa-arrow-down-a-z')
                    el.toggleClass('fa-arrow-up-z-a')
                }
                el.toggleClass('order-chosen', true)
                $('#order-by-rank').toggleClass('order-chosen', false)
                let rankFn = (a, b) => $(a).data('name').localeCompare($(b).data('name'))
                if (el.hasClass('fa-arrow-up-z-a')) {
                    rankFn = (a, b) => $(b).data('name').localeCompare($(a).data('name'))
                }
                $('#leaderboard-content').html($('tr.leaderboard-person').sort(rankFn))

            })
        })
    })
