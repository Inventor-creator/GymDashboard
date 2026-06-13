import { FC, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Gym {
    gym_id: number;
    gym_name: string;
    gym_location: string;
    owner_id: number;
}

interface User {
    id: number;
    email: string;
    name: string;
}

export const AdminDashboard: FC = () => {
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newGym, setNewGym] = useState({
        gym_name: "",
        gym_location: "",
        owner_id: 0,
    });
    const [newUser, setNewUser] = useState({
        email: "",
        full_name: "",
    });
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [gymsRes, usersRes] = await Promise.all([
                api.get("/gyms/"),
                api.get("/auth/users"),
            ]);
            setGyms(gymsRes.data);
            setUsers(usersRes.data);
            if (usersRes.data.length > 0) {
                setNewGym((prev) => ({
                    ...prev,
                    owner_id: prev.owner_id || usersRes.data[0].id,
                }));
            }
        } catch (error) {
            console.error("Admin access denied or error fetching data", error);
            navigate("/select-gym");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateUser = async (e: React.SubmitEvent) => {
        e.preventDefault();
        try {
            await api.post("/auth/users", newUser);
            setNewUser({ email: "", full_name: "" });
            fetchData();
        } catch (error) {
            console.error("Error creating user", error);
        }
    };

    const handleCreateGym = async (e: React.SubmitEvent) => {
        e.preventDefault();
        try {
            await api.post("/gyms/", newGym);
            setNewGym({
                gym_name: "",
                gym_location: "",
                owner_id: users[0]?.id || 0,
            });
            fetchData();
        } catch (error) {
            console.error("Error creating gym", error);
        }
    };

    const handleChangeOwner = async (gymId: number, newOwnerId: number) => {
        try {
            await api.put(`/gyms/${gymId}/owner`, { owner_id: newOwnerId });
            fetchData();
        } catch (error) {
            console.error("Error updating owner", error);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="text-brand-muted animate-pulse font-mono uppercase tracking-widest text-xs">
                    Loading Admin Panel...
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-brand-bg p-12">
            <div className="max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                    <button
                        onClick={() => navigate("/select-gym")}
                        className="text-brand-muted hover:text-brand-fg font-medium"
                    >
                        ← Back to Selection
                    </button>
                </div>

                <section className="bg-brand-surface border border-brand-border rounded-lg p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6">Add New Owner</h2>
                    <form
                        onSubmit={handleCreateUser}
                        className="flex gap-4 items-end"
                    >
                        <div className="flex-[2]">
                            <label className="block text-[11px] uppercase tracking-wider text-brand-muted mb-2">
                                Email (Google Account)
                            </label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-2 rounded bg-brand-bg border border-brand-border"
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[11px] uppercase tracking-wider text-brand-muted mb-2">
                                Full Name
                            </label>
                            <input
                                required
                                className="w-full px-4 py-2 rounded bg-brand-bg border border-brand-border"
                                value={newUser.full_name}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        full_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brand-surface border border-brand-border rounded font-bold transition-all duration-150 hover:bg-brand-bg"
                        >
                            Add Owner
                        </button>
                    </form>
                </section>

                <section className="bg-brand-surface border border-brand-border rounded-lg p-8 mb-10">
                    <h2 className="text-xl font-bold mb-6">Create New Gym</h2>
                    {users.length > 0 ? (
                        <form
                            onSubmit={handleCreateGym}
                            className="flex gap-4 items-end"
                        >
                            <div className="flex-1">
                                <label className="block text-[11px] uppercase tracking-wider text-brand-muted mb-2">
                                    Gym Name
                                </label>
                                <input
                                    required
                                    className="w-full px-4 py-2 rounded bg-brand-bg border border-brand-border"
                                    value={newGym.gym_name}
                                    onChange={(e) =>
                                        setNewGym({
                                            ...newGym,
                                            gym_name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[11px] uppercase tracking-wider text-brand-muted mb-2">
                                    Location
                                </label>
                                <input
                                    required
                                    className="w-full px-4 py-2 rounded bg-brand-bg border border-brand-border"
                                    value={newGym.gym_location}
                                    onChange={(e) =>
                                        setNewGym({
                                            ...newGym,
                                            gym_location: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[11px] uppercase tracking-wider text-brand-muted mb-2">
                                    Initial Owner
                                </label>
                                <select
                                    className="w-full px-4 py-2 rounded bg-brand-bg border border-brand-border"
                                    value={newGym.owner_id}
                                    onChange={(e) =>
                                        setNewGym({
                                            ...newGym,
                                            owner_id: parseInt(e.target.value),
                                        })
                                    }
                                >
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-brand-accent text-white rounded font-bold transition-all duration-150 hover:opacity-90"
                            >
                                Create Gym
                            </button>
                        </form>
                    ) : (
                        <div className="text-brand-muted italic py-4">
                            Please add at least one owner above before creating
                            a gym.
                        </div>
                    )}
                </section>

                <section className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-bg">
                                <th className="p-4 border-b border-brand-border text-[11px] uppercase text-brand-muted">
                                    Gym Name
                                </th>
                                <th className="p-4 border-b border-brand-border text-[11px] uppercase text-brand-muted">
                                    Location
                                </th>
                                <th className="p-4 border-b border-brand-border text-[11px] uppercase text-brand-muted">
                                    Current Owner
                                </th>
                                <th className="p-4 border-b border-brand-border text-[11px] uppercase text-brand-muted">
                                    Change Owner
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {gyms.map((gym) => (
                                <tr
                                    key={gym.gym_id}
                                    className="hover:bg-brand-bg transition-colors"
                                >
                                    <td className="p-4 border-b border-brand-border font-bold">
                                        {gym.gym_name}
                                    </td>
                                    <td className="p-4 border-b border-brand-border text-brand-muted">
                                        {gym.gym_location}
                                    </td>
                                    <td className="p-4 border-b border-brand-border">
                                        {users.find(
                                            (u) => u.id === gym.owner_id,
                                        )?.name || "Unknown"}
                                    </td>
                                    <td className="p-4 border-b border-brand-border">
                                        <select
                                            className="px-2 py-1 rounded bg-brand-bg border border-brand-border text-sm"
                                            value={gym.owner_id}
                                            onChange={(e) =>
                                                handleChangeOwner(
                                                    gym.gym_id,
                                                    parseInt(e.target.value),
                                                )
                                            }
                                        >
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};
