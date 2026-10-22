import { useEffect } from 'react';

/**
 * Makes copying the photos harder on the public website. A web page cannot
 * truly block screenshots (phones and the operating system take them outside
 * the browser), so this only deters; the watermark stamped on uploads is the
 * real protection.
 *
 *   - no right-click menu, image dragging, long-press save or text selection on photos
 *   - Print Screen empties the clipboard and briefly hides the page
 *   - the page blurs while another window has focus (Windows Snipping Tool, Win+Shift+S)
 *   - printing and Ctrl+S / Ctrl+P show nothing
 *
 * Styles: `.capture-guard` and `.capture-hidden` in styles/index.css.
 */
export function useScreenshotGuard() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('capture-guard');
    let timer;
    const hide = (ms) => {
      root.classList.add('capture-hidden');
      window.clearTimeout(timer);
      if (ms) timer = window.setTimeout(() => root.classList.remove('capture-hidden'), ms);
    };
    const show = () => {
      window.clearTimeout(timer);
      root.classList.remove('capture-hidden');
    };
    const editable = (el) => el?.closest?.('input, textarea, [contenteditable="true"]');

    const onContextMenu = (e) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const onDragStart = (e) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement) e.preventDefault();
    };
    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      // Address bar shortcuts: the blur that follows is not a capture.
      if (((e.ctrlKey || e.metaKey) && key === 'l') || (e.altKey && key === 'd') || key === 'f6') leftTopAt = Date.now();
      if ((e.ctrlKey || e.metaKey) && (key === 's' || key === 'p' || (e.shiftKey && key === 's'))) {
        e.preventDefault();
        if (key === 's' && e.shiftKey) hide(1500);
      }
    };
    const onKeyUp = (e) => {
      if (e.key !== 'PrintScreen') return;
      hide(1500);
      navigator.clipboard?.writeText?.('').catch(() => {});
    };
    // The pointer leaving through the top edge is heading for the address bar or tabs.
    let leftTopAt = 0;
    const onMouseOut = (e) => {
      if (!e.relatedTarget && e.clientY <= 0) leftTopAt = Date.now();
    };
    // Clicking into an embedded reel or map, or into the browser's own address bar, also
    // moves focus away: neither is a capture.
    const onBlur = () =>
      window.setTimeout(() => {
        if (document.activeElement?.tagName === 'IFRAME' || Date.now() - leftTopAt < 4000) return;
        hide();
      }, 0);

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', show);
    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      window.clearTimeout(timer);
      root.classList.remove('capture-guard', 'capture-hidden');
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', show);
    };
  }, []);
}
