/**
 * Dózsa Apartman Szeged - Gallery Filter & Lightbox
 * Filterable image gallery with lightbox functionality
 */

(function($) {
    'use strict';

    const Gallery = {
        lightboxInstance: null,

        images: {
            rooms: [
                'room_01_001.jpg', 'room_01_002.jpg', 'room_01_003.jpg', 'room_01_004.jpg',
                'room_01_005.jpg', 'room_01_006.jpg', 'room_01_007.jpg', 'room_01_008.jpg',
                'room_01_009.jpg', 'room_01_010.jpg', 'room_01_011.jpg', 'room_01_012.jpg',
                'room_02_001.jpg', 'room_02_002.jpg', 'room_02_003.jpg', 'room_02_004.jpg',
                'room_02_005.jpg', 'room_02_006.jpg', 'room_02_007.jpg', 'room_02_008.jpg',
                'room_02_009.jpg', 'room_02_010.jpg', 'room_02_011.jpg'
            ],
            bathrooms: [
                'furdo_01_001.jpg', 'furdo_01_002.jpg', 'furdo_01_003.jpg', 'furdo_01_004.jpg',
                'furdo_02_001.jpg', 'furdo_02_002.jpg', 'furdo_02_003.jpg', 'furdo_02_004.jpg'
            ],
            interior: [
                'belso_001.jpg', 'belso_002.jpg', 'belso_003.jpg', 'belso_004.jpg',
                'belso_005.jpg', 'belso_006.jpg', 'belso_007.jpg'
            ],
            exterior: [
                'kulso_001.jpg', 'kulso_002.jpg', 'kulso_003.jpg', 'kulso_004.jpg',
                'kulso_005.jpg', 'kulso_006.jpg', 'kulso_007.jpg', 'kulso_008.jpg',
                'kulso_009.jpg'
            ]
        },

        categoryLabels: {
            bathrooms: 'Fürdőszobák',
            interior: 'Belső terek',
            exterior: 'Külső'
        },

        init: function() {
            this.renderRoomGalleries();
            this.renderGallery();
            this.bindFilterEvents();
            this.initLightbox();
        },

        renderRoomGalleries: function() {
            // Render Room 1 Main Image + Hidden Gallery
            const room1MainImage = $('#room1MainImage');
            const room1Gallery = $('#room1Gallery');
            const room1Images = this.images.rooms.filter(img => img.startsWith('room_01'));
            const room1CoverImageName = 'room_01_001.jpg'; // Cover image shown on page
            const room1FirstGalleryImage = 'room_01_008.jpg'; // First image in lightbox

            if (room1MainImage.length && room1Images.length > 0) {
                // Create main cover image with click handler - opens to room_01_008
                const mainImageLink = $('<a>', {
                    href: `images/gallery/rooms/${room1FirstGalleryImage}`,
                    class: 'glightbox',
                    'data-gallery': 'room1',
                    'data-glightbox': 'title: Szoba 1'
                });

                const mainImg = $('<img>', {
                    src: `images/gallery/rooms/${room1CoverImageName}`,
                    alt: 'Szoba 1',
                    class: 'img-fluid'
                });

                const overlay = $('<div>', { class: 'view-gallery-overlay' })
                    .append($('<i>', { class: 'fas fa-images' }))
                    .append($('<span>').text(`${room1Images.length} kép megtekintése`));

                mainImageLink.append(mainImg).append(overlay);
                room1MainImage.append(mainImageLink);

                // Create hidden gallery links for lightbox (all images except the first gallery image)
                room1Images.filter(img => img !== room1FirstGalleryImage).forEach(image => {
                    const link = $('<a>', {
                        href: `images/gallery/rooms/${image}`,
                        class: 'glightbox',
                        'data-gallery': 'room1',
                        'data-glightbox': 'title: Szoba 1'
                    });
                    room1Gallery.append(link);
                });
            }

            // Render Room 2 Main Image + Hidden Gallery
            const room2MainImage = $('#room2MainImage');
            const room2Gallery = $('#room2Gallery');
            const room2Images = this.images.rooms.filter(img => img.startsWith('room_02'));

            if (room2MainImage.length && room2Images.length > 0) {
                // Create main image with click handler
                const mainImageLink = $('<a>', {
                    href: `images/gallery/rooms/${room2Images[0]}`,
                    class: 'glightbox',
                    'data-gallery': 'room2',
                    'data-glightbox': 'title: Szoba 2'
                });

                const mainImg = $('<img>', {
                    src: `images/gallery/rooms/${room2Images[0]}`,
                    alt: 'Szoba 2',
                    class: 'img-fluid'
                });

                const overlay = $('<div>', { class: 'view-gallery-overlay' })
                    .append($('<i>', { class: 'fas fa-images' }))
                    .append($('<span>').text(`${room2Images.length} kép megtekintése`));

                mainImageLink.append(mainImg).append(overlay);
                room2MainImage.append(mainImageLink);

                // Create hidden gallery links for lightbox
                room2Images.slice(1).forEach(image => {
                    const link = $('<a>', {
                        href: `images/gallery/rooms/${image}`,
                        class: 'glightbox',
                        'data-gallery': 'room2',
                        'data-glightbox': 'title: Szoba 2'
                    });
                    room2Gallery.append(link);
                });
            }
        },

        renderGallery: function(filter = 'all') {
            const galleryGrid = $('#galleryGrid');
            galleryGrid.empty();

            // Combine all images with their categories (excluding rooms)
            const allImages = [];

            Object.keys(this.images).forEach(category => {
                // Skip rooms category
                if (category === 'rooms') return;

                this.images[category].forEach(image => {
                    allImages.push({
                        category: category,
                        filename: image,
                        path: `images/gallery/${category}/${image}`
                    });
                });
            });

            // Filter images based on selected filter
            const filteredImages = filter === 'all'
                ? allImages
                : allImages.filter(img => img.category === filter);

            // Render gallery items with animation delay
            filteredImages.forEach((image, index) => {
                const galleryItem = this.createGalleryItem(image, index);
                galleryGrid.append(galleryItem);
            });

            // Reinitialize AOS for new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }

            // Reinitialize lightbox
            this.initLightbox();
        },

        createGalleryItem: function(image, index) {
            const delay = Math.min(index * 50, 400); // Max delay of 400ms

            const item = $('<div>', {
                class: `gallery-item ${image.category}`,
                'data-aos': 'fade-up',
                'data-aos-delay': delay
            });

            const link = $('<a>', {
                href: image.path,
                class: 'glightbox',
                'data-gallery': 'gallery',
                'data-glightbox': `title: ${this.categoryLabels[image.category]}`
            });

            const img = $('<img>', {
                src: image.path,
                alt: this.categoryLabels[image.category],
                loading: 'lazy'
            });

            const overlay = $('<div>', {
                class: 'gallery-overlay'
            }).append($('<i>', {
                class: 'fas fa-search-plus'
            }));

            link.append(img).append(overlay);
            item.append(link);

            return item;
        },

        bindFilterEvents: function() {
            const self = this;

            $('.filter-btn').on('click', function() {
                const filter = $(this).data('filter');

                // Update active button
                $('.filter-btn').removeClass('active');
                $(this).addClass('active');

                // Filter gallery with fade effect
                $('#galleryGrid').fadeOut(300, function() {
                    self.renderGallery(filter);
                    $(this).fadeIn(300);
                });
            });
        },

        initLightbox: function() {
            // Destroy any existing instance first
            if (this.lightboxInstance) {
                try {
                    this.lightboxInstance.destroy();
                } catch(e) {
                    console.log('Error destroying lightbox:', e);
                }
                this.lightboxInstance = null;
            }

            // Create fresh instance
            if (typeof GLightbox !== 'undefined') {
                this.lightboxInstance = GLightbox({
                    touchNavigation: true,
                    loop: true,
                    autoplayVideos: false,
                    selector: '.glightbox',
                    openEffect: 'fade',
                    closeEffect: 'fade'
                });
                console.log('GLightbox initialized with', document.querySelectorAll('.glightbox').length, 'elements');
            } else {
                console.error('GLightbox library not loaded');
            }
        }
    };

    // Initialize gallery when document is ready
    $(document).ready(function() {
        if ($('#galleryGrid').length || $('#room1Gallery').length || $('#room2Gallery').length) {
            Gallery.init();

            // Debug click handler
            $(document).on('click', '.glightbox', function(e) {
                console.log('Lightbox element clicked:', this.href);
            });

            // Extra check to ensure lightbox is initialized after everything loads
            $(window).on('load', function() {
                console.log('Window loaded, reinitializing lightbox');
                Gallery.initLightbox();
            });
        }
    });

})(jQuery);
