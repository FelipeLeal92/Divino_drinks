
    let content = {};
    let serviceCounter = 0;
    let testimonialCounter = 0;
    let albumCounter = 0;

    async function loadContent() {
      try {
        const res = await fetch('/api/content');
        content = await res.json();
        populateForms();
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
      }
    }

    function populateForms() {
      // Hero
      const heroBgInput = document.getElementById('hero-bg');
      heroBgInput.value = content.hero?.background_image || '';
      updatePreview(heroBgInput, 'hero-bg-preview');
      updateCurrentFile('hero-bg-current', content.hero?.background_image);
      
      document.getElementById('hero-title').value = content.hero?.title || '';
      document.getElementById('hero-subtitle').value = content.hero?.subtitle || '';
      
      const badgesList = document.getElementById('hero-badges-list');
      badgesList.innerHTML = '';
      (content.hero?.badges || []).forEach((badge, i) => {
        addHeroBadge(badge, i);
      });

      // About
      document.getElementById('about-desc').value = content.about?.description?.replace(/\\n/g, '\n') || '';
      const aboutCards = document.getElementById('about-cards');
      aboutCards.innerHTML = '';
      (content.about?.cards || []).forEach((card, i) => {
        addAboutCard(card, i);
      });

      // Services
      serviceCounter = 0;
      const servicesCards = document.getElementById('services-cards');
      servicesCards.innerHTML = '';
      (content.services?.cards || []).forEach(card => {
        addServiceCard(card);
      });

      // Testimonials
      testimonialCounter = 0;
      const testimonialsList = document.getElementById('testimonials-list');
      testimonialsList.innerHTML = '';
      (content.testimonials?.testimonials || []).forEach(t => {
        addTestimonial(t);
      });

      // Gallery
      albumCounter = 0;
      const albumsList = document.getElementById('albums-list');
      albumsList.innerHTML = '';
      (content.gallery?.albums || []).forEach((album, i) => {
        addAlbum(album, i);
      });

      // Footer
      document.getElementById('footer-contact').value = content.footer?.contact || '';
      document.getElementById('footer-message').value = content.footer?.message || '';
    }

    function updateCurrentFile(elementId, url) {
      const element = document.getElementById(elementId);
      if (element) {
        if (url) {
          const filename = url.split('/').pop();
          element.textContent = `Arquivo atual: ${filename}`;
        } else {
          element.textContent = 'Nenhum arquivo selecionado';
        }
      }
    }

    function addHeroBadge(badge = {}, i = Date.now()) {
      const div = document.createElement('div');
      div.className = 'badge-item';
      div.innerHTML = `
        <label>Ícone: <input type="text" value="${badge.icon || ''}" placeholder="e.g., star" /></label>
        <label>Texto: <input type="text" value="${badge.text || ''}" /></label>
        <button class="btn-remove" onclick="removeCard(this)">Remover</button>
      `;
      document.getElementById('hero-badges-list').appendChild(div);
    }

    function addAboutCard(card = {}, i = Date.now()) {
      const div = document.createElement('div');
      div.className = 'card-item';
      div.innerHTML = `
        <h3>Card</h3>
        <div class="form-group">
          <label>Título:</label>
          <input type="text" value="${card.title || ''}" />
        </div>
        <div class="form-group">
          <label>Texto:</label>
          <textarea rows="3">${card.text || ''}</textarea>
        </div>
        <button class="btn-remove" onclick="removeCard(this)">Remover Card</button>
      `;
      document.getElementById('about-cards').appendChild(div);
    }

    function addServiceCard(card = {}) {
      const id = 'service-' + serviceCounter++;
      const div = document.createElement('div');
      div.className = 'card-item';
      div.innerHTML = `
        <h3>Serviço</h3>
        <div class="form-group">
          <label>Imagem:</label>
          <div class="file-input-container">
            <button type="button" class="file-input-button" onclick="document.getElementById('${id}-file').click()">
              Selecionar Arquivo
            </button>
            <input type="file" id="${id}-file" class="file-input-hidden" accept="image/*" onchange="uploadAndSetPreview(this, '${id}', '${id}-preview')" />
            <input type="hidden" id="${id}" value="${card.image || ''}" />
            <div class="current-file" id="${id}-current"></div>
          </div>
          <img id="${id}-preview" class="preview" alt="Preview" style="display:none;" />
        </div>
        <div class="form-group">
          <label>Título:</label>
          <input type="text" value="${card.title || ''}" />
        </div>
        <div class="form-group">
          <label>Texto:</label>
          <textarea rows="4">${card.text?.replace(/\\n/g, '\n') || ''}</textarea>
        </div>
        <button class="btn-remove" onclick="removeCard(this)">Remover Serviço</button>
      `;
      document.getElementById('services-cards').appendChild(div);
      updatePreview(document.getElementById(id), `${id}-preview`);
      updateCurrentFile(`${id}-current`, card.image);
    }

    function addTestimonial(t = {}) {
      const id = 'testimonial-' + testimonialCounter++;
      const div = document.createElement('div');
      div.className = 'card-item';
      div.innerHTML = `
        <h3>Depoimento</h3>
        <div class="form-group">
          <label>Imagem:</label>
          <div class="file-input-container">
            <button type="button" class="file-input-button" onclick="document.getElementById('${id}-file').click()">
              Selecionar Arquivo
            </button>
            <input type="file" id="${id}-file" class="file-input-hidden" accept="image/*" onchange="uploadAndSetPreview(this, '${id}', '${id}-preview')" />
            <input type="hidden" id="${id}" value="${t.image || ''}" />
            <div class="current-file" id="${id}-current"></div>
          </div>
          <img id="${id}-preview" class="preview" alt="Preview" style="display:none;" />
        </div>
        <div class="form-group">
          <label>Citação:</label>
          <textarea rows="3">${t.quote || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Autor:</label>
          <input type="text" value="${t.author || ''}" />
        </div>
        <button class="btn-remove" onclick="removeCard(this)">Remover Depoimento</button>
      `;
      document.getElementById('testimonials-list').appendChild(div);
      updatePreview(document.getElementById(id), `${id}-preview`);
      updateCurrentFile(`${id}-current`, t.image);
    }

    function addAlbum(album = { name: '', thumbnail: '', photos: [] }, i = null) {
      const albumId = i !== null ? i : albumCounter++;
      const div = document.createElement('div');
      div.className = 'card-item album-item';
      div.dataset.albumId = albumId;
      div.innerHTML = `
        <h3>Álbum ${albumId + 1}</h3>
        <div class="form-group">
          <label>Nome do Álbum:</label>
          <input type="text" class="album-name" value="${album.name || ''}" placeholder="Ex: Drinks, Eventos, etc." />
        </div>
        <div class="form-group">
          <label>Capa do Álbum (Thumbnail - 400x400px):</label>
          <div class="file-input-container">
            <button type="button" class="file-input-button" onclick="document.getElementById('album-${albumId}-thumb-file').click()">
              Selecionar Capa
            </button>
            <input type="file" id="album-${albumId}-thumb-file" class="file-input-hidden" accept="image/*" onchange="uploadAndSetPreview(this, 'album-${albumId}-thumb', 'album-${albumId}-thumb-preview')" />
            <input type="hidden" id="album-${albumId}-thumb" class="album-thumbnail-url" value="${album.thumbnail || ''}" />
            <div class="current-file" id="album-${albumId}-thumb-current"></div>
          </div>
          <img id="album-${albumId}-thumb-preview" class="preview album-thumbnail-preview" alt="Preview da capa" style="display:none;" />
          <p style="font-size: 12px; color: var(--text-light); margin-top: 5px;">Formato: quadrado (400x400px)</p>
        </div>
        <div class="form-group">
          <label>Fotos do Álbum (1200x800px):</label>
          <div class="file-input-container">
            <button type="button" class="file-input-button" onclick="document.getElementById('album-${albumId}-photos-file').click()">
              Adicionar Fotos
            </button>
            <input type="file" id="album-${albumId}-photos-file" class="file-input-hidden" accept="image/*" multiple onchange="uploadAndAddPhotos(this, ${albumId})" />
          </div>
          <div class="album-photos-list" id="album-${albumId}-photos">
          </div>
          <p style="font-size: 12px; color: var(--text-light); margin-top: 5px;">Formato: horizontal (1200x800px)</p>
        </div>
        <button type="button" class="btn-remove" onclick="removeAlbum(this)">Remover Álbum</button>
      `;
      document.getElementById('albums-list').appendChild(div);
      
      // Atualizar preview da capa
      updatePreview(document.getElementById(`album-${albumId}-thumb`), `album-${albumId}-thumb-preview`);
      updateCurrentFile(`album-${albumId}-thumb-current`, album.thumbnail);
      
      // Adicionar fotos existentes
      if (album.photos && album.photos.length > 0) {
        const photosContainer = document.getElementById(`album-${albumId}-photos`);
        album.photos.forEach(photoUrl => {
          addPhotoToAlbum(albumId, photoUrl);
        });
      }
    }

    function addPhotoToAlbum(albumId, photoUrl) {
      const photosContainer = document.getElementById(`album-${albumId}-photos`);
      const photoDiv = document.createElement('div');
      photoDiv.className = 'photo-item';
      photoDiv.innerHTML = `
        <img src="${photoUrl}" class="photo-preview" alt="Foto do álbum" />
        <div class="photo-info">
          <div class="photo-url-display">${photoUrl}</div>
          <input type="hidden" class="photo-url" value="${photoUrl}" />
        </div>
        <button type="button" class="btn-remove" onclick="removePhoto(this)">Remover</button>
      `;
      photosContainer.appendChild(photoDiv);
    }

    function removeAlbum(btn) {
      if (confirm('Tem certeza que deseja remover este álbum?')) {
        btn.closest('.album-item').remove();
      }
    }

    function removePhoto(btn) {
      if (confirm('Tem certeza que deseja remover esta foto?')) {
        btn.closest('.photo-item').remove();
      }
    }

    function removeCard(btn) {
      if (confirm('Tem certeza que deseja remover este item?')) {
        btn.closest('.card-item, .badge-item').remove();
      }
    }

    function updatePreview(input, imgId) {
      const img = document.getElementById(imgId);
      if (input && input.value && img) {
        img.src = input.value;
        img.style.display = 'block';
      } else if (img) {
        img.style.display = 'none';
      }
    }

    async function uploadFile(file) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Falha no upload' }));
          throw new Error(errorData.error);
        }
        const result = await res.json();
        return result.url;
      } catch (err) {
        throw new Error(`Erro no upload: ${err.message}`);
      }
    }

    async function uploadAndSetPreview(fileInput, hiddenInputId, previewId) {
      if (fileInput.files.length === 0) return;
      
      const hiddenInput = document.getElementById(hiddenInputId);
      const preview = document.getElementById(previewId);
      const currentFileDiv = document.getElementById(hiddenInputId + '-current');
      
      try {
        fileInput.disabled = true;
        const url = await uploadFile(fileInput.files[0]);
        
        hiddenInput.value = url;
        if (preview) {
          preview.src = url;
          preview.style.display = 'block';
        }
        if (currentFileDiv) {
          updateCurrentFile(hiddenInputId + '-current', url);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        fileInput.disabled = false;
        fileInput.value = '';
      }
    }

    async function uploadAndAddPhotos(fileInput, albumId) {
      if (fileInput.files.length === 0) return;
      
      try {
        fileInput.disabled = true;
        for (const file of fileInput.files) {
          const url = await uploadFile(file);
          addPhotoToAlbum(albumId, url);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        fileInput.disabled = false;
        fileInput.value = '';
      }
    }

    async function saveSection(section) {
      let data = {};
      
      try {
        if (section === 'hero') {
          const badges = [];
          document.querySelectorAll('#hero-badges-list > .badge-item').forEach(div => {
            const inputs = div.querySelectorAll('input');
            badges.push({
              icon: inputs[0].value,
              text: inputs[1].value
            });
          });
          data = {
            background_image: document.getElementById('hero-bg').value,
            title: document.getElementById('hero-title').value,
            subtitle: document.getElementById('hero-subtitle').value,
            badges
          };
        } else if (section === 'about') {
          const cards = [];
          document.querySelectorAll('#about-cards > .card-item').forEach(div => {
            const inputs = div.querySelectorAll('input, textarea');
            cards.push({
              title: inputs[0].value,
              text: inputs[1].value
            });
          });
          data = {
            description: document.getElementById('about-desc').value.replace(/\n/g, '\\n'),
            cards
          };
        } else if (section === 'services') {
          const cards = [];
          document.querySelectorAll('#services-cards > .card-item').forEach(div => {
            const inputs = div.querySelectorAll('input, textarea');
            const hiddenInput = div.querySelector('input[type="hidden"]');
            cards.push({
              image: hiddenInput ? hiddenInput.value : '',
              title: inputs[inputs.length - 2].value,
              text: inputs[inputs.length - 1].value.replace(/\n/g, '\\n')
            });
          });
          data = { cards };
        } else if (section === 'testimonials') {
          const testimonials = [];
          document.querySelectorAll('#testimonials-list > .card-item').forEach(div => {
            const inputs = div.querySelectorAll('input, textarea');
            const hiddenInput = div.querySelector('input[type="hidden"]');
            testimonials.push({
              image: hiddenInput ? hiddenInput.value : '',
              quote: inputs[inputs.length - 2].value,
              author: inputs[inputs.length - 1].value
            });
          });
          data = { testimonials };
        } else if (section === 'gallery') {
          const albums = [];
          document.querySelectorAll('#albums-list > .album-item').forEach(div => {
            const name = div.querySelector('.album-name').value;
            const thumbnail = div.querySelector('.album-thumbnail-url').value;
            const photos = [];
            div.querySelectorAll('.photo-url').forEach(input => {
              if (input.value) photos.push(input.value);
            });
            albums.push({ name, thumbnail, photos });
          });
          data = { albums };
        } else if (section === 'footer') {
          data = {
            contact: document.getElementById('footer-contact').value,
            message: document.getElementById('footer-message').value
          };
        }

        const res = await fetch(`/api/content/${section}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          throw new Error('Erro ao salvar');
        }

        alert(`Seção "${section}" salva com sucesso!`);
        
        // Atualizar conteúdo local
        content[section] = data;
        
      } catch (err) {
        console.error('Erro ao salvar:', err);
        alert('Erro ao salvar: ' + err.message);
      }
    }

    // Carregar conteúdo ao inicializar
    document.addEventListener('DOMContentLoaded', loadContent);
  