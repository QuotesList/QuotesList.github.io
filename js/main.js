const submitCredentials = () => {
    let pass = document.getElementById('passwordInput')
    let server = document.getElementById('serverInput')
    tryAuth(pass, server)
        .then(data => {
            document.getElementById('password-wrapper').classList.add("hidden")
            document.getElementById('general-buttons').classList.remove("hidden")
            if (data.level > 1) {
                document.getElementById('admin-buttons').classList.remove('hidden')
            }
        })
        .catch(err => {
            console.error(err)
            alert(err.err)
        })
}

const onPermsLoaded = permsLevel => {
    console.log("Level:", permsLevel)
}
