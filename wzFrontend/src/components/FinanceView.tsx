import { FC } from "react";

const DATA = {
    finances: {
        totalIncome: 142580.0,
        monthlyGrowth: 12.5,
        recentTransactions: [
            {
                id: "TX-901",
                member: "Alex Rivera",
                amount: 150.0,
                date: "2026-06-01",
                status: "Completed",
            },
            {
                id: "TX-902",
                member: "Sarah Chen",
                amount: 200.0,
                date: "2026-06-02",
                status: "Completed",
            },
            {
                id: "TX-903",
                member: "Marcus Bell",
                amount: 150.0,
                date: "2026-06-02",
                status: "Pending",
            },
            {
                id: "TX-904",
                member: "Elena Gomez",
                amount: 1200.0,
                date: "2026-06-03",
                status: "Completed",
            },
            {
                id: "TX-905",
                member: "David Smith",
                amount: 150.0,
                date: "2026-06-04",
                status: "Completed",
            },
        ],
    },
};

export const FinanceView: FC = () => {
    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-[32px] mb-2 leading-tight">
                    Financial Overview
                </h1>
                <p className="text-brand-muted">
                    Detailed breakdown of gym revenue and income.
                </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
                <div className="bg-brand-surface border border-brand-border p-6 rounded">
                    <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                        Total Income (YTD)
                    </div>
                    <div className="text-[28px] font-bold mb-1 mono">
                        ₹{DATA.finances.totalIncome.toLocaleString()}
                    </div>
                    <div className="text-[12px] flex items-center gap-1 text-trend-up">
                        ↑ {DATA.finances.monthlyGrowth}% from last month
                    </div>
                </div>
                <div className="bg-brand-surface border border-brand-border p-6 rounded">
                    <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                        Active MRR
                    </div>
                    <div className="text-[28px] font-bold mb-1 mono">
                        ₹12,450.00
                    </div>
                    <div className="text-[12px] flex items-center gap-1 text-trend-up">
                        ↑ 4.2%
                    </div>
                </div>
                <div className="bg-brand-surface border border-brand-border p-6 rounded">
                    <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-2">
                        Average LTV
                    </div>
                    <div className="text-[28px] font-bold mb-1 mono">
                        ₹1,840.00
                    </div>
                    <div className="text-[12px] flex items-center gap-1 text-trend-down">
                        ↓ 1.2%
                    </div>
                </div>
            </div>

            <h2 className="text-[18px] mb-4 leading-snug">
                Recent Transactions
            </h2>
            <div className="bg-brand-surface border border-brand-border rounded overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                ID
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Member
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Date
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Amount
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA.finances.recentTransactions.map((tx) => (
                            <tr
                                key={tx.id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border mono text-brand-muted">
                                    {tx.id}
                                </td>
                                <td className="p-4 border-b border-brand-border font-medium">
                                    {tx.member}
                                </td>
                                <td className="p-4 border-b border-brand-border mono">
                                    {tx.date}
                                </td>
                                <td className="p-4 border-b border-brand-border mono font-semibold">
                                    ₹{tx.amount.toFixed(2)}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <span
                                        className={`status-pill ${
                                            tx.status.toLowerCase() ===
                                            "completed"
                                                ? "bg-status-active-bg text-status-active-fg"
                                                : tx.status.toLowerCase() ===
                                                    "pending"
                                                  ? "bg-status-pending-bg text-status-pending-fg"
                                                  : "bg-status-canceled-bg text-status-canceled-fg"
                                        }`}
                                    >
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
