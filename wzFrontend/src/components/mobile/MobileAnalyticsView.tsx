import { useState, useEffect, type FC } from "react";
import api from "../../api";

interface FinanceSummary {
    total_income_ytd: number;
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
}

export const MobileAnalyticsView: FC = () => {
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
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
                const res = await api.get("/finances/transactions");
                setTransactions(res.data.slice(0, 10)); // Latest 10
            } catch {
                console.error("Failed to fetch transactions");
            }
        };
        fetchSummary();
        fetchTransactions();
    }, []);

    const pctMembership = summary ? (summary.revenue_by_source.membership_fees / (summary.revenue_by_source.membership_fees + summary.revenue_by_source.personal_training || 1) * 100) : 0;
    const pctPT = summary ? (summary.revenue_by_source.personal_training / (summary.revenue_by_source.membership_fees + summary.revenue_by_source.personal_training || 1) * 100) : 0;
    const totalSource = summary ? summary.revenue_by_source.membership_fees + summary.revenue_by_source.personal_training : 0;

    return (
        <section className="page active" aria-labelledby="page-title">
            <article className="summary-card">
                <p className="summary-label">Year-to-date income</p>
                <p className="summary-value mono">₹{summary?.total_income_ytd.toLocaleString() || 0}</p>
                <p className="summary-copy">Membership subscriptions remain the main engine, while training keeps margin quality high.</p>
                <div className="summary-meta">
                    <div>
                        <span>Memberships</span>
                        <strong className="mono">₹{summary?.revenue_by_source.membership_fees.toLocaleString() || 0}</strong>
                    </div>
                    <div>
                        <span>Personal training</span>
                        <strong className="mono">₹{summary?.revenue_by_source.personal_training.toLocaleString() || 0}</strong>
                    </div>
                </div>
            </article>

            <article className="card">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Current mix</p>
                        <h2>Source breakdown</h2>
                    </div>
                    <p className="section-label mono">₹{totalSource.toLocaleString()} total</p>
                </div>
                <div className="revenue-bars">
                    <div className="bar-row">
                        <div className="bar-topline">
                            <span className="bar-name">Membership Fees</span>
                            <span className="bar-value mono">₹{summary?.revenue_by_source.membership_fees.toLocaleString() || 0} · {Math.round(pctMembership)}%</span>
                        </div>
                        <div className="bar-track" aria-hidden="true">
                            <div className="bar-fill" style={{ "--pct": pctMembership, "--bar-color": "var(--accent)" } as React.CSSProperties}></div>
                        </div>
                    </div>
                    <div className="bar-row">
                        <div className="bar-topline">
                            <span className="bar-name">Personal Training</span>
                            <span className="bar-value mono">₹{summary?.revenue_by_source.personal_training.toLocaleString() || 0} · {Math.round(pctPT)}%</span>
                        </div>
                        <div className="bar-track" aria-hidden="true">
                            <div className="bar-fill" style={{ "--pct": pctPT, "--bar-color": "var(--fg)" } as React.CSSProperties}></div>
                        </div>
                    </div>
                </div>
            </article>

            <article className="card">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Receipts</p>
                        <h2>Recent transactions</h2>
                    </div>
                    <p className="section-label">Most recent 10</p>
                </div>
                <div className="list-stack">
                    {transactions.map(tx => (
                        <article key={tx.transaction_id} className="transaction-item">
                            <div className="transaction-topline">
                                <div>
                                    <p className="person-name">{tx.member_name}</p>
                                    <p className="transaction-meta mono">TX-{tx.transaction_id} · {new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`status-pill ${tx.status === 'paid' ? 'completed' : 'pending'}`}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="stateline">
                                <div>
                                    <span className="mini-meta">Amount</span>
                                    <strong className="mono">₹{tx.amount.toLocaleString()}</strong>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span className="mini-meta">Channel</span>
                                    <strong>{tx.plan_name || "General"}</strong>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </article>
        </section>
    );
};
