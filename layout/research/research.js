/* Citation remains readable and selectable even when clipboard access is denied. */
(() => {
  'use strict';
  const button = document.querySelector('[data-copy-citation]');
  const reference = document.getElementById(button?.dataset.copyCitation);
  const feedback = document.getElementById('citation-feedback');
  if (!button || !reference || !feedback) return;
  const label = button.querySelector('span');
  let resetTimer;
  button.hidden = false;

  button.addEventListener('click', async () => {
    window.clearTimeout(resetTimer);
    button.disabled = true;
    label.textContent = 'Copying…';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(reference.textContent.trim());
      label.textContent = 'Copied';
      feedback.textContent = 'Citation copied to clipboard.';
      resetTimer = window.setTimeout(() => { label.textContent = 'Copy citation'; }, 2500);
    } catch {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(reference);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      label.textContent = 'Try copying again';
      feedback.textContent = 'Copy unavailable. Select the reference and copy it manually.';
    } finally {
      button.disabled = false;
    }
  });
})();
