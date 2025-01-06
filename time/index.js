var map = {}
var totalQuotes = 0
var numQuotes = 0

const UPDATE_TIME = 100 * 3

const updateMap = arr => {
    arr.forEach(x => {
        if (map[x] === undefined) {
            map[x] = 0
        }
        map[x] += 1
    })
}

const updateBoard = () => {
    const leaderboard = Object.keys(map)
    let n = 1
    leaderboard.sort((a, b) => {
        return (map[b] - map[a])
    })
    document.getElementById('leaderboard').innerHTML = leaderboard.map(x => `${n++}. ${x} (${map[x]} quote${(map[x] > 1)? 's' : ''})`).join('<br>')
    document.getElementById('numQuotes').innerHTML = `${numQuotes}/${totalQuotes}`
}

const startTimelapse = () => {
    map = {}
    document.getElementById('buttonPane').remove()

    getAttributions()
        .then(data => {
            let time = 250
            totalQuotes = data.orderedAuthors.length
            data.orderedAuthors.forEach(attr => {
                setTimeout(() => {
                    numQuotes += 1
                    updateMap(attr)
                    updateBoard()
                }, time)
                time += UPDATE_TIME
            })
        })
}
