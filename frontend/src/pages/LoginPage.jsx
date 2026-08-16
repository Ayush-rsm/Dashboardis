import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      await loginUser(data);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#090d12]">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      {/* Blue glow */}
      <div
        className="
          absolute
          -top-40
          -left-40
          w-[700px]
          h-[700px]
          rounded-full
          bg-blue-900/40
          blur-[120px]
        "
      />

      <div
        className="
          absolute
          -bottom-60
          -right-40
          w-[700px]
          h-[700px]
          rounded-full
          bg-indigo-900/40
          blur-[140px]
        "
      />

      {/* Grid */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.12]
          pointer-events-none
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(148,163,184,0.25) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148,163,184,0.25) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "55px 55px",
        }}
      />

      
      

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 min-h-screen flex">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div
          className="
            hidden
            lg:flex
            lg:w-[52%]
            xl:w-[55%]
            flex-col
            justify-between
            px-16
            xl:px-20
            py-12
            text-white
          "
        >

          {/* Logo / Brand */}
          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                shadow-lg
              "
            >
              <span
                className="
                  text-2xl
                  font-black
                  text-blue-900
                "
              >
                T
              </span>
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                "
              >
                TicketFlow
              </h1>

              <p
                className="
                  text-sm
                  text-blue-200/70
                  mt-0.5
                "
              >
                Operations Platform
              </p>
            </div>

          </div>


          {/* Hero */}
          <div className="max-w-[650px]">

            <p
              className="
                text-sm
                uppercase
                tracking-[0.3em]
                text-blue-300
                font-semibold
                mb-5
              "
            >
              Enterprise Operations
            </p>

            <h2
              className="
                text-6xl
                xl:text-7xl
                font-bold
                tracking-tight
                leading-[1.05]
              "
            >
              Every decision
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-blue-300
                  via-indigo-400
                  to-blue-500
                  bg-clip-text
                  text-transparent
                "
              >
                Moving Forward
              </span>
            </h2>

            <p
              className="
                mt-7
                max-w-lg
                text-lg
                leading-8
                text-slate-300
              "
            >
              Streamline approvals, manage tickets,
              monitor operations and make faster
              data-driven decisions.
            </p>

          </div>


          {/* Footer */}
          <div
            className="
              text-sm
              text-slate-500
            "
          >
            © 2026 TicketFlow
          </div>

        </div>


        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div
          className="
            w-full
            lg:w-[48%]
            xl:w-[45%]
            flex
            items-center
            justify-center
            px-6
            py-10
          "
        >

          <div
            className="
              w-full
              max-w-[520px]
              bg-white
              rounded-[28px]
              shadow-2xl
              p-8
              sm:p-10
              lg:p-12
            "
          >

            {/* Greeting */}
            <div className="mb-8">

              <p
                className="
                  text-4xl
                  sm:text-5xl
                  font-bold
                  tracking-tight
                  text-slate-950
                "
              >
                Welcome
              </p>

              <p
                className="
                  mt-2
                  text-slate-500
                "
              >
                Sign in to your operations dashboard.
              </p>

            </div>


            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Email */}
              <div>

                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-slate-500
                    mb-2
                  "
                >
                  Login ID
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@example.com"
                  required
                  className="
                    w-full
                    h-14
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>


              {/* Password */}
              <div>

                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-slate-500
                    mb-2
                  "
                >
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  className="
                    w-full
                    h-14
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-slate-900
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  "
                />

              </div>


              {/* Error */}
              {error && (
                <div
                  className="
                    text-sm
                    text-red-600
                    bg-red-50
                    border
                    border-red-100
                    p-3
                    rounded-xl
                  "
                >
                  {error}
                </div>
              )}


              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  h-14
                  rounded-xl
                  bg-slate-950
                  text-white
                  font-semibold
                  transition
                  hover:bg-indigo-700
                  active:scale-[0.99]
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {loading
                  ? "Signing in..."
                  : "Sign In →"}
              </button>

            </form>


            {/* Bottom */}
            <p
              className="
                text-center
                text-xs
                text-slate-400
                mt-8
              "
            >
              Secure access • TicketFlow Operations
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default LoginPage;