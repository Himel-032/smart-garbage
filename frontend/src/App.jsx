
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from "./pages/DashboardPage.jsx";
import ProtectRoute from './components/ProtectedRoute.jsx';
function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectRoute> <Dashboard /> 
          </ ProtectRoute>
          } 
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
