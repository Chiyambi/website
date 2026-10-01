// ============================================
// EPH-B.com — Admin Panel Logic
// ============================================

// Initialize when DOM is ready and Supabase is loaded
function init() {
  const client = initSupabase();
  bindEvents();
  if (!client) {
    document.getElementById('login-error').textContent = 'Unable to connect to Supabase. Check the project URL, public key, and network connection.';
    return;
  }
  checkAuth().catch(err => {
    console.error('Failed to check admin session:', err);
    showLogin();
    document.getElementById('login-error').textContent = 'Could not verify your session. Check your connection and try signing in again.';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ---------- Auth ----------
async function checkAuth() {
  const session = await API.getSession();
  if (isAdminSession(session)) {
    showDashboard(session);
  } else {
    showLogin();
  }

  API.onAuthStateChange((event, session) => {
    if (isAdminSession(session)) {
      showDashboard(session);
    } else {
      showLogin();
    }
  });
}

function isAdminSession(session) {
  return session?.user?.app_metadata?.role === 'admin';
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard(session) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'flex';
  document.getElementById('admin-user-email').textContent = session.user.email;
  loadOverview();
}

// ---------- Navigation ----------
function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.toggle('active', tab.id === `tab-${tabName}`);
  });

  const titles = {
    overview: 'Overview',
    hero: 'Hero Slides',
    projects: 'Projects',
    services: 'Services',
    stats: 'Stats',
    about: 'About Section',
    contact: 'Contact Info',
    users: 'User Management',
    settings: 'Site Settings'
  };
  document.getElementById('page-title').textContent = titles[tabName] || 'Overview';

  // Load tab data
  if (tabName === 'overview') loadOverview();
  if (tabName === 'hero') loadHeroSlides();
  if (tabName === 'projects') loadProjects();
  if (tabName === 'services') loadServices();
  if (tabName === 'stats') loadStats();
  if (tabName === 'about') loadAbout();
  if (tabName === 'contact') loadContact();
  if (tabName === 'users') loadUsers();
  if (tabName === 'settings') loadSettings();
}

// ---------- Overview ----------
async function loadOverview() {
  try {
    const [hero, projects, services, stats] = await Promise.all([
      API.getHeroSlides(),
      API.getProjects(),
      API.getServices(),
      API.getStats()
    ]);
    document.getElementById('count-hero').textContent = hero.length;
    document.getElementById('count-projects').textContent = projects.length;
    document.getElementById('count-services').textContent = services.length;
    document.getElementById('count-stats').textContent = stats.length;
  } catch (err) {
    console.error('Failed to load overview:', err);
  }
}

