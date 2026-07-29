import { useState, useEffect, useCallback, type FC } from "react";
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
}

interface MobileFinanceViewProps {
    setTab: (tab: string) => void;
}

export function FetchMobileFinanceSummary() {
    const [summary, setSummary] = useState<FinanceSummary | null>(null);

    const reFetchSummary = useCallback(async () => {
        try {
            const res = await api.get("/finances/summary");
            setSummary(res.data);
        } catch {
            console.error("Failed to fetch summary");
        }
    }, []);

    useEffect(() => {
        reFetchSummary();
    }, [reFetchSummary]);

    return { summary, reFetchSummary };
}

export function FetchMobileFinanceTransactions(limit: number) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const reFetchTransactions = useCallback(async () => {
        try {
            const res = await api.get("/finances/transactions");
            setTransactions(res.data.slice(0, limit));
        } catch {
            console.error("Failed to fetch transactions");
        }
    }, [limit]);

    useEffect(() => {
        reFetchTransactions();
    }, [reFetchTransactions]);

    return { transactions, reFetchTransactions };
}

export const MobileFinanceView: FC<MobileFinanceViewProps> = ({ setTab }) => {
    const { summary } = FetchMobileFinanceSummary();
    const { transactions } = FetchMobileFinanceTransactions(5);

    const handleExportCsv = async () => {
        try {
            const response = await api.get('/finances/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to export transactions", error);
            alert("Failed to export transactions");
        }
    };

    const handleRenewBilling = async () => {
        if (!confirm("Are you sure you want to run the billing cycle? This will add monthly costs to all active members' total owed.")) return;
        try {
            const res = await api.post('/finances/renew-billing');
            alert(res.data.detail);
        } catch (error) {
            console.error("Failed to renew billing", error);
            alert("Failed to renew billing");
        }
    };

    const mrr = summary ? (summary.monthly_breakdown.length > 0 ? summary.monthly_breakdown[summary.monthly_breakdown.length - 1].income + summary.monthly_breakdown[summary.monthly_breakdown.length - 1].pt_income : 0) : 0;
    
    const pctMembership = summary ? (summary.revenue_by_source.membership_fees / (summary.revenue_by_source.membership_fees + summary.revenue_by_source.personal_training || 1) * 100) : 0;
    const pctPT = summary ? (summary.revenue_by_source.personal_training / (summary.revenue_by_source.membership_fees + summary.revenue_by_source.personal_training || 1) * 100) : 0;

    return (
        <section className="page active" aria-labelledby="page-title">
            <article className="summary-card">
                <p className="summary-label">Monthly revenue run-rate</p>
                <p className="summary-value mono">₹{mrr.toLocaleString()}</p>
                <p className="summary-copy">Memberships still carry the club, while personal training drives the highest-margin growth.</p>
                <div className="summary-meta">
                    <div>
                        <span>Total income (YTD)</span>
                        <strong className="mono">₹{summary?.total_income_ytd.toLocaleString() || "0"}</strong>
                    </div>
                    <div>
                        <span>MoM growth</span>
                        <strong className="mono accent-value">+12.5%</strong>
                    </div>
                </div>
            </article>

            <section className="metrics-grid" aria-label="Key metrics">
                <article className="metric-card">
                    <span className="metric-label">Active members</span>
                    <strong className="metric-value mono">{summary?.active_members || 0}</strong>
                    <p className="metric-note">Total active accounts.</p>
                </article>
                <article className="metric-card">
                    <span className="metric-label">New signups</span>
                    <strong className="metric-value mono">{summary?.new_signups_this_month || 0}</strong>
                    <p className="metric-note">This month.</p>
                </article>
            </section>

            <article className="card">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Where the money lands</p>
                        <h2>Revenue mix</h2>
                    </div>
                    <button className="utility-button" type="button" onClick={() => setTab("revenue")}>Open revenue</button>
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
                        <p className="section-kicker">Needs attention</p>
                        <h2>Latest Charges</h2>
                    </div>
                </div>
                <div className="list-stack">
                    {transactions.map(tx => (
                        <article key={tx.transaction_id} className="queue-item">
                            <div className="queue-topline">
                                <div>
                                    <p className="person-name">{tx.member_name}</p>
                                    <p className="queue-meta mono">TX-{tx.transaction_id}</p>
                                </div>
                                <span className={`status-pill ${tx.status === 'paid' ? 'completed' : 'pending'}`}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="stateline">
                                <div>
                                    <span className="mini-meta">Charge</span>
                                    <strong className="mono">₹{tx.amount.toLocaleString()}</strong>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span className="mini-meta">Processed</span>
                                    <strong className="mono">{new Date(tx.date).toLocaleDateString()}</strong>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
        </article>

            <div className="flex flex-col gap-3 mt-4">
                <button 
                    onClick={handleExportCsv}
                    className="w-full utility-button bg-brand-border text-brand-fg py-3 text-sm rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download CSV
                </button>
                <button 
                    onClick={handleRenewBilling}
                    className="w-full utility-button bg-brand-fg text-brand-surface py-3 text-sm rounded-2xl font-bold"
                >
                    Run Billing Cycle
                </button>
            </div>
        </section>
    );
};
