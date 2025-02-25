/* Utilities */
function keyWrapper(evt, fn) {
    if (event.keyCode == 13) {
        fn()
        return false
    }
    return true
}
function escapeText(htmlStr) {
    return htmlStr.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}
function copyObject(obj) {
    return JSON.parse(JSON.stringify(obj))
}
function isDesktop() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}
function randomArrayItem(arr) {
    if (arr === undefined || !Array.isArray(arr) || arr.length <= 1) {
        return
    }
    return arr[Math.floor(Math.random() * arr.length)]
}
function  shuffleArray(arr) {
    if (!Array.isArray(arr) || arr.length < 2) {
        return
    }
    let currentIndex = arr.length
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
    }
}
const pluralize = (count, word, suffix = 's') => `${word}${(count === 1)? '' : suffix}`

/* Auth */
const LEVEL_HACKER = 0, LEVEL_GENERAL = 1, LEVEL_ADMIN = 2, MAX_AUTH_LEVELS = 3
const MAIN_SITE_URL = 'thequoteslist.com'
var gPass = 'X', gServer = '', gLevel = LEVEL_HACKER
const SERVER_KEY = 'server', PASS_KEY = 'password'

function assignBodyClasses(level) {
    if (level === undefined) {
        level = gLevel
    }
    $(document).ready(() => {
        let bodyEl = $('body')
        bodyEl.toggleClass('explicitly-logged-out', (level !== LEVEL_ADMIN && level !== LEVEL_GENERAL))
        bodyEl.toggleClass('logged-in', (level === LEVEL_ADMIN || level === LEVEL_GENERAL))
        bodyEl.toggleClass('is-admin', level === LEVEL_ADMIN)
    })
}
function getCookieItem(key) {
    let value = `${document.cookie} `
    let parts = value.split('; ')

    if (parts.map(x => x.slice(0, x.indexOf('='))).includes(key)) {
        value = parts.find(x => x.indexOf(`${key}=`) === 0)
        return decodeURIComponent(value.split('=')[1]).trim()
    }
}
function setCookieItem(key, value) {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${new Date(2147483647 * 1000).toUTCString()};`
}
function deleteCookieItem(key) {
    document.cookie = `${key}=X; path=/; max-age=0;`
}
function decodeCookie() {
    if (document.cookie.includes(SERVER_KEY)) {
        return {
            server: getCookieItem(SERVER_KEY),
            pass: getCookieItem(PASS_KEY)
        }
    }
}
function encodeCookie() {
    setCookieItem(SERVER_KEY, gServer)
    setCookieItem(PASS_KEY, gPass)
}
function deleteCookie() {
    deleteCookieItem(SERVER_KEY)
    deleteCookieItem(PASS_KEY)
}
function tryAuth(pass, server) {
    if (typeof pass != 'string' || typeof server != 'string') {
        gLevel = LEVEL_HACKER
        return new Promise(resolve => {
            resolve({
                level: LEVEL_HACKER,
                err: "Internal Error"
            })
        })
    }
    if (`${pass}${server}`.includes(';') || `${pass}${server}`.includes('=')) {
        gLevel = LEVEL_HACKER
        return new Promise(resolve => {
            resolve({
                level: LEVEL_HACKER,
                err: "Cannot use ';' or '=' in your password."
            })
        })
    }
    gServer = server
    gPass = pass
    gLevel = LEVEL_HACKER
    encodeCookie()
    return new Promise((resolve, reject) => {
        fetch(`https://${gServer}/perms?pwd=${gPass}`)
            .then(async (data) => {
                if (data === undefined || data.json === undefined) {
                    reject({
                        level: LEVEL_HACKER,
                        err: "Server Error (No Data)"
                    })
                }
                else {
                    let json = await data.json()
                    if (json === undefined || typeof json.level != 'number') {
                        reject({
                            level: LEVEL_HACKER,
                            err: "Invalid Server or Password"
                        })
                    }
                    else if (json.level <= LEVEL_HACKER || json.level >= MAX_AUTH_LEVELS) {
                        reject({
                            level: LEVEL_HACKER,
                            err: "Invalid Server or Password"
                        })
                    }
                    else {
                        gLevel = json.level
                        resolve({
                            level: json.level
                        })
                    }
                }
            })
            .catch(err => {
                console.error('Could not get permissions!', err)
                reject({
                    level: LEVEL_HACKER,
                    err: "Could Not Access Server"
                })
            })
    })
}
function hasAuth() {
    return gLevel > LEVEL_HACKER
}
function deleteAuth() {
    gServer = ""
    gPass = ""
    gLevel = LEVEL_HACKER
    deleteCookie()
}
function backToHome() {
    if (typeof STOP_REDIRECT === 'undefined') {
        window.location.href = "/"
    }
}
function logOut() {
    deleteAuth()
    gLevel = 0
    window.location.href = '/'
}
function requiresHigherAuth() {
    let pages = ['submit', 'edit'].filter(x => window.location.href.toLowerCase().includes(x.toLowerCase()))
    return (pages.length > 0)
}
function isRealSite() {
    return (window.location.href.includes(MAIN_SITE_URL))
}
function runAuthInit() {
    let initAuth = decodeCookie()
    if (initAuth === undefined || initAuth.pass === undefined || initAuth.server === undefined) {
        console.log('No cookie data!')
        backToHome()
        $(document).ready(() => {
            assignBodyClasses(LEVEL_HACKER)
        })
    }
    else {
        tryAuth(initAuth.pass, initAuth.server)
            .then(data => {
                if (data === undefined) {
                    alert('Could not access server?')
                    data = { level: LEVEL_HACKER }
                }
                console.log(`Permission level at ${initAuth.server}: ${data.level}`)
                if (data.level <= LEVEL_HACKER || data.level >= MAX_AUTH_LEVELS) {
                    backToHome()
                }
                else if (requiresHigherAuth() && data.level !== LEVEL_ADMIN) {
                    backToHome()
                }
                else {
                    assignBodyClasses(gLevel)
                    if (typeof onLoadCallback == 'function') {
                        onLoadCallback(gLevel)
                    }
                }
            })
            .catch(err => {
                console.log('Could not get permissions!', initAuth.server)
                console.error(err)
            })
    }
}
runAuthInit()

