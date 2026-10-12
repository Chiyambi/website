const { createClient } = require('@supabase/supabase-js');

const json = (res, status, body) => res.status(status).json(body);

module.exports = async function handler(req, res) {
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return json(res, 503, { error: 'User management is not configured on the server.' });
  }

  const authorization = req.headers.authorization || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json(res, 401, { error: 'Sign in as an administrator to continue.' });

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return json(res, 401, { error: 'Your session is invalid or expired. Sign in again.' });
  if (user.app_metadata?.role !== 'admin') return json(res, 403, { error: 'Administrator access is required.' });

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    if (req.method === 'GET') {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) return json(res, 400, { error: error.message });
      return json(res, 200, { users: data.users.map(({ id, email, role, created_at }) => ({ id, email, role, created_at })) });
    }

    if (req.method === 'POST') {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { error: 'Enter a valid email address.' });
      if (password.length < 8) return json(res, 400, { error: 'Password must be at least 8 characters.' });
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (error) return json(res, 400, { error: error.message });
      return json(res, 201, { user: { id: data.user.id, email: data.user.email, role: data.user.role, created_at: data.user.created_at } });
    }

    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return json(res, 400, { error: 'A valid user ID is required.' });
    }
    if (id === user.id) return json(res, 400, { error: 'You cannot delete the account you are currently using.' });
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json(res, 400, { error: error.message });
    return json(res, 200, { success: true });
  } catch (error) {
    console.error('User management endpoint failed:', error);
    return json(res, 500, { error: 'The user management request failed. Please try again.' });
  }
};
