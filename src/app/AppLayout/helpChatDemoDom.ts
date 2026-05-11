function primeHelpChatMessageBarValue(text: string): void {
  const root = document.querySelector('[data-demo-anchor="pcm-help-chat-message-bar"]');
  const ta = root?.querySelector('textarea.pf-chatbot__message-textarea') as HTMLTextAreaElement | null;
  if (!ta || ta.disabled) {
    return;
  }
  const setNative = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (setNative) {
    setNative.call(ta, text);
  } else {
    ta.value = text;
  }
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Best-effort: show "yes" in the PatternFly chatbot MessageBar textarea before a scripted send.
 * MessageBar keeps internal React state; this updates the DOM so the field often flashes the text
 * before the parent advances the CVE demo (which remounts the bar via `key`).
 */
export function primeHelpChatMessageBarWithYes(): void {
  primeHelpChatMessageBarValue('yes');
}

/** Same as {@link primeHelpChatMessageBarWithYes} but for scripted follow-up prompts (support case demo). */
export function primeHelpChatMessageBarWithText(text: string): void {
  primeHelpChatMessageBarValue(text);
}
