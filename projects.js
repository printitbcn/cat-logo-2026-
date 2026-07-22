(function () {
  const listEl = document.getElementById('projects-list');
  const statusEl = document.getElementById('projects-status');

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.dataset.kind = kind || '';
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function apiPost(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  function groupProjects(projects) {
    const groups = new Map();
    projects.forEach(p => {
      const g = p.group || 'Otros';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(p);
    });
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }

  function renderProjectCard(project) {
    const badges = [];
    if (project.isCurrentRepo) badges.push('<span class="projects-badge">Actual</span>');
    if (project.discovered) badges.push('<span class="projects-badge projects-badge-muted">Auto</span>');
    if (!project.hasEntry) badges.push('<span class="projects-badge projects-badge-warn">Sin index</span>');

    const pathShort = project.folder.replace(/^\/Users\/[^/]+/, '~');

    return `
      <article class="projects-card" data-project-id="${escapeHtml(project.id)}">
        <div class="projects-card-main">
          <h3 class="projects-card-title">${escapeHtml(project.name)} ${badges.join('')}</h3>
          ${project.description ? `<p class="projects-card-desc">${escapeHtml(project.description)}</p>` : ''}
          <p class="projects-card-path" title="${escapeHtml(project.folder)}">${escapeHtml(pathShort)}</p>
          ${project.browserUrl ? `<p class="projects-card-url"><code>${escapeHtml(project.browserUrl)}</code></p>` : ''}
        </div>
        <div class="projects-card-actions">
          <button type="button" class="projects-btn projects-btn-primary" data-action="browser" data-id="${escapeHtml(project.id)}">
            Abrir en navegador
          </button>
          <button type="button" class="projects-btn" data-action="finder" data-id="${escapeHtml(project.id)}">
            Mostrar en Finder
          </button>
        </div>
      </article>
    `;
  }

  function renderProjects(projects) {
    if (!listEl) return;
    if (!projects.length) {
      listEl.innerHTML = '<p class="projects-hub-empty">No hay proyectos en <code>projects.json</code>.</p>';
      return;
    }

    const grouped = groupProjects(projects);
    listEl.innerHTML = grouped
      .map(
        ([group, items]) => `
        <section class="projects-group">
          <h2 class="projects-group-title">${escapeHtml(group)}</h2>
          <div class="projects-group-list">
            ${items.map(renderProjectCard).join('')}
          </div>
        </section>
      `
      )
      .join('');
  }

  async function loadProjects() {
    if (location.protocol === 'file:') {
      if (listEl) {
        listEl.innerHTML =
          '<p class="projects-hub-empty">Abre esta p�gina con el servidor local: <code>http://127.0.0.1:8080/projects.html</code></p>';
      }
      setStatus('Protocolo file:// � inicia ./scripts/serve-lan.sh', 'warn');
      return;
    }

    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      renderProjects(data.projects || []);
      setStatus(`${(data.projects || []).length} proyecto(s) � puerto ${data.serverPort || '?'}`);
    } catch (e) {
      if (listEl) {
        listEl.innerHTML = '<p class="projects-hub-empty">No se pudo cargar la lista de proyectos.</p>';
      }
      setStatus(e.message || String(e), 'error');
    } finally {
      if (listEl) listEl.removeAttribute('aria-busy');
    }
  }

  async function handleAction(action, id) {
    const path = action === 'finder' ? '/api/reveal' : '/api/open-browser';
    try {
      const result = await apiPost(path, { id });
      if (action === 'finder') {
        setStatus(`Finder: ${result.path || id}`, 'ok');
      } else {
        setStatus(`Abierto: ${result.opened || id}`, 'ok');
      }
    } catch (e) {
      setStatus(e.message || String(e), 'error');
    }
  }

  function initTheme() {
    const btn = document.querySelector('.nav-theme-toggle');
    if (!btn) return;
    const root = document.documentElement;
    const logo = document.querySelector('.projects-hub-logo');

    function applyTheme(theme) {
      if (theme === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      if (logo) {
        const src =
          theme === 'light'
            ? logo.getAttribute('data-logo-light')
            : logo.getAttribute('data-logo-dark');
        if (src) logo.setAttribute('src', src);
      }
    }

    try {
      applyTheme(localStorage.getItem('printit-theme') === 'light' ? 'light' : 'dark');
    } catch (e) {
      applyTheme('dark');
    }

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      try {
        if (next === 'light') localStorage.setItem('printit-theme', 'light');
        else localStorage.removeItem('printit-theme');
      } catch (e) { /* ignore */ }
      applyTheme(next);
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !listEl?.contains(btn)) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (!action || !id) return;
    handleAction(action, id);
  });

  initTheme();
  loadProjects();
})();
