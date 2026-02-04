export default function LoginPage() {
  return (
    <div style={{ 
      padding: "20px",
      maxWidth: "400px",
      margin: "50px auto",
      border: "1px solid #ddd",
      borderRadius: "8px"
    }}>
      <h1>Login</h1>
      <p>Sistema Agendamento SaaS</p>
      <form>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input 
            type="email" 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="admin@teste.com"
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Senha:</label>
          <input 
            type="password" 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="admin123"
          />
        </div>
        <button 
          type="submit"
          style={{ 
            width: "100%", 
            padding: "10px", 
            backgroundColor: "#007bff", 
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Entrar
        </button>
      </form>
      <p style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        Teste: admin@teste.com / admin123
      </p>
    </div>
  )
}
