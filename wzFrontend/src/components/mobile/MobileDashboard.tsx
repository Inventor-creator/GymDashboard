import { useState, type FC } from "react";
import { MobileFinanceView } from "./MobileFinanceView";
import { MobileMemberListView } from "./MobileMemberListView";
import { MobileAnalyticsView } from "./MobileAnalyticsView";
import { MobilePlansAndTrainersView } from "./MobilePlansAndTrainersView";
import { MobileDayPassView } from "./MobileDayPassView";
import { ThemeToggle } from "../ThemeToggle";
import "../../mobile.css";

export const MobileDashboard: FC = () => {
    const [tab, setTab] = useState("overview");

    const headerCopy: Record<string, { title: string; subtitle: string }> = {
        overview: {
            title: "Overview",
            subtitle: "Cash, member health, and billing pressure in one mobile view."
        },
        members: {
            title: "Members",
            subtitle: "Search the roster fast and isolate accounts that need follow-up."
        },
        revenue: {
            title: "Revenue",
            subtitle: "Source mix, plan balance, and latest charges without the desktop grid."
        },
        plans: {
            title: "Plans & Trainers",
            subtitle: "Manage membership tiers and your active training staff."
        },
        daypass: {
            title: "Day Passes",
            subtitle: "Record one-day entries for walk-in customers."
        }
    };

    return (
        <div className="mobile-view text-left">
            <div className="mobile-view-body">
                <div className="shell">
                    <header className="app-header">
                        <div className="topline">
                            <div className="brand-lockup">
                                <div className="brand-mark" aria-hidden="true"></div>
                                <div className="brand-copy">
                                    <p className="eyebrow">Owner Console</p>
                                    <p className="brand-title">Workout Zone</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                        <div className="header-copy">
                            <h1 className="page-title">{headerCopy[tab]?.title}</h1>
                            <p className="page-subtitle">{headerCopy[tab]?.subtitle}</p>
                        </div>
                    </header>

                    <main className="app-main">
                        {tab === "overview" && <MobileFinanceView setTab={setTab} />}
                        {tab === "members" && <MobileMemberListView />}
                        {tab === "revenue" && <MobileAnalyticsView />}
                        {tab === "plans" && <MobilePlansAndTrainersView />}
                        {tab === "daypass" && <MobileDayPassView />}
                    </main>
                </div>

                <nav className="bottom-nav" aria-label="Primary">
                    <div className="bottom-nav-inner flex justify-between gap-2 px-2">
                        <button 
                            className={`tab-button flex-1 ${tab === "overview" ? "active" : ""}`} 
                            type="button" 
                            onClick={() => setTab("overview")}
                        >
                            <strong>Overview</strong>
                            <span>Cash</span>
                        </button>
                        <button 
                            className={`tab-button flex-1 ${tab === "members" ? "active" : ""}`} 
                            type="button" 
                            onClick={() => setTab("members")}
                        >
                            <strong>Members</strong>
                            <span>Roster</span>
                        </button>
                        <button 
                            className={`tab-button flex-1 ${tab === "revenue" ? "active" : ""}`} 
                            type="button" 
                            onClick={() => setTab("revenue")}
                        >
                            <strong>Revenue</strong>
                            <span>Detail</span>
                        </button>
                        <button 
                            className={`tab-button flex-1 ${tab === "plans" ? "active" : ""}`} 
                            type="button" 
                            onClick={() => setTab("plans")}
                        >
                            <strong>Plans</strong>
                            <span>Tiers</span>
                        </button>
                        <button 
                            className={`tab-button flex-1 ${tab === "daypass" ? "active" : ""}`} 
                            type="button" 
                            onClick={() => setTab("daypass")}
                        >
                            <strong>Day Pass</strong>
                            <span>Walk-in</span>
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
};
