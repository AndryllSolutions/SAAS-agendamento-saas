type LeadCreate = {
  full_name: string;
  whatsapp?: string;
  email?: string;
  phone?: string;
  source?: string;
  stage?: string;
  status?: string;
  notes?: string;
  wa_chat_title?: string;
  wa_last_message?: string;
  wa_url?: string;
  raw_payload?: Record<string, unknown>;
};

type Settings = {
  apiBaseUrl?: string;
  apiKey?: string;
};

async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(['apiBaseUrl', 'apiKey']);
  return result as Settings;
}

async function postLead(lead: LeadCreate): Promise<{ ok: boolean; message?: string }> {
  const { apiBaseUrl, apiKey } = await getSettings();

  if (!apiBaseUrl) return { ok: false, message: 'API Base URL não configurada' };
  if (!apiKey) return { ok: false, message: 'API Key não configurada' };

  const base = apiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/leads/capture/whatsapp-web`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(lead),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return { ok: false, message: `Erro HTTP ${resp.status}: ${text || resp.statusText}` };
  }

  return { ok: true };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'SAVE_LEAD') {
    const lead = msg.lead as LeadCreate;
    postLead(lead)
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, message: String(e) }));
    return true;
  }
});
