import { FC, useState, useMemo } from "react";

const DATA = {
    members: [
        {
            id: 1,
            name: "Alex Rivera",
            plan: "Elite",
            joinDate: "2024-03-12",
            status: "Active",
            ltv: 2400,
        },
        {
            id: 2,
            name: "Sarah Chen",
            plan: "Pro",
            joinDate: "2025-01-05",
            status: "Active",
            ltv: 1200,
        },
        {
            id: 3,
            name: "Marcus Bell",
            plan: "Basic",
            joinDate: "2025-05-20",
            status: "Pending",
            ltv: 150,
        },
        {
            id: 4,
            name: "Elena Gomez",
            plan: "Annual",
            joinDate: "2023-11-15",
            status: "Active",
            ltv: 3600,
        },
        {
            id: 5,
            name: "David Smith",
            plan: "Pro",
            joinDate: "2026-02-10",
            status: "Active",
            ltv: 450,
        },
        {
            id: 6,
            name: "Jessica Lee",
            plan: "Elite",
            joinDate: "2024-08-22",
            status: "Active",
            ltv: 1800,
        },
        {
            id: 7,
            name: "Tom Wilson",
            plan: "Basic",
            joinDate: "2025-10-02",
            status: "Canceled",
            ltv: 300,
        },
    ],
};

export const MemberListView: FC = () => {
    const [search, setSearch] = useState("");

    const filteredMembers = useMemo(() => {
        return DATA.members.filter(
            (m) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.plan.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search]);

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[32px] mb-2 leading-tight">
                        Member Directory
                    </h1>
                    <p className="text-brand-muted">
                        Manage your gym's {DATA.members.length} active members.
                    </p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="px-4 py-2 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg w-[240px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90">
                        Add Member
                    </button>
                </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Name
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Plan
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Join Date
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                LTV
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Status
                            </th>
                            <th className="bg-brand-bg px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-brand-muted border-b border-brand-border">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr
                                key={member.id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border font-semibold">
                                    {member.name}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {member.plan}
                                </td>
                                <td className="p-4 border-b border-brand-border mono">
                                    {member.joinDate}
                                </td>
                                <td className="p-4 border-b border-brand-border mono">
                                    ${member.ltv.toLocaleString()}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <span
                                        className={`status-pill ${
                                            member.status.toLowerCase() ===
                                            "active"
                                                ? "bg-status-active-bg text-status-active-fg"
                                                : member.status.toLowerCase() ===
                                                    "pending"
                                                  ? "bg-status-pending-bg text-status-pending-fg"
                                                  : "bg-status-canceled-bg text-status-canceled-fg"
                                        }`}
                                    >
                                        {member.status}
                                    </span>
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <button className="px-2 py-1 rounded font-semibold border border-brand-border bg-brand-surface text-brand-fg transition-all duration-150 hover:bg-brand-bg text-[12px]">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
