import mongoose from "mongoose";

interface GridValidator {
    (grid: number[]): boolean;
}

const gridValidator: GridValidator = (grid) => {
    return new Set(grid).size === grid.length && grid.every(num => num >= 1 && num <= 9);
};
const lotteryNumberValidor: GridValidator = (grid) => { 
    return new Set(grid).size === grid.length && grid.every(num => num >= 0 && num <= 9);
    
}
const lotterySchema = new mongoose.Schema({
//  2d array of 3x3 grid
    grid1: { type: [Number], required: true, validate: gridValidator },
  grid2: { type: [Number], required: true, validate: gridValidator },
  lotteryNumbers: { type: [Number], default: [],validate:lotteryNumberValidor }, 
});

const Lottery = mongoose.model("Lottery", lotterySchema);
export default Lottery;
