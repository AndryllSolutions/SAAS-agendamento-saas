export default function Error500() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, color: '#111827' }}>500</h1>
        <p style={{ fontSize: 18, color: '#4b5563', marginBottom: 24 }}>Erro interno no servidor</p>
        <a href="/" style={{ background: '#2563eb', color: '#fff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>Voltar ao inicio</a>
      </div>
    </div>
  )
}
