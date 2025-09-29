document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/content';
    let allContent = {}; // Store all fetched content

    // --- Lightbox State ---
    let currentAlbum = [];
    let currentIndex = 0;

    // --- DOM Elements ---
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    // Função para buscar os dados da API
    async function fetchContent() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allContent = await response.json();
            return allContent;
        } catch (error) {
            console.error('Falha ao buscar conteúdo:', error);
            return null;
        }
    }

    // --- Lightbox Functions ---
    function showImage(index) {
        if (index >= 0 && index < currentAlbum.length) {
            lightboxImage.src = currentAlbum[index];
            currentIndex = index;
        }
    }

    function openLightbox(album, index) {
        currentAlbum = album;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        showImage(index);
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentAlbum = [];
        currentIndex = 0;
    }

    function showNextImage() {
        showImage((currentIndex + 1) % currentAlbum.length);
    }

    function showPrevImage() {
        showImage((currentIndex - 1 + currentAlbum.length) % currentAlbum.length);
    }

    // --- Population Functions ---
    function populateHero(hero) {
        if (!hero) return;
        document.getElementById('hero-title').innerHTML = hero.title || '';
        document.getElementById('hero-subtitle').innerHTML = hero.subtitle || '';
        
        const heroSection = document.getElementById('home');
        if (hero.background_image) {
            heroSection.style.backgroundImage = `url(${hero.background_image})`;
        }

        const badgesContainer = document.getElementById('hero-badges');
        badgesContainer.innerHTML = '';
        if (hero.badges) {
            hero.badges.forEach(badge => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-${badge.icon}"></i> <span>${badge.text}</span>`;
                badgesContainer.appendChild(li);
            });
        }
    }

    function populateAbout(about) {
        if (!about) return;
        document.getElementById('about-description').innerHTML = about.description || '';
        
        const cardsContainer = document.getElementById('about-cards');
        cardsContainer.innerHTML = '';
        if (about.cards) {
            about.cards.forEach(card => {
                const div = document.createElement('div');
                div.className = 'about-card';
                div.innerHTML = `
                    <h3>${card.title}</h3>
                    <p>${card.text}</p>
                `;
                cardsContainer.appendChild(div);
            });
        }
    }

    function populateServices(services) {
        if (!services) return;
        const cardsContainer = document.getElementById('services-cards');
        cardsContainer.innerHTML = '';
        if (services.cards) {
            services.cards.forEach(card => {
                const article = document.createElement('article');
                article.className = 'card';
                article.innerHTML = `
                    <div class="card-image">
                        <img src="${card.image}" alt="${card.title}" loading="lazy" decoding="async" />
                    </div>
                    <h3>${card.title}</h3>
                    <p>${card.text.replace(/\n/g, '<br>')}</p>
                    <div class="hero-ctas">
                        <a href="#contato" class="btn btn-primary">Solicitar orçamento</a>
                    </div>
                `;
                cardsContainer.appendChild(article);
            });
        }
    }

    function populateTestimonials(testimonials) {
        if (!testimonials) return;
        const track = document.getElementById('testimonials-track');
        track.innerHTML = '';
        if (testimonials.testimonials) {
            testimonials.testimonials.forEach(t => {
                const figure = document.createElement('figure');
                figure.className = 'testimonial';
                figure.innerHTML = `
                    <div class="testimonial-image">
                        <img src="${t.image}" alt="Foto de ${t.author}">
                    </div>
                    <blockquote>
                        <p>“${t.quote}”</p>
                    </blockquote>
                    <figcaption>— ${t.author}</figcaption>
                `;
                track.appendChild(figure);
            });
        }
    }

    function populateGallery(gallery) {
        if (!gallery || !gallery.albums) return;
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';
        gallery.albums.forEach((album, index) => {
            const a = document.createElement('a');
            a.href = '#'; // Prevent navigation
            a.className = 'gallery-item';
            a.innerHTML = `
                <div class="gallery-title">${album.name}</div>
                <img src="${album.thumbnail}" alt="${album.name}">
            `;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (album.photos && album.photos.length > 0) {
                    openLightbox(album.photos, 0);
                }
            });
            grid.appendChild(a);
        });
    }

    function populateFooter(footer) {
        if (!footer) return;

        const descriptionEl = document.getElementById('footer-description');
        if (descriptionEl) {
            descriptionEl.innerText = footer.description || '';
        }

        const linksContainer = document.getElementById('footer-links');
        if (linksContainer) {
            linksContainer.innerHTML = `
                <li><a href="mailto:${footer.contact}">${footer.contact}</a></li>
                <li><a href="tel:${footer.phone}">${footer.phone}</a></li>
                <li>Salvador, BA</li>
            `;
        }
    }

    // --- Main Function ---
    async function loadAndPopulateContent() {
        const content = await fetchContent();
        if (content) {
            populateHero(content.hero);
            populateAbout(content.about);
            populateServices(content.services);
            populateTestimonials(content.testimonials);
            populateGallery(content.gallery);
            populateFooter(content.footer);
        }
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- Event Listeners ---
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) { // Close if clicking on the background
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
        }
    });

    // --- Initial Load ---
    loadAndPopulateContent();
});
