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

// Variáveis globais para galeria
let galleryAlbums = {};
let currentAlbum = [];
let currentIndex = 0;

// Elementos do lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const btnClose = document.querySelector('.lightbox-close');
const btnPrev = document.querySelector('.lightbox-prev');
const btnNext = document.querySelector('.lightbox-next');

// Função para carregar dados da galeria do backend
async function loadGalleryData() {
  try {
    const response = await fetch('/api/content');
    const content = await response.json();
    
    if (content.gallery && content.gallery.albums) {
      // Limpar dados antigos
      galleryAlbums = {};
      
      // Processar álbuns do backend
      content.gallery.albums.forEach((album, index) => {
        const albumId = index + 1; // IDs começam em 1
        galleryAlbums[albumId] = album.photos.map(photoUrl => ({
          src: photoUrl,
          alt: `Foto do álbum ${album.name}`
        }));
      });
      
      // Atualizar interface da galeria
      updateGalleryInterface(content.gallery.albums);
    }
  } catch (error) {
    console.error('Erro ao carregar dados da galeria:', error);
    // Fallback para dados estáticos em caso de erro
    initializeFallbackGallery();
  }
}

// Função para atualizar a interface da galeria
function updateGalleryInterface(albums) {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) return;
  
  // Limpar galeria existente
  galleryGrid.innerHTML = '';
  
  // Criar itens da galeria baseados nos dados do backend
  albums.forEach((album, index) => {
    if (album.name && album.thumbnail) {
      const albumId = index + 1;
      const galleryItem = document.createElement('a');
      galleryItem.href = '#';
      galleryItem.className = 'gallery-item';
      galleryItem.dataset.album = albumId;
      
      galleryItem.innerHTML = `
        <div class="gallery-title">${album.name}</div>
        <img src="${album.thumbnail}" alt="${album.name}">
      `;
      
      // Adicionar event listener
      galleryItem.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(albumId, 0);
      });
      
      galleryGrid.appendChild(galleryItem);
    }
  });
}

// Função de fallback com dados estáticos
function initializeFallbackGallery() {
  galleryAlbums = {
    1: [
      { src: "imagens/large/large_drink3.webp", alt: "Foto 1 - Drinks" },
      { src: "imagens/large/large_drink2.webp", alt: "Foto 2 - Bar Clássico" },
      { src: "imagens/large/large_drink1.webp", alt: "Foto 3 - Bar Clássico" },
      { src: "imagens/large/large_drink4.webp", alt: "Foto 4 - Bar Clássico" },
      { src: "imagens/large/large_drink4.webp", alt: "Foto 4 - Bar Clássico" }
    ],
    2: [
      { src: "imagens/large/large_placa.webp", alt: "Foto 1 - Drinks Autorais" },
      { src: "imagens/large/large_tacas1.webp", alt: "Foto 2 - Drinks Autorais" },
      { src: "imagens/large/large_tacas2.webp", alt: "Foto 3 - Drinks Autorais" },
      { src: "imagens/large/large_balcao.webp", alt: "Foto 4 - Drinks Autorais" },
      { src: "imagens/large/large_balcao2.webp", alt: "Foto 5 - Drinks Autorais" },
      { src: "imagens/large/large_tacas3.webp", alt: "Foto 6 - Drinks Autorais" }
    ],
    3: [
      { src: "imagens/large/large_convidada1.webp", alt: "Foto 1 - Eventos Especiais" },
      { src: "imagens/large/large_convidada2.webp", alt: "Foto 2 - Eventos Especiais" },
      { src: "imagens/large/large_convidada3.webp", alt: "Foto 3 - Eventos Especiais" },
      { src: "imagens/large/large_convidada4.webp", alt: "Foto 4 - Eventos Especiais" },
      { src: "imagens/large/large_convidada5.webp", alt: "Foto 5 - Eventos Especiais" },
      { src: "imagens/large/large_convidada6.webp", alt: "Foto 6 - Eventos Especiais" },
      { src: "imagens/large/large_convidada7.webp", alt: "Foto 7 - Eventos Especiais" }
    ]
  };
  
  // Inicializar event listeners para galeria estática
  initializeGalleryListeners();
}

// Função para inicializar event listeners da galeria
function initializeGalleryListeners() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const albumId = item.dataset.album;
      openLightbox(albumId, 0);
    });
  });
}

// Funções do lightbox
function openLightbox(albumId, index) {
  if (!galleryAlbums[albumId]) {
    console.error('Álbum não encontrado:', albumId);
    return;
  }
  
  currentAlbum = galleryAlbums[albumId];
  currentIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden'; // Prevenir scroll da página
}

function updateLightboxImage() {
  if (currentAlbum[currentIndex]) {
    lightboxImage.src = currentAlbum[currentIndex].src;
    lightboxImage.alt = currentAlbum[currentIndex].alt;
  }
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = ''; // Restaurar scroll da página
}

function showPrev() {
  currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
  updateLightboxImage();
}

function showNext() {
  currentIndex = (currentIndex + 1) % currentAlbum.length;
  updateLightboxImage();
}

// Event listeners do lightbox
if (btnClose) btnClose.addEventListener('click', closeLightbox);
if (btnPrev) btnPrev.addEventListener('click', showPrev);
if (btnNext) btnNext.addEventListener('click', showNext);

if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
}

// Controles de teclado
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

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

// Mensagem automatica whatsapp
document.addEventListener("DOMContentLoaded", function(){
  // Verificar se a variável WHATSAPP_PHONE está definida
  const numeroWhatsApp = typeof WHATSAPP_PHONE !== 'undefined'
  const mensagem = "Olá, gostaria de saber mais sobre seus serviços.";

  const link = document.getElementById("whatsapp-link");
  if (link) {
    const encodedMessage = encodeURIComponent(mensagem);
    link.href = `https://wa.me/${numeroWhatsApp}?text=${encodedMessage}`;
  }
  
  // Carregar dados da galeria
  loadGalleryData();
});

// Socket.IO para atualizações em tempo real (se disponível)
if (typeof io !== 'undefined') {
  const socket = io();
  
  socket.on('contentUpdated', (data) => {
    if (data.section === 'gallery') {
      // Recarregar dados da galeria quando houver atualizações
      loadGalleryData();
    }
  });
  
  socket.on('galleryData', (albumsData) => {
    updateGalleryInterface(albumsData);
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
