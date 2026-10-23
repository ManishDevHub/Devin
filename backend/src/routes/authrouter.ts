
import router from "express";
import { login, signup } from "../controller/authcontroller";

const authRouter = router.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);

export default authRouter;