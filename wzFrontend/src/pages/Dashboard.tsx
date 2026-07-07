import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { FinanceView } from "../components/FinanceView";
import { MemberListView } from "../components/MemberListView";
import { AnalyticsView } from "../components/AnalyticsView";
import { PlansAndTrainersView } from "../components/PlansAndTrainersView";
import { ExpenseLogView } from "../components/ExpenseLogView";
import { useGym } from "../contexts/GymContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MobileDashboard } from "../components/mobile/MobileDashboard";

export const Dashboard: FC = () => {
    const [view, setView] = useState("finances");
    const { activeGymId } = useGym();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (!activeGymId) {
            navigate("/select-gym");
        }
    }, [activeGymId, navigate]);

    if (!activeGymId) return null;

    if (isMobile) {
        return <MobileDashboard />;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={view} setView={setView} />
            <main className="flex-1 ml-sidebar flex flex-col">
                <header className="h-header border-b border-brand-border bg-brand-surface flex items-center px-8 justify-between sticky top-0 z-5">
                    <div className="font-medium">
                        {view === "finances" && "Financial Reporting"}
                        {view === "members" && "Member Management"}
                        {view === "plans" && "Plans & Trainers"}
                        {view === "expenses" && "Expense Log"}
                        {view === "analytics" && "Revenue Analytics"}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/select-gym")}
                            className="text-[12px] text-brand-accent hover:underline"
                        >
                            Switch Gym
                        </button>
                        <div className="mono text-[12px] text-brand-muted">
                            June 06, 2026
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#eee] border border-brand-border"></div>
                    </div>
                </header>

                {view === "finances" && <FinanceView />}
                {view === "members" && <MemberListView gymId={activeGymId} />}
                {view === "plans" && <PlansAndTrainersView />}
                {view === "expenses" && <ExpenseLogView />}
                {view === "analytics" && <AnalyticsView />}
            </main>
        </div>
    );
};
