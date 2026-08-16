import { createBrowserRouter } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ApprovalTimeExplorer from "./pages/ApprovalTimeExplorer";
import TicketsPage from "./pages/TicketsPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import TicketDetailsPage from "./pages/TicketDetailsPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },

    {
        element: <DashboardLayout />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardPage />,
            },

            {
                path: "/analytics/approval-time-explorer",
                element: <ApprovalTimeExplorer />,
            },

            {
                path: "/tickets",
                element: <TicketsPage />,
            },
        ],
    },

    {
        path: "/tickets/:ticketId",
        element: <TicketDetailsPage />,
    },
]);

export default router;