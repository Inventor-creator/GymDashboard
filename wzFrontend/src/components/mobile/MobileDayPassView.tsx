import { useState, useEffect, type FC } from "react";
import api from "../../api";

interface DayPassTx {
    transaction_id: number;
    member_name: string;
    amount: number;
    date: string;
    payment_method: string;
    remark: string | null;
}

export const MobileDayPassView: FC = () => {
    const [dayPasses, setDayPasses] = useState<DayPassTx[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        amount: "",
        payment_method: "cash",
        payment_remark: "",
    });

    const fetchDayPasses = async () => {
        try {
            const res = await api.get("/day-passes/");
            setDayPasses(res.data);
        } catch {
            console.error("Failed to fetch day passes");
        }
    };

    useEffect(() => {
        fetchDayPasses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/day-passes/", {
                name: form.name,
                email: form.email,
                phone_number: form.phone_number,
                amount: parseFloat(form.amount) || 0,
                payment_method: form.payment_method,
                payment_remark: form.payment_remark || null,
            });
            setShowModal(false);
            setForm({
                name: "",
                email: "",
                phone_number: "",
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
        if (!confirm("Delete this day pass transaction?")) return;
        try {
            await api.delete(`/finances/transactions/${transactionId}`);
            fetchDayPasses();
        } catch {
            alert("Failed to delete transaction");
        }
    };

    return (
        <div className="page active pb-6" aria-labelledby="page-title">
            <article className="summary-card">
                <p className="summary-label">Day passes</p>
                <p className="summary-value mono">{dayPasses.length} total</p>
                <p className="summary-copy">Record one-day entries for walk-in customers without a membership.</p>
            </article>

            <button
                onClick={() => setShowModal(true)}
                className="w-full utility-button bg-brand-fg text-brand-surface py-3 text-sm rounded-2xl font-bold mt-2"
            >
                + Add Day Pass
            </button>

            <article className="card" style={{ marginTop: "20px" }}>
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Transactions</p>
                        <h2>Day Pass History</h2>
                    </div>
                    <p className="section-label">{dayPasses.length} entries</p>
                </div>
                <div className="list-stack max-h-[500px] overflow-y-auto pr-1">
                    {dayPasses.length === 0 ? (
                        <div className="empty-state">No day pass transactions yet.</div>
                    ) : (
                        dayPasses.map((tx) => (
                            <article key={tx.transaction_id} className="member-card relative">
                                <div className="member-topline">
                                    <div>
                                        <p className="member-name">{tx.member_name}</p>
                                        <p className="subline">{tx.date} · {tx.payment_method}</p>
                                    </div>
                                    <span className="mono font-bold">₹{tx.amount.toFixed(2)}</span>
                                </div>
                                {tx.remark && (
                                    <div className="inline-cluster" style={{ marginTop: "8px" }}>
                                        <span className="plan-pill">{tx.remark}</span>
                                    </div>
                                )}
                                <div className="meta-grid items-end" style={{ marginTop: "8px" }}>
                                    <div />
                                    <div className="text-right">
                                        <button
                                            onClick={() => handleDelete(tx.transaction_id)}
                                            className="text-xs font-semibold text-red-500 underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </article>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-brand-border max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">New Day Pass</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Name</label>
                                <input required className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Email</label>
                                <input required type="email" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Phone Number</label>
                                <input required type="text" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Amount (₹)</label>
                                <input required type="number" step="0.01" min="0" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Payment Method</label>
                                <select className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Remark</label>
                                <input type="text" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-sm" value={form.payment_remark} onChange={e => setForm({...form, payment_remark: e.target.value})} />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 rounded-xl border border-brand-border font-semibold text-sm">Cancel</button>
                                <button type="submit" className="flex-1 p-3 rounded-xl bg-brand-fg text-brand-surface font-semibold text-sm">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
