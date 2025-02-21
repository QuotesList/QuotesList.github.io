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
/* Make Nav and Title */
$(document).ready(() => {
    $('body').prepend(`
        <div class="row header justify-content-center">
            <h1 class="title">
                <div id="hamburger-menu" class="dropdown d-inline-block dropright requires-login">
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
                <a href="/">Quotes List</a>
            </h1>
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
