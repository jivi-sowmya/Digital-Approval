const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authenticate);

router.post("/create", authorizeRoles("employee"), requestController.createRequest);

router.get("/", authorizeRoles("employee", "manager"), requestController.getRequests);
router.get("/:id", authorizeRoles("employee", "manager"), requestController.getRequestById);

router.patch("/:id/status", authorizeRoles("manager"), requestController.updateStatus);
router.put("/update/:id", authorizeRoles("manager"), requestController.updateStatus);

router.patch("/:id/comment", authorizeRoles("manager"), requestController.saveManagerComment);
router.put("/comment/:id", authorizeRoles("manager"), requestController.saveManagerComment);

router.delete("/:id", authorizeRoles("manager"), requestController.deleteRequest);

module.exports = router;
