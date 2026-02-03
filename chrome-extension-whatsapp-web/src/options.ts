function setStatus(text: string) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

async function load() {
  const apiBaseEl = document.getElementById('apiBaseUrl') as HTMLInputElement;
  const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;

  const data = await chrome.storage.sync.get(['apiBaseUrl', 'apiKey']);
  apiBaseEl.value = data.apiBaseUrl ?? '';
  apiKeyEl.value = data.apiKey ?? '';
}

async function save() {
  const apiBaseEl = document.getElementById('apiBaseUrl') as HTMLInputElement;
  const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;

  const apiBaseUrl = apiBaseEl.value.trim();
  const apiKey = apiKeyEl.value.trim();

  await chrome.storage.sync.set({ apiBaseUrl, apiKey });
  setStatus('Configurações salvas.');
}

async function main() {
  await load();

  const btn = document.getElementById('save') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    save().catch((e) => setStatus(String(e)));
  });
}

main().catch((e) => setStatus(String(e)));
