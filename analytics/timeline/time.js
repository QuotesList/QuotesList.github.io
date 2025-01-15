const ctx = document.getElementById('myChart');

Chart.defaults.color = '#000'
Chart.defaults.font.size = 14

const UPDATE_TIME = 50

var slider = document.getElementById("myRange")
var numQuotes = document.getElementById('numQuotesText')
var totalQuotes = document.getElementById('totalQuotesText')

var map = {}
var outputData = {}

var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [''],
        datasets: [
            {
                label: '# of Quotes',
                data: []
            }
        ]
    },
    options: {
        indexAxis: 'y',
        elements: {
            bar: {
                borderWidth: 2
            }
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'right'
            },
            title: {
                display: true,
                text: 'Top 20 of Quotes List Over Time',
                font: {
                    size: 20
                }
            }
        }
    }
})

const updateChart = () => {
    let leaderboard = Object.keys(map)
    leaderboard.sort((a, b) => {
        return (map[b] - map[a])
    })
    if (leaderboard.length > 20) {
        leaderboard = leaderboard.slice(0, 20)
    }
    chart.data.labels = leaderboard
    let values = leaderboard.map(x => map[x])
    chart.data.datasets[0].data = values
    chart.update()
}

const updateMap = (arr) => {
    if (!Array.isArray) {
        return
    }
    arr.forEach(x => {
        if (map[x] === undefined) {
            map[x] = 0
        }
        map[x] += 1
    })
}

slider.oninput = () => {
    if (outputData.orderedAuthors === undefined) {
        return
    }
    numQuotes.innerHTML = slider.value
    map = {}
    for (let i = 0; i < slider.value; i++) {
        updateMap(outputData.orderedAuthors[i])
    }
    updateChart()
}

getAttributions()
    .then(data => {
        outputData = copyObject(data)
        const maxQuotes = outputData.orderedAuthors.length
        totalQuotes.innerHTML = maxQuotes
        numQuotes.innerHTML = maxQuotes
        slider.max = maxQuotes
        slider.value = maxQuotes
        data.orderedAuthors.forEach(x => {
            updateMap(x)
        })
        updateChart()
    })
    .catch(err => {
        console.error("Couldn't get attributions!", err)
        alert('Could not retrieve data from server!')
    })
