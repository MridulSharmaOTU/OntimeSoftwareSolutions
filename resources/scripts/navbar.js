class NavbarComponent extends HTMLElement {
  connectedCallback() {
    // Fetch the navbar markup
    fetch('resources/navbar.html')
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
        this.attachSearchListeners();
        this.attachSignUpListener();
        this.attachSignInListener();
        this.updateAccountBadge();
      })
      .catch(error => console.error('Failed to load navbar:', error));
  }

  attachSearchListeners() {
    const searchBar = this.querySelector('.search-bar');
    const searchButton = this.querySelector('.search-button');
    if (!searchBar || !searchButton) {
      console.error('Search elements not found in navbar.');
      return;
    }
    const handleSearch = () => {
      const query = searchBar.value.trim();
      if (query) {
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
    const signUpForm = this.querySelector('#signUpModal form');
    if (!signUpForm) {
      console.error('Sign-up form not found in navbar.');
      return;
    }
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this.querySelector('#signUpEmail').value.trim();
      const username = this.querySelector('#signUpUsername').value.trim();
      const password = this.querySelector('#signUpPassword').value;
      const confirmPassword = this.querySelector('#signUpConfirmPassword').value;
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      const payload = {
        username,
        email,
        password,
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

  attachSignInListener() {
    // Listen for the sign-in form submission in the sign-in modal.
    const signInForm = this.querySelector('#signInModal form');
    if (!signInForm) {
      console.error('Sign-in form not found in navbar.');
      return;
    }
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = this.querySelector('#signInUsername').value.trim();
      const password = this.querySelector('#signInPassword').value;
      const payload = { username, password };
      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
          // Store the username in localStorage for this session.
          localStorage.setItem('loggedInUser', username);
          alert("Logged in successfully.");
          // Optionally close the modal.
          const signInModalElement = document.getElementById('signInModal');
          if (signInModalElement) {
            const modalInstance = bootstrap.Modal.getInstance(signInModalElement);
            if (modalInstance) modalInstance.hide();
          }
          this.updateAccountBadge();
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error("Error during sign in:", error);
        alert("An error occurred during sign in.");
      }
    });
  }

  updateAccountBadge() {
    // This method updates the account dropdown based on login state.
    const accountDropdown = this.querySelector('#accountDropdown');
    if (!accountDropdown) {
      console.error("Account dropdown not found in navbar.");
      return;
    }
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      // If user is logged in, show only "Sign Out"
      accountDropdown.innerHTML = `
        <li>
          <a class="dropdown-item" href="#" id="signOutButton">Sign Out</a>
        </li>
      `;
      const signOutButton = this.querySelector('#signOutButton');
      if (signOutButton) {
        signOutButton.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            const response = await fetch('http://localhost:3000/api/logout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (response.ok) {
              localStorage.removeItem('loggedInUser');
              alert("Logged out successfully.");
              this.updateAccountBadge();
            } else {
              alert("Error logging out: " + result.error);
            }
          } catch (error) {
            console.error("Error during logout:", error);
            alert("An error occurred during logout.");
          }
        });
      }
    } else {
      // If user is not logged in, show "Sign Up" and "Sign In"
      accountDropdown.innerHTML = `
        <li>
          <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#signUpModal">Sign Up</a>
        </li>
        <li>
          <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#signInModal">Sign In</a>
        </li>
      `;
    }
  }
}

customElements.define('navbar-component', NavbarComponent);