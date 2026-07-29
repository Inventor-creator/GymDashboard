import { useState, useEffect, useCallback, type FC } from "react";
import api from "../api";

interface Expense {
    expense_id: number;
    gym_id: number;
    amount: number;
    description: string;
    category: string;
    date: string;
    created_at: string;
}

const CATEGORIES = [
    "rent",
    "utilities",
    "equipment",
    "supplies",
    "maintenance",
    "salary",
    "marketing",
    "other",
];

export function FetchExpenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const reFetchExpenses = useCallback(async () => {
        try {
            const res = await api.get("/finances/expenses");
            setExpenses(res.data);
        } catch {
            console.error("Failed to fetch expenses");
        }
    }, []);

    useEffect(() => {
        reFetchExpenses();
    }, [reFetchExpenses]);

    return { expenses, reFetchExpenses };
}

export const ExpenseLogView: FC = () => {
    const { expenses, reFetchExpenses } = FetchExpenses();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        amount: "",
        description: "",
        category: "other",
        date: new Date().toISOString().slice(0, 10),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/finances/expenses", {
                amount: parseFloat(form.amount),
                description: form.description,
                category: form.category,
                date: form.date || undefined,
            });
            setShowForm(false);
            setForm({
                amount: "",
                description: "",
                category: "other",
                date: new Date().toISOString().slice(0, 10),
            });
            reFetchExpenses();
        } catch {
            alert("Failed to log expense");
        }
    };

    const totalExpenses = expenses.reduce(
        (sum, ex) => sum + ex.amount,
        0,
    );

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-[32px] mb-2 leading-tight">
                        Expense Log
                    </h1>
                    <p className="text-brand-muted mb-4">
                        Track gym operating costs and overheads.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-brand-fg text-brand-surface px-4 py-2 text-[14px] font-bold hover:opacity-90 transition-opacity rounded"
                >
                    + Log Expense
                </button>
            </div>

            <div className="bg-brand-surface border border-brand-border p-6 rounded mb-8">
                <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                    Total Expenses
                </div>
                <div className="text-[28px] font-bold mono text-red-500">
                    ₹{totalExpenses.toLocaleString()}
                </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Date
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Description
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Category
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((ex) => (
                            <tr
                                key={ex.expense_id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border mono">
                                    {ex.date}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {ex.description}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <span className="text-[11px] uppercase tracking-[0.06em] bg-brand-bg px-2 py-1 rounded">
                                        {ex.category}
                                    </span>
                                </td>
                                <td className="p-4 border-b border-brand-border mono font-semibold text-red-500">
                                    -₹{ex.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-8 text-center text-brand-muted"
                                >
                                    No expenses logged yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[480px] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl mb-2">Log Expense</h2>
                        <p className="text-brand-muted mb-6">
                            Record a gym operating expense.
                        </p>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
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
                                        setForm({
                                            ...form,
                                            amount: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Category
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category: e.target.value,
                                        })
                                    }
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() +
                                                cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={form.date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90"
                                >
                                    Log Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
