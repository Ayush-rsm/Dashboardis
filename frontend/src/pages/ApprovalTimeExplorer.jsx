import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

import {
    getApprovalTimeAnalytics,
    getApprovalTimeTrend,
    getDivisionAnalytics,
    getTicketTypeAnalytics,
} from "../api/analytics";
import { useState } from "react";

function SelectBox({ label, value, onChange, options = ["All"] }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.16em] text-gray-500 mb-2">
                {label}
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function SectionCard({ title, subtitle, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
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

            <div className="px-6 pb-6 pt-5">
                {children}
            </div>
        </div>
    );
}

function ApprovalTimeExplorer() {
    const [division, setDivision] = useState("All");
    const [ticketType, setTicketType] = useState("All");
    const [payment, setPayment] = useState("All");
    const [workflow, setWorkflow] = useState("All");
    const [status, setStatus] = useState("All");
    const [decisionMatrix, setDecisionMatrix] = useState("All");
    const [year, setYear] = useState("All");

    const [measure, setMeasure] = useState("Approval Time");
    const [breakdown, setBreakdown] = useState("Vertical");
    const [period, setPeriod] = useState("Month");
    const [view, setView] = useState("Breakdown");

    const approvalTime = useQuery({
        queryKey: ["analytics", "approval-time"],
        queryFn: getApprovalTimeAnalytics,
    });

    const approvalTrend = useQuery({
        queryKey: ["analytics", "approval-time-trend"],
        queryFn: getApprovalTimeTrend,
    });

    const divisions = useQuery({
        queryKey: ["analytics", "divisions"],
        queryFn: getDivisionAnalytics,
    });

    const ticketTypes = useQuery({
        queryKey: ["analytics", "ticket-types"],
        queryFn: getTicketTypeAnalytics,
    });

    const isLoading =
        approvalTime.isLoading ||
        approvalTrend.isLoading ||
        divisions.isLoading ||
        ticketTypes.isLoading;

    const isError =
        approvalTime.isError ||
        approvalTrend.isError ||
        divisions.isError ||
        ticketTypes.isError;

    const resetFilters = () => {
        setDivision("All");
        setTicketType("All");
        setPayment("All");
        setWorkflow("All");
        setStatus("All");
        setDecisionMatrix("All");
        setYear("All");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-700 rounded-full animate-spin mx-auto" />

                    <p className="text-sm text-gray-500 mt-4">
                        Loading approval analytics...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
                    <p className="text-red-500 text-2xl font-bold">
                        !
                    </p>

                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                        Unable to load approval analytics
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Please try again.
                    </p>
                </div>
            </div>
        );
    }

    const trendData = approvalTrend.data || [];

    const divisionData = (divisions.data || []).map((item) => ({
        label: item.division_code,
        value: item.ticket_count,
    }));

    const ticketTypeData = (ticketTypes.data || []).map((item) => ({
        label: item.type_code,
        value: item.ticket_count,
    }));

    /*
     * For now:
     * - Trend view uses the real approval-time trend API.
     * - Breakdown view uses the existing division analytics API.
     *
     * Once we add a backend approval-time-by-division endpoint,
     * the breakdown can show actual average approval days by division.
     */
    const chartData =
        breakdown === "Vertical"
            ? divisionData
            : ticketTypeData;

    return (
        <div className="min-h-screen bg-[#f7f8fc]">
            <div className="max-w-[1500px] mx-auto px-6 lg:px-8 py-7">

                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-3xl font-bold text-indigo-900">
                        Analytics
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Approval Time Explorer · Access scoped to your role.
                        Data respects Row-Level Security.
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-7">
                    <div className="flex items-center gap-8">

                        <button className="py-4 text-sm text-gray-500">
                            ◫&nbsp;&nbsp; Executive
                        </button>

                        <button className="py-4 text-sm font-semibold text-indigo-800 border-b-2 border-indigo-700">
                            ╱&nbsp;&nbsp; Approval Time Explorer
                        </button>

                        <button className="py-4 text-sm text-gray-500">
                            ∿&nbsp;&nbsp; Operational
                        </button>

                        <button className="py-4 text-sm text-gray-500">
                            ✧&nbsp;&nbsp; AI Insights
                        </button>

                    </div>
                </div>

                {/* Filters */}
                <div className="mb-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">

                        <SelectBox
                            label="Division"
                            value={division}
                            onChange={setDivision}
                            options={["All", ...divisionData.map((x) => x.label)]}
                        />

                        <SelectBox
                            label="Ticket Type"
                            value={ticketType}
                            onChange={setTicketType}
                            options={[
                                "All",
                                ...ticketTypeData.map((x) => x.label),
                            ]}
                        />

                        <SelectBox
                            label="Payment"
                            value={payment}
                            onChange={setPayment}
                            options={["All"]}
                        />

                        <SelectBox
                            label="Workflow"
                            value={workflow}
                            onChange={setWorkflow}
                            options={["All"]}
                        />

                        <SelectBox
                            label="Status"
                            value={status}
                            onChange={setStatus}
                            options={["All"]}
                        />

                        <SelectBox
                            label="Decision Matrix"
                            value={decisionMatrix}
                            onChange={setDecisionMatrix}
                            options={["All"]}
                        />

                        <SelectBox
                            label="Year"
                            value={year}
                            onChange={setYear}
                            options={["All", "2026", "2025"]}
                        />

                    </div>

                    <button
                        onClick={resetFilters}
                        className="mt-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        ↻&nbsp; Reset
                    </button>
                </div>

                {/* Configurable Measure */}
                <SectionCard
                    title="Configurable Measure"
                    subtitle="Switch Measure × Breakdown × Period and the chart recomputes."
                >

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

                        <SelectBox
                            label="Measure"
                            value={measure}
                            onChange={setMeasure}
                            options={[
                                "Approval Time",
                                "Ticket Volume",
                            ]}
                        />

                        <SelectBox
                            label="Break Down By"
                            value={breakdown}
                            onChange={setBreakdown}
                            options={[
                                "Vertical",
                                "Ticket Type",
                            ]}
                        />

                        <SelectBox
                            label="Period (Trend)"
                            value={period}
                            onChange={setPeriod}
                            options={[
                                "Month",
                                "Quarter",
                                "Year",
                            ]}
                        />

                        <div>
                            <label className="block text-xs uppercase tracking-[0.16em] text-gray-500 mb-2">
                                View
                            </label>

                            <div className="flex h-[46px]">
                                <button
                                    onClick={() => setView("Breakdown")}
                                    className={`flex-1 rounded-l-xl border px-4 text-sm font-medium ${
                                        view === "Breakdown"
                                            ? "bg-indigo-800 text-white border-indigo-800"
                                            : "bg-white text-gray-600 border-gray-200"
                                    }`}
                                >
                                    Breakdown
                                </button>

                                <button
                                    onClick={() => setView("Trend")}
                                    className={`flex-1 rounded-r-xl border border-l-0 px-4 text-sm font-medium ${
                                        view === "Trend"
                                            ? "bg-indigo-800 text-white border-indigo-800"
                                            : "bg-white text-gray-600 border-gray-200"
                                    }`}
                                >
                                    Trend
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="border-t border-gray-100 pt-5">

                        <div className="h-[420px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                {view === "Trend" ? (
                                    <LineChart
                                        data={trendData}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 5,
                                            bottom: 25,
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
                                            allowDecimals
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
                                                "Approval Time",
                                            ]}
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
                                ) : (
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 5,
                                            bottom: 35,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="label"
                                            tick={{
                                                fontSize: 12,
                                                fill: "#94a3b8",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
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
                                                value,
                                                measure === "Approval Time"
                                                    ? "Tickets"
                                                    : "Tickets",
                                            ]}
                                        />

                                        <Bar
                                            dataKey="value"
                                            fill="#252a9b"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={55}
                                        />

                                    </BarChart>
                                )}

                            </ResponsiveContainer>

                        </div>

                        <p className="text-sm text-gray-400 mt-4">
                            {view === "Trend"
                                ? `Showing Approval Time (avg, days) by ${period.toLowerCase()}`
                                : `Showing ${measure} by ${breakdown.toLowerCase()}`}
                        </p>

                    </div>

                </SectionCard>

                {/* Footer */}
                <div className="text-xs text-gray-400 py-8">
                    Views and rows shown are scoped to your assigned roles
                    (executive) via Row-Level Security.
                </div>

            </div>
        </div>
    );
}

export default ApprovalTimeExplorer;