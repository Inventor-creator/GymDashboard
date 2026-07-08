import { useState, useEffect, type FC } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useGym } from "../contexts/GymContext";
import api from "../api";

interface FinanceSummary {
    total_income_ytd: number;
    total_expenses: number;
    net_income: number;
    outstanding_revenue: number;
    active_members: number;
    monthly_breakdown: { month: string; income: number; pt_income: number }[];
    revenue_by_source: { membership_fees: number; personal_training: number };
    new_signups_this_month: number;
}

interface Transaction {
    transaction_id: number;
    member_name: string;
    amount: number;
    date: string;
    status: string;
    plan_name: string | null;
    payment_method: string;
    remark: string | null;
}

interface OutstandingMember {
    member_id: number;
    member_name: string;
    plan: string;
    plan_price: number;
    has_personal_training: boolean;
    personal_training_cost: number;
    total_owed: number;
    payment_method: string;
    payment_remark: string | null;
}

const PIE_COLORS = ["#8884d8", "#82ca9d"];

export const FinanceView: FC = () => {
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [outstanding, setOutstanding] = useState<OutstandingMember[]>([]);
    const [paidFilter, setPaidFilter] = useState("");
    const [search, setSearch] = useState("");
    const [showPayModal, setShowPayModal] = useState(false);
    const [payingMember, setPayingMember] = useState<OutstandingMember | null>(
        null,
    );
    const { activeGymId } = useGym();
    const [payForm, setPayForm] = useState({
        amount: "",
        payment_method: "cash",
        remark: "",
    });

    const fetchSummary = async () => {
        try {
            const res = await api.get("/finances/summary");
            setSummary(res.data);
        } catch {
            console.error("Failed to fetch summary");
        }
    };

    const fetchTransactions = async () => {
        try {
            const params: Record<string, string> = {};
            if (paidFilter) params.paid = paidFilter;
            if (search) params.search = search;
            const res = await api.get("/finances/transactions", { params });
            setTransactions(res.data);
        } catch {
            console.error("Failed to fetch transactions");
        }
    };

    const fetchOutstanding = async () => {
        try {
            const res = await api.get("/finances/outstanding");
            setOutstanding(res.data);
        } catch {
            console.error("Failed to fetch outstanding");
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchOutstanding();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [paidFilter, search]);

    const openPayModal = (m: OutstandingMember) => {
        setPayingMember(m);
        setPayForm({
            amount: String(m.total_owed),
            payment_method: "cash",
            remark: "",
        });
        setShowPayModal(true);
    };

    const handlePaySubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!payingMember) return;
        try {
            await api.post("/finances/pay", {
                member_id: payingMember.member_id,
                gym_id: activeGymId,
                amount: parseFloat(payForm.amount),
                payment_method: payForm.payment_method,
                paid_by: payForm.payment_method,
                remark: payForm.remark || null,
            });
            setShowPayModal(false);
            fetchSummary();
            fetchOutstanding();
            fetchTransactions();
        } catch {
            alert("Failed to record payment");
        }
    };

    const handleExportCsv = async () => {
        try {
            const response = await api.get("/finances/export", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "transactions.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to export transactions", error);
            alert("Failed to export transactions");
        }
    };

    const handleRenewBilling = async () => {
        if (
            !confirm(
                "Are you sure you want to run the billing cycle? This will add monthly costs to all active members' total owed.",
            )
        )
            return;
        try {
            const res = await api.post("/finances/renew-billing");
            alert(res.data.detail);
            fetchSummary();
            fetchOutstanding();
            fetchTransactions();
        } catch (error) {
            console.error("Failed to renew billing", error);
            alert("Failed to renew billing");
        }
    };

    const sourcePieData = summary
        ? [
              {
                  name: "Membership Fees",
                  value: summary.revenue_by_source.membership_fees,
              },
              {
                  name: "Personal Training",
                  value: summary.revenue_by_source.personal_training,
              },
          ]
        : [];

    const totalOutstanding = outstanding.reduce(
        (sum, m) => sum + m.total_owed,
        0,
    );

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-[32px] mb-2 leading-tight">
                    Financial Overview
                </h1>
                <p className="text-brand-muted mb-4">
                    Detailed breakdown of gym revenue and income.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={handleExportCsv}
                        className="bg-brand-surface border border-brand-border text-brand-fg px-4 py-2 text-[14px] font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 rounded"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export CSV
                    </button>
                    <button
                        onClick={handleRenewBilling}
                        className="bg-brand-fg text-brand-surface px-4 py-2 text-[14px] font-bold hover:opacity-90 transition-opacity rounded"
                    >
                        Run Billing Cycle
                    </button>
                </div>
            </div>

            {summary && (
                <>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                                Total Income (YTD)
                            </div>
                            <div className="text-[28px] font-bold mb-1 mono">
                                ₹{summary.total_income_ytd.toLocaleString()}
                            </div>
                            <div className="text-[12px] text-trend-up">
                                ↑ from{" "}
                                {summary.monthly_breakdown.length > 0
                                    ? "monthly dues"
                                    : "no data yet"}
                            </div>
                        </div>
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                                Outstanding Revenue
                            </div>
                            <div className="text-[28px] font-bold mb-1 mono">
                                ₹{summary.outstanding_revenue.toLocaleString()}
                            </div>
                            <div className="text-[12px] text-trend-down">
                                {outstanding.length} unpaid member(s)
                            </div>
                        </div>
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                                Total Expenses (YTD)
                            </div>
                            <div className="text-[28px] font-bold mb-1 mono text-red-500">
                                ₹{summary.total_expenses.toLocaleString()}
                            </div>
                            <div className="text-[12px] text-brand-muted">
                                deducted from income
                            </div>
                        </div>
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                                Net Income (YTD)
                            </div>
                            <div className="text-[28px] font-bold mb-1 mono">
                                ₹{summary.net_income.toLocaleString()}
                            </div>
                            <div className="text-[12px] text-trend-up">
                                income − expenses
                            </div>
                        </div>
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                                Active Members
                            </div>
                            <div className="text-[28px] font-bold mb-1 mono">
                                {summary.active_members}
                            </div>
                            <div className="text-[12px] text-trend-up">
                                +{summary.new_signups_this_month} this month
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <h3 className="text-[14px] mb-4 uppercase text-brand-muted">
                                Monthly Revenue
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={summary.monthly_breakdown}
                                    margin={{
                                        top: 5,
                                        right: 0,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="oklch(85% 0.01 240)"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar
                                        dataKey="income"
                                        fill="#8884d8"
                                        name="Membership"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="pt_income"
                                        fill="#82ca9d"
                                        name="PT"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-brand-surface border border-brand-border p-6 rounded">
                            <h3 className="text-[14px] mb-4 uppercase text-brand-muted">
                                Revenue by Source
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={sourcePieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, value }) =>
                                            `${name}: ₹${value.toLocaleString()}`
                                        }
                                    >
                                        {sourcePieData.map((_, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={PIE_COLORS[idx]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-[18px] leading-snug">Transactions</h2>
                <div className="ml-auto flex gap-3">
                    <select
                        className="px-3 py-2 rounded border border-brand-border bg-brand-surface text-[12px]"
                        value={paidFilter}
                        onChange={(e) => setPaidFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Paid</option>
                        <option value="false">Unpaid</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search member..."
                        className="px-3 py-2 rounded border border-brand-border bg-brand-surface w-[200px] text-[12px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div
                className={`bg-brand-surface border border-brand-border rounded ${transactions.length > 10 ? "overflow-y-auto max-h-[600px]" : "overflow-hidden"}`}
            >
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 z-5">
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Member
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Plan
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Amount
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Date
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Status
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Method
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Remark
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr
                                key={tx.transaction_id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border font-semibold">
                                    {tx.member_name}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {tx.plan_name || "—"}
                                </td>
                                <td className="p-4 border-b border-brand-border mono font-semibold">
                                    ₹{tx.amount.toFixed(2)}
                                </td>
                                <td className="p-4 border-b border-brand-border mono">
                                    {tx.date}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <span
                                        className={`status-pill ${
                                            tx.status === "paid"
                                                ? "bg-status-active-bg text-status-active-fg"
                                                : tx.status === "expense"
                                                  ? "bg-red-50 text-red-600"
                                                  : "bg-status-pending-bg text-status-pending-fg"
                                        }`}
                                    >
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {tx.payment_method}
                                </td>
                                <td className="p-4 border-b border-brand-border text-brand-muted">
                                    {tx.remark || "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div
                className={`bg-brand-surface border border-brand-border rounded mt-5 ${outstanding.length > 5 ? "overflow-y-auto max-h-[600px]" : "overflow-hidden"}`}
            >
                <div className="bg-brand-bg px-4 py-3 border-b border-brand-border flex justify-between items-center">
                    <h3 className="text-[14px] font-semibold">
                        Outstanding Debts
                    </h3>
                    <span className="text-[14px] mono font-bold text-red-500">
                        Total: ₹{totalOutstanding.toLocaleString()}
                    </span>
                </div>
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Member
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Plan
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                PT
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Owed
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
                        {outstanding.map((m) => (
                            <tr
                                key={m.member_id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border font-semibold">
                                    {m.member_name}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {m.plan}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {m.has_personal_training
                                        ? `₹${m.personal_training_cost}`
                                        : "No"}
                                </td>
                                <td className="p-4 border-b border-brand-border mono font-semibold text-red-500">
                                    ₹{m.total_owed.toLocaleString()}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {m.payment_method}
                                </td>
                                <td className="p-4 border-b border-brand-border text-brand-muted">
                                    {m.payment_remark || "—"}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <button
                                        onClick={() => openPayModal(m)}
                                        className="px-3 py-1 rounded font-semibold bg-brand-accent text-white text-[11px] hover:opacity-90"
                                    >
                                        Record Payment
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showPayModal && payingMember && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl mb-2">Record Payment</h2>
                        <p className="text-brand-muted mb-6">
                            Member: <strong>{payingMember.member_name}</strong>
                        </p>
                        <form
                            onSubmit={handlePaySubmit}
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
                                    value={payForm.amount}
                                    onChange={(e) =>
                                        setPayForm({
                                            ...payForm,
                                            amount: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Payment Method
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={payForm.payment_method}
                                    onChange={(e) =>
                                        setPayForm({
                                            ...payForm,
                                            payment_method: e.target.value,
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
                                    value={payForm.remark}
                                    onChange={(e) =>
                                        setPayForm({
                                            ...payForm,
                                            remark: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
