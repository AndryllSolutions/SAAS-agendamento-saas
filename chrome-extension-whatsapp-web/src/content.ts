type ExtractedLead = {
  wa_chat_title?: string;
  wa_last_message?: string;
  wa_url?: string;
  full_name?: string;
  whatsapp?: string;
  raw_payload?: Record<string, unknown>;
};

function firstText(selectors: string[]): string | undefined {
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null;
    const txt = el?.innerText?.trim();
    if (txt) return txt;
  }
  return undefined;
}

function extractChatTitle(): string | undefined {
  return firstText([
    "header [data-testid='conversation-info-header-chat-title'] span",
    "header span[title]",
    "header h1",
  ]);
}

function extractLastMessage(): string | undefined {
  const candidates = Array.from(
    document.querySelectorAll(
      "div[data-testid='msg-container'], div.message-in, div.message-out"
    )
  ) as HTMLElement[];

  const last = candidates[candidates.length - 1];
  if (!last) return undefined;

  const txt = last.innerText?.trim();
  return txt || undefined;
}

function guessWhatsappNumberFromTitle(title?: string): string | undefined {
  if (!title) return undefined;
  const cleaned = title.replace(/\s+/g, '');
  if (/^\+?\d{8,15}$/.test(cleaned)) return cleaned;
  return undefined;
}

function extractLead(): ExtractedLead {
  const wa_chat_title = extractChatTitle();
  const wa_last_message = extractLastMessage();
  const wa_url = location.href;

  const whatsapp = guessWhatsappNumberFromTitle(wa_chat_title);

  return {
    wa_chat_title,
    wa_last_message,
    wa_url,
    full_name: wa_chat_title,
    whatsapp,
    raw_payload: {
      userAgent: navigator.userAgent,
      extractedAt: new Date().toISOString(),
    },
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'EXTRACT_LEAD') {
    try {
      sendResponse({ ok: true, data: extractLead() });
    } catch (e) {
      sendResponse({ ok: false, message: String(e) });
    }
  }
});
