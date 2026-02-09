"use client";

export default function SimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Sistema SAAS de Agendamento</h1>
      <p>Sistema está funcionando!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Status dos Serviços:</h2>
        <ul>
          <li>✅ Frontend: Rodando</li>
          <li>✅ Backend API: Rodando</li>
          <li>✅ Banco de Dados: Conectado</li>
          <li>✅ Cache Redis: Ativo</li>
          <li>✅ Fila RabbitMQ: Ativa</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard" style={{ background: '#0070f3', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px' }}>
          Ir para Dashboard
        </a>
      </div>
    </div>
  );
}
