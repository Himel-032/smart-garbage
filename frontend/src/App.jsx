
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from "./pages/DashboardPage.jsx";
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ProtectRoute from './components/ProtectedRoute.jsx';

import BinsPage from './pages/bins/BinsPage.jsx';
import AddBin from './pages/bins/AddBin.jsx';
import EditBin from './pages/bins/EditBin.jsx';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectRoute>
              {" "}
              <DashboardPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/bins"
          element={
            <ProtectRoute>
              {" "}
              <BinsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/bins/add"
          element={
            <ProtectRoute>
              {" "}
              <AddBin />
            </ProtectRoute>
          }
        />
        <Route
          path="/bins/edit/:id"
          element={
            <ProtectRoute>
              {" "}
              <EditBin />
            </ProtectRoute>
          }
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App
