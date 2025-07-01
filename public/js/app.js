document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const carouselContainer = document.getElementById('carouselContainer');
    const noResultsElement = document.getElementById('noResults');
    const carousel = document.querySelector('.carousel');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    
    let slides = [];
    let currentSlide = 0;
    
    // Mostrar/ocultar elementos
    function showElement(element) {
        element.style.display = 'block';
    }
    
    function hideElement(element) {
        element.style.display = 'none';
    }
    
    // Buscar imagens quando o botão é clicado
    searchButton.addEventListener('click', searchImages);
    
    // Também buscar quando Enter é pressionado
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchImages();
        }
    });
    
    // Navegação do carrossel
    prevButton.addEventListener('click', showPrevSlide);
    nextButton.addEventListener('click', showNextSlide);
    
    async function searchImages() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            errorElement.textContent = 'Por favor, digite um termo de busca.';
            showElement(errorElement);
            return;
        }
        
        // Mostrar loading e esconder outros elementos
        showElement(loadingElement);
        hideElement(errorElement);
        hideElement(carouselContainer);
        hideElement(noResultsElement);
        
        // Limpar slides anteriores
        slides = [];
        carousel.querySelectorAll('.slide').forEach(slide => slide.remove());
        
        try {
            // Fazer requisição para nossa API Express
            const response = await fetch(`/api/apod?searchTerm=${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) {
                throw new Error(await response.text());
            }
            
            const images = await response.json();
            
            if (images.length === 0) {
                showElement(noResultsElement);
            } else {
                // Criar slides para as imagens
                images.forEach((image, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    if (index === 0) slide.classList.add('active');
                    
                    slide.innerHTML = `
                        <img src="${image.url}" alt="${image.title}">
                        <div class="slide-info">
                            <h3>${image.title}</h3>
                            <p>${image.date}</p>
                        </div>
                    `;
                    
                    carousel.appendChild(slide);
                    slides.push(slide);
                });
                
                showElement(carouselContainer);
                currentSlide = 0;
            }
        } catch (error) {
            errorElement.textContent = `Erro: ${error.message}`;
            showElement(errorElement);
        } finally {
            hideElement(loadingElement);
        }
    }
    
    function showPrevSlide() {
        if (slides.length === 0) return;
        
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    function showNextSlide() {
        if (slides.length === 0) return;
        
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    // Inicializar com todos os elementos ocultos exceto o campo de busca
    hideElement(loadingElement);
    hideElement(errorElement);
    hideElement(carouselContainer);
    hideElement(noResultsElement);
});