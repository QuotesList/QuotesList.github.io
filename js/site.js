/* Nav Bar Constants */
const navItems = [
    { href: "/all", text: 'All Quotes' },
    { href: "/leaderboard", text: 'Leaderboard' },
    { href: "/game", text: 'Game' },
    { href: "/random", text: 'Random Quote' },
    { href: "/analytics", text: 'Fun Charts' },
    { href: "/search", text: 'Search' },
    { href: "/vote", text: 'Vote' },
    { href: '/submit', text: 'Submit New Quote', requiresPriveleges: true },
    { href: '/edit', text: 'Edit Quotes', requiresPriveleges: true }
]
/* Make Nav Bar */
if (isDesktop()) { // TODO Something more robust than this, obviously
    const navBar = document.createElement('nav')
    navBar.className = 'header text-center justify-content-center onload-needs-auth'
    if (navItems.map(x => x.href.slice(1)).filter(x => window.location.href.toLowerCase().includes(x)).length < 1) {
        navBar.classList.add('hidden')
    }
    let navButtons = navItems.map(x => `<button type="button" onclick="window.location.href='${x.href}'"${
        x.requiresPriveleges? ' class="hidden"' : ''}>${x.text}</button>`).join('\n')
    navBar.innerHTML = `${navButtons}\n<button type="button" onclick="logOut()">Log Out</button>\n`
    document.body.insertBefore(navBar, document.body.firstChild)
}
/* Make Title Bar */
const titleBar = document.createElement('div')
titleBar.className = 'row header justify-content-center'
titleBar.innerHTML = '<h1 class="title"><a href="/">Quotes Lists</a></h1>'
document.body.insertBefore(titleBar, document.body.firstChild)
/* Add Standard Bootstrap to Main Content (if blank) */
var content = document.getElementById('content')
if (content !== null && content.className.trim().length < 1) {
    content.className = "col-8 col-lg-8 offset-2 justify-content-center"
}
/* Function to Re-size Nav Buttons */
const resizeNavButtons = () => {
    let buttonsList = document.querySelectorAll('nav button:not(.hidden)')
    let buttonWidth = ($(document).width() / buttonsList.length) - 20
    Array.from(buttonsList).forEach(el => {
        el.style.width = `${buttonWidth}px`
    })
}
/* Function to show hidden Nav Buttons */
const setPriveligedNavItemsShown = (shown) => {
    let privelegedButtons = navItems.filter(x => x.requiresPriveleges).map(x => x.text)
    Array.from(document.querySelectorAll('nav button')).forEach(btn => {
        if (privelegedButtons.includes(btn.innerHTML.trim())) {
            if (shown) {
                btn.classList.remove('hidden')
            } else if (!Array.from(btn.classList).includes('hidden')) {
                btn.classList.add('hidden')
            }
        }
    })
    resizeNavButtons()
}
/* Re-size Nav Items to Current Page */
resizeNavButtons()
