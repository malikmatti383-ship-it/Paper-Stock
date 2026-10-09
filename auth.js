/* PaperPilot — Gmail login + cloud sync (classic script) */
(function () {
  'use strict';
  // Render deploy ke baad yahan server URL ayega. Khali = login band, app offline-only.
  var PAPER_SERVER_URL = '';

  var TOKEN_KEY = 'ps_token';

  function isConfigured(){
    return !!PAPER_SERVER_URL && PAPER_SERVER_URL.indexOf('http')===0 && PAPER_SERVER_URL.indexOf('PASTE')!==0;
  }
  function base(){ return PAPER_SERVER_URL.replace(/\/$/, ''); }
  function getToken(){ try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function setToken(t){ try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
  function clearToken(){ try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  function handleAuthRedirect(){
    var h = location.hash || '';
    if (h.indexOf('#token=') === 0) {
      var tok = decodeURIComponent(h.slice(7).split('&')[0]);
      if (tok) setToken(tok);
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      return tok || null;
    }
    return null;
  }

  function login(){
    if(!isConfigured()) return;
    location.href = base() + '/auth/google';
  }

  function api(path, opts){
    opts = opts || {};
    var headers = opts.headers || {};
    var tok = getToken();
    if (tok) headers['Authorization'] = 'Bearer ' + tok;
    if (opts.body && typeof opts.body === 'object') {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    opts.headers = headers;
    return fetch(base() + path, opts).then(function (res) {
      if (res.status === 401) { clearToken(); throw new Error('session expired'); }
      if (!res.ok) throw new Error('API ' + res.status);
      return res.json();
    });
  }

  function logout(){
    return api('/api/logout', { method: 'POST' }).catch(function(){}).then(function(){ clearToken(); });
  }

  function startAutoSync(getDB, applyRemote, onPush){
    if (!isConfigured() || !getToken()) return null;
    var pushTimer = null, pushing = false;

    function pull(){
      return api('/api/data').then(function (r) {
        if (r && r.data && typeof applyRemote === 'function') applyRemote(r.data, r.updatedAt);
      }).catch(function (e) { console.warn('[sync] pull failed:', e.message); });
    }
    function pushNow(){
      if (pushing) return Promise.resolve();
      pushing = true;
      var snapshot;
      try { snapshot = getDB(); } catch (e) { pushing = false; return Promise.resolve(); }
      return api('/api/data', { method: 'POST', body: { data: snapshot } })
        .then(function (r) { pushing = false; if (typeof onPush === 'function') onPush(r && r.updatedAt); })
        .catch(function (e) { pushing = false; console.warn('[sync] push failed:', e.message); });
    }
    function schedulePush(){
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(pushNow, 15000);
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') pushNow(); });
    window.addEventListener('pagehide', function () { pushNow(); });
    pull();
    return { pull: pull, push: pushNow, schedulePush: schedulePush };
  }

  window.PaperAuth = {
    isConfigured: isConfigured, getToken: getToken, handleAuthRedirect: handleAuthRedirect,
    login: login, logout: logout, api: api, startAutoSync: startAutoSync,
    setServerUrl: function (u) { PAPER_SERVER_URL = u; }
  };
})();
