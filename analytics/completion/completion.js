let progressBarCount = 0
const colors = ['success', 'primary', 'danger', 'warning']

function addProgressBar(label, percent) {
    percent = Math.min(100, Math.max(0, percent))
    percent = Math.round(percent * 10000) / 100
    $('#progress-container').append(`
      <div class="mb-5">
        <label class="form-label">${label}</label>
        <div class="progress" style="height: 25px;">
          <div class="progress-bar progress-bar-striped bg-${colors[progressBarCount++ % colors.length]}" role="progressbar"
               style="width: ${percent}%" aria-valuenow="${percent}" 
               aria-valuemin="0" aria-valuemax="100">
            ${percent}%
          </div>
        </div>
      </div>`)
  }

getAllQuotes()
    .then(({ quotes }) => {
        let map = getCharFrequency(quotes.flatMap(({ quote }) => quote.split('\n').map(line => {
                if (line.includes('~')) {
                    return line.slice(0, line.indexOf('~'))
                } else if (line.includes(':')) {
                    return line.slice(line.indexOf(':') + 1)
                } else if (line.includes('-')) {
                    return line.slice(0, line.indexOf('-'))
                }
                return line
            })
        ).join(''))
        let mediaFrequencies = Object.entries(mediaFrequencyMap).map(([title, media]) => {
            let ret = {
                media,
                obj: JSON.parse(media),
                title,
                count: 0
            }
            ret.totalLetters = Object.values(ret.obj).reduce((a, b) => a + b, 0)
            return ret
        })
        Object.entries(map).forEach(([letter, count]) => {
            mediaFrequencies.forEach(media => {
                if (media.obj[letter] !== undefined) {
                    media.count += Math.min(media.obj[letter], count)
                }
            })
        })

        mediaFrequencies.forEach(media => {
            media.percentage = media.count / media.totalLetters
            media.percentage -= (((media.percentage * 10000) % 1.0) / 10000)
            addProgressBar(media.title, media.percentage)
        })
    })
