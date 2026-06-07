import { FC, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { FinanceView } from "../components/FinanceView";
import { MemberListView } from "../components/MemberListView";
import { AnalyticsView } from "../components/AnalyticsView";

export const Dashboard: FC = () => {
    const [view, setView] = useState("finances");

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={view} setView={setView} />
            <main className="flex-1 ml-sidebar flex flex-col">
                <header className="h-header border-b border-brand-border bg-brand-surface flex items-center px-8 justify-between sticky top-0 z-5">
                    <div className="font-medium">
                        {view === "finances" && "Financial Reporting"}
                        {view === "members" && "Member Management"}
                        {view === "analytics" && "Revenue Analytics"}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="mono text-[12px] text-brand-muted">
                            June 06, 2026
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#eee] border border-brand-border"></div>
                    </div>
                </header>

                {view === "finances" && <FinanceView />}
                {view === "members" && <MemberListView />}
                {view === "analytics" && <AnalyticsView />}
            </main>
        </div>
    );
};
