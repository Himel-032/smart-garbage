
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from "./pages/DashboardPage.jsx";
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ProtectRoute from './components/ProtectedRoute.jsx';

import BinsPage from './pages/bins/BinsPage.jsx';
import AddBin from './pages/bins/AddBin.jsx';
import EditBin from './pages/bins/EditBin.jsx';
import BinsMapPage from './pages/maps/BinsMapPage.jsx';
import DriversPage from './pages/drivers/DriversPage.jsx';
import AddDriver from './pages/drivers/AddDriver.jsx';
import EditDriver from './pages/drivers/EditDriver.jsx';
import DriverDetailPage from './pages/drivers/DriverDetailPage.jsx';
import DriverResetPassword from './pages/drivers/DriverResetPassword.jsx';
import MessagesPage from './pages/messages/MessagesPage.jsx';
import ConversationPage from './pages/messages/ConversationPage.jsx';
import AnalyticsPage from './pages/analytics/AnalyticsPage.jsx';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/driver/reset-password/:token" element={<DriverResetPassword />} />
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
          path="/drivers"
          element={
            <ProtectRoute>
              {" "}
              <DriversPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/drivers/add"
          element={
            <ProtectRoute>
              {" "}
              <AddDriver />
            </ProtectRoute>
          }
        />
        <Route
          path="/drivers/edit/:id"
          element={
            <ProtectRoute>
              {" "}
              <EditDriver />
            </ProtectRoute>
          }
        />
        <Route
          path="/drivers/detail/:id"
          element={
            <ProtectRoute>
              {" "}
              <DriverDetailPage />
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
        <Route
          path="/map"
          element={
            <ProtectRoute>
              {" "}
              <BinsMapPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectRoute>
              {" "}
              <MessagesPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/messages/:driverId"
          element={
            <ProtectRoute>
              {" "}
              <ConversationPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectRoute>
              {" "}
              <AnalyticsPage />
            </ProtectRoute>
          }
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
