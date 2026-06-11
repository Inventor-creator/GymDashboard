import { useState, useMemo, useEffect } from "react";
import api from "../api";
import { type FC } from "react";

interface Member {
    member_id: number;
    name: string;
    email: string;
    phone_number: string;
    plan: string;
    joining_date: string;
}

export const MemberListView: FC<{ gymId: number }> = ({ gymId }) => {
    const [search, setSearch] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        phone_number: "",
        plan: "monthly",
    });

    const fetchMembers = async () => {
        try {
            const response = await api.get("/members/");
            setMembers(response.data);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [gymId]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/members/", { ...newMember, gym_id: gymId });
            setIsModalOpen(false);
            setNewMember({
                name: "",
                email: "",
                phone_number: "",
                plan: "monthly",
            });
            fetchMembers();
        } catch (error) {
            console.error("Error adding member:", error);
        }
    };

    const filteredMembers = useMemo(() => {
        return members.filter(
            (m) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.plan.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, members]);

    return (
        <div className="p-8 max-w-[1200px] w-full mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[32px] mb-2 leading-tight">
                        Member Directory
                    </h1>
                    <p className="text-brand-muted">
                        Manage your gym's {members.length} active members.
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
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 rounded font-semibold bg-brand-accent text-white border border-brand-accent transition-all duration-150 hover:opacity-90"
                    >
                        Add Member
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-brand-surface p-8 rounded-lg border border-brand-border w-full max-w-[400px]">
                        <h2 className="text-2xl mb-6">Add New Member</h2>
                        <form
                            onSubmit={handleAddMember}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={newMember.name}
                                    onChange={(e) =>
                                        setNewMember({
                                            ...newMember,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={newMember.email}
                                    onChange={(e) =>
                                        setNewMember({
                                            ...newMember,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={newMember.phone_number}
                                    onChange={(e) =>
                                        setNewMember({
                                            ...newMember,
                                            phone_number: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Plan
                                </label>
                                <select
                                    className="w-full px-3 py-2 rounded border border-brand-border bg-brand-bg"
                                    value={newMember.plan}
                                    onChange={(e) =>
                                        setNewMember({
                                            ...newMember,
                                            plan: e.target.value,
                                        })
                                    }
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="half yearly">
                                        Half Yearly
                                    </option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded font-semibold border border-brand-border hover:bg-brand-bg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded font-semibold bg-brand-accent text-white hover:opacity-90"
                                >
                                    Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                key={member.member_id}
                                className="hover:bg-[oklch(99%_0.002_240)] transition-colors"
                            >
                                <td className="p-4 border-b border-brand-border font-semibold">
                                    {member.name}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    {member.plan}
                                </td>
                                <td className="p-4 border-b border-brand-border mono">
                                    {new Date(
                                        member.joining_date,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="p-4 border-b border-brand-border">
                                    <span className="status-pill bg-status-active-bg text-status-active-fg">
                                        Active
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
