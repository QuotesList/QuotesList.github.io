const LEVEL_ADMIN = 2
const LEVEL_GENERAL = 1
const LEVEL_HACKER = 0

const MAX_AUTH_LEVELS = 3

const MAIN_SITE_URL = 'thequoteslist.com'

var gPass = 'X'
var gServer = 'localhost:8008'
var gLevel = LEVEL_HACKER

const SERVER_KEY = 'server'
const PASS_KEY = 'password'

const assignBodyClasses = (level) => {
    if (level === undefined) {
        level = gLevel
    }
    
    if (level === LEVEL_ADMIN || level === LEVEL_GENERAL) {
        while (Array.from(document.body.classList).includes('explicity-logged-out')) {
            document.body.classList.remove('explicity-logged-out')
        }
        document.body.classList.add('logged-in')
    } else {
        while (Array.from(document.body.classList).includes('logged-in')) {
            document.body.classList.remove('logged-in')
        }
        document.body.classList.add('explicity-logged-out')
    }

    if (level === LEVEL_ADMIN) {
        document.body.classList.add('is-admin')
    } else {
        while (Array.from(document.body.classList).includes('is-admin')) {
            document.body.classList.remove('is-admin')
        }
    }
}

var getCookieItem = function (key) {
    let value = `${document.cookie} `
    let parts = value.split('; ')

    if (parts.map(x => x.slice(0, x.indexOf('='))).includes(key)) {
        value = parts.find(x => x.indexOf(`${key}=`) === 0)
        return decodeURIComponent(value.split('=')[1]).trim()
    }
}

var setCookieItem = function (key, value) {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${new Date(2147483647 * 1000).toUTCString()};`
}

var deleteCookieItem = function (key) {
    document.cookie = `${key}=X; path=/; max-age=0;`
}

const decodeCookie = () => {
    if (document.cookie.includes(SERVER_KEY)) {
        return {
            server: getCookieItem(SERVER_KEY),
            pass: getCookieItem(PASS_KEY)
        }
    }
}

const encodeCookie = () => {
    setCookieItem(SERVER_KEY, gServer)
    setCookieItem(PASS_KEY, gPass)
}

const deleteCookie = () => {
    deleteCookieItem(SERVER_KEY)
    deleteCookieItem(PASS_KEY)
}

const tryAuth = (pass, server) => {
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

const hasAuth = () => {
    return gLevel > LEVEL_HACKER
}

const deleteAuth = () => {
    gServer = ""
    gPass = ""
    gLevel = LEVEL_HACKER
    deleteCookie()
}

const backToHome = () => {
    if (typeof STOP_REDIRECT === 'undefined') {
        window.location.href = "/"
    }
}

const logOut = () => {
    deleteAuth()
    gLevel = 0
    window.location.href = '/'
}

const requiresHigherAuth = () => {
    let pages = ['submit', 'edit'].filter(x => window.location.href.toLowerCase().includes(x.toLowerCase()))
    return (pages.length > 0)
}

const isRealSite = () => {
    return (window.location.href.includes(MAIN_SITE_URL))
}

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
