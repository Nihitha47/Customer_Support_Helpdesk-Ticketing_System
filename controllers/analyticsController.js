const Ticket = require("../models/Ticket");
const User = require("../models/User");
const SatisfactionRating = require("../models/SatisfactionRating");

// Get Agent Workload Analytics
const getAgentWorkload = async (req, res, next) => {
    try {
        let agentQuery = { role: "agent" };

        // If an agent requests this, they can only view their own workload
        if (req.user.role === "agent") {
            agentQuery._id = req.user.id;
        }

        const agents = await User.find(agentQuery).select("name email role createdAt").sort({ name: 1 });

        // Calculate workload metrics per agent
        const workloadData = await Promise.all(
            agents.map(async (agent) => {
                const tickets = await Ticket.find({ assignedAgentId: agent._id });

                const totalAssigned = tickets.length;
                const openCount = tickets.filter(t => t.status === "Open").length;
                const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
                const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
                const closedCount = tickets.filter(t => t.status === "Closed").length;
                const urgentCount = tickets.filter(
                    t => t.priority === "Urgent" && (t.status === "Open" || t.status === "In Progress")
                ).length;
                const slaBreachedCount = tickets.filter(t => t.slaBreached).length;
                const escalatedCount = tickets.filter(t => t.isEscalated).length;

                // Resolution time calculation for resolved tickets
                const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
                let avgResolutionHours = null;
                if (resolvedTickets.length > 0) {
                    const totalDurationMs = resolvedTickets.reduce((acc, t) => {
                        return acc + (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime());
                    }, 0);
                    avgResolutionHours = parseFloat((totalDurationMs / (resolvedTickets.length * 3600000)).toFixed(1));
                }

                return {
                    agentId: agent._id,
                    name: agent.name,
                    email: agent.email,
                    totalAssigned,
                    open: openCount,
                    inProgress: inProgressCount,
                    resolved: resolvedCount,
                    closed: closedCount,
                    activeLoad: openCount + inProgressCount,
                    urgent: urgentCount,
                    slaBreaches: slaBreachedCount,
                    escalated: escalatedCount,
                    avgResolutionHours: avgResolutionHours !== null ? avgResolutionHours : 0
                };
            })
        );

        // Calculate unassigned tickets count
        const unassignedCount = await Ticket.countDocuments({ assignedAgentId: null, status: "Open" });

        res.status(200).json({
            success: true,
            unassignedCount,
            agents: workloadData
        });
    } catch (error) {
        next(error);
    }
};

// Get Comprehensive Manager Reports & Analytics
const getManagerReports = async (req, res, next) => {
    try {
        const totalTickets = await Ticket.countDocuments();

        // 1. Status overview
        const statusCounts = {
            open: await Ticket.countDocuments({ status: "Open" }),
            inProgress: await Ticket.countDocuments({ status: "In Progress" }),
            resolved: await Ticket.countDocuments({ status: "Resolved" }),
            closed: await Ticket.countDocuments({ status: "Closed" })
        };

        // 2. Priority breakdown
        const priorityCounts = {
            low: await Ticket.countDocuments({ priority: "Low" }),
            medium: await Ticket.countDocuments({ priority: "Medium" }),
            high: await Ticket.countDocuments({ priority: "High" }),
            urgent: await Ticket.countDocuments({ priority: "Urgent" })
        };

        // 3. Category distribution
        const categoryAggregation = await Ticket.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const categoryStats = categoryAggregation.map(item => ({
            category: item._id || "Uncategorized",
            count: item.count
        }));

        // 4. SLA performance
        const slaBreachedCount = await Ticket.countDocuments({ slaBreached: true });
        const slaMetCount = totalTickets - slaBreachedCount;
        const breachRate = totalTickets > 0 ? parseFloat(((slaBreachedCount / totalTickets) * 100).toFixed(1)) : 0;

        // 5. Escalation stats
        const currentlyEscalated = await Ticket.countDocuments({ isEscalated: true });
        const escalationStatusCounts = {
            none: await Ticket.countDocuments({ escalationStatus: "None" }),
            escalated: await Ticket.countDocuments({ escalationStatus: "Escalated" }),
            underReview: await Ticket.countDocuments({ escalationStatus: "Under Review" }),
            resolved: await Ticket.countDocuments({ escalationStatus: "Resolved" })
        };

        // 6. Customer Satisfaction (CSAT) metrics
        const ratings = await SatisfactionRating.find().populate("customerId", "name email");
        const totalRatings = ratings.length;
        let avgRating = 0;
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (totalRatings > 0) {
            const sum = ratings.reduce((acc, r) => {
                const val = Math.min(5, Math.max(1, Math.round(r.rating)));
                ratingDistribution[val] = (ratingDistribution[val] || 0) + 1;
                return acc + r.rating;
            }, 0);
            avgRating = parseFloat((sum / totalRatings).toFixed(2));
        }

        // 7. Recent CSAT feedback
        const recentFeedback = ratings
            .filter(r => r.feedback && r.feedback.trim().length > 0)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(r => ({
                id: r._id,
                rating: r.rating,
                feedback: r.feedback,
                customerName: r.customerId ? r.customerId.name : "Customer",
                createdAt: r.createdAt
            }));

        res.status(200).json({
            success: true,
            overview: {
                totalTickets,
                statusCounts,
                priorityCounts,
                sla: {
                    met: slaMetCount,
                    breached: slaBreachedCount,
                    breachRate
                },
                escalations: {
                    active: currentlyEscalated,
                    byStatus: escalationStatusCounts
                },
                csat: {
                    totalRatings,
                    avgRating,
                    distribution: ratingDistribution,
                    recentFeedback
                },
                categories: categoryStats
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAgentWorkload,
    getManagerReports
};
