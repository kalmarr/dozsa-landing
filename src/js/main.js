/**
 * Dózsa Apartman Szeged - Main JavaScript
 * Smooth scrolling, navigation, and general functionality
 */

(function($) {
    'use strict';

    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Initialize GLightbox for gallery and floor plan
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: true
    });

    // Navbar scroll effect
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 100) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));

        if (target.length) {
            e.preventDefault();

            // Close mobile menu if open
            $('.navbar-collapse').collapse('hide');

            $('html, body').stop().animate({
                scrollTop: target.offset().top - 90
            }, 1000, 'swing');
        }
    });

    // Add active class to nav items on scroll
    $(window).on('scroll', function() {
        const scrollPos = $(document).scrollTop() + 100;

        $('.navbar-nav a[href^="#"]').each(function() {
            const currLink = $(this);
            const refElement = $(currLink.attr('href'));

            if (refElement.length && refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
                $('.navbar-nav a').removeClass('active');
                currLink.addClass('active');
            } else {
                currLink.removeClass('active');
            }
        });
    });

    // Mobile menu close on outside click
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.navbar').length) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // Lazy loading images with fallback
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback to Intersection Observer
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Scroll to top button (optional feature)
    const scrollToTopBtn = $('<button>', {
        id: 'scrollToTop',
        class: 'scroll-to-top',
        html: '<i class="fas fa-chevron-up"></i>',
        css: {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            backgroundColor: 'var(--primary-brown)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'none',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        }
    });

    $('body').append(scrollToTopBtn);

    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 300) {
            scrollToTopBtn.fadeIn();
        } else {
            scrollToTopBtn.fadeOut();
        }
    });

    scrollToTopBtn.on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
    });

    scrollToTopBtn.hover(
        function() { $(this).css('transform', 'scale(1.1)'); },
        function() { $(this).css('transform', 'scale(1)'); }
    );

    // Prevent layout shift by setting image aspect ratios
    $('img').on('load', function() {
        const img = $(this);
        if (!img.attr('width') || !img.attr('height')) {
            const width = img.width();
            const height = img.height();
            img.attr('width', width).attr('height', height);
        }
    });

    // Console message
    console.log('%c Dózsa Apartman Szeged ', 'background: #8B4513; color: #fff; padding: 5px 10px; border-radius: 3px;');
    console.log('Website developed with care and attention to detail.');

})(jQuery);
