/* Make Nav Bar */
const navBar = document.createElement('div')
navBar.className = 'row header justify-content-center'
navBar.innerHTML = '<h1 class="title">Quotes Lists</h1>'
document.body.insertBefore(navBar, document.body.firstChild)
/* Add Standard Bootstrap to Main Content (if blank) */
var content = document.getElementById('content')
if (content !== null && content.className.trim().length < 1) {
    content.className = "col-8 col-lg-8 offset-2 justify-content-center"
}
