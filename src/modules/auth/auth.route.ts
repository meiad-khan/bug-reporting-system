import { Router } from "express";
import { createUser } from "./auth.controller";

const router = Router();

router.post("/signup", createUser);

export const authRoute = router;