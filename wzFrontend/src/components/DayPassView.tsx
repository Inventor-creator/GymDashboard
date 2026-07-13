import { useState, useEffect, type FC } from "react";
import api from "../api";

const PLAN_OPTIONS = ["Day Pass", "HYROX"];

interface DayPassTx {
    transaction_id: number;
    member_name: string;
    plan_name: string;
    amount: number;
    date: string;
    payment_method: string;
    remark: string | null;
}

export const DayPassView: FC = () => {
    const [dayPasses, setDayPasses] = useState<DayPassTx[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [planFilter, setPlanFilter] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        plan_name: "Day Pass",
        amount: "",
        payment_method: "cash",
        payment_remark: "",
    });

    const fetchDayPasses = async () => {
        try {
            const params: Record<string, string> = {};
            if (planFilter) params.plan = planFilter;
            const res = await api.get("/day-passes/", { params });
            setDayPasses(res.data);
        } catch {
            console.error("Failed to fetch day passes");
        }
    };

    useEffect(() => {
        fetchDayPasses();
    }, [planFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/day-passes/", {
                name: form.name,
                email: form.email,
                phone_number: form.phone_number,
                plan_name: form.plan_name,
                amount: parseFloat(form.amount) || 0,
                payment_method: form.payment_method,
                payment_remark: form.payment_remark || null,
            });
            setShowModal(false);
            setForm({
                name: "",
                email: "",
                phone_number: "",
                plan_name: "Day Pass",
                amount: "",
                payment_method: "cash",
                payment_remark: "",
            });
            fetchDayPasses();
        } catch {
            alert("Failed to record day pass");
        }
    };

    const handleDelete = async (transactionId: number) => {
        if (!confirm("Delete this transaction?")) return;
        try {
            await api.delete(`/finances/transactions/${transactionId}`);
            fetchDayPasses();
        } catch {
            alert("Failed to delete transaction");
        }
    };

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[32px] mb-2 leading-tight">
                        Day Passes & HYROX
                    </h1>
                    <p className="text-brand-muted">
                        Record and manage one-time pass charges.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90"
                >
                    + Add Entry
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[480px] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl mb-6">New Entry</h2>
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
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
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
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone Number
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.phone_number}
                                    onChange={(e) =>
                                        setForm({ ...form, phone_number: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Type
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.plan_name}
                                    onChange={(e) =>
                                        setForm({ ...form, plan_name: e.target.value })
                                    }
                                >
                                    {PLAN_OPTIONS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Amount (₹)
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.amount}
                                    onChange={(e) =>
                                        setForm({ ...form, amount: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Payment Method
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.payment_method}
                                    onChange={(e) =>
                                        setForm({ ...form, payment_method: e.target.value })
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
                                    value={form.payment_remark}
                                    onChange={(e) =>
                                        setForm({ ...form, payment_remark: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-[18px] leading-snug">Entries</h2>
                <div className="ml-auto">
                    <select
                        className="px-3 py-2 rounded border border-brand-border bg-brand-surface text-[12px]"
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        {PLAN_OPTIONS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                className={`bg-brand-surface border border-brand-border rounded ${dayPasses.length > 10 ? "overflow-y-auto max-h-[600px]" : "overflow-hidden"}`}
            >
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 z-5">
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Customer
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Type
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Amount
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Date
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Method
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Remark
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {dayPasses.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="p-8 text-center text-brand-muted"
                                >
                                    No entries yet.
                                </td>
                            </tr>
                        ) : (
                            dayPasses.map((tx) => (
                                <tr
                                    key={tx.transaction_id}
                                    className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                                >
                                    <td className="p-4 border-b border-brand-border font-semibold">
                                        {tx.member_name}
                                    </td>
                                    <td className="p-4 border-b border-brand-border">
                                        <span className={`status-pill ${
                                            tx.plan_name === "HYROX"
                                                ? "bg-purple-50 text-purple-700"
                                                : "bg-status-active-bg text-status-active-fg"
                                        }`}>
                                            {tx.plan_name}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b border-brand-border mono font-semibold">
                                        ₹{tx.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4 border-b border-brand-border mono">
                                        {tx.date}
                                    </td>
                                    <td className="p-4 border-b border-brand-border">
                                        {tx.payment_method}
                                    </td>
                                    <td className="p-4 border-b border-brand-border text-brand-muted">
                                        {tx.remark || "—"}
                                    </td>
                                    <td className="p-4 border-b border-brand-border">
                                        <button
                                            onClick={() =>
                                                handleDelete(tx.transaction_id)
                                            }
                                            className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
