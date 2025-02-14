const FINISH_THE_QUOTE = 'finish'
const GUESS_THE_SPEAKER = 'guess'
const SPOT_THE_FAKES = 'spotFakes'
const WHICH_DID_THEY_SAY = 'whichQuote'

const ALL_GAME_KEYS = [
    FINISH_THE_QUOTE,
    GUESS_THE_SPEAKER,
    SPOT_THE_FAKES
]

class GameScore {
    #key = null
    #total = 0
    #score = 0

    constructor(key) {
        this.#key = `${key}`
        let total = getCookieItem(`game_${key}_total`)
        if (total) {
            try {
                total = parseInt(total)
                this.#total = total
            } catch (err) {
                console.warn(err)
            }
        }
        let score = getCookieItem(`game_${key}_score`)
        if (score) {
            try {
                score = parseInt(score)
                this.#score = score
            } catch (err) {
                console.warn(err)
            }
        }
    }

    #writeScores() {
        setCookieItem(`game_${this.#key}_total`, this.#total)
        setCookieItem(`game_${this.#key}_score`, this.#score)
    }

    clearScore() {
        this.#total = 0
        this.#score = 0
        this.#writeScores()
    }

    addScore(points, maxPoints) {
        this.#score += points
        this.#total += maxPoints
        this.#writeScores()
    }

    get currentPoints() {
        return this.#score
    }

    get possiblePoints() {
        return this.#total
    }
}

const clearAllScores = () => {
    if (confirm('Are you sure you want to erase all game scores?') == true) {
        ALL_GAME_KEYS.forEach(key => {
            let score = new GameScore(key)
            score.clearScore()
        })
    }
}
