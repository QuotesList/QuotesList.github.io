/* Nav Bar Constants */
const navItems = [
    { href: "/all", text: 'All Quotes' },
    { href: "/random", text: 'Random Quote' },
    { href: "/search", text: 'Search' },
    { href: "/vote", text: 'Vote' },
    { href: "/game", text: 'Games' },
    { href: "/leaderboard", text: 'Leaderboard' },
    { href: "/analytics", text: 'Fun Charts' },
    { href: '/submit', text: 'Submit New Quote', requiresPriveleges: true },
    { href: '/edit', text: 'Edit Quotes', requiresPriveleges: true }
]
/* Make Nav and Title */
$(document).ready(() => {
    $('body').prepend(`
        <div class="row header justify-content-center">
            <h1 class="title">
                <a href="/">Quotes List</a>
            </h1>
        </div>
        <nav class="header text-center justify-content-center requires-login no-mobile">
            ${navItems.map(item => {
                return `<button type="button" onclick="window.location.href='${item.href}'"${
                    item.requiresPriveleges? ' class="requires-admin"' : ''}>${item.text}</button>`
            }).join('\n')}
            <button type="button" onclick="logOut()">Log Out</button>
        </nav>
    `)
    $('div#content:not([class])').attr('class', 'col-10 col-lg-8 offset-lg-2 justify-content-center')
    let length = navItems.filter(x => x.requiresPriveleges !== true).length + 1
    let buttonWidth = ($(document).width() / length) - 20
    $('nav button').css('width', `${buttonWidth}px`)
})
/* Add Mobile Tag to body, if needed */
if (!isDesktop()) {
    document.body.classList.add('is-mobile')
}
