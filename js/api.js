// ============================================
// EPH-B.com — Supabase API Layer
// All database operations go through here
// ============================================

const API = {
  // ---------- HERO SLIDES ----------
  async getHeroSlides() {
    const { data, error } = await supabaseClient
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createHeroSlide(slide) {
    const { data, error } = await supabaseClient.from('hero_slides').insert(slide).select().single();
    if (error) throw error;
    return data;
  },

  async updateHeroSlide(id, updates) {
    const { data, error } = await supabaseClient.from('hero_slides').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteHeroSlide(id) {
    const { error } = await supabaseClient.from('hero_slides').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- PROJECTS ----------
  async getProjects() {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createProject(project) {
    const { data, error } = await supabaseClient.from('projects').insert({
      title: project.title,
      description: project.description || '',
      media_url: project.media_url,
      type: project.type || 'image'
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateProject(id, updates) {
    const { data, error } = await supabaseClient.from('projects').update({
      title: updates.title,
      description: updates.description || '',
      media_url: updates.media_url,
      type: updates.type || 'image'
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProject(id) {
    const { error } = await supabaseClient.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- SERVICES ----------
  async getServices() {
    const { data, error } = await supabaseClient
      .from('services')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createService(service) {
    const { data, error } = await supabaseClient.from('services').insert(service).select().single();
    if (error) throw error;
    return data;
  },

  async updateService(id, updates) {
    const { data, error } = await supabaseClient.from('services').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteService(id) {
    const { error } = await supabaseClient.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- STATS ----------
  async getStats() {
    const { data, error } = await supabaseClient
      .from('stats')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createStat(stat) {
    const { data, error } = await supabaseClient.from('stats').insert(stat).select().single();
    if (error) throw error;
    return data;
  },

  async updateStat(id, updates) {
    const { data, error } = await supabaseClient.from('stats').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteStat(id) {
    const { error } = await supabaseClient.from('stats').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- CONTACT INFO ----------
  async getContactInfo() {
    const { data, error } = await supabaseClient.from('contact_info').select('*').single();
    if (error) throw error;
    return data;
  },

  async updateContactInfo(updates) {
    const { data, error } = await supabaseClient.from('contact_info').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  },

  // ---------- ABOUT SECTION ----------
  async getAboutSection() {
    const { data, error } = await supabaseClient.from('about_section').select('*').single();
    if (error) throw error;
    return data;
  },

  async updateAboutSection(updates) {
    const { data, error } = await supabaseClient.from('about_section').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  },

  // ---------- SITE SETTINGS ----------
  async getSiteSettings() {
    const { data, error } = await supabaseClient.from('site_settings').select('*');
    if (error) throw error;
    const settings = {};
    data.forEach(row => { settings[row.key] = row.value; });
    return settings;
  },

  async updateSiteSetting(key, value) {
    const { data, error } = await supabaseClient
      .from('site_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ---------- ADMIN AUTH ----------
  async adminLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async adminLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }
};
