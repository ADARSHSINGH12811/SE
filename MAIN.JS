document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // STICKY HEADER & SCROLL EFFECTS
    // ==========================================================================
    const headerNav = document.querySelector('.header-nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            headerNav.classList.add('scrolled');
        } else {
            headerNav.classList.remove('scrolled');
        }
    });
    // ==========================================================================
    // MOBILE NAVIGATION (HAMBURGER)
    // ==========================================================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Prevent scrolling when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    // ==========================================================================
    // DYNAMIC STATS COUNTER ANIMATION
    // ==========================================================================
    const statsSection = document.querySelector('.stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;
    const startCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const isPercent = stat.textContent.includes('%');
            const isPlus = stat.textContent.includes('+');
            const speed = 200; // lower is slower
            
            let current = 0;
            const increment = target / speed;
            
            const updateCount = () => {
                current += increment;
                if (current < target) {
                    if (Number.isInteger(target)) {
                        stat.textContent = Math.ceil(current) + (isPercent ? '%' : '') + (isPlus ? '+' : '');
                    } else {
                        stat.textContent = current.toFixed(1) + (isPercent ? '%' : '') + (isPlus ? '+' : '');
                    }
                    setTimeout(updateCount, 1);
                } else {
                    stat.textContent = target + (isPercent ? '%' : '') + (isPlus ? '+' : '');
                }
            };
            
            updateCount();
        });
    };
    if (statsSection && statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    startCounters();
                    countersStarted = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
    // ==========================================================================
    // BEFORE-AND-AFTER DRAGGABLE SLIDER
    // ==========================================================================
    const slider = document.getElementById("baSlider");
    const afterImage = document.getElementById("afterImage");
    const handle = document.getElementById("baHandle");
    
    let isDragging = false;
    function moveSlider(x) {
        const rect = slider.getBoundingClientRect();
        let position = ((x - rect.left) / rect.width) * 100;
        if (position < 0) position = 0;
        if (position > 100) position = 100;
        
        afterImage.style.width = position + "%";
        handle.style.left = position + "%";
    }
    
    handle.addEventListener("mousedown", () => isDragging = true);
    window.addEventListener("mouseup", () => isDragging = false);

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        moveSlider(e.clientX);
    }
);

/* mobile support */
handle.addEventListener("touchstart", () => isDragging = true);
window.addEventListener("touchend", () => isDragging = false);

window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    moveSlider(e.touches[0].clientX);
});
    // ==========================================================================
    // PORTFOLIO FILTERING
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Set active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filterValue = button.getAttribute('data-filter');
                
                portfolioItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 400); // match transition speed
                    }
                });
            });
        });
    }
    // ==========================================================================
    // PORTFOLIO LIGHTBOX GALLERY
    // ==========================================================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let currentGalleryItems = [];
    let currentIndex = 0;
    const updateLightbox = () => {
        if (currentGalleryItems.length === 0) return;
        const item = currentGalleryItems[currentIndex];
        
        // Temporarily hide image to fade in new image
        lightboxImg.style.opacity = 0;
        
        setTimeout(() => {
            lightboxImg.src = item.src;
            lightboxCaption.textContent = item.title;
            lightboxCategory.textContent = item.category;
            lightboxImg.style.opacity = 1;
        }, 150);
    };
    if (lightbox && portfolioItems.length > 0) {
        portfolioItems.forEach(item => {
            item.addEventListener('click', () => {
                // Find all items that are currently visible on screen to navigate through them
                const visibleItems = Array.from(portfolioItems).filter(el => el.style.display !== 'none');
                
                currentGalleryItems = visibleItems.map(el => {
                    const img = el.querySelector('.portfolio-img');
                    return {
                        src: img.src,
                        title: el.querySelector('.portfolio-title').textContent,
                        category: el.querySelector('.portfolio-category').textContent
                    };
                });
                
                const clickedSrc = item.querySelector('.portfolio-img').src;
                currentIndex = currentGalleryItems.findIndex(el => el.src === clickedSrc);
                
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                updateLightbox();
            });
        });
        // Close Lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        // Navigation
        const nextImage = () => {
            currentIndex = (currentIndex + 1) % currentGalleryItems.length;
            updateLightbox();
        };
        const prevImage = () => {
            currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
            updateLightbox();
        };
        if (lightboxNext) lightboxNext.addEventListener('click', nextImage);
        if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }
    // ==========================================================================
    // WHATSAPP LEAD GENERATOR WIDGET
    // ==========================================================================
    const waToggleBtn = document.getElementById('wa-toggle-btn');
    const waLeadModal = document.getElementById('wa-lead-modal');
    const waStartChatBtn = document.getElementById('wa-start-chat');
    if (waToggleBtn && waLeadModal) {
        // Toggle the popup open/close
        waToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            waLeadModal.classList.toggle('active');
        });
        // Close popup if user clicks outside
        window.addEventListener('click', (e) => {
            if (!waLeadModal.contains(e.target) && e.target !== waToggleBtn) {
                waLeadModal.classList.remove('active');
            }
        });
        // Handle CTA button in popup
        if (waStartChatBtn) {
            waStartChatBtn.addEventListener('click', () => {
                const projectType = document.getElementById('wa-project-type').value;
                const budgetRange = document.getElementById('wa-budget').value;
                const phoneNumber = '918169744142'; // Shivam Enterprises Number
                
                // Formulate WhatsApp Message
                const message = `Hello Shivam Enterprises, I am inquiring from your website. I want a consultation for a ${projectType} project. Our approximate budget tier is ${budgetRange}. Please connect with me.`;
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
                
                // Open WhatsApp link and close widget
                window.open(whatsappUrl, '_blank');
                waLeadModal.classList.remove('active');
            });
        }
    }
    // ==========================================================================
    // CONSULTATION INQUIRY FORM SUBMISSION (REGISTRATION PAGE)
    // ==========================================================================
    const inquiryForm = document.getElementById('inquiryForm');
    
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Retrieve values
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const city = document.getElementById('city').value.trim();
            const projectType = document.getElementById('project-type').value;
            const budget = document.getElementById('budget').value;
            const message = document.getElementById('message').value.trim();
            
            if (!name || !phone || !city) {
                alert('Please fill out the required fields (Name, Phone, City).');
                return;
            }
            // Create a premium feedback experience
            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'TRANSMITTING REQUEST...';
            submitBtn.style.background = '#AA7C11';
            
            setTimeout(() => {
                // Show customized premium success modal/alert
                submitBtn.textContent = 'REQUEST SENT SUCCESSFULLY!';
                submitBtn.style.background = '#25D366';
                
                // Ask user if they want to also forward this info to WhatsApp directly for instant reply
                const doubleLead = confirm(`Thank you ${name}! Your consultation request has been logged. \n\nWould you like to instantly forward this request to our WhatsApp support team (+91 81697 44142) for an immediate response?`);
                
                if (doubleLead) {
                    const waText = `Hello Shivam Enterprises, my name is ${name}. I just submitted a consultation request on your site for: \n- Project: ${projectType}\n- Budget: ${budget}\n- Location: ${city}\n- Details: ${message}\n- Phone: ${phone}. \nPlease contact me to schedule a meeting.`;
                    const waUrl = `https://api.whatsapp.com/send?phone=918169744142&text=${encodeURIComponent(waText)}`;
                    window.open(waUrl, '_blank');
                }
                
                // Reset form
                inquiryForm.reset();
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                }, 3000);
                
            }, 1800);
        });
    }
});
