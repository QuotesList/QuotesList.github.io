const FINISH_THE_QUOTE = 'finish'
const GUESS_THE_SPEAKER = 'guess'
const SPOT_THE_FAKES = 'spotFakes'

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
            this.#total = total
        }
        let score = getCookieItem(`game_${key}_score`)
        if (score) {
            this.#score = score
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
    ALL_GAME_KEYS.forEach(key => {
        let score = GameScore(key)
        score.clearScore()
    })
}
