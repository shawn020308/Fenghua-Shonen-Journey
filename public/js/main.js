function inPageNavigateTo(page) {
    fetch(`/${page}`)
        .then(response => response.text())
        .then(html => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = html;
            } else {
                console.error('Element with id "main-content" not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching page:', error);
        });
}