/* PaperPilot — Gmail login + cloud sync (classic script) */
(function () {
  'use strict';
  // Render deploy ke baad yahan server URL ayega. Khali = login band, app offline-only.
  var PAPER_SERVER_URL = 'https://paper-stock-server.onrender.com';

  var TOKEN_KEY = 'ps_token';

  function isConfigured(){
    return !!PAPER_SERVER_URL && PAPER_SERVER_URL.indexOf('http')===0 && PAPER_SERVER_URL.indexOf('PASTE')!==0;
  }
  function base(){ return PAPER_SERVER_URL.replace(/\/$/, ''); }
  function getToken(){ try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function setToken(t){ try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
  function clearToken(){ try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem('ps_paycfg'); localStorage.removeItem('ps_user'); } catch (e) {} }

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

  /* Google tap-login: inside the Android app the native bridge opens the
     sign-in in the phone's browser (Google sign-in cannot run inside a
     WebView) and the app receives the session back; in a normal browser
     the plain redirect flow above is used. Email-code login stays as the
     always-available backup — the gate shows both. */
  function googleLogin(){
    if (window.AndroidApp) {
      if (AndroidApp.googleLogin) { try { AndroidApp.googleLogin(); return; } catch (e) {} }
      /* Old app shell: Google sign-in cannot run inside the app window —
         point the user to the email code instead of a broken page. */
      var m = document.getElementById('gate-msg');
      if (m) m.textContent = 'Google login needs the latest ReamBook update — please use the email code below for now.';
      return;
    }
    login();
  }

  /* Email-code login: works inside the Android wrapper, where the Google
     page can never open. Server emails a 6-digit code; verify returns the
     same 365-day session token Google login would have created. */
  function postJson(path, body){
    return fetch(base() + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.json().catch(function(){ return {}; }).then(function (j) {
        if (!res.ok) throw new Error(j.error || ('Request failed (' + res.status + ')'));
        return j;
      });
    });
  }

  function requestCode(email){
    if (!isConfigured()) return Promise.reject(new Error('Login is not set up yet.'));
    return postJson('/api/auth/code/request', { email: email });
  }

  function verifyCode(email, code){
    if (!isConfigured()) return Promise.reject(new Error('Login is not set up yet.'));
    return postJson('/api/auth/code/verify', { email: email, code: code }).then(function (j) {
      if (j && j.token) setToken(j.token);
      return j;
    });
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
      if (!res.ok) return res.json().catch(function () { return {}; }).then(function (j) {
        var e = new Error('API ' + res.status);
        e.detail = (j && (j.detail || j.error)) || '';
        throw e;
      });
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
    login: login, googleLogin: googleLogin, logout: logout, api: api, startAutoSync: startAutoSync,
    requestCode: requestCode, verifyCode: verifyCode,
    setServerUrl: function (u) { PAPER_SERVER_URL = u; }
  };
})();
