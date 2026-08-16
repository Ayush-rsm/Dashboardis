import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from "recharts";

import {
    getOverview,
    getStatusAnalytics,
    getDivisionAnalytics,
    getTicketTypeAnalytics,
    getApprovalTimeAnalytics,
    getApprovalTimeTrend,
    getClosureVolume,

    // Operational APIs
    getOperationalAnalytics,
    getOpenTicketAging,
    getSendBackTrend,
    getApprovalTimeByVertical,
    getApprovalTimeByDepartment,
    getStageTimeBreakdown,
    getCheckerTimeByLevel,
    getEscalationByLevel,
} from "../api/analytics";

import ApprovalTime from "../components/analytics/ApprovalTime";
import OperationalContent from "../components/analytics/Operational";


/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_COLORS = {
    open: "#252a9b",
    pending_checker: "#f59e0b",
    pending_approver: "#8b5cf6",
    approved: "#16a34a",
    rejected: "#ef4444",
    closed: "#16a34a",
    cancelled: "#9ca3af",
};

const STATUS_LABELS = {
    open: "Open",
    pending_checker: "Pending Checker",
    pending_approver: "Pending Approver",
    approved: "Approved",
    rejected: "Rejected",
    closed: "Closed",
    cancelled: "Cancelled",
};


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    subtitle,
    accent = "blue",
}) {
    const accents = {
        blue: {
            border: "border-l-indigo-700",
            icon: "bg-indigo-50 text-indigo-700",
        },

        green: {
            border: "border-l-green-500",
            icon: "bg-green-50 text-green-600",
        },

        orange: {
            border: "border-l-orange-500",
            icon: "bg-orange-50 text-orange-600",
        },

        red: {
            border: "border-l-red-500",
            icon: "bg-red-50 text-red-600",
        },

        gray: {
            border: "border-l-gray-400",
            icon: "bg-gray-100 text-gray-500",
        },
    };

    const style = accents[accent] || accents.blue;

    return (
        <div
            className={`
                bg-white
                rounded-2xl
                border border-gray-100
                border-l-4
                ${style.border}
                px-5 py-5
                shadow-sm
                hover:shadow-md
                transition-shadow
            `}
        >
            <div className="flex items-start justify-between">

                <div>

                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        {title}
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-3">
                        {value ?? 0}
                    </p>

                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-2">
                            {subtitle}
                        </p>
                    )}

                </div>

                <div
                    className={`
                        w-9 h-9
                        rounded-xl
                        flex items-center justify-center
                        ${style.icon}
                    `}
                >
                    <span className="text-sm font-bold">
                        {accent === "green"
                            ? "✓"
                            : accent === "red"
                                ? "!"
                                : accent === "orange"
                                    ? "↻"
                                    : "○"}
                    </span>
                </div>

            </div>
        </div>
    );
}


