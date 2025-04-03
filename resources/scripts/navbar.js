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
          localStorage.setItem('isAdmin', result.isAdmin ? 'true' : 'false');
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
    // Select the account badge anchor and the dropdown container by ID.
    const accountAnchor = this.querySelector('#accountBadge');
    const accountDropdown = this.querySelector('#accountDropdown');
    
    // Check if a user is logged in by reading localStorage.
    const loggedInUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
    if (loggedInUser) {
      let newIconSVG = '';
      if (isAdmin) {
        // Admin icon: person-fill-gear.
        newIconSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" 
               class="bi bi-person-fill-gear hover-effect" viewBox="0 0 16 16">
            <path d="M10 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            <path d="M11.5 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
            <path d="M11.5 12a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            <path d="M13.405 11.32a.5.5 0 0 0-.611-.21l-.645.258a2.5 2.5 0 0 0-.48-.278l-.097-.68a.5.5 0 0 0-.5-.436h-1.29a.5.5 0 0 0-.5.436l-.097.68a2.5 2.5 0 0 0-.48.278l-.645-.258a.5.5 0 0 0-.611.21l-.39.674a.5.5 0 0 0 .122.617l.516.4c-.028.157-.042.317-.042.48 0 .163.014.323.042.48l-.516.4a.5.5 0 0 0-.122.617l.39.674a.5.5 0 0 0 .611.21l.645-.258c.15.11.312.203.48.278l.097.68a.5.5 0 0 0 .5.436h1.29a.5.5 0 0 0 .5-.436l.097-.68a2.5 2.5 0 0 0 .48-.278l.645.258a.5.5 0 0 0 .611-.21l.39-.674z"/>
          </svg>
        `;
      } else {
        // Regular logged in user: person-fill-check.
        newIconSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" 
               class="bi bi-person-fill-check hover-effect" viewBox="0 0 16 16">
            <path d="M10 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            <path fill="none" stroke="currentColor" stroke-width="1" d="M6 9l2 2 4-4"/>
          </svg>
        `;
      }
      accountAnchor.innerHTML = newIconSVG;
      // Update the dropdown to show a single "Sign Out" option.
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
              localStorage.setItem('isAdmin', 'false');
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
      // No user is logged in: revert to default icon and login options.
      accountAnchor.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" 
             class="bi bi-person-circle hover-effect" viewBox="0 0 16 16">
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
          <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
        </svg>
      `;
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