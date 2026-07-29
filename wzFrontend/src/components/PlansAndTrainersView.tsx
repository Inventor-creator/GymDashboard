import { useState, useEffect, useCallback, useMemo, type FC } from "react";
import api from "../api";

interface Plan {
    plan_id: number;
    name: string;
    price: number;
    is_active: boolean;
    duration_days: number;
}

interface TrainerPlan {
    plan_id: number;
    trainer_id: number;
    name: string;
    price: number;
    duration_days: number;
    is_active: boolean;
}

interface Trainer {
    trainer_id: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    is_active: boolean;
    plans: TrainerPlan[];
}

export function FetchPlans() {
    const [plans, setPlans] = useState<Plan[]>([]);

    const reFetchPlans = useCallback(async () => {
        try {
            const res = await api.get("/plans/");
            setPlans(res.data);
        } catch {
            console.error("Failed to fetch plans");
        }
    }, []);

    useEffect(() => {
        reFetchPlans();
    }, [reFetchPlans]);

    return { plans, reFetchPlans };
}

export function FetchTrainers() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);

    const reFetchTrainers = useCallback(async () => {
        try {
            const res = await api.get("/trainers/");
            setTrainers(res.data);
        } catch {
            console.error("Failed to fetch trainers");
        }
    }, []);

    useEffect(() => {
        reFetchTrainers();
    }, [reFetchTrainers]);

    return { trainers, reFetchTrainers };
}

