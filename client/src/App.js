import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authcontext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Groups from "./pages/Groups";
import UploadReel from "./pages/UploadReel";
import GroupFeed from "./pages/GroupFeed";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import Navbar from "./components/navbar";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />

          <Route
            path="/group/:groupId"
            element={
              <ProtectedRoute>
                <GroupFeed />
              </ProtectedRoute>
            }
          />
          <Route path="/upload"
            element={
              <ProtectedRoute>
                <UploadReel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
