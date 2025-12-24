import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authcontext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import Groups from "./pages/Groups";
// import Feed from "./pages/Feed";
// import UploadReel from "./pages/UploadReel";
// import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />

          <Route
            path="/feed/:groupId"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadReel />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