export const PlansAndTrainersView: FC = () => {
    const [tab, setTab] = useState<"plans" | "trainers">("plans");

    const { plans, reFetchPlans } = FetchPlans();
    const { trainers, reFetchTrainers } = FetchTrainers();
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
    const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
    const [showPlanForm, setShowPlanForm] = useState(false);

    const selectedTrainer = useMemo(
        () => trainers.find((t) => t.trainer_id === selectedTrainerId) ?? null,
        [trainers, selectedTrainerId],
    );

    const [planForm, setPlanForm] = useState({ name: "", price: "", duration_days: "30", is_active: true });
    const [trainerForm, setTrainerForm] = useState({ name: "", email: "", phone: "", specialization: "" });
    const [trainerPlanForm, setTrainerPlanForm] = useState({ name: "", price: "", duration_days: "30" });

    const openAddPlan = () => {
        setEditingPlan(null);
        setPlanForm({ name: "", price: "", duration_days: "30", is_active: true });
        setShowPlanModal(true);
    };

    const openEditPlan = (p: Plan) => {
        setEditingPlan(p);
        setPlanForm({ name: p.name, price: String(p.price), duration_days: String(p.duration_days), is_active: p.is_active });
        setShowPlanModal(true);
    };

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, unknown> = { name: planForm.name, price: parseFloat(planForm.price), duration_days: parseInt(planForm.duration_days) };
            if (editingPlan) { payload.is_active = planForm.is_active; await api.put(`/plans/${editingPlan.plan_id}`, payload); }
            else { await api.post("/plans/", payload); }
            setShowPlanModal(false); reFetchPlans();
        } catch { alert("Failed to save plan"); }
    };

    const handleDeletePlan = async (planId: number) => {
        try { await api.delete(`/plans/${planId}`); reFetchPlans(); } catch { alert("Failed to delete plan"); }
    };

    const openAddTrainer = () => {
        setEditingTrainer(null);
        setTrainerForm({ name: "", email: "", phone: "", specialization: "" });
        setShowTrainerModal(true);
    };

    const openEditTrainer = (t: Trainer) => {
        setEditingTrainer(t);
        setTrainerForm({ name: t.name, email: t.email || "", phone: t.phone || "", specialization: t.specialization || "" });
        setShowTrainerModal(true);
    };

    const handleTrainerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { name: trainerForm.name, email: trainerForm.email || null, phone: trainerForm.phone || null, specialization: trainerForm.specialization || null };
            if (editingTrainer) { await api.put(`/trainers/${editingTrainer.trainer_id}`, payload); }
            else { await api.post("/trainers/", payload); }
            setShowTrainerModal(false); reFetchTrainers();
        } catch { alert("Failed to save trainer"); }
    };

    const handleDeleteTrainer = async (trainerId: number) => {
        try { await api.delete(`/trainers/${trainerId}`); setSelectedTrainerId(null); reFetchTrainers(); } catch { alert("Failed to delete trainer"); }
    };

    const handlePlanSubmitForTrainer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrainer) return;
        try {
            await api.post(`/trainers/${selectedTrainer.trainer_id}/plans`, {
                name: trainerPlanForm.name,
                price: parseFloat(trainerPlanForm.price),
                duration_days: parseInt(trainerPlanForm.duration_days),
            });
            setShowPlanForm(false);
            setTrainerPlanForm({ name: "", price: "", duration_days: "30" });
            reFetchTrainers();
        } catch { alert("Failed to save plan"); }
    };

    const handleDeleteTrainerPlan = async (planId: number) => {
        if (!selectedTrainer) return;
        try { await api.delete(`/trainers/${selectedTrainer.trainer_id}/plans/${planId}`); reFetchTrainers(); } catch { alert("Failed to delete plan"); }
    };

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-[32px] mb-2 leading-tight">Plans & Trainers</h1>
                <p className="text-brand-muted">Manage membership plans, pricing, and trainer details.</p>
            </div>

            <div className="flex gap-4 mb-8 border-b border-brand-border">
                <button className={`pb-3 px-1 font-medium text-[14px] transition-colors ${tab === "plans" ? "text-brand-accent border-b-2 border-brand-accent" : "text-brand-muted hover:text-brand-fg"}`} onClick={() => setTab("plans")}>Membership Plans</button>
                <button className={`pb-3 px-1 font-medium text-[14px] transition-colors ${tab === "trainers" ? "text-brand-accent border-b-2 border-brand-accent" : "text-brand-muted hover:text-brand-fg"}`} onClick={() => setTab("trainers")}>Trainers</button>
            </div>

            {tab === "plans" && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={openAddPlan} className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90">+ Add Plan</button>
                    </div>
                    <div className="bg-brand-surface border border-brand-border rounded overflow-hidden">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Plan Name</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Price</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Duration</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Status</th>
                                    <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((p) => (
                                    <tr key={p.plan_id} className="hover:bg-[oklch(99%_0.002_240)] transition-colors">
                                        <td className="p-4 border-b border-brand-border font-semibold">{p.name}</td>
                                        <td className="p-4 border-b border-brand-border mono">₹{p.price.toLocaleString()}</td>
                                        <td className="p-4 border-b border-brand-border text-brand-muted">{p.duration_days} Days</td>
                                        <td className="p-4 border-b border-brand-border">
                                            <span className={`status-pill ${p.is_active ? "bg-status-active-bg text-status-active-fg" : "bg-status-canceled-bg text-status-canceled-fg"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                                        </td>
                                        <td className="p-4 border-b border-brand-border flex gap-2">
                                            <button onClick={() => openEditPlan(p)} className="px-2 py-1 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg text-[12px]">Edit</button>
                                            <button onClick={() => handleDeletePlan(p.plan_id)} className="px-2 py-1 rounded font-semibold border border-red-200 text-red-500 transition-all duration-150 hover:bg-red-50 text-[12px]">Delete</button>
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
                        <button onClick={openAddTrainer} className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90">+ Add Trainer</button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {trainers.map((t) => (
                            <div
                                key={t.trainer_id}
                                onClick={() => setSelectedTrainerId(t.trainer_id)}
                                className={`bg-brand-surface border p-6 rounded cursor-pointer transition-all duration-150 hover:shadow-md ${selectedTrainer?.trainer_id === t.trainer_id ? "border-brand-accent ring-1 ring-brand-accent" : "border-brand-border"}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-base">{t.name}</div>
                                        {t.specialization && <div className="text-brand-muted text-[12px]">{t.specialization}</div>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditTrainer(t); }}
                                            className="px-2 py-1 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg text-[11px]"
                                        >
                                            Edit Trainer
                                        </button>
                                    </div>
                                </div>
                                {t.email && <div className="text-[12px] text-brand-muted mb-1">{t.email}</div>}
                                {t.phone && <div className="text-[12px] text-brand-muted mb-2">{t.phone}</div>}
                                <div className="border-t border-brand-border pt-3 mt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-[11px] uppercase tracking-[0.06em] text-brand-muted font-semibold">Plans</div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedTrainerId(t.trainer_id); setShowPlanForm(true); }}
                                            className="text-[11px] text-brand-accent font-semibold hover:underline"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    {t.plans && t.plans.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {t.plans.map((tp) => (
                                                <div key={tp.plan_id} className="flex justify-between items-center bg-brand-bg px-3 py-1.5 rounded text-[13px]">
                                                    <div>
                                                        <span className="font-medium">{tp.name}</span>
                                                        <span className="text-brand-muted ml-2">₹{tp.price.toLocaleString()} / {tp.duration_days}d</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTrainerPlan(tp.plan_id); }}
                                                        className="text-red-400 hover:text-red-500 text-[11px] font-semibold"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-brand-muted italic">No plans yet</div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {trainers.length === 0 && (
                            <div className="col-span-2 p-8 text-center text-brand-muted bg-brand-surface border border-brand-border rounded">
                                No trainers yet. Click "+ Add Trainer" to get started.
                            </div>
                        )}
                    </div>
                </>
            )}

            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl mb-6">{editingPlan ? "Edit Plan" : "Add New Plan"}</h2>
                        <form onSubmit={handlePlanSubmit} className="flex flex-col gap-4">
                            <div><label className="block text-sm font-medium mb-1">Plan Name</label><input required type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Price (₹)</label><input required type="number" step="0.01" min="0" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Duration (Days)</label><input required type="number" min="1" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={planForm.duration_days} onChange={(e) => setPlanForm({ ...planForm, duration_days: e.target.value })} /></div>
                            {editingPlan && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input type="checkbox" id="desktop-p-active" checked={planForm.is_active} onChange={e => setPlanForm({...planForm, is_active: e.target.checked})} className="w-4 h-4 rounded border-brand-border" />
                                    <label htmlFor="desktop-p-active" className="text-sm font-semibold">Active Plan</label>
                                </div>
                            )}
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90">{editingPlan ? "Update Plan" : "Save Plan"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTrainerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl mb-6">{editingTrainer ? "Edit Trainer" : "Add New Trainer"}</h2>
                        <form onSubmit={handleTrainerSubmit} className="flex flex-col gap-4">
                            <div><label className="block text-sm font-medium mb-1">Name</label><input required type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerForm.name} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerForm.email} onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Phone</label><input type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerForm.phone} onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Specialization</label><input type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerForm.specialization} onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })} /></div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowTrainerModal(false)} className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90">{editingTrainer ? "Update Trainer" : "Save Trainer"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPlanForm && selectedTrainer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl mb-2">Add Plan</h2>
                        <p className="text-brand-muted mb-6">for <strong>{selectedTrainer.name}</strong></p>
                        <form onSubmit={handlePlanSubmitForTrainer} className="flex flex-col gap-4">
                            <div><label className="block text-sm font-medium mb-1">Plan Name</label><input required type="text" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerPlanForm.name} onChange={(e) => setTrainerPlanForm({ ...trainerPlanForm, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Price (₹)</label><input required type="number" step="0.01" min="0" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerPlanForm.price} onChange={(e) => setTrainerPlanForm({ ...trainerPlanForm, price: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium mb-1">Duration (Days)</label><input required type="number" min="1" className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg" value={trainerPlanForm.duration_days} onChange={(e) => setTrainerPlanForm({ ...trainerPlanForm, duration_days: e.target.value })} /></div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowPlanForm(false)} className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90">Save Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};