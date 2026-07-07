import { useState, useEffect, type FC } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import api from "../api";

interface FinanceSummary {
    total_income_ytd: number;
    outstanding_revenue: number;
    active_members: number;
    monthly_breakdown: { month: string; income: number; pt_income: number }[];
    revenue_by_source: { membership_fees: number; personal_training: number };
    new_signups_this_month: number;
}

export const AnalyticsView: FC = () => {
    const [summary, setSummary] = useState<FinanceSummary | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get("/finances/summary");
                setSummary(res.data);
            } catch {
                console.error("Failed to fetch summary");
            }
        };
        fetchSummary();
    }, []);

    const sourceBarData = summary
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

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-[32px] mb-2 leading-tight">
                    Revenue Analytics
                </h1>
                <p className="text-brand-muted">
                    Deeper dive into revenue streams and member growth.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-brand-surface border border-brand-border p-6 rounded">
                    <h3 className="text-[14px] mb-4 uppercase text-brand-muted">
                        Income by Source
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={sourceBarData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="oklch(85% 0.01 240)"
                            />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                scale="band"
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar
                                dataKey="value"
                                fill="#8884d8"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    {summary && (
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Membership Fees</span>
                                <span className="mono font-semibold">
                                    ₹
                                    {summary.revenue_by_source.membership_fees.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Personal Training</span>
                                <span className="mono font-semibold">
                                    ₹
                                    {summary.revenue_by_source.personal_training.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-brand-surface border border-brand-border p-6 rounded">
                    <h3 className="text-[14px] mb-4 uppercase text-brand-muted">
                        Monthly Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={summary?.monthly_breakdown || []}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="oklch(85% 0.01 240)"
                            />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11 }}
                                scale="point"
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    {summary && (
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Total Income (YTD)</span>
                                <span className="mono font-semibold">
                                    ₹{summary.total_income_ytd.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Outstanding</span>
                                <span className="mono font-semibold text-red-500">
                                    ₹
                                    {summary.outstanding_revenue.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-brand-surface border border-brand-border p-6 rounded mb-8">
                <h3 className="text-[14px] mb-4 uppercase text-brand-muted">
                    Growth Summary
                </h3>
                {summary && (
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-1">
                                Active Members
                            </div>
                            <div className="text-[24px] font-bold mono">
                                {summary.active_members}
                            </div>
                        </div>
                        <div>
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-1">
                                New Signups (This Month)
                            </div>
                            <div className="text-[24px] font-bold mono text-trend-up">
                                +{summary.new_signups_this_month}
                            </div>
                        </div>
                        <div>
                            <div className="text-brand-muted text-[12px] uppercase tracking-[0.06em] mb-1">
                                Avg Revenue / Member
                            </div>
                            <div className="text-[24px] font-bold mono">
                                ₹
                                {summary.active_members > 0
                                    ? (
                                          summary.total_income_ytd /
                                          summary.active_members
                                      ).toLocaleString()
                                    : 0}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
