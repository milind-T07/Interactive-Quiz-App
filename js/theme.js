/* ============================================
   THEME.JS — Shared Utilities (All Pages)
   ============================================
   Purpose: Handles shared functionality used on EVERY page:
   1. Dark/Light theme toggle with localStorage
   2. Mobile hamburger menu toggle
   
   This file is loaded on ALL pages in the project.
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initHamburger();
});

/* ============================================
   THEME TOGGLE
   ============================================ */

// initTheme() - Sets up the theme toggle functionality
function initTheme() {
  const themeToggleButton = document.getElementById("theme-toggle");
  if (!themeToggleButton) return;

  // Read the saved theme from localStorage (returns null if not set)
  const savedTheme = localStorage.getItem("theme");

  // Apply saved theme (or default to light)
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggleButton.textContent = "Light";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggleButton.textContent = "Dark";
  }

  // Listen for clicks on the theme toggle button
  themeToggleButton.addEventListener("click", function () {
    toggleTheme(themeToggleButton);
  });
}

// toggleTheme() - Switches between light and dark theme
function toggleTheme(themeToggleButton) {
  const currentTheme = document.documentElement.getAttribute("data-theme");

  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggleButton.textContent = "Dark";
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggleButton.textContent = "Light";
    localStorage.setItem("theme", "dark");
  }
}

/* ============================================
   HAMBURGER MENU (Mobile Navigation)
   ============================================
   This handler works on ALL pages — portfolio AND sub-projects.
   Previously only portfolio.js had this, so sub-project pages
   had a broken hamburger menu on mobile.
   ============================================ */

// initHamburger() - Sets up the mobile hamburger menu toggle
function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  // Guard: exit if hamburger doesn't exist on this page
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("active");

    // Update the hamburger icon
    if (navLinks.classList.contains("active")) {
      hamburger.textContent = "✕";
    } else {
      hamburger.textContent = "☰";
    }
  });

  // Close menu when a link is clicked (for smooth scroll navigation)
  const links = navLinks.querySelectorAll("a");
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("active");
      hamburger.textContent = "☰";
    });
  });
}
