/**
 * Muhammad Mahedi Hasan - Portfolio
 */

// --- Configuration & Constants ---
const CONFIG = {
    DATA_PATH: 'assets/data.json',
    MEDIUM_RSS_CONVERTER: 'https://api.rss2json.com/v1/api.json?rss_url=',
    DEFAULT_BLOG_IMAGE: 'assets/img/code.jpg',
    NAV_OBSERVER_OPTIONS: {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0
    },
    ANIMATION_OBSERVER_OPTIONS: {
        threshold: 0.1
    }
};

const ICON_MAP = {
    github: 'fab fa-github',
    linkedin: 'fab fa-linkedin',
    twitter: 'fab fa-twitter',
    medium: 'fab fa-medium',
    email: 'fas fa-envelope',
    phone: 'fas fa-phone',
    location: 'fas fa-map-marker-alt',
    calendar: 'far fa-calendar-alt',
    external: 'fas fa-external-link-alt',
    lock: 'fas fa-lock',
    arrowRight: 'fas fa-arrow-right'
};

// --- UI Components (Templates) ---
const UI = {
    /**
     * Generates a social link icon
     */
    socialLink: (platform, url) => `
        <a href="${url}" target="_blank" aria-label="${platform}">
            <i class="${ICON_MAP[platform] || 'fas fa-link'}"></i>
        </a>`,

    /**
     * Generates a skill tag
     */
    skillTag: (skill, customStyle = '') => `
        <span class="skill-tag" style="${customStyle}">${skill}</span>`,

    /**
     * Generates an experience card
     */
    experienceCard: (job) => {
        const achievements = job.achievements?.length
            ? `<ul class="exp-achievements">${job.achievements.map(a => `<li>${a}</li>`).join('')}</ul>`
            : '';

        const techStack = job.tech_stack?.length
            ? `<div class="exp-tech">${job.tech_stack.map(t => UI.skillTag(t, 'font-size:0.8rem')).join('')}</div>`
            : '';

        return `
            <div class="experience-item">
                <div class="experience-card">
                    <div class="exp-header">
                        <div>
                            <div class="exp-role">${job.role}</div>
                            <div class="exp-company">${job.company}</div>
                        </div>
                        <div class="text-right">
                            <div class="exp-duration"><i class="${ICON_MAP.calendar}"></i> ${job.duration}</div>
                            <div class="exp-location"><i class="${ICON_MAP.location}"></i> ${job.location}</div>
                        </div>
                    </div>
                    <p class="exp-desc">${job.description}</p>
                    ${achievements}
                    ${techStack}
                </div>
            </div>`;
    },

    /**
     * Generates a project card
     */
    projectCard: (project) => {
        const linkHtml = project.is_private
            ? `<span class="link-icon"><i class="${ICON_MAP.lock}"></i> Private</span>`
            : `<a href="${project.link}" target="_blank" class="link-icon"><i class="${ICON_MAP.external}"></i> Live</a>`;

        return `
            <article class="project-card">
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tech-stack">
                        ${project.tech_stack.map(t => `<span>${t}</span>`).join('')}
                    </div>
                    <div class="project-links">${linkHtml}</div>
                </div>
            </article>`;
    },

    /**
     * Generates a blog card from Medium post
     */
    blogCard: (post) => {
        const imgMatch = post.description.match(/<img src="(.*?)"/);
        const image = post.thumbnail || (imgMatch ? imgMatch[1] : CONFIG.DEFAULT_BLOG_IMAGE);
        const date = new Date(post.pubDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        return `
            <article class="blog-card">
                <div class="blog-image" style="background-image: url('${image}'); background-size: cover; background-position: center;"></div>
                <div class="blog-content">
                    <span class="date">${date}</span>
                    <h3>${post.title}</h3>
                    <a href="${post.link}" target="_blank" class="read-more">
                        Read Article <i class="${ICON_MAP.arrowRight}"></i>
                    </a>
                </div>
            </article>`;
    },

    /**
     * Generates a contact info item
     */
    contactItem: (icon, title, value, link = null) => `
        <div class="info-item">
            <i class="${ICON_MAP[icon] || icon}"></i>
            <div>
                <h4>${title}</h4>
                ${link ? `<a href="${link}">${value}</a>` : `<p>${value}</p>`}
            </div>
        </div>`
};

// --- Application Controller ---
class PortfolioApp {
    constructor() {
        // Core Elements
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.nav-links');
        this.navLinksList = document.querySelectorAll('.nav-links a');

        // Containers
        this.containers = {
            profileName: document.getElementById('profile-name'),
            profileRole: document.getElementById('profile-role'),
            profileBio: document.getElementById('profile-bio'),
            socialLinks: document.getElementById('social-links'),
            socialFooter: document.querySelector('.social-footer'),
            aboutContent: document.getElementById('about-content'),
            skillsList: document.getElementById('skills-list'),
            experienceList: document.getElementById('experience-list'),
            projectsGrid: document.getElementById('projects-grid'),
            blogGrid: document.getElementById('blog-grid'),
            contactInfo: document.getElementById('contact-info'),
            currentYear: document.getElementById('currentYear')
        };
    }

    /**
     * Initialize the Application
     */
    async init() {
        this.setYear();
        this.setupEventListeners();
        this.setupScrollObservers();
        await this.loadData();
    }

    setYear() {
        if (this.containers.currentYear) {
            this.containers.currentYear.textContent = new Date().getFullYear();
        }
    }

    /**
     * Set up all event listeners (Menu, Scroll)
     */
    setupEventListeners() {
        // Mobile Menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.navLinks.classList.toggle('active');
                this.hamburger.classList.toggle('active');
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.hamburger.contains(e.target) && !this.navLinks.contains(e.target) && this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    this.closeMenu();
                }
            });
        });

        // Top of page check for Home link
        window.addEventListener('scroll', () => {
            if (window.scrollY < 100) {
                this.updateActiveNavLink('#home');
            }
        });
    }

    closeMenu() {
        this.navLinks.classList.remove('active');
        this.hamburger.classList.remove('active');
    }

    /**
     * Set up Intersection Observers for animations and navigation
     */
    setupScrollObservers() {
        // Reveal on Scroll Observer
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, CONFIG.ANIMATION_OBSERVER_OPTIONS);

        this.animationObserver = animationObserver;

        // Navigation Sync Observer
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNavLink(`#${entry.target.id}`);
                }
            });
        }, CONFIG.NAV_OBSERVER_OPTIONS);

        document.querySelectorAll('section[id]').forEach(section => navObserver.observe(section));
    }

    updateActiveNavLink(hash) {
        this.navLinksList.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
    }

    /**
     * Main Data Loader
     */
    async loadData() {
        try {
            const response = await fetch(CONFIG.DATA_PATH);
            const data = await response.json();

            this.renderProfile(data.profile);
            this.renderAbout(data.profile.about, data.skills);
            this.renderExperience(data.experience);
            this.renderProjects(data.projects);
            this.renderContact(data.profile.contact);

            if (data.profile.socials.medium) {
                this.fetchMediumBlogs(data.profile.socials.medium);
            }

            // Start observing newly rendered elements
            this.observeElements();

        } catch (error) {
            console.error('Portfolio Error: Failed to load data.json', error);
        }
    }

    renderProfile(profile) {
        this.containers.profileName.textContent = profile.name;
        this.containers.profileRole.textContent = profile.role;
        this.containers.profileBio.textContent = profile.short_bio;

        const socialHtml = Object.entries(profile.socials)
            .map(([platform, url]) => UI.socialLink(platform, url))
            .join('');

        if (this.containers.socialLinks) this.containers.socialLinks.innerHTML = socialHtml;
        if (this.containers.socialFooter) this.containers.socialFooter.innerHTML = socialHtml;
    }

    renderAbout(aboutParagraphs, skills) {
        // Insert About Bio
        aboutParagraphs.slice().reverse().forEach(text => {
            const p = document.createElement('p');
            p.innerHTML = text;
            this.containers.aboutContent.insertBefore(p, this.containers.skillsList);
        });

        // Insert Skills
        this.containers.skillsList.innerHTML = skills.map(s => UI.skillTag(s)).join('');
    }

    renderExperience(jobs) {
        if (!this.containers.experienceList || !jobs) return;
        this.containers.experienceList.innerHTML = jobs.map(j => UI.experienceCard(j)).join('');
    }

    renderProjects(projects) {
        if (!this.containers.projectsGrid) return;
        this.containers.projectsGrid.innerHTML = projects.map(p => UI.projectCard(p)).join('');
    }

    renderContact(contact) {
        if (!this.containers.contactInfo) return;
        this.containers.contactInfo.innerHTML = [
            UI.contactItem('email', 'Email', contact.email, `mailto:${contact.email}`),
            UI.contactItem('phone', 'Phone', contact.phone),
            UI.contactItem('location', 'Location', contact.location)
        ].join('');
    }

    /**
     * Fetch blogs from Medium via RSS to JSON
     */
    async fetchMediumBlogs(mediumUrl) {
        const usernameMatch = mediumUrl.match(/@([\w-]+)/);
        if (!usernameMatch) return;

        const rssUrl = `https://medium.com/feed/@${usernameMatch[1]}`;
        const mediumProfileLink = document.getElementById('medium-link');
        if (mediumProfileLink) mediumProfileLink.href = mediumUrl;

        try {
            const response = await fetch(`${CONFIG.MEDIUM_RSS_CONVERTER}${encodeURIComponent(rssUrl)}`);
            const data = await response.json();

            if (data.status === 'ok') {
                this.containers.blogGrid.innerHTML = data.items.slice(0, 6).map(p => UI.blogCard(p)).join('');
            } else {
                throw new Error('RSS conversion failed');
            }
        } catch (error) {
            console.error('Blog Fetch Error:', error);
            if (this.containers.blogGrid) {
                this.containers.blogGrid.innerHTML = `<p class="error-msg">Unable to load latest articles at this time.</p>`;
            }
        }
    }

    /**
     * Attach Intersection Observer to specific elements for entry animations
     */
    observeElements() {
        document.querySelectorAll('.project-card, .section-title, .about-text').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            this.animationObserver.observe(el);
        });
    }
}

// --- Bootstrap Application ---
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.init();
});