// Main GameHub JavaScript functionality

// Smooth scrolling for CTA button
document.querySelector('.cta-btn').addEventListener('click', () => {
    document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
});

// Mobile menu toggle
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// Smooth scrolling for nav links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    });
});

// Contact form submission
document.querySelector('.contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const message = e.target.querySelector('textarea').value;
    
    if (name && email && message) {
        console.log('Contact Form Submission:', { name, email, message });
        alert('Thank you for your message! We\'ll get back to you soon.');
        e.target.reset();
    } else {
        alert('Please fill in all fields.');
    }
});

// Leaderboard tabs functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tab = btn.dataset.tab;
        if (tab === 'weekly') {
            document.querySelector('.podium-place.first .player-name').textContent = 'GameMaster';
            document.querySelector('.podium-place.first .player-score').textContent = '2,890';
        } else if (tab === 'monthly') {
            document.querySelector('.podium-place.first .player-name').textContent = 'ProGamer';
            document.querySelector('.podium-place.first .player-score').textContent = '8,750';
        } else {
            document.querySelector('.podium-place.first .player-name').textContent = 'NasirYaseen';
            document.querySelector('.podium-place.first .player-score').textContent = '18,420';
        }
    });
});

// Login system functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('registerModal').style.display = 'none';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function closeRegister() {
    document.getElementById('registerModal').style.display = 'none';
}

// Profile functions
function showProfile() {
    const currentUser = localStorage.getItem('currentUser');
    document.getElementById('profileModal').style.display = 'block';
    document.getElementById('profileUsername').textContent = currentUser;
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

// Settings functions
function showSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('profileModal').style.display = 'none';
    loadSettings();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const theme = document.getElementById('themeSelect').value;
    const sound = document.getElementById('soundToggle').checked;
    const notifications = document.getElementById('notificationToggle').checked;
    
    localStorage.setItem('theme', theme);
    localStorage.setItem('sound', sound);
    localStorage.setItem('notifications', notifications);
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    alert('Settings saved successfully!');
    closeSettings();
}

function loadSettings() {
    const theme = localStorage.getItem('theme') || 'dark';
    const sound = localStorage.getItem('sound') !== 'false';
    const notifications = localStorage.getItem('notifications') !== 'false';
    
    document.getElementById('themeSelect').value = theme;
    document.getElementById('soundToggle').checked = sound;
    document.getElementById('notificationToggle').checked = notifications;
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    closeProfile();
    updateNavigation();
    alert('Logged out successfully!');
}

function updateNavigation() {
    const isLoggedIn = localStorage.getItem('loggedIn');
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.querySelector('.nav-links li:last-child a');
    
    if (isLoggedIn) {
        loginLink.textContent = currentUser;
        loginLink.onclick = showProfile;
    } else {
        loginLink.textContent = 'Login';
        loginLink.onclick = showLogin;
    }
}

// Form submissions
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', username);
        alert('Login successful! Welcome ' + username);
        closeLogin();
        updateNavigation();
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (username && email && password) {
        alert('Account created successfully! Please login.');
        closeRegister();
        showLogin();
    }
});



// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Initialize on page load
updateNavigation();
loadSettings();

// Welcome popup
if (!localStorage.getItem('welcomeShown')) {
    setTimeout(() => {
        const reason = prompt('Welcome to GameHub! Why are you visiting our website today?');
        if (reason) {
            console.log('Visitor reason:', reason);
        }
        localStorage.setItem('welcomeShown', 'true');
    }, 5000);
}