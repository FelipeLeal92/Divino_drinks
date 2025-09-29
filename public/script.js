// Util: ano no rodapé  
document.getElementById('year').textContent = new Date().getFullYear();

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

function initializeGallery(albumsData) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const btnClose = document.querySelector('.lightbox-close');
    const btnPrev = document.querySelector('.lightbox-prev');
    const btnNext = document.querySelector('.lightbox-next');

    if (!lightbox || !galleryItems.length) return;

    let currentAlbum = [];
    let currentIndex = 0;

    function openLightbox(albumId, index) {
        currentAlbum = albumsData[albumId] || [];
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('open');
    }

    function updateLightboxImage() {
        if (currentAlbum.length > 0 && currentAlbum[currentIndex]) {
            lightboxImage.src = currentAlbum[currentIndex].src;
            lightboxImage.alt = currentAlbum[currentIndex].alt;
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
    }

    function showPrev() {
        if (currentAlbum.length > 0) {
            currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
            updateLightboxImage();
        }
    }

    function showNext() {
        if (currentAlbum.length > 0) {
            currentIndex = (currentIndex + 1) % currentAlbum.length;
            updateLightboxImage();
        }
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const albumId = item.dataset.album;
            openLightbox(albumId, 0);
        });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', showPrev);
    btnNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}

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
  const today = new Date(); today.setHours(0,0,0,0);
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

      // Novo trecho de debug ↓
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

const socket = io();

socket.on('galleryData', (albumsData) => {
    initializeGallery(albumsData);
});


// Mensagem automatica whatsapp
document.addEventListener("DOMContentLoaded", function(){
const numeroWhatsApp = WHATSAPP_PHONE; // seu número aqui no formato internacional (55 + DDD + número)
const mensagem = "Olá, gostaria de saber mais sobre seus serviços."; // mensagem inicial

const link = document.getElementById("whatsapp-link");
const encodedMessage = encodeURIComponent(mensagem);

link.href = `https://wa.me/${numeroWhatsApp}?text=${encodedMessage}`;
});

/*==================== SHOW SCROLL UP ====================*/ 
function scrollUp(){
    const scrollUp = document.getElementById('scroll-up');
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if(window.scrollY >= 560) scrollUp.classList.add('show-scroll'); else scrollUp.classList.remove('show-scroll')
    console.log(window.scrollY)
}
window.addEventListener('scroll', scrollUp)


/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight
        const sectionTop = current.offsetTop - 50;
        sectionId = current.getAttribute('id')

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

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