import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Gym {
    gym_id: number;
    gym_name: string;
    gym_location: string;
}

interface User {
    id: number;
    email: string;
    name: string;
}

export const SelectGym: FC = () => {
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, gymsRes] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/gyms/my"),
                ]);
                setUser(userRes.data);
                setGyms(gymsRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectGym = (gymId: number) => {
        localStorage.setItem("activeGymId", gymId.toString());
        navigate("/dashboard");
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem("activeGymId");
            // Direct redirect to backend logout to clear session cookies
            window.location.href = `${api.defaults.baseURL}/auth/logout`;
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="text-brand-muted animate-pulse font-mono uppercase tracking-widest text-xs">
                    Loading Gyms...
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-[600px] bg-brand-surface border border-brand-border rounded-lg p-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome, {user?.name}
                        </h1>
                        <p className="text-brand-muted">
                            Please select a gym to manage.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {user?.email === "aryaupatil9@gmail.com" && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="px-4 py-2 rounded font-semibold bg-brand-surface border border-brand-border transition-all duration-150 hover:bg-brand-bg"
                            >
                                Admin Panel
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {gyms.length > 0 ? (
                        gyms.map((gym) => (
                            <div
                                key={gym.gym_id}
                                onClick={() => handleSelectGym(gym.gym_id)}
                                className="p-6 border border-brand-border rounded hover:bg-brand-bg cursor-pointer transition-colors group"
                            >
                                <div className="font-bold text-xl group-hover:text-brand-accent transition-colors">
                                    {gym.gym_name}
                                </div>
                                <div className="text-brand-muted text-sm">
                                    {gym.gym_location}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border border-dashed border-brand-border rounded">
                            <p className="text-brand-muted">
                                You don't have any gyms assigned yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
