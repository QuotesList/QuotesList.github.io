Chart.defaults.color = '#000'
Chart.defaults.font.size = 14

var slider = document.getElementById("myRange")
var numQuotes = document.getElementById('numQuotesText')
var totalQuotes = document.getElementById('totalQuotesText')

var map = {}
var outputData = {}

var chart = new Chart(document.getElementById('myChart'), {
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
            bar: { borderWidth: 2 }
        },
        responsive: true,
        plugins: {
            legend: { position: 'right' },
            title: {
                display: true,
                text: 'Top 20 of Quotes List Over Time',
                font: { size: 20 }
            }
        }
    }
})

const updateChart = () => {
    let leaderboard = Object.keys(map).sort((a, b) => map[b] - map[a]).slice(0, 20)
    chart.data.labels = leaderboard
    chart.data.datasets[0].data = leaderboard.map(x => map[x])
    chart.update()
}

const updateMap = (arr) => {
    if (Array.isArray(arr)) {
        arr.forEach(x => map[x] = (map[x] || 0) + 1)
    }
}

slider.oninput = () => {
    if (outputData.orderedAuthors) {
        numQuotes.innerHTML = slider.value
        map = {}
        for (let i = 0; i < slider.value; i++) {
            updateMap(outputData.orderedAuthors[i])
        }
        updateChart()
    }
}

getAttributions()
    .then(data => {
        outputData = copyObject(data)
        const maxQuotes = outputData.orderedAuthors.length
        totalQuotes.innerHTML = maxQuotes
        numQuotes.innerHTML = maxQuotes
        slider.max = maxQuotes
        slider.value = maxQuotes
        data.orderedAuthors.forEach(updateMap)
        updateChart()
    })
    .catch(err => {
        console.error("Couldn't get attributions!", err)
        alert('Could not retrieve data from server!')
    })
