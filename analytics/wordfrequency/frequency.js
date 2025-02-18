getWordMap().then(data => {
    let words = Object.keys(data.map)
    words.sort((a, b) => {
        if (data.map[a] === data.map[b]) {
            return a.localeCompare(b)
        }
        return (data.map[b] - data.map[a])
    })
    document.getElementById('leaderboard').innerHTML =
        words.map((x, n) => `${n + 1}. ${x} (${data.map[x]} time${data.map[x] > 1? 's' : ''})`).join('<br>\n')
})