/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
    title,
    subtitle,
    children,
    className = "",
}) {
    return (
        <div
            className={`
                bg-white
                rounded-2xl
                border border-gray-100
                shadow-sm
                ${className}
            `}
        >

            <div className="px-6 pt-6">

                <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                </h2>

                {subtitle && (
                    <p className="text-sm text-gray-400 mt-1">
                        {subtitle}
                    </p>
                )}

            </div>

            <div className="px-6 pb-6 pt-4">
                {children}
            </div>

        </div>
    );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
    label,
    value,
    subtitle,
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-xs uppercase tracking-wider text-gray-500">
                        {label}
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-3">
                        {value}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        {subtitle}
                    </p>

                </div>

                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    ◷
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   FILTER BOX
========================================================= */

function FilterBox({
    label,
    value,
}) {
    return (
        <div>

            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                {label}
            </label>

            <div
                className="
                    bg-gray-50
                    border border-gray-200
                    rounded-xl
                    px-4 py-3
                    text-sm
                    text-gray-700
                    flex
                    items-center
                    justify-between
                "
            >

                <span>
                    {value}
                </span>

                <span className="text-gray-400">
                    ▾
                </span>

            </div>

        </div>
    );
}


/* =========================================================
   EXECUTIVE CONTENT
========================================================= */

function ExecutiveContent({
    stats,
    statusChartData,
    approvalTime,
    approvalTrendData,
    closureVolumeData,
}) {
    return (
        <>

            {/* =================================================
                STATUS OVERVIEW
            ================================================= */}

            <div className="mb-7">

                <div className="mb-4">

                    <h2 className="text-xl font-bold text-gray-900">
                        Status overview
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Ticket counts by current lifecycle state
                    </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <StatCard
                        title="Total Tickets"
                        value={stats.total_tickets}
                        subtitle="All tickets"
                    />

                    <StatCard
                        title="Open"
                        value={stats.open_tickets}
                        subtitle="Initiated · not closed"
                        accent="blue"
                    />

                    <StatCard
                        title="Pending Checker"
                        value={stats.pending_checker}
                        subtitle="Awaiting checker action"
                        accent="orange"
                    />

                    <StatCard
                        title="Pending Approver"
                        value={stats.pending_approver}
                        subtitle="Awaiting approval"
                        accent="orange"
                    />

                    <StatCard
                        title="Approved"
                        value={stats.approved_tickets}
                        subtitle="Approved tickets"
                        accent="green"
                    />

                    <StatCard
                        title="Closed"
                        value={stats.closed_tickets}
                        subtitle="Completed workflow"
                        accent="green"
                    />

                    <StatCard
                        title="Escalated"
                        value={stats.escalated_tickets}
                        subtitle="Escalated tickets"
                        accent="orange"
                    />

                    <StatCard
                        title="SLA Breached"
                        value={stats.sla_breached_tickets}
                        subtitle="Tickets beyond SLA"
                        accent="red"
                    />

                </div>

            </div>


            {/* =================================================
                TIMING METRICS
            ================================================= */}

            <div className="mb-7">

                <div className="mb-4">

                    <h2 className="text-xl font-bold text-gray-900">
                        Timing metrics
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Average time spent across the ticket workflow
                    </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <MetricCard
                        label="Average Checker Time"
                        value={`${Number(
                            approvalTime?.average_checker_hours || 0
                        ).toFixed(2)}h`}
                        subtitle="Average checker processing time"
                    />

                    <MetricCard
                        label="Average Approval Time"
                        value={`${Number(
                            approvalTime?.average_approval_hours || 0
                        ).toFixed(2)}h`}
                        subtitle="Average approver processing time"
                    />

                    <MetricCard
                        label="Average Total Time"
                        value={`${Number(
                            approvalTime?.average_total_hours || 0
                        ).toFixed(2)}h`}
                        subtitle="Average complete processing time"
                    />

                </div>

            </div>


            {/* =================================================
                MAIN CHARTS
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* =================================================
                    APPROVAL TIME TREND
                ================================================= */}

                <div className="xl:col-span-2">

                    <SectionCard
                        title="Approval Time Trend"
                        subtitle="Avg days to closure, by month"
                    >

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={approvalTrendData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 5,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e5e7eb"
                                    />

                                    <XAxis
                                        dataKey="month"
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) =>
                                            `${value}d`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${Number(value).toFixed(1)} days`,
                                            "Average",
                                        ]}
                                        contentStyle={{
                                            borderRadius: "10px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.08)",
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="average_days"
                                        stroke="#252a9b"
                                        strokeWidth={3}
                                        dot={{
                                            r: 5,
                                            fill: "#252a9b",
                                            strokeWidth: 0,
                                        }}
                                        activeDot={{
                                            r: 7,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    </SectionCard>

                </div>


                {/* =================================================
                    STATUS MIX
                ================================================= */}

                <div className="xl:col-span-1">

                    <SectionCard
                        title="Status Mix"
                        subtitle="All Tickets (filtered)"
                    >

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={statusChartData}
                                        dataKey="count"
                                        nameKey="label"
                                        cx="50%"
                                        cy="43%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                    >

                                        {statusChartData.map((entry) => (

                                            <Cell
                                                key={entry.status}
                                                fill={
                                                    STATUS_COLORS[
                                                    entry.status
                                                    ] || "#6366f1"
                                                }
                                            />

                                        ))}

                                    </Pie>

                                    <Tooltip />

                                    <Legend
                                        verticalAlign="bottom"
                                        height={55}
                                    />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </SectionCard>

                </div>

            </div>


            {/* =================================================
                CLOSURE VOLUME
            ================================================= */}

            <div className="mt-6">

                <SectionCard
                    title="Closure Volume by Month"
                    subtitle="Count of tickets closed"
                >

                    <div className="h-[350px]">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={closureVolumeData}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 5,
                                    bottom: 5,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />

                                <XAxis
                                    dataKey="month"
                                    tick={{
                                        fontSize: 12,
                                        fill: "#94a3b8",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    tick={{
                                        fontSize: 12,
                                        fill: "#94a3b8",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip
                                    formatter={(value) => [
                                        `${value} tickets`,
                                        "Closed",
                                    ]}
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "1px solid #e5e7eb",
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.08)",
                                    }}
                                />

                                <Bar
                                    dataKey="closed_count"
                                    fill="#252a9b"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={55}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                        Showing monthly count of successfully closed tickets
                    </p>

                </SectionCard>

            </div>

        </>
    );
}


/* =========================================================
   DASHBOARD PAGE
========================================================= */

function DashboardPage() {

    /*
     * This state controls ONLY the lower analytics content.
     *
     * URL remains:
     * /dashboard
     *
     * Clicking the tabs does NOT navigate anywhere.
     */

    const [activeTab, setActiveTab] = useState("executive");


    /* =====================================================
       API CALLS
    ===================================================== */

    const overview = useQuery({
        queryKey: ["analytics", "overview"],
        queryFn: getOverview,
    });

    const status = useQuery({
        queryKey: ["analytics", "status"],
        queryFn: getStatusAnalytics,
    });

    const divisions = useQuery({
        queryKey: ["analytics", "divisions"],
        queryFn: getDivisionAnalytics,
    });

    const ticketTypes = useQuery({
        queryKey: ["analytics", "ticket-types"],
        queryFn: getTicketTypeAnalytics,
    });

    const approvalTime = useQuery({
        queryKey: ["analytics", "approval-time"],
        queryFn: getApprovalTimeAnalytics,
    });

    const approvalTrend = useQuery({
        queryKey: ["analytics", "approval-time-trend"],
        queryFn: getApprovalTimeTrend,
    });

    const closureVolume = useQuery({
        queryKey: ["analytics", "closure-volume"],
        queryFn: getClosureVolume,
    });

    const operational = useQuery({
        queryKey: ["analytics", "operational"],
        queryFn: getOperationalAnalytics,
    });

    const openTicketAging = useQuery({
        queryKey: ["analytics", "operational", "open-ticket-aging"],
        queryFn: getOpenTicketAging,
    });

    const sendBackTrend = useQuery({
        queryKey: ["analytics", "operational", "send-back-trend"],
        queryFn: getSendBackTrend,
    });

    const approvalTimeByVertical = useQuery({
        queryKey: [
            "analytics",
            "operational",
            "approval-time-by-vertical",
        ],
        queryFn: getApprovalTimeByVertical,
    });

    const approvalTimeByDepartment = useQuery({
        queryKey: [
            "analytics",
            "operational",
            "approval-time-by-department",
        ],
        queryFn: getApprovalTimeByDepartment,
    });

    const stageTimeBreakdown = useQuery({
        queryKey: [
            "analytics",
            "operational",
            "stage-time-breakdown",
        ],
        queryFn: getStageTimeBreakdown,
    });

    const checkerTimeByLevel = useQuery({
        queryKey: [
            "analytics",
            "operational",
            "checker-time-by-level",
        ],
        queryFn: getCheckerTimeByLevel,
    });

    const escalationByLevel = useQuery({
        queryKey: [
            "analytics",
            "operational",
            "escalation-by-level",
        ],
        queryFn: getEscalationByLevel,
    });


    /* =====================================================
       LOADING
    ===================================================== */

    const isLoading =
        overview.isLoading ||
        status.isLoading ||
        divisions.isLoading ||
        ticketTypes.isLoading ||
        approvalTime.isLoading ||
        approvalTrend.isLoading ||
        closureVolume.isLoading ||
        operational.isLoading ||
        openTicketAging.isLoading ||
        sendBackTrend.isLoading ||
        approvalTimeByVertical.isLoading ||
        approvalTimeByDepartment.isLoading ||
        stageTimeBreakdown.isLoading ||
        checkerTimeByLevel.isLoading ||
        escalationByLevel.isLoading;

    /* =====================================================
       ERROR
    ===================================================== */

    const isError =
        overview.isError ||
        status.isError ||
        divisions.isError ||
        ticketTypes.isError ||
        approvalTime.isError ||
        approvalTrend.isError ||
        closureVolume.isError ||
        operational.isError ||
        openTicketAging.isError ||
        sendBackTrend.isError ||
        approvalTimeByVertical.isError ||
        approvalTimeByDepartment.isError ||
        stageTimeBreakdown.isError ||
        checkerTimeByLevel.isError ||
        escalationByLevel.isError;


    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    if (isLoading) {

        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-[#f7f8fc]">

                <div className="text-center">

                    <div
                        className="
                            w-10 h-10
                            border-4
                            border-indigo-100
                            border-t-indigo-700
                            rounded-full
                            animate-spin
                            mx-auto
                        "
                    />

                    <p className="text-sm text-gray-500 mt-4">
                        Loading analytics...
                    </p>

                </div>

            </div>
        );
    }


    /* =====================================================
       ERROR SCREEN
    ===================================================== */

    if (isError) {

        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-[#f7f8fc]">

                <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">

                    <div className="text-red-500 text-2xl mb-3">
                        !
                    </div>

                    <h2 className="font-semibold text-gray-900">
                        Unable to load analytics
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Please try again.
                    </p>

                </div>

            </div>
        );
    }


    /* =====================================================
       DATA PREPARATION
    ===================================================== */

    const stats = overview.data || {};


    const statusData = (status.data || []).map((item) => ({
        ...item,
        label:
            STATUS_LABELS[item.status] || item.status,
    }));


    const statusChartData = statusData.filter(
        (item) => Number(item.count) > 0
    );


    const approvalTrendData =
        approvalTrend.data || [];


    const closureVolumeData =
        closureVolume.data || [];


    const divisionData =
        divisions.data || [];


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#f7f8fc]">

            <div className="max-w-[1500px] mx-auto px-6 lg:px-8 py-7">


                {/* =================================================
                    HEADER
                    NEVER CHANGES
                ================================================= */}

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">

                    <div>

                        <p className="text-xs uppercase tracking-[0.18em] text-indigo-700 font-semibold">
                            Executive Workspace
                        </p>

                        <h1 className="text-3xl lg:text-4xl font-bold text-indigo-900 mt-2">
                            Analytics
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Executive overview of ticket operations
                        </p>

                    </div>


                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">

                        <p className="text-xs text-gray-400">
                            Data source
                        </p>

                        <p className="text-sm font-semibold text-gray-800 mt-1">
                            Live ticket operations
                        </p>

                    </div>

                </div>


                {/* =================================================
                    TABS + FILTERS
                    NEVER CHANGES
                ================================================= */}

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">


                    {/* =================================================
                        TABS
                    ================================================= */}

                    <div className="flex items-center gap-8 px-6 border-b border-gray-100">


                        {/* EXECUTIVE */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("executive")
                            }
                            className={`
                                py-4
                                text-sm
                                transition-colors
                                ${activeTab === "executive"
                                    ? "font-semibold text-indigo-800 border-b-2 border-indigo-700"
                                    : "text-gray-400 hover:text-indigo-800"
                                }
                            `}
                        >
                            Executive
                        </button>


                        {/* APPROVAL TIME */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("approval")
                            }
                            className={`
                                py-4
                                text-sm
                                transition-colors
                                ${activeTab === "approval"
                                    ? "font-semibold text-indigo-800 border-b-2 border-indigo-700"
                                    : "text-gray-400 hover:text-indigo-800"
                                }
                            `}
                        >
                            Approval Time
                        </button>


                        {/* OPERATIONAL */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("operational")
                            }
                            className={`
                                py-4
                                text-sm
                                transition-colors
                                ${activeTab === "operational"
                                    ? "font-semibold text-indigo-800 border-b-2 border-indigo-700"
                                    : "text-gray-400 hover:text-indigo-800"
                                }
                            `}
                        >
                            Operational
                        </button>

                    </div>


                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <div className="p-5">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <FilterBox
                                label="Division"
                                value="All divisions"
                            />

                            <FilterBox
                                label="Ticket Type"
                                value="All ticket types"
                            />

                            <FilterBox
                                label="Status"
                                value="All statuses"
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    LOWER CONTENT
                    ONLY THIS SECTION CHANGES
                ================================================= */}


                {/* =================================================
                    EXECUTIVE TAB
                ================================================= */}

                {activeTab === "executive" && (

                    <ExecutiveContent
                        stats={stats}
                        statusChartData={statusChartData}
                        approvalTime={approvalTime.data}
                        approvalTrendData={approvalTrendData}
                        closureVolumeData={closureVolumeData}
                    />

                )}


                {/* =================================================
                    APPROVAL TIME TAB
                ================================================= */}

                {activeTab === "approval" && (

                    <ApprovalTime
                        approvalTime={approvalTime.data}
                        approvalTrendData={approvalTrendData}
                        divisions={divisionData}
                    />

                )}


                {/* =================================================
                    OPERATIONAL TAB
                ================================================= */}

                {activeTab === "operational" && (

                    <OperationalContent
                        stats={operational.data || {}}
                        openTicketAgingData={openTicketAging.data || []}
                        adminSendBackTrendData={sendBackTrend.data || []}
                        approvalTimeByVerticalData={
                            approvalTimeByVertical.data || []
                        }
                        approvalTimeByDepartmentData={
                            approvalTimeByDepartment.data || []
                        }
                        stageTimeData={
                            stageTimeBreakdown.data || []
                        }
                        checkerTimeByLevelData={
                            checkerTimeByLevel.data || []
                        }
                        escalationByLevelData={
                            escalationByLevel.data || []
                        }
                    />

                )}


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="text-center text-xs text-gray-400 py-8">

                    TicketFlow · Analytics powered by live ticket workflow data

                </div>

            </div>

        </div>
    );
}


export default DashboardPage;