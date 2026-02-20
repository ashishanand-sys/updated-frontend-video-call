// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Meeting from "./pages/Meeting";
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />

        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/stream/:streamId"
              element={
                <ProtectedRoute>
                  <Meeting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}




export default App;
