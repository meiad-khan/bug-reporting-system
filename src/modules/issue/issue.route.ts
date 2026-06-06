import { Router } from "express";
import { createIssue, getAllIssues, getSingleIssue } from "./issue.controller";
import { auth } from "../../middleware/auth";


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);

export const issueRoute = router;