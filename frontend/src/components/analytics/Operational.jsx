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
    Cell,
} from "recharts";


/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
    title,
    subtitle,
    children,
}) {
    return (
        <div
            className="
                bg-white
                rounded-2xl
                border border-gray-100
                shadow-sm
                overflow-hidden
            "
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
   EMPTY STATE
========================================================= */

function EmptyState({
    message = "No data available",
}) {
    return (
        <div className="h-[350px] flex items-center justify-center">

            <div className="text-center">

                <div
                    className="
                        w-12
                        h-12
                        rounded-full
                        bg-gray-50
                        flex
                        items-center
                        justify-center
                        mx-auto
                    "
                >
                    <span className="text-gray-400 text-lg">
                        —
                    </span>
                </div>

                <p className="text-sm font-medium text-gray-500 mt-3">
                    {message}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                    No records are currently available.
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
    title,
    value,
    subtitle,
    accent = "blue",
    icon = "○",
}) {

    const accentStyles = {

        blue: {
            border: "border-l-indigo-700",
            icon: "bg-indigo-50 text-indigo-700",
        },

        orange: {
            border: "border-l-orange-500",
            icon: "bg-orange-50 text-orange-600",
        },

        red: {
            border: "border-l-red-500",
            icon: "bg-red-50 text-red-600",
        },

        green: {
            border: "border-l-green-500",
            icon: "bg-green-50 text-green-600",
        },

        gray: {
            border: "border-l-gray-400",
            icon: "bg-gray-50 text-gray-500",
        },

    };

    const style =
        accentStyles[accent] ||
        accentStyles.blue;

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
                        w-9
                        h-9
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${style.icon}
                    `}
                >
                    <span className="text-sm font-bold">
                        {icon}
                    </span>
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   OPERATIONAL CONTENT
========================================================= */

function OperationalContent({

    stats = {},

    openTicketAgingData = [],

    adminSendBackTrendData = [],

    approvalTimeByVerticalData = [],

    approvalTimeByDepartmentData = [],

    stageTimeData = [],

    checkerTimeByLevelData = [],

    escalationByLevelData = [],

}) {


    /* =====================================================
       TOTAL OPEN TICKETS
    ===================================================== */

    const totalOpenTickets =
        openTicketAgingData.reduce(
            (sum, item) =>
                sum + Number(item.count || 0),
            0
        );


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="space-y-6">


            {/* =================================================
                OPERATIONAL HEADER
            ================================================= */}

            <div>

                <h2 className="text-xl font-bold text-gray-900">
                    Operational Analytics
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Operational view of current ticket workflow activity
                </p>

            </div>


            {/* =================================================
                METRIC CARDS
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-4
                "
            >

                {/* =================================================
                    TOTAL TICKETS
                ================================================= */}

                <MetricCard
                    title="Total Tickets"
                    value={stats?.total_tickets}
                    subtitle="Tickets in scope"
                    accent="blue"
                    icon="○"
                />


                {/* =================================================
                    OPEN TICKETS
                ================================================= */}

                <MetricCard
                    title="Open Tickets"
                    value={stats?.open_tickets}
                    subtitle="Currently open"
                    accent="blue"
                    icon="○"
                />


                {/* =================================================
                    PENDING CHECKER
                ================================================= */}

                <MetricCard
                    title="Pending Checker"
                    value={stats?.pending_checker}
                    subtitle="Awaiting checker action"
                    accent="orange"
                    icon="↻"
                />


                {/* =================================================
                    PENDING APPROVER
                ================================================= */}

                <MetricCard
                    title="Pending Approver"
                    value={stats?.pending_approver}
                    subtitle="Awaiting approval"
                    accent="orange"
                    icon="↻"
                />


                {/* =================================================
                    ESCALATED
                ================================================= */}

                <MetricCard
                    title="Escalated"
                    value={stats?.escalated}
                    subtitle="Requires attention"
                    accent="orange"
                    icon="↻"
                />


                {/* =================================================
                    SLA BREACHED
                ================================================= */}

                <MetricCard
                    title="SLA Breached"
                    value={stats?.sla_breached}
                    subtitle="Beyond SLA"
                    accent="red"
                    icon="!"
                />


                {/* =================================================
                    APPROVED
                ================================================= */}

                <MetricCard
                    title="Approved"
                    value={stats?.approved_tickets}
                    subtitle="Approved tickets"
                    accent="green"
                    icon="✓"
                />


                {/* =================================================
                    CLOSED
                ================================================= */}

                <MetricCard
                    title="Closed"
                    value={stats?.closed_tickets}
                    subtitle="Completed workflow"
                    accent="green"
                    icon="✓"
                />

            </div>


            {/* =================================================
                ROW 1
                OPEN TICKET AGING
                SEND-BACK TREND
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                {/* =================================================
                    OPEN TICKET AGING
                ================================================= */}

                <SectionCard
                    title="Open Ticket Aging"
                    subtitle={`${totalOpenTickets} open tickets by age (days)`}
                >

                    {openTicketAgingData.length === 0 ? (

                        <EmptyState />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={openTicketAgingData}
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
                                        dataKey="age"
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
                                            "Open Tickets",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="count"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={45}
                                    >

                                        {openTicketAgingData.map(
                                            (entry) => (

                                                <Cell
                                                    key={entry.age}
                                                    fill={
                                                        entry.age === "16-30"
                                                            ? "#f0831b"
                                                            : entry.age === "31-60"
                                                                ? "#f0831b"
                                                                : entry.age === ">60"
                                                                    ? "#ef1111"
                                                                    : "#252a9b"
                                                    }
                                                />

                                            )
                                        )}

                                    </Bar>

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>


                {/* =================================================
                    ADMIN L1 SEND-BACK TREND
                ================================================= */}

                <SectionCard
                    title="Admin L1 Send-Back Trend"
                    subtitle="Send-backs per month"
                >

                    {adminSendBackTrendData.length === 0 ? (

                        <EmptyState message="No send-back data available" />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={adminSendBackTrendData}
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
                                            `${value}`,
                                            "Send-backs",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#f0831b"
                                        strokeWidth={3}
                                        dot={{
                                            r: 5,
                                            fill: "#f0831b",
                                            strokeWidth: 0,
                                        }}
                                        activeDot={{
                                            r: 7,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>

            </div>


            {/* =================================================
                ROW 2
                APPROVAL TIME BY VERTICAL
                APPROVAL TIME BY DEPARTMENT
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                {/* =================================================
                    APPROVAL TIME BY VERTICAL
                ================================================= */}

                <SectionCard
                    title="Approval Time by Vertical"
                    subtitle="Average days, closed tickets"
                >

                    {approvalTimeByVerticalData.length === 0 ? (

                        <EmptyState message="No vertical approval data available" />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={approvalTimeByVerticalData}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 100,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                        stroke="#e5e7eb"
                                    />

                                    <XAxis
                                        type="number"
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, "dataMax + 2"]}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="vertical"
                                        width={100}
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${Number(value).toFixed(1)} d`,
                                            "Approval Time",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="days"
                                        fill="#252a9b"
                                        radius={[0, 6, 6, 0]}
                                        maxBarSize={20}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>


                {/* =================================================
                    APPROVAL TIME BY DEPARTMENT
                ================================================= */}

                <SectionCard
                    title="Approval Time by Division – Department"
                    subtitle="Average approval time by department"
                >

                    {approvalTimeByDepartmentData.length === 0 ? (

                        <EmptyState message="No department approval data available" />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={approvalTimeByDepartmentData}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 135,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                        stroke="#e5e7eb"
                                    />

                                    <XAxis
                                        type="number"
                                        tick={{
                                            fontSize: 12,
                                            fill: "#94a3b8",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, "dataMax + 2"]}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="department"
                                        width={140}
                                        tick={{
                                            fontSize: 11,
                                            fill: "#94a3b8",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${Number(value).toFixed(1)} d`,
                                            "Approval Time",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="days"
                                        fill="#252a9b"
                                        radius={[0, 6, 6, 0]}
                                        maxBarSize={20}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>

            </div>


            {/* =================================================
                ROW 3
                STAGE TIME BREAKDOWN
                CHECKER TIME BY LEVEL
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                {/* =================================================
                    STAGE TIME BREAKDOWN
                ================================================= */}

                <SectionCard
                    title="Stage Time Breakdown"
                    subtitle="Average days per stage"
                >

                    {stageTimeData.length === 0 ? (

                        <EmptyState message="No stage time data available" />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={stageTimeData}
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
                                        dataKey="stage"
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
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${Number(value).toFixed(1)} d`,
                                            "Avg Time",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="days"
                                        fill="#252a9b"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={55}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>


                {/* =================================================
                    CHECKER TIME BY LEVEL
                ================================================= */}

                <SectionCard
                    title="Checker Time by Level"
                    subtitle="Average days by checker level"
                >

                    {checkerTimeByLevelData.length === 0 ? (

                        <EmptyState message="No checker level data available" />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={checkerTimeByLevelData}
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
                                        dataKey="level"
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
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${Number(value).toFixed(1)} d`,
                                            "Avg Checker Time",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="days"
                                        fill="#7da0d2"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={55}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>

            </div>


            {/* =================================================
                ROW 4
                ESCALATION BY LEVEL
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                <SectionCard
                    title="Escalation by Level"
                    subtitle="Number of escalations by escalation level"
                >

                    {escalationByLevelData.length === 0 ? (

                        <EmptyState message="No escalation data available" />

                    ) : (

                        <div className="h-[350px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={escalationByLevelData}
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
                                        dataKey="level"
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
                                            `${value} escalations`,
                                            "Count",
                                        ]}
                                    />

                                    <Bar
                                        dataKey="count"
                                        fill="#f0831b"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={55}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </SectionCard>

            </div>

        </div>
    );
}


/* =========================================================
   EXPORT
========================================================= */

export default OperationalContent;