/* Quotes */
function standardGET(ep, query='') {
    if (query.length) query = `&${query}`
    const url = new URL(`https://${gServer}/api/${ep}?pwd=${gPass}${query}`)
    return new Promise((resolve, reject) => {
        try {
            fetch(url)
                .then(data => data.json())
                .then(json => resolve(json))
        } catch (error) {
            reject(error)
        }
    })
}
function getSearch(searchStr='') {
    searchStr = searchStr.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/\s{2,}/g,' ')
    return standardGET('search', `str=${searchStr}`)
}
function getNameGuesses(searchList, verbose='') {
    if (!Array.isArray(searchList)) {
        searchList = []
    }
    let searchStr = searchList.join(',').replaceAll('?', '').replaceAll('&', '').trim()
    return standardGET('guess', `names=${searchStr}${verbose && '&verbose=true'}`)
}
function getAllQuotes(includeStats) {
    return standardGET('all', includeStats && 'includeStats=true')
}
const getWordMap = () => standardGET('words')
function getAttributions()  {
    return new Promise((resolve, reject) => {
        getAllQuotes()
            .then(data => {
                let quotes = JSON.parse(JSON.stringify(data.quotes))
                quotes.sort((a, b) => a.id - b.id)
                quotes = quotes.map(x => x.authors.split(','))
                resolve({
                    orderedAuthors: quotes
                })
            })
            .catch(reject)
    })
}
function standardPOST(ep, body, query='') {
    if (query.length) query = `&${query}`
    const url = new URL(`https://${gServer}/api/${ep}?pwd=${gPass}${query}`)
    return new Promise((resolve, reject) => {
        try {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            .then(data => data.json())
            .then(json => resolve(json))
        } catch (error) {
            reject(error)
        }
    })
}
function postQuote(quote, authors) {
    return standardPOST('quote', {quote, authors})
}
function postEdit(quote, id) {
    return standardPOST('edit', {quote, id})
}
function postVote(good, bad) {
    standardPOST('vote', {
        yesId: good,
        noId: bad
    })
}

/* Color Themes */
const COLOR_KEY = 'colorTheme'
const DEFAULT_COLOR_THEME = 'defaultTheme'
let currentColorTheme = getCookieItem(COLOR_KEY) || setCookieItem(COLOR_KEY, DEFAULT_COLOR_THEME)
const colorThemeMap = {
    [DEFAULT_COLOR_THEME]: 'Original',
    coolBlue: 'Cool Blue',
    uAlbany: 'UAlbany',
    njTransit: 'NJ Transit',
    krasne: 'ZachKrasne.com',
    grayscale: 'Grayscale'
}
if (!Object.keys(colorThemeMap).includes(currentColorTheme)) {
    currentColorTheme = setCookieItem(COLOR_KEY, DEFAULT_COLOR_THEME)
}
function setColorTheme(theme) {
    theme ??= currentColorTheme
    Object.keys(colorThemeMap).forEach(theme => {
        $('body').toggleClass(theme, false)
    })
    $('body').toggleClass(theme, true)
}

