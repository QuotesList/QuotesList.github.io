const populatePage = level => {
    if (level === undefined) {
        level = gLevel
    }
    if (level <= 0 || level >= 3) {
        document.getElementById('password-wrapper').classList.remove("hidden")
        document.getElementById('general-buttons').classList.add("hidden")
        document.getElementById('admin-buttons').classList.add('hidden')
    }
    else {
        document.getElementById('passwordInput').value = ""
        document.getElementById('serverInput').value = ""
        document.getElementById('password-wrapper').classList.add("hidden")
        document.getElementById('general-buttons').classList.remove("hidden")
        if (level > 1) {
            document.getElementById('admin-buttons').classList.remove('hidden')
        }
        else {
            document.getElementById('admin-buttons').classList.add('hidden')
        }
    }
}

const submitCredentials = () => {
    let pass = document.getElementById('passwordInput').value
    let server = document.getElementById('serverInput').value
    if (pass.trim().length < 1 || server.trim().length < 1) {
        alert("Please provide a server URL and password!")
        return
    }
    tryAuth(pass, server)
        .then(data => {
            populatePage(data.level)
        })
        .catch(err => {
            console.error(err)
            alert(err.err)
        })
}

window.addEventListener('load', () => {
    onPermsLoaded()
    setTimeout(() => populatePage(gLevel), 500)
}, false)

window.addEventListener('onload', () => {
    onPermsLoaded()
    setTimeout(() => populatePage(gLevel), 500)
})

const onPermsLoaded = () => {
    populatePage(gLevel)
    setTimeout(() => populatePage(gLevel), 300)
}

const logOut = () => {
    deleteAuth()
    gLevel = 0
    populatePage(gLevel)
}
