document.getElementById("menu-toggle").addEventListener("click", function() {
    var navLinks = document.getElementsByClassName("nav-link");
    if (navLinks.style.display === "flex") {
        navLinks.style.display = "none";
    } else {
        navLinks.style.display = "flex";
    }
})