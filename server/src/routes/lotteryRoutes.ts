import express from "express";
import { clearTheBoard, createLottery, getLotteriesBoard, setZeroRowsOrCols } from "../controllers/lotteryController";

const router = express.Router();

router.route("/create").post(createLottery);
router.route("/get/:id").get(getLotteriesBoard);
router.route("/win").post(setZeroRowsOrCols);
router.route("/clear").put(clearTheBoard)
export default router;
