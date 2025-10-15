/**
 * Dózsa Apartman Szeged - Hero Slider
 * Automatic slideshow with manual controls
 */

(function($) {
    'use strict';

    const Slider = {
        slides: [],
        currentSlide: 0,
        slideInterval: null,
        autoplayDelay: 5000,
        transitionDuration: 1500,

        init: function() {
            this.slides = $('.hero-slide');

            if (this.slides.length === 0) {
                return;
            }

            this.createDots();
            this.bindEvents();
            this.startAutoplay();

            // Preload images
            this.preloadImages();
        },

        preloadImages: function() {
            this.slides.each(function() {
                const bgImage = $(this).css('background-image');
                const imageUrl = bgImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');

                if (imageUrl && imageUrl !== 'none') {
                    const img = new Image();
                    img.src = imageUrl;
                }
            });
        },

        createDots: function() {
            const dotsContainer = $('.slider-dots');
            dotsContainer.empty();

            this.slides.each((index) => {
                const dot = $('<span>', {
                    class: 'slider-dot' + (index === 0 ? ' active' : ''),
                    'data-slide': index
                });
                dotsContainer.append(dot);
            });
        },

        bindEvents: function() {
            const self = this;

            // Previous button
            $('.slider-prev').on('click', function() {
                self.stopAutoplay();
                self.previousSlide();
                self.startAutoplay();
            });

            // Next button
            $('.slider-next').on('click', function() {
                self.stopAutoplay();
                self.nextSlide();
                self.startAutoplay();
            });

            // Dot navigation
            $('.slider-dot').on('click', function() {
                const slideIndex = $(this).data('slide');
                self.stopAutoplay();
                self.goToSlide(slideIndex);
                self.startAutoplay();
            });

            // Pause on hover
            $('.hero-slider').hover(
                function() { self.stopAutoplay(); },
                function() { self.startAutoplay(); }
            );

            // Keyboard navigation
            $(document).on('keydown', function(e) {
                if ($('.hero-section').length) {
                    if (e.key === 'ArrowLeft') {
                        self.stopAutoplay();
                        self.previousSlide();
                        self.startAutoplay();
                    } else if (e.key === 'ArrowRight') {
                        self.stopAutoplay();
                        self.nextSlide();
                        self.startAutoplay();
                    }
                }
            });

            // Pause when tab is not visible
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    self.stopAutoplay();
                } else {
                    self.startAutoplay();
                }
            });
        },

        goToSlide: function(index) {
            if (index === this.currentSlide) {
                return;
            }

            // Remove active class from current slide
            this.slides.eq(this.currentSlide).removeClass('active');
            $('.slider-dot').eq(this.currentSlide).removeClass('active');

            // Update current slide
            this.currentSlide = index;

            // Add active class to new slide
            this.slides.eq(this.currentSlide).addClass('active');
            $('.slider-dot').eq(this.currentSlide).addClass('active');
        },

        nextSlide: function() {
            const nextIndex = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(nextIndex);
        },

        previousSlide: function() {
            const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prevIndex);
        },

        startAutoplay: function() {
            const self = this;

            this.stopAutoplay(); // Clear any existing interval

            this.slideInterval = setInterval(function() {
                self.nextSlide();
            }, this.autoplayDelay);
        },

        stopAutoplay: function() {
            if (this.slideInterval) {
                clearInterval(this.slideInterval);
                this.slideInterval = null;
            }
        }
    };

    // Initialize slider when document is ready
    $(document).ready(function() {
        Slider.init();
    });

})(jQuery);
