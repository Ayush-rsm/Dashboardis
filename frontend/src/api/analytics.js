import api from "./client";


/* =========================================================
   EXECUTIVE ANALYTICS
========================================================= */

export const getOverview = async () => {
    const response = await api.get("/analytics/overview");
    return response.data;
};


export const getStatusAnalytics = async () => {
    const response = await api.get("/analytics/status");
    return response.data;
};


export const getDivisionAnalytics = async () => {
    const response = await api.get("/analytics/by-division");
    return response.data;
};


export const getTicketTypeAnalytics = async () => {
    const response = await api.get("/analytics/by-ticket-type");
    return response.data;
};


export const getApprovalTimeAnalytics = async () => {
    const response = await api.get("/analytics/approval-time");
    return response.data;
};


export const getApprovalTimeTrend = async () => {
    const response = await api.get(
        "/analytics/approval-time/trend"
    );

    return response.data;
};


export const getClosureVolume = async () => {
    const response = await api.get(
        "/analytics/closure-volume"
    );

    return response.data;
};


/* =========================================================
   OPERATIONAL ANALYTICS
========================================================= */

export const getOperationalAnalytics = async () => {
    const response = await api.get(
        "/analytics/operational"
    );

    return response.data;
};


export const getOpenTicketAging = async () => {
    const response = await api.get(
        "/analytics/operational/open-ticket-aging"
    );

    return response.data;
};


export const getSendBackTrend = async () => {
    const response = await api.get(
        "/analytics/operational/send-back-trend"
    );

    return response.data;
};


export const getApprovalTimeByVertical = async () => {
    const response = await api.get(
        "/analytics/operational/approval-time-by-vertical"
    );

    return response.data;
};


export const getApprovalTimeByDepartment = async () => {
    const response = await api.get(
        "/analytics/operational/approval-time-by-department"
    );

    return response.data;
};


export const getStageTimeBreakdown = async () => {
    const response = await api.get(
        "/analytics/operational/stage-time-breakdown"
    );

    return response.data;
};


export const getCheckerTimeByLevel = async () => {
    const response = await api.get(
        "/analytics/operational/checker-time-by-level"
    );

    return response.data;
};


export const getEscalationByLevel = async () => {
    const response = await api.get(
        "/analytics/operational/escalation-by-level"
    );

    return response.data;
};