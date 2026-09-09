const express = require("express");
const {
    getAgentWorkload,
    getManagerReports
} = require("../controllers/analyticsController");

const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

// Agent workload metrics (Manager can view all, Agent can view their own)
router.get(
    "/agent-workload",
    protect,
    authorizeRoles("agent", "manager"),
    getAgentWorkload
);

// Manager organization-wide analytics and reports
router.get(
    "/manager-reports",
    protect,
    authorizeRoles("manager"),
    getManagerReports
);

router.get(
    "/manager-report",
    protect,
    authorizeRoles("manager"),
    getManagerReports
);

module.exports = router;
