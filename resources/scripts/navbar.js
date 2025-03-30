class NavbarComponent extends HTMLElement {
  connectedCallback() {
    // Fetch the navbar markup
    fetch('resources/navbar.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
        this.attachSearchListeners();
        this.attachSignUpListener();
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

  attachSignUpListener() {
    // Listen for the sign-up form submission in the sign-up modal
    const signUpForm = this.querySelector('#signUpModal form');
    if (!signUpForm) {
      console.error('Sign-up form not found in navbar.');
      return;
    }
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get values from the form fields
      const email = this.querySelector('#signUpEmail').value.trim();
      const username = this.querySelector('#signUpUsername').value.trim();
      const password = this.querySelector('#signUpPassword').value;
      const confirmPassword = this.querySelector('#signUpConfirmPassword').value;

      // Ensure that the password and confirm password fields match
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Build the payload to send to the registration endpoint.
      // Note: admin and verified are set to false.
      const payload = {
        username: username,
        email: email,
        password: password,
        admin: false,
        verified: false
      };

      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
          alert("Account created! Please check your email for verification.");
          // Optionally close the modal (requires Bootstrap's modal JS)
          const signUpModalElement = document.getElementById('signUpModal');
          if (signUpModalElement) {
            const modalInstance = bootstrap.Modal.getInstance(signUpModalElement);
            if (modalInstance) modalInstance.hide();
          }
        } else {
          alert("Error creating account: " + result.message);
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration.");
      }
    });
  }
}

customElements.define('navbar-component', NavbarComponent);