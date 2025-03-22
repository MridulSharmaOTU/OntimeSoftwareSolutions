class NavbarComponent extends HTMLElement {
    connectedCallback() {
      // Fetch the navbar markup
      fetch('resources/navbar.html')
        .then(response => response.text())
        .then(html => {
          this.innerHTML = html;
          this.attachSearchListeners();
        })
        .catch(error => console.error('Failed to load navbar:', error));
    }
  
    attachSearchListeners() {
      // Use this.querySelector to find elements inside the custom element
      const searchBar = this.querySelector('.search-bar');
      const searchButton = this.querySelector('.search-button');
      if (!searchBar || !searchButton) {
        console.error('Search elements not found in navbar.');
        return;
      }
  
      const handleSearch = () => {
        const query = searchBar.value.trim();
        if (query) {
          // Redirect to results_page.html with the search query as a URL parameter
          window.location.href = 'results_page.html?search=' + encodeURIComponent(query);
        }
      };
  
      searchButton.addEventListener('click', handleSearch);
      searchBar.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          handleSearch();
        }
      });
    }
  }
  
  customElements.define('navbar-component', NavbarComponent);  