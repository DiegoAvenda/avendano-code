/**
 * Build the srcdoc HTML string that runs inside the sandboxed iframe.
 *
 * We inject a postMessage bridge that captures console.log/warn/error,
 * window.onerror, and unhandledrejection — and forwards them to the parent.
 */

const BRIDGE_SCRIPT = `
<script>
(function() {
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
      parent.postMessage({ __playground: true, type, args: serialized }, '*');
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
	const css = code.css || '';
	const js = code.javascript || '';

	// Inject bridge as the very first script (before anything else)
	const bridgeAndStyle = BRIDGE_SCRIPT + (css ? `<style>${css}</style>` : '');

	// Replace the user's linked stylesheet reference — we inline the CSS instead
	html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');

	// Replace the user's script src reference — we inline the JS instead
	html = html.replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi, '');

	// Inject bridge + CSS into <head> if it exists
	if (html.includes('</head>')) {
		html = html.replace('</head>', bridgeAndStyle + '</head>');
	} else {
		html = bridgeAndStyle + html;
	}

	// Inject JS before </body> or at the end
	const jsTag = js ? `<script>${js}<\/script>` : '';
	if (html.includes('</body>')) {
		html = html.replace('</body>', jsTag + '</body>');
	} else {
		html += jsTag;
	}

	return html;
}
