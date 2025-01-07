var id1 = -1
var id2 = -1

const vote = (idx) => {
    if (idx !== 1 && idx !== 2) {
        console.error(`Index: ${idx}`)
        return
    }
    if (id1 < 1 || id2 < 1) {
        console.error(`IDs: ${id1} | ${id2}`)
    }
}