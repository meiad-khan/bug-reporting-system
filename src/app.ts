import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issue/issue.route";

export const app: Application = express();

app.use(express.json());

app.use('/api/auth', authRoute);
app.use("/api/issues", issueRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});


