import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface User {
    id: number;
    email: string;
    name: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data);
            } catch (error) {
                console.error("Not authenticated", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="text-brand-muted animate-pulse font-mono uppercase tracking-widest text-xs">
                    Verifying Identity...
                </div>
            </div>
        );
    }

    return user ? <>{children}</> : null;
}
