import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/LoginPage";

function App() {
    return (
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );
}

export default App;
