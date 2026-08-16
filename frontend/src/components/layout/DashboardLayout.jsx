import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Chatbot from "../../components/chatbot/Chatbot";

import {
  LayoutDashboard,
  Ticket,
  Bell,
  Menu,
  LogOut,
} from "lucide-react";


const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tickets",
    path: "/tickets",
    icon: Ticket,
  },
];


function DashboardLayout() {
  const {
    user,
    logoutUser,
  } = useAuth();

  const navigate = useNavigate();


  // =====================================================
  // USER INITIALS
  // =====================================================

  const initials = (
    user?.full_name || "U"
  )
    .charAt(0)
    .toUpperCase();


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // Clear authentication state
    logoutUser();

    // Redirect to login page
    navigate(
      "/",
      {
        replace: true,
      }
    );
  };


  return (
    <div className="min-h-screen bg-slate-50">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          fixed
          top-0
          left-0
          right-0
          h-[72px]
          bg-white
          border-b
          border-slate-200
          z-50
        "
      >

        <div
          className="
            h-full
            flex
            items-center
            justify-between
            px-7
          "
        >


          {/* ================= BRAND ================= */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* Logo */}

            <div
              className="
                w-9
                h-9
                rounded-lg
                bg-slate-950
                flex
                items-center
                justify-center
                text-white
                font-bold
                text-sm
              "
            >
              T
            </div>


            {/* Brand text */}

            <div>

              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  leading-tight
                "
              >
                TicketFlow
              </h1>

              <p
                className="
                  text-xs
                  text-slate-500
                  mt-0.5
                "
              >
                Operations Dashboard
              </p>

            </div>

          </div>


          {/* ================= HEADER RIGHT ================= */}

          <div
            className="
              flex
              items-center
              gap-5
            "
          >


            {/* Notification */}

            <button
              type="button"
              className="
                relative
                w-9
                h-9
                rounded-full
                flex
                items-center
                justify-center
                text-slate-500
                hover:bg-slate-100
                hover:text-slate-800
                transition
              "
              aria-label="Notifications"
            >

              <Bell
                size={18}
                strokeWidth={2}
              />


              {/* Notification dot */}

              <span
                className="
                  absolute
                  top-1.5
                  right-1.5
                  w-2
                  h-2
                  rounded-full
                  bg-red-500
                  ring-2
                  ring-white
                "
              />

            </button>


            {/* User name */}

            <div
              className="
                text-right
                hidden
                sm:block
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                {user?.full_name || "User"}
              </p>


              <p
                className="
                  text-xs
                  text-slate-500
                  capitalize
                  mt-0.5
                "
              >
                {user?.role || "viewer"}
              </p>

            </div>


            {/* Header avatar */}

            <div
              className="
                w-9
                h-9
                rounded-full
                bg-indigo-600
                text-white
                flex
                items-center
                justify-center
                text-sm
                font-semibold
              "
            >
              {initials}
            </div>


            {/* Menu */}

            <button
              type="button"
              className="
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                text-slate-500
                hover:bg-slate-100
                hover:text-slate-800
                transition
              "
              aria-label="Menu"
            >

              <Menu
                size={20}
                strokeWidth={2}
              />

            </button>

          </div>

        </div>

      </header>



      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-[72px]
          bottom-0
          w-[280px]
          bg-white
          text-slate-900
          z-40
          flex
          flex-col
          border-r
          border-slate-200
        "
      >


        {/* ================= NAVIGATION ================= */}

        <nav
          className="
            flex-1
            px-5
            py-8
          "
        >

          {/* Workspace label */}

          <p
            className="
              px-3
              mb-4
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            Workspace
          </p>


          <div className="space-y-2">

            {navItems.map(
              (item) => {

                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({
                      isActive,
                    }) =>
                      `
                      group
                      flex
                      items-center
                      gap-3
                      px-3
                      py-3
                      rounded-xl
                      text-sm
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-indigo-50 text-slate-900 font-semibold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }
                      `
                    }
                  >

                    {({
                      isActive,
                    }) => (
                      <>

                        {/* Icon box */}

                        <span
                          className={`
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                            transition-all
                            duration-200
                            ${
                              isActive
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                            }
                          `}
                        >

                          <Icon
                            size={18}
                            strokeWidth={2}
                          />

                        </span>


                        {/* Label */}

                        <span>
                          {item.label}
                        </span>

                      </>
                    )}

                  </NavLink>
                );
              }
            )}

          </div>

        </nav>



        {/* =================================================
            SIDEBAR USER
        ================================================= */}

        <div
          className="
            p-5
            border-t
            border-slate-200
          "
        >


          {/* User info */}

          <div
            className="
              flex
              items-center
              gap-3
              px-2
              mb-5
            "
          >


            {/* Avatar */}

            <div
              className="
                w-10
                h-10
                rounded-full
                bg-indigo-600
                flex
                items-center
                justify-center
                text-sm
                font-bold
                text-white
                flex-shrink-0
              "
            >
              {initials}
            </div>


            {/* Name / role */}

            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                  truncate
                "
              >
                {user?.full_name || "User"}
              </p>


              <p
                className="
                  text-xs
                  text-slate-500
                  capitalize
                  mt-0.5
                "
              >
                {user?.role || "viewer"}
              </p>

            </div>

          </div>



          {/* =================================================
              SIGN OUT
          ================================================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-lg
              text-sm
              text-slate-500
              hover:bg-slate-50
              hover:text-slate-900
              transition
            "
          >

            <LogOut
              size={17}
              strokeWidth={2}
            />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>



      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          ml-[280px]
          pt-[72px]
          min-h-screen
        "
      >

        <main>
          <Outlet />
        </main>

      </div>


      {/* =====================================================
          CHATBOT
      ===================================================== */}

      <Chatbot />

    </div>
  );
}


export default DashboardLayout;