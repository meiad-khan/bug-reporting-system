import { Router } from "express";
import { createIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.controller";
import { auth } from "../../middleware/auth";
import { checkRole } from "../../middleware/checkRole";


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
router.put("/:id",auth("contributor", "maintainer"),checkRole, updateIssue);

export const issueRoute = router;