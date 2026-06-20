import { useState, useEffect, type FC } from "react";
import api from "../../api";
import { useGym } from "../../contexts/GymContext";

interface Plan {
    plan_id: number;
    name: string;
    price: number;
    is_active: boolean;
    duration_days: number;
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

export const MobilePlansAndTrainersView: FC = () => {
    const { activeGymId } = useGym();
    const [tab, setTab] = useState<"plans" | "trainers">("plans");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);

    // Modal states
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

    // Form states
    const [planForm, setPlanForm] = useState({ name: "", price: "", duration_days: "30", is_active: true });
    const [trainerForm, setTrainerForm] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        charge_per_session: "",
        is_active: true
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

    const handleOpenPlanModal = (p: Plan | null = null) => {
        if (p) {
            setEditingPlan(p);
            setPlanForm({ name: p.name, price: p.price.toString(), duration_days: p.duration_days.toString(), is_active: p.is_active });
        } else {
            setEditingPlan(null);
            setPlanForm({ name: "", price: "", duration_days: "30", is_active: true });
        }
        setShowPlanModal(true);
    };

    const handleOpenTrainerModal = (t: Trainer | null = null) => {
        if (t) {
            setEditingTrainer(t);
            setTrainerForm({
                name: t.name,
                email: t.email || "",
                phone: t.phone || "",
                specialization: t.specialization || "",
                charge_per_session: t.charge_per_session.toString(),
                is_active: t.is_active
            });
        } else {
            setEditingTrainer(null);
            setTrainerForm({ name: "", email: "", phone: "", specialization: "", charge_per_session: "", is_active: true });
        }
        setShowTrainerModal(true);
    };

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Record<string, unknown> = { name: planForm.name, price: parseFloat(planForm.price), duration_days: parseInt(planForm.duration_days) };
        if (editingPlan) {
            payload.is_active = planForm.is_active;
        } else {
            payload.gym_id = activeGymId;
        }

