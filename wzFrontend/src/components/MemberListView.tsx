import { useState, useMemo, useEffect, type FC } from "react";
import api from "../api";

interface Member {
    member_id: number;
    name: string;
    email: string;
    phone_number: string;
    plan: string;
    plan_price: number;
    joining_date: string;
    has_personal_training: boolean;
    personal_training_cost: number;
    assigned_trainer_id: number | null;
    assigned_trainer_name: string | null;
    assigned_trainer_plan_id: number | null;
    assigned_trainer_plan_name: string | null;
    total_owed: number;
    paid: boolean;
    payment_method: string;
    payment_remark: string | null;
    is_active: boolean;
}

interface Plan {
    plan_id: number;
    name: string;
    price: number;
}

interface Trainer {
    trainer_id: number;
    name: string;
    specialization: string | null;
    plans: {
        plan_id: number;
        name: string;
        price: number;
        duration_days: number;
    }[];
}

export const MemberListView: FC<{ gymId: number }> = ({ gymId }) => {
    const [search, setSearch] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isCustomPlan, setIsCustomPlan] = useState(false);
    const [memberForm, setMemberForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        plan: "monthly",
        plan_price: 0,
        has_personal_training: false,
        personal_training_cost: 0,
        assigned_trainer_id: "",
        assigned_trainer_name: "",
        assigned_trainer_plan_id: "",
        assigned_trainer_plan_name: "",
        initial_paid_amount: "",
        payment_method: "cash",
        payment_remark: "",
        custom_plan_name: "",
        custom_plan_price: "",
        custom_plan_duration: "30",
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
            setPlans(response.data);
        } catch {
            console.error("Error fetching plans");
        }
    };

    const fetchTrainers = async () => {
        try {
            const response = await api.get("/trainers/");
            setTrainers(response.data);
        } catch {
            console.error("Error fetching trainers");
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchPlans();
        fetchTrainers();
    }, [gymId]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const handleOpenAddModal = () => {
        setEditingMember(null);
        setIsCustomPlan(false);
        setMemberForm({
            name: "",
            email: "",
            phone_number: "",
            plan: "monthly",
            plan_price: plans.find((p) => p.name === "monthly")?.price || 0,
            has_personal_training: false,
            personal_training_cost: 0,
            assigned_trainer_id: "",
            assigned_trainer_plan_id: "",
            assigned_trainer_plan_name: "",
            assigned_trainer_name: "",
            initial_paid_amount: "",
            payment_method: "cash",
            payment_remark: "",
            custom_plan_name: "",
            custom_plan_price: "",
            custom_plan_duration: "30",
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (member: Member) => {
        setEditingMember(member);
        const isCustom = !plans.some((p) => p.name === member.plan);
        setIsCustomPlan(isCustom);
        setMemberForm({
            name: member.name,
            email: member.email,
            phone_number: member.phone_number,
            plan: member.plan,
            plan_price: member.plan_price,
            has_personal_training: member.has_personal_training,
            personal_training_cost: member.personal_training_cost,
            assigned_trainer_id: String(member.assigned_trainer_id ?? ""),
            assigned_trainer_plan_id: String(
                member.assigned_trainer_plan_id ?? "",
            ),
            initial_paid_amount: "",
            assigned_trainer_name: member.assigned_trainer_name ?? "",
            assigned_trainer_plan_name: member.assigned_trainer_plan_name ?? "",
            payment_method: member.payment_method,
            payment_remark: member.payment_remark || "",
            custom_plan_name: isCustom ? member.plan : "",
            custom_plan_price: isCustom ? String(member.plan_price) : "",
            custom_plan_duration: "30",
        });
        setIsModalOpen(true);
    };

    const handleOpenReadmitModal = (member: Member) => {
        setEditingMember(null);
        const isCustom = !plans.some((p) => p.name === member.plan);
        setIsCustomPlan(isCustom);
        setMemberForm({
            name: member.name,
            email: member.email,
            phone_number: member.phone_number,
            plan: member.plan,
            plan_price: member.plan_price,
            has_personal_training: member.has_personal_training,
            personal_training_cost: member.personal_training_cost,
            assigned_trainer_id: String(member.assigned_trainer_id ?? ""),
            assigned_trainer_plan_id: String(
                member.assigned_trainer_plan_id ?? "",
            ),
            initial_paid_amount: "",
            assigned_trainer_name: member.assigned_trainer_name ?? "",
            assigned_trainer_plan_name: member.assigned_trainer_plan_name ?? "",
            payment_method: member.payment_method,
            payment_remark: member.payment_remark || "",
            custom_plan_name: isCustom ? member.plan : "",
            custom_plan_price: isCustom ? String(member.plan_price) : "",
            custom_plan_duration: "30",
        });
        setIsModalOpen(true);
    };

    const handlePlanChange = (planName: string) => {
        if (planName === "__custom__") {
            setIsCustomPlan(true);
            setMemberForm({ ...memberForm, plan: planName, plan_price: 0 });
        } else {
            setIsCustomPlan(false);
            const selectedPlan = plans.find((p) => p.name === planName);
            setMemberForm({
                ...memberForm,
                plan: planName,
                plan_price: selectedPlan?.price || 0,
                custom_plan_name: "",
                custom_plan_price: "",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const trainerId = memberForm.assigned_trainer_id
                ? parseInt(memberForm.assigned_trainer_id)
                : null;
            const payload: Record<string, unknown> = {
                name: memberForm.name,
                email: memberForm.email,
                phone_number: memberForm.phone_number,
                plan: memberForm.plan,
                plan_price: memberForm.plan_price,
                has_personal_training:
                    !!memberForm.assigned_trainer_plan_id ||
                    (trainerId !== null && memberForm.has_personal_training),
                personal_training_cost: (() => {
                    if (memberForm.assigned_trainer_plan_id) {
                        const selectedTrainer = trainers.find(
                            (t) => t.trainer_id === trainerId,
                        );
                        const selectedPlan = selectedTrainer?.plans?.find(
                            (p) =>
                                p.plan_id ===
                                parseInt(memberForm.assigned_trainer_plan_id),
                        );
                        return selectedPlan?.price ?? 0;
                    }
                    return memberForm.has_personal_training
                        ? memberForm.personal_training_cost
                        : 0;
                })(),
                assigned_trainer_id: trainerId,
                assigned_trainer_plan_id: memberForm.assigned_trainer_plan_id
                    ? parseInt(memberForm.assigned_trainer_plan_id)
                    : null,
                initial_paid_amount:
                    parseFloat(memberForm.initial_paid_amount) || 0,
                payment_method: memberForm.payment_method,
                payment_remark: memberForm.payment_remark || null,
            };

            if (isCustomPlan) {
                payload.custom_plan_name = memberForm.custom_plan_name;
                payload.custom_plan_price =
                    parseFloat(memberForm.custom_plan_price) || 0;
                payload.custom_plan_duration =
                    parseInt(memberForm.custom_plan_duration) || 30;
                payload.plan = memberForm.custom_plan_name;
            }

            if (editingMember) {
                await api.put(`/members/${editingMember.member_id}`, payload);
            } else {
                await api.post("/members/", { ...payload, gym_id: gymId });
            }
            setIsModalOpen(false);
            fetchMembers();
        } catch (error) {
            console.error("error:", error);
            alert("recheck the contents, wrong inputs");
        }
    };

    const handleDeleteMember = async () => {
        if (!editingMember) return;
        if (
            !confirm(
                "Are you sure you want to remove this member? This action cannot be undone.",
            )
        )
            return;

        try {
            await api.delete(`/members/${editingMember.member_id}`);
            setIsModalOpen(false);
            fetchMembers();
        } catch (error) {
            console.error("Failed to delete member:", error);
            alert("Failed to delete member");
        }
    };

    const filteredMembers = useMemo(() => {
        return members.filter(
            (m) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.plan.toLowerCase().includes(search.toLowerCase()) ||
                m.email.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, members]);

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[32px] mb-2 leading-tight">
                        Member Directory
                    </h1>
                    <p className="text-brand-muted">
                        Manage your gym's{" "}
                        {members.filter((m) => m.is_active).length} active
                        members.
                    </p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="px-4 py-2 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg w-[240px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90"
                    >
                        Add Member
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl mb-6">
                            {editingMember ? "Edit Member" : "Add New Member"}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={memberForm.name}
                                    onChange={(e) =>
                                        setMemberForm({
                                            ...memberForm,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={memberForm.email}
                                    onChange={(e) =>
                                        setMemberForm({
                                            ...memberForm,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={memberForm.phone_number}
                                    onChange={(e) =>
                                        setMemberForm({
                                            ...memberForm,
                                            phone_number: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Plan
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={
                                        isCustomPlan
                                            ? "__custom__"
                                            : memberForm.plan
                                    }
                                    onChange={(e) =>
                                        handlePlanChange(e.target.value)
                                    }
                                >
                                    {plans.map((p) => (
                                        <option key={p.plan_id} value={p.name}>
                                            {p.name} (₹{p.price})
                                        </option>
                                    ))}
                                    <option value="__custom__">
                                        Custom Plan
                                    </option>
                                </select>
                            </div>
                            {!isCustomPlan && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Plan Price (₹)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                        value={memberForm.plan_price}
                                        onChange={(e) =>
                                            setMemberForm({
                                                ...memberForm,
                                                plan_price:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                            )}
                            {isCustomPlan && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Custom Plan Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                            value={memberForm.custom_plan_name}
                                            onChange={(e) =>
                                                setMemberForm({
                                                    ...memberForm,
                                                    custom_plan_name:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Custom Plan Price (₹)
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                            value={memberForm.custom_plan_price}
                                            onChange={(e) =>
                                                setMemberForm({
                                                    ...memberForm,
                                                    custom_plan_price:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Custom Plan Duration (Days)
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                            value={
                                                memberForm.custom_plan_duration
                                            }
                                            onChange={(e) =>
                                                setMemberForm({
                                                    ...memberForm,
                                                    custom_plan_duration:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Assigned Trainer
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={memberForm.assigned_trainer_id}
                                    onChange={(e) =>
                                        setMemberForm({
                                            ...memberForm,
                                            assigned_trainer_id: e.target.value,
                                            assigned_trainer_plan_id: "",
                                        })
                                    }
                                >
                                    <option value="">Select a trainer</option>
                                    {trainers.map((t) => (
                                        <option
                                            key={t.trainer_id}
                                            value={t.trainer_id}
                                        >
                                            {t.name}
                                            {t.specialization
                                                ? ` (${t.specialization})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {memberForm.assigned_trainer_id &&
                                (() => {
                                    const selectedTrainer = trainers.find(
                                        (t) =>
                                            t.trainer_id ===
                                            parseInt(
                                                memberForm.assigned_trainer_id,
                                            ),
                                    );
                                    return selectedTrainer &&
                                        selectedTrainer.plans &&
                                        selectedTrainer.plans.length > 0 ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Trainer Plan
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                                value={
                                                    memberForm.assigned_trainer_plan_id
                                                }
                                                onChange={(e) =>
                                                    setMemberForm({
                                                        ...memberForm,
                                                        assigned_trainer_plan_id:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                {selectedTrainer.plans.map(
                                                    (tp) => (
                                                        <option
                                                            key={tp.plan_id}
                                                            value={tp.plan_id}
                                                        >
                                                            {tp.name} — ₹
                                                            {tp.price.toLocaleString()}{" "}
                                                            / {tp.duration_days}
                                                            d
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    ) : selectedTrainer ? (
                                        <div className="text-[12px] text-brand-muted italic">
                                            No plans defined for this trainer
                                        </div>
                                    ) : null;
                                })()}
                            {!editingMember && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium">
                                            Initial Payment (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                memberForm.initial_paid_amount
                                            }
                                            onChange={(e) =>
                                                setMemberForm({
                                                    ...memberForm,
                                                    initial_paid_amount:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Payment Method
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                            value={memberForm.payment_method}
                                            onChange={(e) =>
                                                setMemberForm({
                                                    ...memberForm,
                                                    payment_method:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="upi">UPI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Remark
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                            value={memberForm.payment_remark}
                                            onChange={(e) =>
                                                setMemberForm({
                                                    ...memberForm,
                                                    payment_remark:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 mt-4">
                                {editingMember && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteMember}
                                        className="px-4 py-2 rounded font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all duration-150"
                                    >
                                        Left
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90"
                                >
                                    {editingMember
                                        ? "Update Member"
                                        : "Save Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div
                className={`bg-brand-surface border border-brand-border rounded ${filteredMembers.length > 10 ? "overflow-y-auto max-h-[600px]" : "overflow-hidden"}`}
            >
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 z-5">
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Name
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Plan
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Join Date
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Trainer
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Owed
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Status
                            </th>
                            {/*<th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Method
                            </th>*/}
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr
                                key={member.member_id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border font-semibold">
                                    {member.name}
                                    {!member.is_active && (
                                        <span className="ml-2 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                                            Left
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {member.plan}
                                </td>
                                <td className="p-4 border-b border-brand-border mono">
                                    {new Date(
                                        member.joining_date,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {member.assigned_trainer_name || (
                                        <span className="text-brand-muted">
                                            —
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 border-b border-brand-border mono font-semibold">
                                    ₹{member.total_owed.toLocaleString()}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <span
                                        className={`status-pill ${member.paid ? "bg-status-active-bg text-status-active-fg" : "bg-status-pending-bg text-status-pending-fg"}`}
                                    >
                                        {member.paid ? "Paid" : "Unpaid"}
                                    </span>
                                </td>
                                {/*<td className="p-4 border-b border-brand-border">
                                    {member.payment_method}
                                </td>*/}
                                <td className="p-4 border-b border-brand-border">
                                    {member.is_active ? (
                                        <button
                                            onClick={() =>
                                                handleOpenEditModal(member)
                                            }
                                            className="px-2 py-1 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg text-[12px]"
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleOpenReadmitModal(member)
                                            }
                                            className="px-2 py-1 rounded font-semibold border border-brand-accent bg-brand-accent text-white transition-all duration-150 hover:opacity-90 text-[12px]"
                                        >
                                            Readmit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