// Site Mods
/* Nav Bar Constants */
const navItems = [
    { href: "/all", text: 'All Quotes' },
    { href: "/random", text: 'Random Quote' },
    { href: "/search", text: 'Search' },
    { href: "/vote", text: 'Vote' },
    { href: "/game", text: 'Games' },
    { href: "/leaderboard", text: 'Leaderboard' },
    { href: "/analytics", text: 'Fun Charts' },
    { href: '/submit', text: 'Submit New', requiresPriveleges: true },
    { href: '/edit', text: 'Edit Quotes', requiresPriveleges: true }
]
/* Settings Modal Functions */
function openSettingsModal() {
    $('#settings-modal').show()
    setTimeout(() => $('div#settings-modal').toggleClass('settings-open', true))

    $('.color-btn').each((_, el) => {
        let key = $(el).attr('id').split('-')[2]
        $(el).attr('checked', key == currentColorTheme)
    })
}
function closeSettingsModal(apply) {
    $('#settings-modal').hide()
    $('div#settings-modal').toggleClass('settings-open', false)

    if (apply) {
        $('.color-btn').each((_, el) => {
            if ($(el).is(':checked')) {
                currentColorTheme = $(el).attr('id').split('-')[2]
            }
        })
        setCookieItem(COLOR_KEY, currentColorTheme)
        setColorTheme()
    }
}
/* Make Nav and Title */
$(document).ready(() => {
    $('body').prepend(`
        <div class="modal" id="settings-modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Settings</h2>
                    <button type="button" class="close pointable" onClick="closeSettingsModal()" aria-label="Close">
                        <span aria-hidden="true" class="pointable">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-6">
                            <h5>Color Themes</h5>
                            ${Object.entries(colorThemeMap).map(([themeKey, text]) => `
                                <div class="form-check">
                                    &ensp;
                                    <input class="form-check-input color-btn" type="radio" name="flexRadioDefault" id="radio-color-${themeKey}">
                                    <label class="form-check-label" for="radio-color-${themeKey}">
                                        ${text}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                        <div class="col-6">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="customSwitch2">
                                <label class="custom-control-label" for="customSwitch2">Show "Nice"-ness</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" onClick="closeSettingsModal(true)">Apply</button>
                </div>
                </div>
            </div>
        </div>
        <div class="row header justify-content-center">
            <h1 class="title">
                <div id="hamburger-menu" class="dropdown d-inline-block dropright requires-login mobile-only">
                    <i class="fa-solid fa-bars mobile-only" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </i>
                    <div class="dropdown-menu dropdown-menu-right dropright" aria-labelledby="dropdownMenuButton">
                        ${navItems.map(item => {
                            return `<a class="dropdown-item bold ${item.requiresPriveleges? 'requires-admin' : ''}" href="${item.href}">${item.text}</a>`
                        }).join('\n')}
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item bold" onclick="logOut()">Log Out</a>
                    </div>
                </div>
                <a href="/" id="title-box">Quotes List</a>
            </h1>
            <i class="fa-solid fa-gear cog-icon" onclick="openSettingsModal()"></i>
        </div>
        <nav class="header text-center justify-content-center requires-login no-mobile">
            ${navItems.map(item => {
                return `<button type="button" onclick="window.location.href='${item.href}'" class="${
                    item.requiresPriveleges? 'requires-admin ' : ''}nav-button">${item.text}</button>`
            }).join('\n')}
            <button type="button" onclick="logOut()" class="nav-button">Log Out</button>
        </nav>
    `)
})
/* Add Mobile Tag to body, if needed */
if (!isDesktop()) {
    document.body.classList.add('is-mobile')
}
/* Add color theme dropdown items and body */
$(document).ready(() => {
    $('#color-theme-dropdown').append(
        Object.entries(colorThemeMap)
            .map(([themeKey, text]) => `<a class="dropdown-item color-theme-item${
                (themeKey === currentColorTheme)? ' active' : ''
            }" data-color-theme="${themeKey}">${text}</a>`)
            .join('')
    )
    $('.color-theme-item').click((evt) => {
        $('.color-theme-item').toggleClass('active', false)
        $(evt.target).toggleClass('active')
        setColorTheme($(evt.target).data('color-theme'))
    })
    setColorTheme()
})
