type ExtractResponse = { ok: boolean; data?: any; message?: string };

type SaveResponse = { ok: boolean; message?: string };

function setStatus(text: string) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

async function getActiveTabId(): Promise<number | null> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id ?? null;
}

async function extractFromPage(): Promise<ExtractResponse> {
  const tabId = await getActiveTabId();
  if (!tabId) return { ok: false, message: 'Nenhuma aba ativa' };

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_LEAD' }, (resp) => {
      const err = chrome.runtime.lastError;
      if (err) return resolve({ ok: false, message: err.message });
      resolve(resp as ExtractResponse);
    });
  });
}

async function saveLead(lead: any): Promise<SaveResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'SAVE_LEAD', lead }, (resp) => {
      const err = chrome.runtime.lastError;
      if (err) return resolve({ ok: false, message: err.message });
      resolve(resp as SaveResponse);
    });
  });
}

async function main() {
  const fullNameInput = document.getElementById('full_name') as HTMLInputElement;
  const whatsappInput = document.getElementById('whatsapp') as HTMLInputElement;
  const notesInput = document.getElementById('notes') as HTMLTextAreaElement;
  const saveBtn = document.getElementById('save') as HTMLButtonElement;

  setStatus('Lendo conversa do WhatsApp Web...');
  const extracted = await extractFromPage();

  if (extracted.ok && extracted.data) {
    fullNameInput.value = extracted.data.full_name ?? extracted.data.wa_chat_title ?? '';
    whatsappInput.value = extracted.data.whatsapp ?? '';
    notesInput.value = extracted.data.wa_last_message ?? '';
    setStatus('');
  } else {
    setStatus(extracted.message || 'Não foi possível extrair dados');
  }

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    setStatus('Salvando...');

    const lead = {
      full_name: fullNameInput.value || 'Sem nome',
      whatsapp: whatsappInput.value || undefined,
      notes: notesInput.value || undefined,
      source: 'whatsapp_web',
      stage: 'inbox',
      status: 'new',
      wa_chat_title: extracted.data?.wa_chat_title,
      wa_last_message: extracted.data?.wa_last_message,
      wa_url: extracted.data?.wa_url,
      raw_payload: extracted.data?.raw_payload,
    };

    const resp = await saveLead(lead);
    setStatus(resp.ok ? 'Lead salvo.' : (resp.message || 'Erro ao salvar'));
    saveBtn.disabled = false;
  });
}

main().catch((e) => setStatus(String(e)));
