import { useState, useMemo, useEffect, type FC } from "react";
import api from "../../api";
import { useGym } from "../../contexts/GymContext";

interface Member {
    member_id: number;
    name: string;
    email: string;
    phone_number: string;
    plan: string;
    plan_price: number;
    plan_id: number | null;
    custom_plan_price: number | null;
    joining_date: string;
    has_personal_training: boolean;
    personal_training_cost: number | null;
    total_owed: number;
    paid: boolean;
    payment_method: string;
    payment_remark: string | null;
}

interface Plan {
    plan_id: number;
    name: string;
    price: number;
}

export const MobileMemberListView: FC = () => {
    const { activeGymId } = useGym();
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    // Modal States
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [payingMember, setPayingMember] = useState<Member | null>(null);

    // Form States
    const [memberForm, setMemberForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        plan_id: "",
        custom_plan_name: "",
        custom_plan_price: "",
        custom_plan_duration: "30",
        has_personal_training: false,
        personal_training_cost: 0,
        initial_paid_amount: "",
        payment_method: "cash",
        payment_remark: ""
    });
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        method: "cash",
        remark: ""
    });

    const fetchMembers = async () => {
        try {
            const response = await api.get("/members/");
            setMembers(response.data);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get("/plans/");
            setPlans(response.data.filter((p: any) => p.is_active));
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    const filteredMembers = useMemo(() => {
        return members.filter((m) => {
            const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.plan.toLowerCase().includes(search.toLowerCase());
            if (!matchesSearch) return false;
            if (filter === "active") return m.paid;
            if (filter === "attention") return !m.paid;
            return true;
        });
    }, [search, filter, members]);

    const activeCount = members.filter(m => m.paid).length;
    const attentionCount = members.filter(m => !m.paid).length;

    const handleOpenAddModal = () => {
        setEditingMember(null);
        setMemberForm({
            name: "",
            email: "",
            phone_number: "",
            plan_id: "",
            custom_plan_name: "",
            custom_plan_price: "",
            custom_plan_duration: "30",
            has_personal_training: false,
            personal_training_cost: 0,
            initial_paid_amount: "",
            payment_method: "cash",
            payment_remark: ""
        });
        setShowMemberModal(true);
    };

    const handleOpenEditModal = (m: Member) => {
        const isCustom = !m.plan_id;
        const dbPlan = plans.find(p => p.plan_id === m.plan_id);
        setEditingMember(m);
        setMemberForm({
            name: m.name,
            email: m.email || "",
            phone_number: m.phone_number || "",
            plan_id: isCustom ? "custom" : String(dbPlan?.plan_id || ""),
            custom_plan_name: isCustom ? m.plan : "",
            custom_plan_price: isCustom ? String(m.plan_price || "") : "",
            custom_plan_duration: "30",
            has_personal_training: m.has_personal_training,
            personal_training_cost: m.personal_training_cost || 0,
            initial_paid_amount: "",
            payment_method: m.payment_method || "cash",
            payment_remark: m.payment_remark || ""
        });
        setShowMemberModal(true);
    };

    const handleOpenPaymentModal = (m: Member) => {
        setPayingMember(m);
        setPaymentForm({
            amount: m.total_owed.toString(),
            method: "cash",
            remark: ""
        });
        setShowPaymentModal(true);
    };

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isCustomPlan = memberForm.plan_id === "custom" || memberForm.plan_id === "";
        let selectedPlanName = "";
        let selectedPlanPrice = 0;
        
        if (!isCustomPlan) {
            const p = plans.find(p => p.plan_id.toString() === memberForm.plan_id);
            if (p) {
                selectedPlanName = p.name;
                selectedPlanPrice = p.price;
            }
        } else {
            selectedPlanName = memberForm.custom_plan_name;
            selectedPlanPrice = parseFloat(memberForm.custom_plan_price) || 0;
        }

        const payload: Record<string, unknown> = {
            name: memberForm.name,
            email: memberForm.email,
            phone_number: memberForm.phone_number,
            plan: selectedPlanName,
            plan_price: selectedPlanPrice,
            has_personal_training: memberForm.has_personal_training,
            personal_training_cost: memberForm.has_personal_training ? memberForm.personal_training_cost : 0,
            initial_paid_amount: parseFloat(memberForm.initial_paid_amount) || 0,
            payment_method: memberForm.payment_method,
            payment_remark: memberForm.payment_remark || null
        };

        if (isCustomPlan) {
            payload.custom_plan_name = memberForm.custom_plan_name;
            payload.custom_plan_price = parseFloat(memberForm.custom_plan_price) || 0;
            payload.custom_plan_duration = parseInt(memberForm.custom_plan_duration) || 30;
            payload.plan = memberForm.custom_plan_name;
        }

        try {
            if (editingMember) {
                await api.put(`/members/${editingMember.member_id}`, payload);
            } else {
                await api.post("/members/", { ...payload, gym_id: activeGymId });
            }
            setShowMemberModal(false);
            fetchMembers();
        } catch (error) {
            console.error("Failed to save member:", error);
            alert("Failed to save member.");
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payingMember || !activeGymId) return;
        try {
            await api.post("/finances/pay", {
                member_id: payingMember.member_id,
                gym_id: activeGymId,
                amount: parseFloat(paymentForm.amount),
                payment_method: paymentForm.method,
                paid_by: paymentForm.method,
                remark: paymentForm.remark || null
            });
            setShowPaymentModal(false);
            fetchMembers();
        } catch {
            alert("Failed to record payment");
        }
    };

    return (
        <section className="page active pb-6" aria-labelledby="page-title">
            <article className="summary-card">
                <p className="summary-label">Member roster</p>
                <p className="summary-value mono">{members.length} accounts</p>
                <p className="summary-copy">{activeCount} active, {attentionCount} pending payment. Search by name or filter for accounts that need action.</p>
            </article>

            <article className="card search-wrap">
                <label className="eyebrow" htmlFor="member-search">Search members</label>
                <input
                    id="member-search"
                    className="search-input"
                    type="search"
                    placeholder="Search by member name or plan"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="chip-row">
                    <button className={`chip ${filter === "all" ? "active" : ""}`} type="button" onClick={() => setFilter("all")}>All</button>
                    <button className={`chip ${filter === "active" ? "active" : ""}`} type="button" onClick={() => setFilter("active")}>Active</button>
                    <button className={`chip ${filter === "attention" ? "active" : ""}`} type="button" onClick={() => setFilter("attention")}>Attention</button>
                </div>
            </article>

            <article className="card">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Directory</p>
                        <h2>Member list</h2>
                    </div>
                    <p className="section-label">{filteredMembers.length} shown</p>
                </div>
                <div className="list-stack max-h-[600px] overflow-y-auto pr-1">
                    {filteredMembers.length === 0 ? (
                        <div className="empty-state">
                            No members match that search.
                        </div>
                    ) : (
                        filteredMembers.map(member => (
                            <article key={member.member_id} className="member-card relative">
                                <div className="member-topline">
                                    <div>
                                        <p className="member-name">{member.name}</p>
                                        <p className="subline">Joined {new Date(member.joining_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`status-pill ${member.paid ? 'active' : 'pending'}`}>
                                            {member.paid ? "Paid" : "Pending"}
                                        </span>
                                        <button onClick={() => handleOpenEditModal(member)} className="text-xs font-semibold text-brand-muted underline">Edit</button>
                                    </div>
                                </div>
                                <div className="inline-cluster" style={{ marginTop: "12px" }}>
                                    <span className="plan-pill">{member.plan} {member.has_personal_training ? "+ PT" : ""}</span>
                                </div>
                                <div className="meta-grid items-end">
                                    <div>
                                        <span className="mini-meta">Owed amount</span>
                                        <strong className="mono text-red-500">₹{member.total_owed.toLocaleString()}</strong>
                                    </div>
                                    <div className="text-right">
                                        {!member.paid ? (
                                            <button onClick={() => handleOpenPaymentModal(member)} className="utility-button bg-brand-fg text-brand-surface !px-3 !min-h-[32px] !text-[10px]">Record Pay</button>
                                        ) : (
                                            <>
                                                <span className="mini-meta">Needs action</span>
                                                <strong>No</strong>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </article>

            <button onClick={handleOpenAddModal} className="w-full utility-button bg-brand-fg text-brand-surface py-3 text-sm rounded-2xl font-bold mt-2">
                + Add Member
            </button>

            {/* Modals overlay */}
            {(showMemberModal || showPaymentModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {showMemberModal && (
                        <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-brand-border max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">{editingMember ? "Edit Member" : "Add Member"}</h2>
                            <form onSubmit={handleMemberSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Name</label>
                                    <input required className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Email</label>
                                    <input required type="email" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Phone</label>
                                    <input required type="text" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.phone_number} onChange={e => setMemberForm({...memberForm, phone_number: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Plan</label>
                                    <select className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.plan_id} onChange={e => setMemberForm({...memberForm, plan_id: e.target.value})}>
                                        <option value="">Select Plan...</option>
                                        {plans.map(p => (
                                            <option key={p.plan_id} value={p.plan_id}>{p.name}</option>
                                        ))}
                                        <option value="custom">Custom Plan</option>
                                    </select>
                                </div>
                                {memberForm.plan_id === "custom" && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Custom Plan Name</label>
                                            <input required className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.custom_plan_name} onChange={e => setMemberForm({...memberForm, custom_plan_name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Custom Price (₹)</label>
                                            <input required type="number" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.custom_plan_price} onChange={e => setMemberForm({...memberForm, custom_plan_price: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Custom Duration (Days)</label>
                                            <input required type="number" min="1" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.custom_plan_duration} onChange={e => setMemberForm({...memberForm, custom_plan_duration: e.target.value})} />
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="m-pt" checked={memberForm.has_personal_training} onChange={e => setMemberForm({...memberForm, has_personal_training: e.target.checked})} className="w-4 h-4 rounded border-brand-border" />
                                    <label htmlFor="m-pt" className="text-sm font-semibold">Has Personal Training</label>
                                </div>
                                {memberForm.has_personal_training && (
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">PT Cost (₹)</label>
                                        <input type="number" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.personal_training_cost} onChange={e => setMemberForm({...memberForm, personal_training_cost: parseFloat(e.target.value) || 0})} />
                                    </div>
                                )}
                                {!editingMember && (
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Initial Payment (₹)</label>
                                        <input type="number" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={memberForm.initial_paid_amount} onChange={e => setMemberForm({...memberForm, initial_paid_amount: e.target.value})} />
                                    </div>
                                )}
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 p-3 rounded-xl border border-brand-border font-semibold text-sm">Cancel</button>
                                    <button type="submit" className="flex-1 p-3 rounded-xl bg-brand-fg text-brand-surface font-semibold text-sm">Save</button>
                                </div>
                            </form>
                        </div>
                    )}
                    {showPaymentModal && payingMember && (
                        <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-brand-border max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-1">Record Payment</h2>
                            <p className="text-sm text-brand-muted mb-4">Member: <strong className="text-brand-fg">{payingMember.name}</strong></p>
                            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Amount (₹)</label>
                                    <input required type="number" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Method</label>
                                    <select className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="upi">UPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Remark (Optional)</label>
                                    <input className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={paymentForm.remark} onChange={e => setPaymentForm({...paymentForm, remark: e.target.value})} />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 p-3 rounded-xl border border-brand-border font-semibold text-sm">Cancel</button>
                                    <button type="submit" className="flex-1 p-3 rounded-xl bg-brand-accent text-white font-semibold text-sm">Confirm</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
