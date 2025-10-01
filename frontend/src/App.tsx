import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { Alert } from './components/ui/Alert';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import PricingPage from './pages/PricingPage';

function App() {
  const { error, clearError } = useAuth();

  return (
    <Router>
      <AuthProvider>
        {/* Alertas globais de autenticação */}
        {error && (
          <div className="fixed top-4 right-4 z-50 w-96">
            <Alert
              message={error}
              variant="error"
              onClose={clearError}
              autoClose
              autoCloseDuration={5000}
            />
          </div>
        )}

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Rota 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