// ---------- Hero Slides ----------
async function loadHeroSlides() {
  const list = document.getElementById('hero-list');
  list.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
  try {
    const slides = await API.getHeroSlides();
    if (slides.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>No hero slides yet. Add your first one!</p></div>';
      return;
    }
    list.innerHTML = slides.map(slide => `
      <div class="item-card">
        <img src="${slide.image_url}" alt="${slide.headline}" class="item-card-image">
        <div class="item-card-info">
          <h4>${slide.headline}</h4>
          <p>${slide.sub_headline}</p>
        </div>
        <div class="item-card-actions">
          <button onclick="editHero('${slide.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete" onclick="deleteHero('${slide.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function openHeroModal(slide = null) {
  document.getElementById('hero-modal').classList.add('active');
  document.getElementById('hero-modal-title').textContent = slide ? 'Edit Hero Slide' : 'Add Hero Slide';
  document.getElementById('hero-id').value = slide?.id || '';
  document.getElementById('hero-headline').value = slide?.headline || '';
  document.getElementById('hero-subheadline').value = slide?.sub_headline || '';
  document.getElementById('hero-cta-text').value = slide?.cta_text || 'Get Started';
  document.getElementById('hero-cta-link').value = slide?.cta_link || '#contact';
  document.getElementById('hero-sort').value = slide?.sort_order || 0;
  document.getElementById('hero-active').checked = slide?.active ?? true;
  document.getElementById('hero-image').value = '';
  document.getElementById('hero-image-preview').style.display = 'none';
  if (slide?.image_url) {
    const preview = document.getElementById('hero-image-preview');
    preview.src = slide.image_url;
    preview.style.display = 'block';
  }
}

async function editHero(id) {
  const slides = await API.getHeroSlides();
  const slide = slides.find(s => s.id === id);
  if (slide) openHeroModal(slide);
}

async function deleteHero(id) {
  if (!confirm('Delete this hero slide?')) return;
  try {
    await API.deleteHeroSlide(id);
    showToast('Hero slide deleted', 'success');
    loadHeroSlides();
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

// ---------- Projects ----------
async function loadProjects() {
  const list = document.getElementById('projects-list');
  list.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
  try {
    const projects = await API.getProjects();
    if (projects.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-project-diagram"></i><p>No projects yet. Add your first one!</p></div>';
      return;
    }
    list.innerHTML = projects.map(p => `
      <div class="item-card">
        <img src="${p.media_url}" alt="${p.title}" class="item-card-image">
        <div class="item-card-info">
          <h4>${p.title}</h4>
          <p>${p.type || 'image'} — ${(p.description || '').substring(0, 60)}...</p>
        </div>
        <div class="item-card-actions">
          <button onclick="editProject('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete" onclick="deleteProject('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function openProjectModal(project = null) {
  document.getElementById('project-modal').classList.add('active');
  document.getElementById('project-modal-title').textContent = project ? 'Edit Project' : 'Add Project';
  document.getElementById('project-id').value = project?.id || '';
  document.getElementById('project-title').value = project?.title || '';
  document.getElementById('project-desc').value = project?.description || '';
  document.getElementById('project-type').value = project?.type || 'image';
  document.getElementById('project-media').value = '';
  document.getElementById('project-media-preview').style.display = 'none';
  if (project?.media_url) {
    const preview = document.getElementById('project-media-preview');
    preview.src = project.media_url;
    preview.style.display = 'block';
  }
}

async function editProject(id) {
  const projects = await API.getProjects();
  const project = projects.find(p => p.id === id);
  if (project) openProjectModal(project);
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  try {
    await API.deleteProject(id);
    showToast('Project deleted', 'success');
    loadProjects();
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

// ---------- Services ----------
async function loadServices() {
  const list = document.getElementById('services-list');
  list.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
  try {
    const services = await API.getServices();
    if (services.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-cogs"></i><p>No services yet. Add your first one!</p></div>';
      return;
    }
    list.innerHTML = services.map(s => `
      <div class="item-card">
        <div class="item-card-info">
          <h4><i class="${s.icon}" style="color:var(--primary);margin-right:8px;"></i>${s.title}</h4>
          <p>${s.description.substring(0, 80)}...</p>
        </div>
        <div class="item-card-actions">
          <button onclick="editService('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete" onclick="deleteService('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function openServiceModal(service = null) {
  document.getElementById('service-modal').classList.add('active');
  document.getElementById('service-modal-title').textContent = service ? 'Edit Service' : 'Add Service';
  document.getElementById('service-id').value = service?.id || '';
  document.getElementById('service-title').value = service?.title || '';
  document.getElementById('service-description').value = service?.description || '';
  document.getElementById('service-icon').value = service?.icon || 'fas fa-hard-hat';
  document.getElementById('service-features').value = service?.features?.join('\n') || '';
  document.getElementById('service-sort').value = service?.sort_order || 0;
  document.getElementById('service-active').checked = service?.active ?? true;
}

async function editService(id) {
  const services = await API.getServices();
  const service = services.find(s => s.id === id);
  if (service) openServiceModal(service);
}

async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  try {
    await API.deleteService(id);
    showToast('Service deleted', 'success');
    loadServices();
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

// ---------- Stats ----------
async function loadStats() {
  const list = document.getElementById('stats-list');
  list.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
  try {
    const stats = await API.getStats();
    if (stats.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No stats yet. Add your first one!</p></div>';
      return;
    }
    list.innerHTML = stats.map(s => `
      <div class="item-card">
        <div class="item-card-info">
          <h4><i class="${s.icon}" style="color:var(--primary);margin-right:8px;"></i>${s.value} — ${s.label}</h4>
        </div>
        <div class="item-card-actions">
          <button onclick="editStat('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete" onclick="deleteStat('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function openStatModal(stat = null) {
  document.getElementById('stat-modal').classList.add('active');
  document.getElementById('stat-modal-title').textContent = stat ? 'Edit Stat' : 'Add Stat';
  document.getElementById('stat-id').value = stat?.id || '';
  document.getElementById('stat-value').value = stat?.value || '';
  document.getElementById('stat-label').value = stat?.label || '';
  document.getElementById('stat-icon').value = stat?.icon || 'fas fa-chart-line';
  document.getElementById('stat-sort').value = stat?.sort_order || 0;
  document.getElementById('stat-active').checked = stat?.active ?? true;
}

async function editStat(id) {
  const stats = await API.getStats();
  const stat = stats.find(s => s.id === id);
  if (stat) openStatModal(stat);
}

async function deleteStat(id) {
  if (!confirm('Delete this stat?')) return;
  try {
    await API.deleteStat(id);
    showToast('Stat deleted', 'success');
    loadStats();
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

// ---------- About ----------
async function loadAbout() {
  try {
    const about = await API.getAboutSection();
    if (about) {
      document.getElementById('about-heading').value = about.heading;
      document.getElementById('about-paragraph').value = about.paragraph;
      document.getElementById('about-features').value = about.features?.join('\n') || '';
      if (about.image_url) {
        const preview = document.getElementById('about-image-preview');
        preview.src = about.image_url;
        preview.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Failed to load about:', err);
  }
}

// ---------- Contact ----------
async function loadContact() {
  try {
    const contact = await API.getContactInfo();
    if (contact) {
      document.getElementById('contact-phone-primary').value = contact.phone_primary || '';
      document.getElementById('contact-phone-secondary').value = contact.phone_secondary || '';
      document.getElementById('contact-email').value = contact.email || '';
      document.getElementById('contact-whatsapp').value = contact.whatsapp || '';
      document.getElementById('contact-location').value = contact.location || '';
      document.getElementById('contact-facebook').value = contact.facebook || '';
      document.getElementById('contact-twitter').value = contact.twitter || '';
      document.getElementById('contact-instagram').value = contact.instagram || '';
    }
  } catch (err) {
    console.error('Failed to load contact:', err);
  }
}

// ---------- Settings ----------
async function loadSettings() {
  try {
    const settings = await API.getSiteSettings();
    document.getElementById('setting-site-name').value = settings.site_name || '';
    document.getElementById('setting-tagline').value = settings.site_tagline || '';
    document.getElementById('setting-footer-credit').value = settings.footer_credit || '';
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

// ---------- Helpers ----------
function previewImage(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previewMedia(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = e => {
      if (isVideo) {
        preview.outerHTML = `<video src="${e.target.result}" controls style="max-width:100%;max-height:200px;"></video>`;
      } else {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
}

// ---------- User Management ----------
function getAdminClient() {
  return supabaseAdminClient;
}

async function loadUsers() {
  const list = document.getElementById('users-list');
  list.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';
  try {
    const client = getAdminClient();
    if (!client) throw new Error('User management requires a secure server-side endpoint.');
    const { data, error } = await client.auth.admin.listUsers();
    if (error) throw error;
    if (data.users.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No users yet.</p></div>';
      return;
    }
    list.innerHTML = data.users.map(u => `
      <div class="item-card">
        <div class="item-card-info">
          <h4>${u.email}</h4>
          <p>Role: ${u.role} | Created: ${new Date(u.created_at).toLocaleDateString()}</p>
        </div>
        <div class="item-card-actions">
          <button onclick="deleteUser('${u.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

async function addUser() {
  const email = document.getElementById('new-user-email').value;
  const password = document.getElementById('new-user-password').value;
  if (!email || !password) {
    showToast('Email and password are required', 'error');
    return;
  }
  try {
    const client = getAdminClient();
    if (!client) throw new Error('User management requires a secure server-side endpoint.');
    const { data, error } = await client.auth.admin.createUser({ email, password });
    if (error) throw error;
    showToast('User created: ' + data.user.email, 'success');
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-password').value = '';
    loadUsers();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    const client = getAdminClient();
    if (!client) throw new Error('User management requires a secure server-side endpoint.');
    const { error } = await client.auth.admin.deleteUser(id);
    if (error) throw error;
    showToast('User deleted', 'success');
    loadUsers();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---------- Event Bindings ----------
function bindEvents() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    if (!supabaseClient) {
      errorEl.textContent = 'Supabase not initialized. Check your config.';
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!isAdminSession(data.session)) {
        await API.adminLogout();
        throw new Error('This account is not authorized for the admin panel.');
      }
      showToast('Welcome back!', 'success');
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed. Check your credentials.';
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await API.adminLogout();
    showToast('Logged out', 'info');
  });

  // Tab navigation
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  // Hero form
  document.getElementById('hero-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('hero-id').value;
    const imageFile = document.getElementById('hero-image').files[0];
    let imageUrl = document.getElementById('hero-image-preview').src || '';

    try {
      if (imageFile) {
        const uploaded = await uploadFile('hero-images', imageFile, 'slides');
        imageUrl = uploaded.publicUrl;
      }

      const data = {
        headline: document.getElementById('hero-headline').value,
        sub_headline: document.getElementById('hero-subheadline').value,
        cta_text: document.getElementById('hero-cta-text').value,
        cta_link: document.getElementById('hero-cta-link').value,
        sort_order: parseInt(document.getElementById('hero-sort').value),
        active: document.getElementById('hero-active').checked,
        image_url: imageUrl
      };

      if (id) {
        await API.updateHeroSlide(id, data);
        showToast('Hero slide updated', 'success');
      } else {
        await API.createHeroSlide(data);
        showToast('Hero slide created', 'success');
      }
      closeModal('hero-modal');
      loadHeroSlides();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Project form
  document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const mediaFile = document.getElementById('project-media').files[0];
    const mediaType = document.getElementById('project-type').value;
    let mediaUrl = document.getElementById('project-media-preview').src || '';

    try {
      if (mediaFile) {
        const bucket = mediaType === 'video' ? 'project-videos' : 'project-images';
        const uploaded = await uploadFile(bucket, mediaFile, 'projects');
        mediaUrl = uploaded.publicUrl;
      }

      const data = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-desc').value,
        media_url: mediaUrl,
        type: mediaType
      };

      if (id) {
        await API.updateProject(id, data);
        showToast('Project updated', 'success');
      } else {
        await API.createProject(data);
        showToast('Project created', 'success');
      }
      closeModal('project-modal');
      loadProjects();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Service form
  document.getElementById('service-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('service-id').value;
    const featuresText = document.getElementById('service-features').value;
    const features = featuresText.split('\n').filter(f => f.trim());

    const data = {
      title: document.getElementById('service-title').value,
      description: document.getElementById('service-description').value,
      icon: document.getElementById('service-icon').value,
      features: features,
      sort_order: parseInt(document.getElementById('service-sort').value),
      active: document.getElementById('service-active').checked
    };

    try {
      if (id) {
        await API.updateService(id, data);
        showToast('Service updated', 'success');
      } else {
        await API.createService(data);
        showToast('Service created', 'success');
      }
      closeModal('service-modal');
      loadServices();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Stat form
  document.getElementById('stat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('stat-id').value;

    const data = {
      value: document.getElementById('stat-value').value,
      label: document.getElementById('stat-label').value,
      icon: document.getElementById('stat-icon').value,
      sort_order: parseInt(document.getElementById('stat-sort').value),
      active: document.getElementById('stat-active').checked
    };

    try {
      if (id) {
        await API.updateStat(id, data);
        showToast('Stat updated', 'success');
      } else {
        await API.createStat(data);
        showToast('Stat created', 'success');
      }
      closeModal('stat-modal');
      loadStats();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // About form
  document.getElementById('about-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageFile = document.getElementById('about-image').files[0];
    let imageUrl = document.getElementById('about-image-preview').src || '';

    try {
      if (imageFile) {
        const uploaded = await uploadFile('general', imageFile, 'about');
        imageUrl = uploaded.publicUrl;
      }

      const featuresText = document.getElementById('about-features').value;
      const features = featuresText.split('\n').filter(f => f.trim());

      await API.updateAboutSection({
        heading: document.getElementById('about-heading').value,
        paragraph: document.getElementById('about-paragraph').value,
        image_url: imageUrl,
        features: features
      });
      showToast('About section updated', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Contact form
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await API.updateContactInfo({
        phone_primary: document.getElementById('contact-phone-primary').value,
        phone_secondary: document.getElementById('contact-phone-secondary').value,
        email: document.getElementById('contact-email').value,
        whatsapp: document.getElementById('contact-whatsapp').value,
        location: document.getElementById('contact-location').value,
        facebook: document.getElementById('contact-facebook').value,
        twitter: document.getElementById('contact-twitter').value,
        instagram: document.getElementById('contact-instagram').value
      });
      showToast('Contact info updated', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Settings form
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await API.updateSiteSetting('site_name', document.getElementById('setting-site-name').value);
      await API.updateSiteSetting('site_tagline', document.getElementById('setting-tagline').value);
      await API.updateSiteSetting('footer_credit', document.getElementById('setting-footer-credit').value);
      showToast('Settings saved', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}
