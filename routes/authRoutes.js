import express from "express";
import { registerUser, loginUser ,verifyEmail,getUserArticles} from "../controllers/authController.js";
import { validateRegistration, validateLogin } from "../middleware/validateMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get('/verify/:token',verifyEmail)
router.get('/updated/:userId',getUserArticles)
// router.get("/home", verifyToken, getUser);
export default router;
