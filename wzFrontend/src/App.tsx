import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/LoginPage";
import { LoginError } from "./pages/LoginError";
import { SelectGym } from "./pages/SelectGym";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/select-gym" replace />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/select-gym"
                element={
                    <ProtectedRoute>
                        <SelectGym />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/error" element={<LoginError />} />
        </Routes>
    );
}

export default App;
