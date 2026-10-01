// ============================================
// EPH-B.com — Dynamic Content Loader
// Fetches data from Supabase and renders it
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  await loadAllContent();
});

async function loadAllContent() {
  try {
    await Promise.all([
      loadHeroSlides(),
      loadStats(),
      loadAbout(),
      loadServices(),
      loadProjects(),
      loadContact(),
      loadSettings()
    ]);
    console.log('EPH-B Website loaded with dynamic content!');
    document.dispatchEvent(new Event('contentLoaded'));
  } catch (err) {
    console.error('Failed to load content:', err);
  }
}

// ---------- HERO SLIDES ----------
async function loadHeroSlides() {
  const slider = document.getElementById('hero-slider');
  const dotsContainer = document.getElementById('slider-dots');
  if (!slider) return;

  try {
    const slides = await API.getHeroSlides();
    if (slides.length > 0) {
      slider.innerHTML = slides.map((slide, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}">
          <img src="${slide.image_url}" alt="${slide.headline}" />
          <div class="slide-content">
            <h1 class="hero-title">${slide.headline}</h1>
            <p class="hero-subtitle">${slide.sub_headline}</p>
            <div class="hero-buttons">
              <a href="${slide.cta_link}" class="btn-primary">${slide.cta_text}</a>
              <a href="#contact" class="btn-secondary">Get Free Consultation</a>
            </div>
          </div>
        </div>
      `).join('');

      dotsContainer.innerHTML = slides.map((_, i) =>
        `<span class="dot ${i === 0 ? 'active' : ''}"></span>`
      ).join('');
    }
  } catch (err) {
    // Table doesn't exist — use fallback slides
    console.warn('Hero slides table not found, using fallback content');
  }

  // Fallback if no slides were loaded
  if (slider.children.length === 0) {
    slider.innerHTML = `
      <div class="slide active">
        <img src="banner1.jpg" alt="Premium Construction" />
        <div class="slide-content">
          <h1 class="hero-title">Building Dreams Into Reality</h1>
          <p class="hero-subtitle">Premium Design & Construction Services in Malawi</p>
          <div class="hero-buttons">
            <a href="#projects" class="btn-primary">View Our Work</a>
            <a href="#contact" class="btn-secondary">Get Free Consultation</a>
          </div>
        </div>
      </div>
    `;
    if (dotsContainer) dotsContainer.innerHTML = '<span class="dot active"></span>';
  }
}

// ---------- STATS ----------
async function loadStats() {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  try {
    const stats = await API.getStats();
    if (stats.length > 0) {
      grid.innerHTML = stats.map(stat => `
        <div class="stat-item">
          <div class="stat-number">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Stats table not found, using fallback content');
  }

  // Fallback stats
  if (grid.children.length === 0) {
    grid.innerHTML = `
      <div class="stat-item"><div class="stat-number">50+</div><div class="stat-label">Projects Completed</div></div>
      <div class="stat-item"><div class="stat-number">4+</div><div class="stat-label">Years Experience</div></div>
      <div class="stat-item"><div class="stat-number">94%</div><div class="stat-label">Client Satisfaction</div></div>
      <div class="stat-item"><div class="stat-number">24/7</div><div class="stat-label">Support Available</div></div>
    `;
  }
}

// ---------- ABOUT ----------
async function loadAbout() {
  const headingEl = document.getElementById('about-heading');
  const paragraphEl = document.getElementById('about-paragraph');
  const featuresEl = document.getElementById('about-features');
  const imageEl = document.getElementById('about-image');

  try {
    const about = await API.getAboutSection();
    if (about) {
      if (headingEl) headingEl.textContent = about.heading;
      if (paragraphEl) paragraphEl.textContent = about.paragraph;
      if (imageEl && about.image_url) imageEl.src = about.image_url;

      if (featuresEl && about.features?.length) {
        featuresEl.innerHTML = about.features.map(f => `
          <div class="feature">
            <i class="fas fa-check-circle"></i>
            <span>${f}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('About table not found, using fallback content');
  }

  // Fallback about content
  if (headingEl && headingEl.textContent === 'Loading...') {
    if (headingEl) headingEl.textContent = 'Building Excellence Since 2020';
    if (paragraphEl) paragraphEl.textContent = 'We are a Malawian construction company dedicated to building dreams into reality. With over 50 completed projects, we specialize in modern schools, luxury homes, cost-effective housing, beach resorts, and commercial buildings.';
    if (featuresEl && featuresEl.children.length === 0) {
      featuresEl.innerHTML = `
        <div class="feature"><i class="fas fa-check-circle"></i><span>50+ Projects Completed</span></div>
        <div class="feature"><i class="fas fa-check-circle"></i><span>Expert Team</span></div>
        <div class="feature"><i class="fas fa-check-circle"></i><span>Quality Materials</span></div>
        <div class="feature"><i class="fas fa-check-circle"></i><span>On-Time Delivery</span></div>
      `;
    }
  }
}

// ---------- SERVICES ----------
async function loadServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  try {
    const services = await API.getServices();
    const serviceCards = services
      .filter(service => service.title?.trim() || service.description?.trim() || service.features?.some(feature => feature?.trim()))
      .map(service => {
        const features = (service.features || []).filter(feature => feature?.trim());
        return `
        <div class="service-card">
          ${service.icon ? `<div class="service-icon"><i class="${service.icon}"></i></div>` : ''}
          ${service.title?.trim() ? `<h3>${service.title}</h3>` : ''}
          ${service.description?.trim() ? `<p>${service.description}</p>` : ''}
          ${features.length ? `<ul class="service-features">${features.map(feature => `<li>${feature}</li>`).join('')}</ul>` : ''}
        </div>
      `;
      });
    if (serviceCards.length > 0) grid.innerHTML = serviceCards.join('');
  } catch (err) {
    console.warn('Services table not found, using fallback content');
  }

  // Fallback services
  if (grid.children.length === 0) {
    grid.innerHTML = `
      <div class="service-card">
        <div class="service-icon"><i class="fas fa-drafting-compass"></i></div>
        <h3>Architectural Design</h3>
        <p>Custom house plans, 3D visualization, and space optimization tailored to your needs.</p>
      </div>
      <div class="service-card">
        <div class="service-icon"><i class="fas fa-hard-hat"></i></div>
        <h3>Full Construction</h3>
        <p>End-to-end construction with project monitoring, quality control, and timeline management.</p>
      </div>
      <div class="service-card">
        <div class="service-icon"><i class="fas fa-building"></i></div>
        <h3>Commercial Projects</h3>
        <p>Office buildings, retail spaces, and industrial facilities built to the highest standards.</p>
      </div>
      <div class="service-card">
        <div class="service-icon"><i class="fas fa-map-marked-alt"></i></div>
        <h3>Surveying Services</h3>
        <p>Professional land surveying, title deed processing, and beacon creation services.</p>
      </div>
    `;
  }
}

// ---------- PROJECTS ----------
async function loadProjects() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  try {
    const projects = await API.getProjects();
    if (projects.length === 0) return;

    grid.innerHTML = projects.map(project => {
      const isVideo = project.type === 'video';
      const media = isVideo
        ? `<video src="${project.media_url}" controls preload="metadata" playsinline></video>`
        : `<img src="${project.media_url}" alt="${project.title}" />`;

      return `
        <div class="portfolio-item ${isVideo ? 'portfolio-video' : ''}">
          ${media}
          <div class="portfolio-overlay">
            <h3>${project.title}</h3>
            <p>${project.description || ''}</p>
            ${isVideo ? `
              <span class="portfolio-link">
                <i class="fas fa-play-circle"></i> Video
              </span>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Projects error:', err);
  }
}

// ---------- CONTACT ----------
async function loadContact() {
  const infoEl = document.getElementById('contact-info');
  const socialEl = document.getElementById('social-links');

  try {
    const contact = await API.getContactInfo();
    if (contact) {
      if (infoEl) {
        infoEl.innerHTML = `
          <div class="contact-item">
            <div class="contact-icon"><i class="fas fa-phone"></i></div>
            <div class="contact-details">
              <h3>Phone</h3>
              <p>${contact.phone_primary || ''}</p>
              ${contact.phone_secondary ? `<p>${contact.phone_secondary}</p>` : ''}
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon"><i class="fas fa-envelope"></i></div>
            <div class="contact-details">
              <h3>Email</h3>
              <p>${contact.email || ''}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="contact-details">
              <h3>Location</h3>
              <p>${contact.location || ''}</p>
            </div>
          </div>
        `;
      }

      if (socialEl) {
        const links = [];
        if (contact.facebook) links.push(`<a href="${contact.facebook}" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>`);
        if (contact.twitter) links.push(`<a href="${contact.twitter}" target="_blank" class="social-link"><i class="fab fa-twitter"></i></a>`);
        if (contact.instagram) links.push(`<a href="${contact.instagram}" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>`);
        if (contact.whatsapp) links.push(`<a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}" target="_blank" class="social-link whatsapp"><i class="fab fa-whatsapp"></i></a>`);
        socialEl.innerHTML = links.join('');
      }

      const footerPhone1 = document.getElementById('footer-phone1');
      const footerPhone2 = document.getElementById('footer-phone2');
      const footerEmail = document.getElementById('footer-email');
      const footerSocial = document.getElementById('footer-social');

      if (footerPhone1) footerPhone1.textContent = contact.phone_primary || '';
      if (footerPhone2) footerPhone2.textContent = contact.phone_secondary || '';
      if (footerEmail) footerEmail.textContent = contact.email || '';

      if (footerSocial && contact.whatsapp) {
        footerSocial.innerHTML = `<a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}" target="_blank"><i class="fab fa-whatsapp"></i></a>`;
      }
    }
  } catch (err) {
    console.warn('Contact table not found, using fallback content');
  }

  // Fallback contact info
  if (infoEl && infoEl.children.length === 0) {
    infoEl.innerHTML = `
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-phone"></i></div>
        <div class="contact-details">
          <h3>Phone</h3>
          <p>+265 882 96 87 02</p>
          <p>+265 994 80 03 29</p>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-envelope"></i></div>
        <div class="contact-details">
          <h3>Email</h3>
          <p>contact@ephb-construction.com</p>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
        <div class="contact-details">
          <h3>Location</h3>
          <p>Malawi, Africa</p>
        </div>
      </div>
    `;
  }

  if (socialEl && socialEl.children.length === 0) {
    socialEl.innerHTML = `
      <a href="https://wa.me/265882968702" target="_blank" class="social-link whatsapp"><i class="fab fa-whatsapp"></i></a>
    `;
  }
}

// ---------- SETTINGS ----------
async function loadSettings() {
  try {
    const settings = await API.getSiteSettings();

    if (settings.site_name) {
      document.title = `${settings.site_name} - Premium Building Solutions`;
    }
    if (settings.footer_credit) {
      const footerBottom = document.querySelector('.footer-bottom');
      if (footerBottom) {
        footerBottom.innerHTML = `<p>&copy; ${new Date().getFullYear()} ${settings.site_name || 'EPH-B DESIGN AND CONSTRUCTION'}. All Rights Reserved.</p><p>${settings.footer_credit}</p>`;
      }
    }
  } catch (err) {
    console.warn('Settings table not found, using defaults');
  }
}
