import { useState, useEffect, type FC } from "react";
import api from "../api";

interface Plan {
    plan_id: number;
    name: string;
    price: number;
    is_active: boolean;
}

interface Trainer {
    trainer_id: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    charge_per_session: number;
    is_active: boolean;
}

export const PlansAndTrainersView: FC = () => {
    const [tab, setTab] = useState<"plans" | "trainers">("plans");

    const [plans, setPlans] = useState<Plan[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

    const [planForm, setPlanForm] = useState({ name: "", price: "" });
    const [trainerForm, setTrainerForm] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        charge_per_session: "",
    });

    const fetchPlans = async () => {
        try {
            const res = await api.get("/plans/");
            setPlans(res.data);
        } catch {
            console.error("Failed to fetch plans");
        }
    };

    const fetchTrainers = async () => {
        try {
            const res = await api.get("/trainers/");
            setTrainers(res.data);
        } catch {
            console.error("Failed to fetch trainers");
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchTrainers();
    }, []);

    const openAddPlan = () => {
        setEditingPlan(null);
        setPlanForm({ name: "", price: "" });
        setShowPlanModal(true);
    };

    const openEditPlan = (p: Plan) => {
        setEditingPlan(p);
        setPlanForm({ name: p.name, price: String(p.price) });
        setShowPlanModal(true);
    };

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { name: planForm.name, price: parseFloat(planForm.price) };
            if (editingPlan) {
                await api.put(`/plans/${editingPlan.plan_id}`, payload);
            } else {
                await api.post("/plans/", payload);
            }
            setShowPlanModal(false);
            fetchPlans();
        } catch {
            alert("Failed to save plan");
        }
    };

    const handleDeletePlan = async (planId: number) => {
        try {
            await api.delete(`/plans/${planId}`);
            fetchPlans();
        } catch {
            alert("Failed to delete plan");
        }
    };

    const openAddTrainer = () => {
        setEditingTrainer(null);
        setTrainerForm({ name: "", email: "", phone: "", specialization: "", charge_per_session: "" });
        setShowTrainerModal(true);
    };

    const openEditTrainer = (t: Trainer) => {
        setEditingTrainer(t);
        setTrainerForm({
            name: t.name,
            email: t.email || "",
            phone: t.phone || "",
            specialization: t.specialization || "",
            charge_per_session: String(t.charge_per_session),
        });
        setShowTrainerModal(true);
    };

    const handleTrainerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: trainerForm.name,
                email: trainerForm.email || null,
                phone: trainerForm.phone || null,
                specialization: trainerForm.specialization || null,
                charge_per_session: parseFloat(trainerForm.charge_per_session) || 0,
            };
            if (editingTrainer) {
                await api.put(`/trainers/${editingTrainer.trainer_id}`, payload);
            } else {
                await api.post("/trainers/", payload);
            }
            setShowTrainerModal(false);
            fetchTrainers();
        } catch {
            alert("Failed to save trainer");
        }
    };

    const handleDeleteTrainer = async (trainerId: number) => {
        try {
            await api.delete(`/trainers/${trainerId}`);
            fetchTrainers();
        } catch {
            alert("Failed to delete trainer");
        }
    };

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-[32px] mb-2 leading-tight">Plans & Trainers</h1>
                <p className="text-brand-muted">
                    Manage membership plans, pricing, and trainer details.
                </p>
            </div>

            <div className="flex gap-4 mb-8 border-b border-brand-border">
                <button
                    className={`pb-3 px-1 font-medium text-[14px] transition-colors ${
                        tab === "plans"
                            ? "text-brand-accent border-b-2 border-brand-accent"
                            : "text-brand-muted hover:text-brand-fg"
                    }`}
                    onClick={() => setTab("plans")}
                >
                    Membership Plans
                </button>
                <button
                    className={`pb-3 px-1 font-medium text-[14px] transition-colors ${
                        tab === "trainers"
                            ? "text-brand-accent border-b-2 border-brand-accent"
                            : "text-brand-muted hover:text-brand-fg"
                    }`}
                    onClick={() => setTab("trainers")}
                >
                    Trainers
                </button>
            </div>

            {tab === "plans" && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={openAddPlan}
                            className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90"
                        >
                            + Add Plan
                        </button>
                    </div>
                    <div className="bg-brand-surface border border-brand-border rounded overflow-hidden">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                        Plan Name
                                    </th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                        Price
                                    </th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                        Status
                                    </th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((p) => (
                                    <tr key={p.plan_id} className="hover:bg-[oklch(99%_0.002_240)] transition-colors">
                                        <td className="p-4 border-b border-brand-border font-semibold">{p.name}</td>
                                        <td className="p-4 border-b border-brand-border mono">₹{p.price.toLocaleString()}</td>
                                        <td className="p-4 border-b border-brand-border">
                                            <span className={`status-pill ${p.is_active ? "bg-status-active-bg text-status-active-fg" : "bg-status-canceled-bg text-status-canceled-fg"}`}>
                                                {p.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4 border-b border-brand-border flex gap-2">
                                            <button onClick={() => openEditPlan(p)} className="px-2 py-1 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg text-[12px]">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeletePlan(p.plan_id)} className="px-2 py-1 rounded font-semibold border border-red-200 text-red-500 transition-all duration-150 hover:bg-red-50 text-[12px]">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab === "trainers" && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={openAddTrainer}
                            className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90"
                        >
                            + Add Trainer
                        </button>
                    </div>
                    <div className="bg-brand-surface border border-brand-border rounded overflow-hidden">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Name</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Email</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Specialization</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Charge/Session</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainers.map((t) => (
                                    <tr key={t.trainer_id} className="hover:bg-[oklch(99%_0.002_240)] transition-colors">
                                        <td className="p-4 border-b border-brand-border font-semibold">{t.name}</td>
                                        <td className="p-4 border-b border-brand-border text-brand-muted">{t.email || "—"}</td>
                                        <td className="p-4 border-b border-brand-border">{t.specialization || "—"}</td>
                                        <td className="p-4 border-b border-brand-border mono">₹{t.charge_per_session.toLocaleString()}</td>
                                        <td className="p-4 border-b border-brand-border flex gap-2">
                                            <button onClick={() => openEditTrainer(t)} className="px-2 py-1 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg text-[12px]">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteTrainer(t.trainer_id)} className="px-2 py-1 rounded font-semibold border border-red-200 text-red-500 transition-all duration-150 hover:bg-red-50 text-[12px]">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl mb-6">{editingPlan ? "Edit Plan" : "Add New Plan"}</h2>
                        <form onSubmit={handlePlanSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Plan Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={planForm.name}
                                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={planForm.price}
                                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90">
                                    {editingPlan ? "Update Plan" : "Save Plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Trainer Modal */}
            {showTrainerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl mb-6">{editingTrainer ? "Edit Trainer" : "Add New Trainer"}</h2>
                        <form onSubmit={handleTrainerSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input required type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={trainerForm.name}
                                    onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={trainerForm.email}
                                    onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={trainerForm.phone}
                                    onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Specialization</label>
                                <input type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={trainerForm.specialization}
                                    onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Charge Per Session (₹)</label>
                                <input required type="number" step="0.01" min="0" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={trainerForm.charge_per_session}
                                    onChange={(e) => setTrainerForm({ ...trainerForm, charge_per_session: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowTrainerModal(false)} className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90">
                                    {editingTrainer ? "Update Trainer" : "Save Trainer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
