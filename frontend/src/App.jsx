import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import Protected from "./components/Protected";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Schemes from "./pages/Schemes";
import SchemeDetails from "./pages/SchemeDetails";
import Applications from "./pages/Applications";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import Jago from "./pages/Jago";

function App() {
  return (
    <Layout>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Auth />} />

        <Route
          path="/register"
          element={<Auth register />}
        />

        <Route
          path="/schemes"
          element={<Schemes />}
        />

        <Route
          path="/schemes/:id"
          element={<SchemeDetails />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/applications"
          element={
            <Protected>
              <Applications />
            </Protected>
          }
        />

        <Route
          path="/documents"
          element={
            <Protected>
              <Documents />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        <Route
          path="/jago"
          element={
            <Protected>
              <Jago />
            </Protected>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </Layout>
  );
}

export default App;
