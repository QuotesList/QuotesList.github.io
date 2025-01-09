const populatePage = level => {
    if (level <= 0 || level >= 3) {
        document.getElementById('password-wrapper').classList.remove("hidden")
        document.getElementById('general-buttons').classList.add("hidden")
        document.getElementById('admin-buttons').classList.add('hidden')
    }
    else {
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
    tryAuth(pass, server)
        .then(data => {
            populatePage(data.level)
        })
        .catch(err => {
            console.error(err)
            alert(err.err)
        })
}

const onPermsLoaded = () => {
    populatePage(gLevel)
}

// setTimeout(() => {
//     if (gLevel > 0 && gLevel < 3) {

//     }
// }, 50)
