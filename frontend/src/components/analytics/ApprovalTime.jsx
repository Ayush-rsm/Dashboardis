import { useMemo, useState } from "react";

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


/* =========================================================
   APPROVAL TIME COMPONENT

   This component owns only the Approval Time lower section.
   The Dashboard header, tabs and filters remain in DashboardPage.
========================================================= */

function ApprovalTime({
    approvalTime,
    approvalTrendData = [],
    divisions = [],
}) {
    const [measure, setMeasure] = useState("approval");
    const [breakdown, setBreakdown] = useState("vertical");
    const [period, setPeriod] = useState("month");
    const [view, setView] = useState("breakdown");


    /* =========================================================
       SUMMARY VALUES
    ========================================================= */

    const approvalDays =
        Number(approvalTime?.average_approval_hours || 0) / 24;

    const checkerDays =
        Number(approvalTime?.average_checker_hours || 0) / 24;

    const totalDays =
        Number(approvalTime?.average_total_hours || 0) / 24;


    /* =========================================================
       CURRENT MEASURE
    ========================================================= */

    const metricLabel =
        measure === "checker"
            ? "Checker Time"
            : measure === "total"
                ? "Total Processing Time"
                : "Approval Time";

    const metricValue =
        measure === "checker"
            ? checkerDays
            : measure === "total"
                ? totalDays
                : approvalDays;


    /* =========================================================
       VERTICAL BREAKDOWN

       getDivisionAnalytics() is used here because the existing
       DashboardPage already loads division analytics.
    ========================================================= */

    const verticalData = useMemo(() => {
        return (divisions || []).map((item) => {
            const label =
                item.vertical ||
                item.vertical_name ||
                item.division_code ||
                item.division ||
                item.name ||
                item.label ||
                "Unknown";

            const rawValue =
                item.average_days ??
                item.avg_days ??
                item.approval_days ??
                item.average_approval_days;

            return {
                ...item,
                name: label,
                value:
                    rawValue !== undefined &&
                    rawValue !== null
                        ? Number(rawValue)
                        : metricValue,
            };
        });
    }, [divisions, metricValue]);


    /* =========================================================
       TREND

       The existing approval-time trend API returns average_days.
    ========================================================= */

    const trendData = useMemo(() => {
        return (approvalTrendData || []).map((item) => {
            let value = Number(item.average_days || 0);

            /*
             * The existing API exposes approval trend directly.
             * For checker/total we fall back to the corresponding
             * overall metric because those historical series are
             * not present in the current API response.
             */
            if (measure === "checker") {
                value = checkerDays;
            }

            if (measure === "total") {
                value = totalDays;
            }

            return {
                ...item,
                month:
                    item.month ||
                    item.period ||
                    item.date ||
                    "",
                value,
            };
        });
    }, [
        approvalTrendData,
        measure,
        checkerDays,
        totalDays,
    ]);


    /* =========================================================
       CHART DATA
    ========================================================= */

    const chartData =
        view === "breakdown"
            ? verticalData
            : trendData;


    /* =========================================================
       HELPERS
    ========================================================= */

    const formatDays = (value) =>
        `${Number(value || 0).toFixed(1)} days`;


    return (
        <div className="space-y-6">


            {/* =================================================
                CONFIGURABLE MEASURE
            ================================================= */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border border-gray-100
                    shadow-sm
                "
            >

                {/* Header */}

                <div className="px-6 pt-6">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Configurable Measure
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                        Switch Measure × Breakdown × Period and the chart recomputes.
                    </p>

                </div>


                {/* =================================================
                    CONTROLS
                ================================================= */}

                <div className="px-6 pt-5">

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">


                        {/* Measure */}

                        <div>

                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                                Measure
                            </label>

                            <select
                                value={measure}
                                onChange={(e) =>
                                    setMeasure(e.target.value)
                                }
                                className="
                                    w-full
                                    bg-white
                                    border border-gray-200
                                    rounded-xl
                                    px-4 py-3
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            >

                                <option value="approval">
                                    Approval Time
                                </option>

                                <option value="checker">
                                    Checker Time
                                </option>

                                <option value="total">
                                    Total Processing Time
                                </option>

                            </select>

                        </div>


                        {/* Breakdown */}

                        <div>

                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                                Break Down By
                            </label>

                            <select
                                value={breakdown}
                                onChange={(e) =>
                                    setBreakdown(e.target.value)
                                }
                                className="
                                    w-full
                                    bg-white
                                    border border-gray-200
                                    rounded-xl
                                    px-4 py-3
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            >

                                <option value="vertical">
                                    Vertical
                                </option>

                            </select>

                        </div>


                        {/* Period */}

                        <div>

                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                                Period (Trend)
                            </label>

                            <select
                                value={period}
                                onChange={(e) =>
                                    setPeriod(e.target.value)
                                }
                                className="
                                    w-full
                                    bg-white
                                    border border-gray-200
                                    rounded-xl
                                    px-4 py-3
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            >

                                <option value="month">
                                    Month
                                </option>

                                <option value="quarter">
                                    Quarter
                                </option>

                                <option value="year">
                                    Year
                                </option>

                            </select>

                        </div>


                        {/* View */}

                        <div>

                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                                View
                            </label>

                            <div className="flex">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setView("breakdown")
                                    }
                                    className={`
                                        flex-1
                                        px-4 py-3
                                        text-sm
                                        font-medium
                                        border
                                        rounded-l-xl
                                        ${
                                            view === "breakdown"
                                                ? "bg-indigo-700 text-white border-indigo-700"
                                                : "bg-white text-gray-600 border-gray-200"
                                        }
                                    `}
                                >
                                    Breakdown
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setView("trend")
                                    }
                                    className={`
                                        flex-1
                                        px-4 py-3
                                        text-sm
                                        font-medium
                                        border
                                        rounded-r-xl
                                        ${
                                            view === "trend"
                                                ? "bg-indigo-700 text-white border-indigo-700"
                                                : "bg-white text-gray-600 border-gray-200"
                                        }
                                    `}
                                >
                                    Trend
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Divider */}

                <div className="mx-6 border-t border-gray-100" />


                {/* =================================================
                    CHART
                ================================================= */}

                <div className="px-6 pb-6 pt-6">

                    <div className="h-[420px]">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            {view === "breakdown" ? (

                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 10,
                                        bottom: 30,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e5e7eb"
                                    />

                                    <XAxis
                                        dataKey="name"
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
                                            `${Number(value).toFixed(0)}d`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            formatDays(value),
                                            metricLabel,
                                        ]}
                                        contentStyle={{
                                            borderRadius: "10px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.08)",
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        fill="#252a9b"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={55}
                                    />

                                </BarChart>

                            ) : (

                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 10,
                                        bottom: 20,
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
                                            `${Number(value).toFixed(0)}d`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            formatDays(value),
                                            metricLabel,
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
                                        dataKey="value"
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

                            )}

                        </ResponsiveContainer>

                    </div>


                    {/* =================================================
                        FOOTER INFO
                    ================================================= */}

                    <div className="mt-4 text-xs text-gray-400">

                        Showing{" "}

                        <span className="font-medium text-gray-500">
                            {metricLabel}
                        </span>

                        {" "}

                        {view === "breakdown"
                            ? "by Vertical"
                            : `trend by ${period}`}

                        {" · "}

                        {view === "breakdown"
                            ? `${verticalData.length} records in scope`
                            : `${trendData.length} records in scope`}

                        {" · unit: d"}

                    </div>

                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <SummaryCard
                    label="Average Approval Time"
                    value={`${approvalDays.toFixed(1)}d`}
                    subtitle="Average approval processing time"
                />

                <SummaryCard
                    label="Average Checker Time"
                    value={`${checkerDays.toFixed(1)}d`}
                    subtitle="Average checker processing time"
                />

                <SummaryCard
                    label="Average Total Time"
                    value={`${totalDays.toFixed(1)}d`}
                    subtitle="Average complete processing time"
                />

            </div>


            <p className="text-xs text-gray-400">
                Views and rows shown are scoped to your assigned roles
                (executive) via Row-Level Security.
            </p>

        </div>
    );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
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


export default ApprovalTime;