/**
 * Build the srcdoc HTML string that runs inside the sandboxed iframe.
 *
 * We inject a postMessage bridge that captures console.log/warn/error,
 * window.onerror, and unhandledrejection — and forwards them to the parent.
 *
 * NOTE on lint: this module intentionally builds `</script>`-style sequences
 * with an escaped slash (`\/`). The `no-useless-escape` rule is disabled below
 * because removing the backslash would let the sequence read as a real HTML
 * closing tag when this source is embedded or inspected.
 */
/* eslint-disable no-useless-escape */

const BRIDGE_SCRIPT = `
<script>
(function() {
  // Capture the parent window NOW. A lesson may declare its own top level
  // "parent" binding (union-find uses that name), which would shadow the
  // global inside this function and make postMessage fail silently later.
  const bridgeTarget = window.parent;

  // ── Console capture ──
  const _log = console.log;
  const _warn = console.warn;
  const _error = console.error;

  function send(type, args) {
    try {
      const serialized = Array.from(args).map(a => {
        if (a instanceof Error) return a.message;
        if (typeof a === 'object') {
          try { return JSON.stringify(a); }
          catch { return String(a); }
        }
        return String(a);
      });
      bridgeTarget.postMessage({ __playground: true, type, args: serialized }, '*');
    } catch(e) { /* ignore serialization errors */ }
  }

  console.log = function() { send('log', arguments); _log.apply(console, arguments); };
  console.warn = function() { send('warn', arguments); _warn.apply(console, arguments); };
  console.error = function() { send('error', arguments); _error.apply(console, arguments); };

  // ── Error capture ──
  window.onerror = function(msg, source, line, col, error) {
    send('error', [msg + (line ? ' (line ' + line + ')' : '')]);
    return false;
  };

  window.addEventListener('unhandledrejection', function(e) {
    send('error', ['Unhandled Promise: ' + (e.reason?.message || e.reason || 'unknown')]);
  });

  // ── Content size ──
  // The preview is sandboxed without same-origin, so the host cannot measure
  // this document. It reports its own size instead, which is what the host
  // needs to scale the lesson down in "Fit" mode.
  function reportSize() {
    try {
      const doc = document.documentElement;
      bridgeTarget.postMessage({
        __playgroundSize: true,
        width: Math.max(doc.scrollWidth, doc.clientWidth),
        height: Math.max(doc.scrollHeight, doc.clientHeight)
      }, '*');
    } catch (e) { /* ignore */ }
  }

  window.addEventListener('load', reportSize);
  window.addEventListener('resize', reportSize);
  document.addEventListener('DOMContentLoaded', reportSize);
  if (typeof ResizeObserver !== 'undefined') {
    try { new ResizeObserver(reportSize).observe(document.documentElement); } catch (e) { /* ignore */ }
  }
  reportSize();
})();
<\/script>
`;

/**
 * @param {{ html: string, css: string, javascript: string }} code
 * @returns {string}
 */
export function buildSrcDoc(code) {
	// We need to inject the bridge script and the user's CSS/JS into the HTML.
	// If the HTML already contains <head> or <body>, we inject into those.
	// Otherwise we wrap everything.

	let html = code.html || '';
	// Escape user content so it can't prematurely close our injected tags.
	// Without this, a closing script tag inside a JS string would break the preview
	// (the HTML parser ends the <script> element at the first closing tag it sees).
	const SLASH = String.fromCharCode(47);
	const BACKSLASH = String.fromCharCode(92);
	const css = (code.css || '').split('<' + SLASH + 'style').join('<' + BACKSLASH + SLASH + 'style');
	const js = (code.javascript || '')
		.split('<' + SLASH + 'script')
		.join('<' + BACKSLASH + SLASH + 'script');

	// Inject bridge as the very first script (before anything else)
	const bridgeAndStyle = BRIDGE_SCRIPT + (css ? `<style>${css}</style>` : '');

	// Replace the user's linked stylesheet reference — we inline the CSS instead
	html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');

	// Replace the user's script src reference — we inline the JS instead
	html = html.replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi, '');

	// Inject bridge + CSS into <head> if it exists (case-insensitive)
	if (/<\/head\s*>/i.test(html)) {
		html = html.replace(/<\/head\s*>/i, () => bridgeAndStyle + '</head>');
	} else {
		html = bridgeAndStyle + html;
	}

	// Inject JS before </body> or at the end (tag split so this source
	// never holds a contiguous closing-tag sequence)
	const jsTag = js ? '<script>' + js + '</scr' + 'ipt>' : '';
	if (/<\/body\s*>/i.test(html)) {
		html = html.replace(/<\/body\s*>/i, () => jsTag + '</body>');
	} else {
		html += jsTag;
	}

	return html;
}
