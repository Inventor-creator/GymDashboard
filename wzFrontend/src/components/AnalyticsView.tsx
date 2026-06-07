import { FC } from "react";

export const AnalyticsView: FC = () => {
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
                    <div className="h-[200px] bg-brand-bg border border-dashed border-brand-border flex items-center justify-center text-brand-muted italic">
                        Revenue Breakdown (Bar Chart)
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between mb-2">
                            <span>Monthly Memberships</span>
                            <span className="mono">$8,200</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Personal Training</span>
                            <span className="mono">$3,400</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Supplement Sales</span>
                            <span className="mono">$850</span>
                        </div>
                    </div>
                </div>
                <div className="bg-brand-surface border border-brand-border p-6 rounded">
                    <h3 className="text-[14px] mb-4 uppercase text-brand-muted">
                        Member Growth
                    </h3>
                    <div className="h-[200px] bg-brand-bg border border-dashed border-brand-border flex items-center justify-center text-brand-muted italic">
                        Growth Curve (Line Chart)
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between mb-2">
                            <span>New Signups</span>
                            <span className="mono">+12</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Churn Rate</span>
                            <span className="mono">1.8%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
