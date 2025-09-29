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

    // Menu mobile
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Fechar ao clicar em link
      nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') nav.classList.remove('open');
      });
    }

    // Carousel simples
    (function carousel(){
      const track = document.querySelector('.carousel-track');
      const prev = document.querySelector('.carousel .prev');
      const next = document.querySelector('.carousel .next');
      if (!track) return;
      let index = 0;
      const slides = Array.from(track.children);

      function update(direction){
        index = (index + direction + slides.length) % slides.length;
        track.scrollTo({ left: slides[index].offsetLeft, behavior: 'smooth' });
      }
      prev.addEventListener('click', () => update(-1));
      next.addEventListener('click', () => update(1));
      // Auto-play leve
      setInterval(() => update(1), 7000);
    })();

    // Formulário: máscara simples de telefone e validações
    const tel = document.getElementById('telefone');
    if (tel) {
      tel.addEventListener('input', () => {
        let v = tel.value.replace(/\D/g,'').slice(0,11);
        if (v.length > 6) tel.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
        else if (v.length > 2) tel.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else tel.value = v;
      });
    }

    // Data mínima = hoje
    const dataEvento = document.getElementById('dataEvento');
    if (dataEvento) {
      const today = new Date(); 
      today.setHours(0,0,0,0);
      const iso = today.toISOString().split('T')[0];
      dataEvento.min = iso;
    }

    // Envio do formulário (para backend Node)
    const form = document.getElementById('lead-form');
    const statusEl = document.querySelector('.form-status');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusEl.textContent = 'Enviando...';

        const payload = {
          nome: form.nome.value.trim(),
          email: form.email.value.trim(),
          telefone: form.telefone.value.trim(),
          tipoEvento: form.tipoEvento.value,
          dataEvento: form.dataEvento.value,
          convidados: Number(form.convidados.value),
          mensagem: form.mensagem.value.trim()
        };

        // Validações simples
        if (
          !payload.nome ||
          !payload.email ||
          !payload.telefone ||
          !payload.tipoEvento ||
          !payload.dataEvento ||
          !payload.convidados
        ) {
          statusEl.style.color = '#ffb7b7';
          statusEl.textContent = 'Por favor, preencha todos os campos obrigatórios.';
          return;
        }

        try {
          const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json().catch(() => ({}));
          console.log('Resposta do servidor:', res.status, data);

          if (!res.ok) {
            throw new Error(data.error || 'Falha no envio');
          }

          statusEl.style.color = '#b7ffb7';
          statusEl.textContent = 'Recebemos seu pedido! Em breve entraremos em contato.';
          form.reset();
        } catch (err) {
          console.error('Erro no envio:', err);
          statusEl.style.color = '#ffb7b7';
          statusEl.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
        }
      });
    }

    /*==================== SHOW SCROLL UP ====================*/ 
    function scrollUp(){
        const scrollUp = document.getElementById('scroll-up');
        if (scrollUp) {
          // When the scroll is higher than 560 viewport height, add the show-scroll class
          if(window.scrollY >= 560) {
            scrollUp.classList.add('show-scroll');
          } else {
            scrollUp.classList.remove('show-scroll');
          }
        }
    }
    window.addEventListener('scroll', scrollUp);

    /*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
    const sections = document.querySelectorAll('section[id]');

    function scrollActive(){
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector('.nav a[href*=' + sectionId + ']');

            if (navLink) {
              if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
                  navLink.classList.add('active-link');
              } else {
                  navLink.classList.remove('active-link');
              }
            }
        });
    }
    window.addEventListener('scroll', scrollActive);

    /*==================== SMOOTH SCROLLING ====================*/
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Initial Load ---
    loadAndPopulateContent();
});