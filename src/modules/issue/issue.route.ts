import { Router } from "express";
import { createIssue } from "./issue.controller";
import { auth } from "../../middleware/auth";


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);

export const issueRoute = router;