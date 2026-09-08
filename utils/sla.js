const SLA_HOURS = {
    Low: 48,
    Medium: 24,
    High: 8,
    Urgent: 4
};

const calculateSlaDeadline = (priority, createdAt = new Date()) => {
    const hours = SLA_HOURS[priority] || SLA_HOURS.Medium;
    return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
};

module.exports = {
    SLA_HOURS,
    calculateSlaDeadline
};