        try {
            if (editingPlan) {
                await api.put(`/plans/${editingPlan.plan_id}`, payload);
            } else {
                await api.post("/plans/", payload);
            }
            setShowPlanModal(false);
            fetchPlans();
        } catch {
            alert("Failed to save plan.");
        }
    };

    const handleTrainerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Record<string, unknown> = {
            name: trainerForm.name,
            email: trainerForm.email || null,
            phone: trainerForm.phone || null,
            specialization: trainerForm.specialization || null,
            charge_per_session: parseFloat(trainerForm.charge_per_session)
        };
        if (editingTrainer) {
            payload.is_active = trainerForm.is_active;
        } else {
            payload.gym_id = activeGymId;
        }

        try {
            if (editingTrainer) {
                await api.put(`/trainers/${editingTrainer.trainer_id}`, payload);
            } else {
                await api.post("/trainers/", payload);
            }
            setShowTrainerModal(false);
            fetchTrainers();
        } catch {
            alert("Failed to save trainer.");
        }
    };

    const activePlansCount = plans.filter(p => p.is_active).length;
    const activeTrainersCount = trainers.filter(t => t.is_active !== false).length;

    return (
        <section className="page active pb-6" aria-labelledby="page-title">
            <article className="summary-card">
                <p className="summary-label">Offerings</p>
                <p className="summary-value mono">{plans.length + trainers.length} Total</p>
                <p className="summary-copy">Manage your membership tiers and personal trainers.</p>
                <div className="summary-meta">
                    <div>
                        <span>Active Plans</span>
                        <strong className="mono">{activePlansCount}</strong>
                    </div>
                    <div>
                        <span>Active Trainers</span>
                        <strong className="mono">{activeTrainersCount}</strong>
                    </div>
                </div>
            </article>

            <article className="card search-wrap">
                <div className="chip-row">
                    <button className={`chip ${tab === "plans" ? "active" : ""}`} type="button" onClick={() => setTab("plans")}>Membership Plans</button>
                    <button className={`chip ${tab === "trainers" ? "active" : ""}`} type="button" onClick={() => setTab("trainers")}>Trainers</button>
                </div>
            </article>

            <article className="card">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Directory</p>
                        <h2>{tab === "plans" ? "Plans list" : "Trainers list"}</h2>
                    </div>
                    <p className="section-label">{tab === "plans" ? plans.length : trainers.length} shown</p>
                </div>
                <div className="list-stack max-h-[600px] overflow-y-auto pr-1">
                    {tab === "plans" && plans.map((plan) => (
                        <article key={plan.plan_id} className="member-card">
                            <div className="member-topline">
                                <div>
                                    <p className="member-name">{plan.name}</p>
                                    <p className="subline">Tier: General</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`status-pill ${plan.is_active ? 'active' : 'canceled'}`}>
                                        {plan.is_active ? "Active" : "Inactive"}
                                    </span>
                                    <button onClick={() => handleOpenPlanModal(plan)} className="text-xs font-semibold text-brand-muted underline">Edit</button>
                                </div>
                            </div>
                            <div className="meta-grid">
                                <div>
                                    <span className="mini-meta">Price</span>
                                    <strong className="mono">₹{plan.price.toLocaleString()}</strong>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span className="mini-meta">Duration</span>
                                    <strong>{plan.duration_days} Days</strong>
                                </div>
                            </div>
                        </article>
                    ))}
                    {tab === "trainers" && trainers.map((trainer) => (
                        <article key={trainer.trainer_id} className="member-card">
                            <div className="member-topline">
                                <div>
                                    <p className="member-name">{trainer.name}</p>
                                    <p className="subline">{trainer.specialization || "General Fitness"}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`status-pill ${trainer.is_active !== false ? 'active' : 'canceled'}`}>
                                        {trainer.is_active !== false ? "Active" : "Inactive"}
                                    </span>
                                    <button onClick={() => handleOpenTrainerModal(trainer)} className="text-xs font-semibold text-brand-muted underline">Edit</button>
                                </div>
                            </div>
                            <div className="meta-grid">
                                <div>
                                    <span className="mini-meta">Charge/Session</span>
                                    <strong className="mono">₹{trainer.charge_per_session.toLocaleString()}</strong>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span className="mini-meta">Contact</span>
                                    <strong>{trainer.phone || trainer.email || "N/A"}</strong>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </article>

            <button 
                onClick={() => tab === "plans" ? handleOpenPlanModal() : handleOpenTrainerModal()} 
                className="w-full utility-button bg-brand-fg text-brand-surface py-3 text-sm rounded-2xl font-bold mt-2"
            >
                + Add {tab === "plans" ? "Plan" : "Trainer"}
            </button>

            {/* Modals overlay */}
            {(showPlanModal || showTrainerModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {showPlanModal && (
                        <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-brand-border max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">{editingPlan ? "Edit Plan" : "Add Plan"}</h2>
                            <form onSubmit={handlePlanSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Name</label>
                                    <input required className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Price (₹)</label>
                                    <input required type="number" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Duration (Days)</label>
                                    <input required type="number" min="1" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={planForm.duration_days} onChange={e => setPlanForm({...planForm, duration_days: e.target.value})} />
                                </div>
                                {editingPlan && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox" id="p-active" checked={planForm.is_active} onChange={e => setPlanForm({...planForm, is_active: e.target.checked})} className="w-4 h-4 rounded border-brand-border" />
                                        <label htmlFor="p-active" className="text-sm font-semibold">Active Plan</label>
                                    </div>
                                )}
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 p-3 rounded-xl border border-brand-border font-semibold text-sm">Cancel</button>
                                    <button type="submit" className="flex-1 p-3 rounded-xl bg-brand-fg text-brand-surface font-semibold text-sm">Save</button>
                                </div>
                            </form>
                        </div>
                    )}
                    {showTrainerModal && (
                        <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-brand-border max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">{editingTrainer ? "Edit Trainer" : "Add Trainer"}</h2>
                            <form onSubmit={handleTrainerSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Name</label>
                                    <input required className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={trainerForm.name} onChange={e => setTrainerForm({...trainerForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Phone</label>
                                    <input className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={trainerForm.phone} onChange={e => setTrainerForm({...trainerForm, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Specialization</label>
                                    <input className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={trainerForm.specialization} onChange={e => setTrainerForm({...trainerForm, specialization: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Charge/Session (₹)</label>
                                    <input required type="number" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={trainerForm.charge_per_session} onChange={e => setTrainerForm({...trainerForm, charge_per_session: e.target.value})} />
                                </div>
                                {editingTrainer && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox" id="t-active" checked={trainerForm.is_active} onChange={e => setTrainerForm({...trainerForm, is_active: e.target.checked})} className="w-4 h-4 rounded border-brand-border" />
                                        <label htmlFor="t-active" className="text-sm font-semibold">Active Trainer</label>
                                    </div>
                                )}
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setShowTrainerModal(false)} className="flex-1 p-3 rounded-xl border border-brand-border font-semibold text-sm">Cancel</button>
                                    <button type="submit" className="flex-1 p-3 rounded-xl bg-brand-fg text-brand-surface font-semibold text-sm">Save</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
