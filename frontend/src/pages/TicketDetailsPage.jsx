import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTicket,
  getTicketHistory,
  checkTicket,
  approveTicket,
  closeTicket,
} from "../api/tickets";

import { useAuth } from "../context/AuthContext";

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const [remarks, setRemarks] = useState("");
  const [actionError, setActionError] = useState("");

  const {
    data: ticket,
    isLoading: ticketLoading,
    isError: ticketError,
  } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId),
  });

  const {
    data: history = [],
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ["ticket-history", ticketId],
    queryFn: () => getTicketHistory(ticketId),
    enabled: !!ticketId,
  });

  const refreshTicket = () => {
    queryClient.invalidateQueries({
      queryKey: ["ticket", ticketId],
    });

    queryClient.invalidateQueries({
      queryKey: ["ticket-history", ticketId],
    });

    queryClient.invalidateQueries({
      queryKey: ["tickets"],
    });
  };

  const checkMutation = useMutation({
    mutationFn: ({ action, remarks }) =>
      checkTicket(ticketId, action, remarks),

    onSuccess: () => {
      setRemarks("");
      setActionError("");
      refreshTicket();
    },

    onError: (error) => {
      setActionError(
        error.response?.data?.detail ||
          "Failed to perform checker action"
      );
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ action, remarks }) =>
      approveTicket(ticketId, action, remarks),

    onSuccess: () => {
      setRemarks("");
      setActionError("");
      refreshTicket();
    },

    onError: (error) => {
      setActionError(
        error.response?.data?.detail ||
          "Failed to perform approval action"
      );
    },
  });

  const closeMutation = useMutation({
    mutationFn: ({ remarks }) =>
      closeTicket(ticketId, remarks),

    onSuccess: () => {
      setRemarks("");
      setActionError("");
      refreshTicket();
    },

    onError: (error) => {
      setActionError(
        error.response?.data?.detail ||
          "Failed to close ticket"
      );
    },
  });

  const handleCheckerAction = (action) => {
    setActionError("");

    checkMutation.mutate({
      action,
      remarks: remarks || null,
    });
  };

  const handleApproverAction = (action) => {
    setActionError("");

    approveMutation.mutate({
      action,
      remarks: remarks || null,
    });
  };

  const handleClose = () => {
    setActionError("");

    closeMutation.mutate({
      remarks: remarks || null,
    });
  };

  const isActionLoading =
    checkMutation.isPending ||
    approveMutation.isPending ||
    closeMutation.isPending;

  if (ticketLoading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">
          Loading ticket...
        </p>
      </div>
    );
  }

  if (ticketError || !ticket) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Failed to load ticket.
          </p>

          <button
            onClick={() => navigate("/tickets")}
            className="mt-3 text-sm underline"
          >
            Back to tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/tickets")}
          className="text-sm text-slate-500 hover:text-slate-900 mb-5"
        >
          ← Back to tickets
        </button>

        {/* Header */}
        <div className="bg-white border rounded-xl p-6 mb-6">

          <div className="flex justify-between items-start gap-4">

            <div>
              <p className="text-sm text-slate-500">
                {ticket.reference_no}
              </p>

              <h1 className="text-2xl font-bold mt-1">
                {ticket.title}
              </h1>
            </div>

            <StatusBadge status={ticket.status} />

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">

            <Info
              label="Priority"
              value={ticket.priority}
            />

            <Info
              label="Division"
              value={ticket.division_id}
            />

            <Info
              label="Ticket Type"
              value={ticket.type_id}
            />

            <Info
              label="Created"
              value={
                ticket.created_at
                  ? new Date(
                      ticket.created_at
                    ).toLocaleString()
                  : "-"
              }
            />

          </div>
        </div>

        {/* Workflow */}
        <div className="bg-white border rounded-xl p-6 mb-6">

          <h2 className="text-lg font-semibold mb-6">
            Workflow
          </h2>

          <Workflow ticket={ticket} />

          <TicketActions
            ticket={ticket}
            user={user}
            remarks={remarks}
            setRemarks={setRemarks}
            actionError={actionError}
            onCheckerAction={handleCheckerAction}
            onApproverAction={handleApproverAction}
            onClose={handleClose}
            isLoading={isActionLoading}
          />

        </div>

        {/* Timing */}
        <div className="bg-white border rounded-xl p-6 mb-6">

          <h2 className="text-lg font-semibold mb-5">
            Processing Time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Info
              label="Checker"
              value={
                ticket.checker_cycle_hours != null
                  ? `${ticket.checker_cycle_hours}h`
                  : "-"
              }
            />

            <Info
              label="Approval"
              value={
                ticket.approval_cycle_hours != null
                  ? `${ticket.approval_cycle_hours}h`
                  : "-"
              }
            />

            <Info
              label="Total"
              value={
                ticket.total_cycle_hours != null
                  ? `${ticket.total_cycle_hours}h`
                  : "-"
              }
            />

          </div>

        </div>

        {/* History */}
        <div className="bg-white border rounded-xl overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">
              Ticket History
            </h2>
          </div>

          {historyLoading ? (
            <div className="p-6 text-slate-500">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-slate-500">
              No history available.
            </div>
          ) : (
            <div className="divide-y">

              {history.map((event) => (
                <div
                  key={event.id}
                  className="p-5"
                >
                  <div className="flex justify-between gap-4">

                    <div>
                      <p className="font-medium capitalize">
                        {event.stage}
                      </p>

                      <p className="text-sm text-slate-500 mt-1 capitalize">
                        {event.action}
                      </p>

                      {event.remarks && (
                        <p className="text-sm mt-2">
                          {event.remarks}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-slate-500 text-right">
                      {event.occurred_at
                        ? new Date(
                            event.occurred_at
                          ).toLocaleString()
                        : "-"}
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

function TicketActions({
  ticket,
  user,
  remarks,
  setRemarks,
  actionError,
  onCheckerAction,
  onApproverAction,
  onClose,
  isLoading,
}) {
  const canCheck =
    ticket.status === "pending_checker" &&
    ["checker", "admin"].includes(user?.role);

  const canApprove =
    ticket.status === "pending_approver" &&
    ["approver", "admin"].includes(user?.role);

  const canClose =
    ticket.status === "approved" &&
    ["approver", "admin"].includes(user?.role);

  if (!canCheck && !canApprove && !canClose) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t">

      <h3 className="font-semibold mb-4">
        Actions
      </h3>

      <div className="mb-4">

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Remarks
        </label>

        <textarea
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
          }
          rows={3}
          placeholder="Add remarks..."
          className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />

      </div>

      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            {actionError}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">

        {/* Checker */}
        {canCheck && (
          <>
            <button
              disabled={isLoading}
              onClick={() =>
                onCheckerAction("approved")
              }
              className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : "Approve"}
            </button>

            <button
              disabled={isLoading}
              onClick={() =>
                onCheckerAction("rejected")
              }
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 disabled:opacity-50"
            >
              Reject
            </button>

            <button
              disabled={isLoading}
              onClick={() =>
                onCheckerAction("returned")
              }
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Return
            </button>
          </>
        )}

        {/* Approver */}
        {canApprove && (
          <>
            <button
              disabled={isLoading}
              onClick={() =>
                onApproverAction("approved")
              }
              className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : "Approve"}
            </button>

            <button
              disabled={isLoading}
              onClick={() =>
                onApproverAction("rejected")
              }
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 disabled:opacity-50"
            >
              Reject
            </button>

            <button
              disabled={isLoading}
              onClick={() =>
                onApproverAction("returned")
              }
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Return
            </button>
          </>
        )}

        {/* Close */}
        {canClose && (
          <button
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
          >
            {isLoading
              ? "Closing..."
              : "Close Ticket"}
          </button>
        )}

      </div>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="font-medium mt-1 capitalize">
        {value ?? "-"}
      </p>
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
    <span className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium">
      {labels[status] || status}
    </span>
  );
}

function Workflow({ ticket }) {
  const steps = [
    {
      label: "Created",
      done: true,
    },
    {
      label: "Checker",
      done:
        !!ticket.checker_action_at ||
        [
          "pending_approver",
          "approved",
          "closed",
        ].includes(ticket.status),
    },
    {
      label: "Approver",
      done:
        !!ticket.approver_action_at ||
        ["approved", "closed"].includes(
          ticket.status
        ),
    },
    {
      label: "Closed",
      done: ticket.status === "closed",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="flex items-center flex-1"
        >
          <div className="flex items-center gap-3">

            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                step.done
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.done ? "✓" : index + 1}
            </div>

            <span
              className={
                step.done
                  ? "font-medium"
                  : "text-slate-400"
              }
            >
              {step.label}
            </span>

          </div>

          {index < steps.length - 1 && (
            <div className="hidden md:block flex-1 h-px bg-slate-200 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
}

export default TicketDetailsPage;