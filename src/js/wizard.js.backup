/**
 * Dózsa Apartman Szeged - Booking Wizard
 * Multi-step booking form with validation
 */

(function($) {
    'use strict';

    const BookingWizard = {
        currentStep: 1,
        totalSteps: 4,
        formData: {},

        init: function() {
            this.setupDatePickers();
            this.bindEvents();
            this.showStep(1);
        },

        setupDatePickers: function() {
            const today = new Date();
            const minDate = new Date(today.setDate(today.getDate() + 2));
            const minDateStr = minDate.toISOString().split('T')[0];

            $('#checkin').attr('min', minDateStr);

            // Update checkout minimum when checkin changes
            $('#checkin').on('change', function() {
                const checkinDate = new Date($(this).val());
                checkinDate.setDate(checkinDate.getDate() + 1);
                const minCheckout = checkinDate.toISOString().split('T')[0];
                $('#checkout').attr('min', minCheckout);
            });
        },

        bindEvents: function() {
            const self = this;

            // Next button
            $(document).on('click', '.wizard-next', function() {
                if (self.validateStep(self.currentStep)) {
                    self.saveStepData(self.currentStep);
                    self.nextStep();
                }
            });

            // Previous button
            $(document).on('click', '.wizard-prev', function() {
                self.prevStep();
            });

            // Form submission
            $('#bookingForm').on('submit', function(e) {
                e.preventDefault();
                self.submitForm();
            });

            // Progress bar click navigation
            $(document).on('click', '.progress-step', function() {
                const stepNum = $(this).data('step');
                if (stepNum < self.currentStep) {
                    self.goToStep(stepNum);
                }
            });
        },

        showStep: function(stepNum) {
            $('.wizard-step').removeClass('active');
            $(`.wizard-step[data-step="${stepNum}"]`).addClass('active');

            $('.progress-step').removeClass('active completed');

            // Mark previous steps as completed
            for (let i = 1; i < stepNum; i++) {
                $(`.progress-step[data-step="${i}"]`).addClass('completed');
            }

            // Mark current step as active
            $(`.progress-step[data-step="${stepNum}"]`).addClass('active');

            this.currentStep = stepNum;
            this.updateButtons();
        },

        updateButtons: function() {
            const prevBtn = $('.wizard-prev');
            const nextBtn = $('.wizard-next');
            const submitBtn = $('.wizard-submit');

            if (this.currentStep === 1) {
                prevBtn.hide();
            } else {
                prevBtn.show();
            }

            if (this.currentStep === this.totalSteps) {
                nextBtn.hide();
                submitBtn.show();
            } else {
                nextBtn.show();
                submitBtn.hide();
            }
        },

        validateStep: function(stepNum) {
            const step = $(`.wizard-step[data-step="${stepNum}"]`);
            const inputs = step.find('input[required], select[required]');
            let isValid = true;

            inputs.each(function() {
                const input = $(this);
                if (!input.val()) {
                    isValid = false;
                    input.addClass('is-invalid');

                    if (!input.next('.invalid-feedback').length) {
                        input.after('<div class="invalid-feedback">Ez a mező kötelező</div>');
                    }
                } else {
                    input.removeClass('is-invalid');
                    input.next('.invalid-feedback').remove();
                }
            });

            // Date validation
            if (stepNum === 1) {
                const checkin = $('#checkin').val();
                const checkout = $('#checkout').val();

                if (checkin && checkout) {
                    const checkinDate = new Date(checkin);
                    const checkoutDate = new Date(checkout);

                    if (checkoutDate <= checkinDate) {
                        isValid = false;
                        $('#checkout').addClass('is-invalid');
                        if (!$('#checkout').next('.invalid-feedback').length) {
                            $('#checkout').after('<div class="invalid-feedback">A távozás dátuma későbbi kell legyen</div>');
                        }
                    }
                }
            }

            // Email validation
            if (stepNum === 4) {
                const email = $('#email').val();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (email && !emailRegex.test(email)) {
                    isValid = false;
                    $('#email').addClass('is-invalid');
                    if (!$('#email').next('.invalid-feedback').length) {
                        $('#email').after('<div class="invalid-feedback">Érvénytelen email cím</div>');
                    }
                }
            }

            return isValid;
        },

        saveStepData: function(stepNum) {
            const step = $(`.wizard-step[data-step="${stepNum}"]`);
            const inputs = step.find('input, select, textarea');

            inputs.each((index, input) => {
                const $input = $(input);
                this.formData[$input.attr('name')] = $input.val();
            });
        },

        nextStep: function() {
            if (this.currentStep < this.totalSteps) {
                this.showStep(this.currentStep + 1);
            }
        },

        prevStep: function() {
            if (this.currentStep > 1) {
                this.showStep(this.currentStep - 1);
            }
        },

        goToStep: function(stepNum) {
            this.showStep(stepNum);
        },

        submitForm: function() {
            if (!this.validateStep(this.currentStep)) {
                return;
            }

            this.saveStepData(this.currentStep);

            const submitBtn = $('.wizard-submit');
            submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Küldés...');

            $.ajax({
                url: $('#bookingForm').attr('action'),
                method: 'POST',
                data: this.formData,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        $('#formMessage')
                            .removeClass('alert-danger')
                            .addClass('alert alert-success')
                            .html('<i class="fas fa-check-circle me-2"></i>' + response.message)
                            .fadeIn();

                        // Reset form after 2 seconds
                        setTimeout(function() {
                            $('#bookingForm')[0].reset();
                            BookingWizard.showStep(1);
                            $('#formMessage').fadeOut();
                        }, 3000);
                    } else {
                        $('#formMessage')
                            .removeClass('alert-success')
                            .addClass('alert alert-danger')
                            .html('<i class="fas fa-exclamation-circle me-2"></i>' + response.message)
                            .fadeIn();
                    }
                },
                error: function() {
                    $('#formMessage')
                        .removeClass('alert-success')
                        .addClass('alert alert-danger')
                        .html('<i class="fas fa-exclamation-circle me-2"></i>Hiba történt. Kérjük próbálja újra később.')
                        .fadeIn();
                },
                complete: function() {
                    submitBtn.prop('disabled', false).html('<i class="fas fa-paper-plane me-2"></i>Ajánlatot kérek');
                }
            });
        }
    };

    // Initialize wizard when document is ready
    $(document).ready(function() {
        if ($('#bookingForm').length) {
            BookingWizard.init();
        }
    });

})(jQuery);
