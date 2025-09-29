document.addEventListener('DOMContentLoaded', () => {
    let content = {};
    let serviceCounter = 0;
    let testimonialCounter = 0;
    let albumCounter = 0;

    // Funções de Carregamento e População
    async function loadContent() {
        try {
            const res = await fetch('/api/content');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            content = await res.json();
            populateForms();
        } catch (err) {
            console.error('Erro ao carregar conteúdo:', err);
            alert('Não foi possível carregar os dados do site. Verifique o console para mais detalhes.');
        }
    }

    function populateForms() {
        // Hero
        const heroBgInput = document.getElementById('hero-bg');
        if (heroBgInput) {
            heroBgInput.value = content.hero?.background_image || '';
            updatePreview(heroBgInput, 'hero-bg-preview');
            updateCurrentFile('hero-bg-current', content.hero?.background_image);
        }
        document.getElementById('hero-title').value = content.hero?.title || '';
        document.getElementById('hero-subtitle').value = content.hero?.subtitle || '';
        const badgesList = document.getElementById('hero-badges-list');
        badgesList.innerHTML = '';
        (content.hero?.badges || []).forEach((badge, i) => addHeroBadge(badge, i));

        // About
        document.getElementById('about-desc').value = content.about?.description?.replace(/\n/g, '\n') || '';
        const aboutCards = document.getElementById('about-cards');
        aboutCards.innerHTML = '';
        (content.about?.cards || []).forEach((card, i) => addAboutCard(card, i));

        // Services
        serviceCounter = 0;
        const servicesCards = document.getElementById('services-cards');
        servicesCards.innerHTML = '';
        (content.services?.cards || []).forEach(addServiceCard);

        // Testimonials
        testimonialCounter = 0;
        const testimonialsList = document.getElementById('testimonials-list');
        testimonialsList.innerHTML = '';
        (content.testimonials?.testimonials || []).forEach(addTestimonial);

        // Gallery
        albumCounter = 0;
        const albumsList = document.getElementById('albums-list');
        albumsList.innerHTML = '';
        (content.gallery?.albums || []).forEach((album, i) => addAlbum(album, i));

        // Footer
        document.getElementById('footer-description-input').value = content.footer?.description || '';
        document.getElementById('footer-contact').value = content.footer?.contact || '';
        document.getElementById('footer-phone').value = content.footer?.phone || '';
    }

    // Funções de Manipulação da UI
    function updateCurrentFile(elementId, url) {
        const element = document.getElementById(elementId);
        if (!element) return;
        if (url) {
            const filename = url.split('/').pop();
            element.textContent = `Arquivo atual: ${filename}`;
        } else {
            element.textContent = 'Nenhum arquivo selecionado';
        }
    }

    function updatePreview(input, imgId) {
        const img = document.getElementById(imgId);
        if (!img) return;
        if (input && input.value) {
            img.src = input.value;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    }

    // Funções de Adição de Elementos Dinâmicos
    function addHeroBadge(badge = {}) {
        const div = document.createElement('div');
        div.className = 'badge-item';
        div.innerHTML = `
            <label>Ícone: <input type="text" value="${badge.icon || ''}" placeholder="e.g., star" /></label>
            <label>Texto: <input type="text" value="${badge.text || ''}" /></label>
            <button type="button" class="btn-remove" data-action="remove-item">Remover</button>
        `;
        document.getElementById('hero-badges-list').appendChild(div);
    }

    function addAboutCard(card = {}) {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `
            <h3>Card</h3>
            <div class="form-group"><label>Título:</label><input type="text" value="${card.title || ''}" /></div>
            <div class="form-group"><label>Texto:</label><textarea rows="3">${card.text || ''}</textarea></div>
            <button type="button" class="btn-remove" data-action="remove-item">Remover Card</button>
        `;
        document.getElementById('about-cards').appendChild(div);
    }

    function addServiceCard(card = {}) {
        const id = `service-${serviceCounter++}`;
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `
            <h3>Serviço</h3>
            <div class="form-group">
                <label>Imagem:</label>
                <div class="file-input-container">
                    <button type="button" class="file-input-button" data-target-file="${id}-file">Selecionar Arquivo</button>
                    <input type="file" id="${id}-file" class="file-input-hidden" accept="image/*" data-hidden-input="${id}" data-preview="${id}-preview" />
                    <input type="hidden" id="${id}" value="${card.image || ''}" />
                    <div class="current-file" id="${id}-current"></div>
                </div>
                <img id="${id}-preview" class="preview" alt="Preview" style="display:none;" />
            </div>
            <div class="form-group"><label>Título:</label><input type="text" value="${card.title || ''}" /></div>
            <div class="form-group"><label>Texto:</label><textarea rows="4">${card.text?.replace(/\n/g, '\n') || ''}</textarea></div>
            <button type="button" class="btn-remove" data-action="remove-item">Remover Serviço</button>
        `;
        document.getElementById('services-cards').appendChild(div);
        updatePreview(document.getElementById(id), `${id}-preview`);
        updateCurrentFile(`${id}-current`, card.image);
    }

    function addTestimonial(t = {}) {
        const id = `testimonial-${testimonialCounter++}`;
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `
            <h3>Depoimento</h3>
            <div class="form-group">
                <label>Imagem:</label>
                <div class="file-input-container">
                    <button type="button" class="file-input-button" data-target-file="${id}-file">Selecionar Arquivo</button>
                    <input type="file" id="${id}-file" class="file-input-hidden" accept="image/*" data-hidden-input="${id}" data-preview="${id}-preview" />
                    <input type="hidden" id="${id}" value="${t.image || ''}" />
                    <div class="current-file" id="${id}-current"></div>
                </div>
                <img id="${id}-preview" class="preview" alt="Preview" style="display:none;" />
            </div>
            <div class="form-group"><label>Citação:</label><textarea rows="3">${t.quote || ''}</textarea></div>
            <div class="form-group"><label>Autor:</label><input type="text" value="${t.author || ''}" /></div>
            <button type="button" class="btn-remove" data-action="remove-item">Remover Depoimento</button>
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
            <div class="form-group"><label>Nome do Álbum:</label><input type="text" class="album-name" value="${album.name || ''}" placeholder="Ex: Drinks, Eventos, etc." /></div>
            <div class="form-group">
                <label>Capa do Álbum (Thumbnail - 400x400px):</label>
                <div class="file-input-container">
                    <button type="button" class="file-input-button" data-target-file="album-${albumId}-thumb-file">Selecionar Capa</button>
                    <input type="file" id="album-${albumId}-thumb-file" class="file-input-hidden" accept="image/*" data-hidden-input="album-${albumId}-thumb" data-preview="album-${albumId}-thumb-preview" />
                    <input type="hidden" id="album-${albumId}-thumb" class="album-thumbnail-url" value="${album.thumbnail || ''}" />
                    <div class="current-file" id="album-${albumId}-thumb-current"></div>
                </div>
                <img id="album-${albumId}-thumb-preview" class="preview album-thumbnail-preview" alt="Preview da capa" style="display:none;" />
            </div>
            <div class="form-group">
                <label>Fotos do Álbum (1200x800px):</label>
                <div class="file-input-container">
                    <button type="button" class="file-input-button" data-target-file="album-${albumId}-photos-file">Adicionar Fotos</button>
                    <input type="file" id="album-${albumId}-photos-file" class="file-input-hidden" accept="image/*" multiple data-album-id="${albumId}" />
                </div>
                <div class="album-photos-list" id="album-${albumId}-photos"></div>
            </div>
            <button type="button" class="btn-remove" data-action="remove-album">Remover Álbum</button>
        `;
        document.getElementById('albums-list').appendChild(div);
        updatePreview(document.getElementById(`album-${albumId}-thumb`), `album-${albumId}-thumb-preview`);
        updateCurrentFile(`album-${albumId}-thumb-current`, album.thumbnail);
        if (album.photos && album.photos.length > 0) {
            const photosContainer = document.getElementById(`album-${albumId}-photos`);
            album.photos.forEach(photoUrl => addPhotoToAlbum(albumId, photoUrl));
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
            <button type="button" class="btn-remove" data-action="remove-photo">Remover</button>
        `;
        photosContainer.appendChild(photoDiv);
    }

    // Funções de Upload
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

    async function handleFileUpload(fileInput) {
        if (fileInput.files.length === 0) return;
        const hiddenInputId = fileInput.dataset.hiddenInput;
        const previewId = fileInput.dataset.preview;
        const hiddenInput = document.getElementById(hiddenInputId);
        const preview = document.getElementById(previewId);
        const currentFileDiv = document.getElementById(`${hiddenInputId}-current`);

        try {
            fileInput.disabled = true;
            const url = await uploadFile(fileInput.files[0]);
            hiddenInput.value = url;
            if (preview) {
                preview.src = url;
                preview.style.display = 'block';
            }
            if (currentFileDiv) {
                updateCurrentFile(`${hiddenInputId}-current`, url);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            fileInput.disabled = false;
            fileInput.value = '';
        }
    }

    async function handleMultipleFileUpload(fileInput) {
        if (fileInput.files.length === 0) return;
        const albumId = fileInput.dataset.albumId;
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

    // Funções de Salvamento
    async function saveSection(section) {
        let data = {};
        try {
            if (section === 'hero') {
                const badges = Array.from(document.querySelectorAll('#hero-badges-list > .badge-item')).map(div => ({
                    icon: div.querySelector('input').value,
                    text: div.querySelectorAll('input')[1].value
                }));
                data = {
                    background_image: document.getElementById('hero-bg').value,
                    title: document.getElementById('hero-title').value,
                    subtitle: document.getElementById('hero-subtitle').value,
                    badges
                };
            } else if (section === 'about') {
                const cards = Array.from(document.querySelectorAll('#about-cards > .card-item')).map(div => ({
                    title: div.querySelector('input').value,
                    text: div.querySelector('textarea').value
                }));
                data = {
                    description: document.getElementById('about-desc').value.replace(/\n/g, '\\n'),
                    cards
                };
            } else if (section === 'services') {
                const cards = Array.from(document.querySelectorAll('#services-cards > .card-item')).map(div => ({
                    image: div.querySelector('input[type="hidden"]').value,
                    title: div.querySelector('input[type="text"]').value,
                    text: div.querySelector('textarea').value.replace(/\n/g, '\\n')
                }));
                data = { cards };
            } else if (section === 'testimonials') {
                const testimonials = Array.from(document.querySelectorAll('#testimonials-list > .card-item')).map(div => ({
                    image: div.querySelector('input[type="hidden"]').value,
                    quote: div.querySelector('textarea').value,
                    author: div.querySelector('input[type="text"]').value
                }));
                data = { testimonials };
            } else if (section === 'gallery') {
                const albums = Array.from(document.querySelectorAll('#albums-list > .album-item')).map(div => ({
                    name: div.querySelector('.album-name').value,
                    thumbnail: div.querySelector('.album-thumbnail-url').value,
                    photos: Array.from(div.querySelectorAll('.photo-url')).map(input => input.value).filter(Boolean)
                }));
                data = { albums };
            } else if (section === 'footer') {
                data = {
                    description: document.getElementById('footer-description-input').value,
                    contact: document.getElementById('footer-contact').value,
                    phone: document.getElementById('footer-phone').value
                };
            }

            const res = await fetch(`/api/content/${section}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Erro ao salvar');
            alert(`Seção "${section}" salva com sucesso!`);
            content[section] = data; // Atualizar conteúdo local

        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert(`Erro ao salvar: ${err.message}`);
        }
    }

    // Event Listeners
    document.body.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'remove-item') {
            if (confirm('Tem certeza que deseja remover este item?')) {
                e.target.closest('.card-item, .badge-item').remove();
            }
        } else if (action === 'remove-album') {
            if (confirm('Tem certeza que deseja remover este álbum?')) {
                e.target.closest('.album-item').remove();
            }
        } else if (action === 'remove-photo') {
            if (confirm('Tem certeza que deseja remover esta foto?')) {
                e.target.closest('.photo-item').remove();
            }
        } else if (e.target.classList.contains('file-input-button')) {
            const targetId = e.target.dataset.targetFile;
            document.getElementById(targetId)?.click();
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('file-input-hidden')) {
            if (e.target.multiple) {
                handleMultipleFileUpload(e.target);
            } else {
                handleFileUpload(e.target);
            }
        }
    });

    // Botões de Ação Principais
    document.getElementById('add-hero-badge')?.addEventListener('click', () => addHeroBadge());
    document.getElementById('save-hero')?.addEventListener('click', () => saveSection('hero'));
    document.getElementById('add-about-card')?.addEventListener('click', () => addAboutCard());
    document.getElementById('save-about')?.addEventListener('click', () => saveSection('about'));
    document.getElementById('add-service-card')?.addEventListener('click', () => addServiceCard());
    document.getElementById('save-services')?.addEventListener('click', () => saveSection('services'));
    document.getElementById('add-testimonial')?.addEventListener('click', () => addTestimonial());
    document.getElementById('save-testimonials')?.addEventListener('click', () => saveSection('testimonials'));
    document.getElementById('add-album')?.addEventListener('click', () => addAlbum());
    document.getElementById('save-gallery')?.addEventListener('click', () => saveSection('gallery'));
    document.getElementById('save-footer')?.addEventListener('click', () => saveSection('footer'));

    // Iniciar
    loadContent();
});
