import { FC } from "react";

interface SidebarProps {
    activeView: string;
    setView: (view: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({ activeView, setView }) => {
    return (
        <div className="w-sidebar border-r border-brand-border bg-brand-surface flex flex-col fixed h-screen z-10">
            <div className="p-6 flex items-center gap-3 border-b border-brand-border">
                <div className="w-6 h-6 bg-brand-accent rounded-[2px]"></div>
                <div className="font-bold text-base tracking-tight uppercase">
                    Iron & Assets
                </div>
            </div>
            <nav className="list-none py-4 px-2">
                <li
                    className={`px-4 py-2 rounded flex items-center gap-3 cursor-pointer font-medium transition-all duration-150 mb-1 ${
                        activeView === "finances"
                            ? "bg-brand-bg text-brand-accent border-l-2 border-brand-accent rounded-l-none rounded-r"
                            : "text-brand-muted hover:bg-brand-bg hover:text-brand-fg"
                    }`}
                    onClick={() => setView("finances")}
                >
                    <span>Finances</span>
                </li>
                <li
                    className={`px-4 py-2 rounded flex items-center gap-3 cursor-pointer font-medium transition-all duration-150 mb-1 ${
                        activeView === "members"
                            ? "bg-brand-bg text-brand-accent border-l-2 border-brand-accent rounded-l-none rounded-r"
                            : "text-brand-muted hover:bg-brand-bg hover:text-brand-fg"
                    }`}
                    onClick={() => setView("members")}
                >
                    <span>Member List</span>
                </li>
                <li
                    className={`px-4 py-2 rounded flex items-center gap-3 cursor-pointer font-medium transition-all duration-150 mb-1 ${
                        activeView === "analytics"
                            ? "bg-brand-bg text-brand-accent border-l-2 border-brand-accent rounded-l-none rounded-r"
                            : "text-brand-muted hover:bg-brand-bg hover:text-brand-fg"
                    }`}
                    onClick={() => setView("analytics")}
                >
                    <span>Revenue Details</span>
                </li>
            </nav>
        </div>
    );
};
