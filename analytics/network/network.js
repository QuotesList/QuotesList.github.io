let nodeDataSet = []
let edgeDataSet = []
let nameMap = {}

getAllQuotes().then(data => {
    let names = []
    data.quotes.forEach(quote => {
        let authors = quote.authors
        if (authors.includes(',')) {
            authors = authors.split(',').map(x => x.trim())
            authors.forEach(name => {
                names.push(name)
            })
        } else {
            authors = [authors]
        }
    })
    names.sort()
    nodeDataSet = []
    let usedNames = []
    names.forEach((x, n) => {
        if (!usedNames.includes(x)) {
            usedNames.push(x)
            let idx = (n + 1)
            nameMap[x] = {
                idx,
                numGQuotes: names.filter(name => (x === name)).length
            }
            nodeDataSet.push({
                id: idx,
                label: x,
                value: nameMap[x].numGQuotes
            })
        }
    })
    edgeDataSet = []
    let combos = {}
    data.quotes.forEach(quote => {
        if (quote.authors.includes(',')) {
            let authors = quote.authors.split(',').map(x => x.trim())
            let authorCombos = authors.flatMap((v, i) => authors.slice(i + 1).map(w => [v, w]))
            authorCombos.forEach(combo => {
                combo.sort()
                let comboId = combo.join(',')
                if (Object.keys(combos).includes(comboId)) {
                    combos[comboId] += 1
                } else {
                    combos[comboId] = 1
                }
            })
        }
    })
    Object.keys(combos).forEach(combo => {
        let authors = combo.split(',')
        edgeDataSet.push({
            from: nameMap[authors[0]].idx,
            to: nameMap[authors[1]].idx,
            value: combos[combo]
        })
    })
}).then(() => {
    var nodes = new vis.DataSet(nodeDataSet);
    var edges = new vis.DataSet(edgeDataSet);
    
    var container = document.getElementById("group-network");
    var data = {
        nodes: nodes,
        edges: edges,
    };
    var options = {
        nodes: {
          shape: "dot",
          scaling: {
            customScalingFunction: function (min, max, total, value) {
              return value / total;
            },
            min: 5,
            max: 150,
          },
        },
      };
    var network = new vis.Network(container, data, options);
})
