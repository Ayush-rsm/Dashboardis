import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "../api/tickets";
import { useNavigate } from "react-router-dom";

function TicketsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const navigate = useNavigate();

    const {
        data: tickets = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["tickets"],
        queryFn: getTickets,
    });

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                !search ||
                ticket.reference_no
                    ?.toLowerCase()
                    .includes(searchValue) ||
                ticket.title
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                ticket.status === statusFilter;

            const matchesPriority =
                priorityFilter === "all" ||
                ticket.priority === priorityFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });
    }, [
        tickets,
        search,
        statusFilter,
        priorityFilter,
    ]);

    if (isLoading) {
        return (
            <div className="p-6">
                <p className="text-slate-500">
                    Loading tickets...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-700">
                        Failed to load tickets.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Tickets
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Manage and review ticket workflows
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white border rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Reference or title..."
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                            >
                                <option value="all">
                                    All statuses
                                </option>
                                <option value="open">Open</option>
                                <option value="pending_checker">
                                    Pending Checker
                                </option>
                                <option value="pending_approver">
                                    Pending Approver
                                </option>
                                <option value="approved">
                                    Approved
                                </option>
                                <option value="rejected">
                                    Rejected
                                </option>
                                <option value="closed">
                                    Closed
                                </option>
                                <option value="cancelled">
                                    Cancelled
                                </option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Priority
                            </label>

                            <select
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                            >
                                <option value="all">
                                    All priorities
                                </option>
                                <option value="low">Low</option>
                                <option value="medium">
                                    Medium
                                </option>
                                <option value="high">High</option>
                                <option value="critical">
                                    Critical
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border rounded-xl overflow-hidden">

                    <div className="px-5 py-4 border-b flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                All Tickets
                            </h2>

                            <p className="text-sm text-slate-500">
                                {filteredTickets.length} tickets
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="text-left px-5 py-3 font-medium text-slate-600">
                                        Reference
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-slate-600">
                                        Title
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-slate-600">
                                        Division
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-slate-600">
                                        Status
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-slate-600">
                                        Priority
                                    </th>

                                    <th className="text-left px-5 py-3 font-medium text-slate-600">
                                        Created
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() =>
                                            navigate(`/tickets/${ticket.id}`)
                                        }
                                        className="hover:bg-slate-50 cursor-pointer"
                                    >
                                        <td className="px-5 py-4 font-medium">
                                            {ticket.reference_no}
                                        </td>

                                        <td className="px-5 py-4">
                                            {ticket.title}
                                        </td>

                                        <td className="px-5 py-4">
                                            {ticket.division_id}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={ticket.status}
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <PriorityBadge
                                                priority={ticket.priority}
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-slate-500">
                                            {ticket.created_at
                                                ? new Date(
                                                    ticket.created_at
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}

                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-5 py-10 text-center text-slate-500"
                                        >
                                            No tickets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const labels = {
        open: "Open",
        pending_checker: "Pending Checker",
        pending_approver: "Pending Approver",
        approved: "Approved",
        rejected: "Rejected",
        closed: "Closed",
        cancelled: "Cancelled",
    };

    return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {labels[status] || status}
        </span>
    );
}

function PriorityBadge({ priority }) {
    return (
        <span className="capitalize text-slate-700">
            {priority || "-"}
        </span>
    );
}

export default TicketsPage;