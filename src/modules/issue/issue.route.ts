import { Router } from "express";
import { createIssue, getAllIssues } from "./issue.controller";
import { auth } from "../../middleware/auth";


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);

export const issueRoute = router;