import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRoute } from "./modules/auth/auth.route";

export const app: Application = express();

app.use(express.json());

app.use('/api/auth', authRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});


