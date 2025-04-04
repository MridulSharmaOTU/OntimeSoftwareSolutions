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
          setTimeout(() => {
            window.location.reload();
          }, 500);
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
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-person-fill-gear" viewBox="0 0 16 16">
            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
          </svg>
        `;
      } else {
        // Regular logged in user: person-fill-check.
        newIconSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-person-fill-check" viewBox="0 0 16 16">
            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
            <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
          </svg>
        `;
        document.querySelector('#favourites').classList.remove('hide-fav'); 
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
              setTimeout(() => {
                window.location.reload();
              }, 500);
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
      document.querySelector('#favourites').classList.add('hide-fav');
    }
  }
}

customElements.define('navbar-component', NavbarComponent);