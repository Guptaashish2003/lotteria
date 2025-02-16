import Lottery from "../models/Lottery";
import { Request, Response, NextFunction } from "express";

export const createLottery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { grid1, grid2 } = req.body;
    console.log(grid1, grid2);
    // convert into 2d array

    if (!grid1 || !grid2 || grid1.length !== 9 || grid2.length !== 9) {
      res.status(400).json({ message: "Each grid must contain exactly 9 numbers." });
      return;
    }

    const newLottery = new Lottery({ grid1, grid2 });
    await newLottery.save();

    res.status(201).json({ message: "Lottery game created successfully!", data: newLottery,id: newLottery._id });
  } catch (error: any) {
    next(error); // Pass the error to Express error middleware
  }
};

export const getLotteriesBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    const lotteries = await Lottery.findById({_id:id});
    console.log(lotteries); 
    res.status(200).json({ data: lotteries });
  } catch (error: any) {
    next(error);
  }
};
interface Grid {
  [index: number]: number[];
}

export const setZeroRowsOrCols = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {grid1, grid2,randomNumber,gridsBoardsId} = req.body;
    console.log("gridborardId",gridsBoardsId);
    console.log("randomNumber",randomNumber);
    // push the random number into the lotteryNumbers array in the database
    const lottery = await Lottery.findById({_id:gridsBoardsId});
    if (!lottery) {
      res.status(404).json({ message: "Lottery not found" });
      return;
    }
    console.log("lotterynumbers",lottery.lotteryNumbers);
    if(randomNumber !== 0){
      lottery.lotteryNumbers.push(randomNumber);
      await lottery.save();
    }
    // convert 2dArray from grid1 and grid2

    let grid1Array = [];
    let grid2Array = [];

    for (let i = 0; i < 3; i++) {
      grid1Array.push(grid1.slice(i * 3, i * 3 + 3));
      grid2Array.push(grid2.slice(i * 3, i * 3 + 3));
    }
   
    // set the grid1 and grid2 to 0 of all the lotteryNumbers are present in the grid
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (lottery.lotteryNumbers.includes(grid1Array[i][j])) {
          grid1Array[i][j] = 0;
        }
        if (lottery.lotteryNumbers.includes(grid2Array[i][j])) {
          grid2Array[i][j] = 0;
        }
      }
    }
    console.log("grid1Array",grid1Array);
    console.log("grid2Array",grid2Array);

    
    // check if the row or  is all 0 grid1Array and grid2Array

    for(let i = 0 ; i<3;i++){
      if(grid1Array[i].every((num: number) => num === 0)){
        res.status(200).json({message:"Row or Column is all 0",data:grid1Array,winner:"User 1"});
      }
      if(grid2Array[i].every((num: number) => num === 0)){
        res.status(200).json({message:"Row or Column is all 0",data:grid2Array,winner:"User 2"});
      }
    }

    // check if cols are 0 
    for (let j = 0; j < 3; j++) {
      let allZeroForGrid1 = true;
      for (let i = 0; i < 3; i++) {
          if (grid1Array[i][j] !== 0) {
              allZeroForGrid1 = false;
              break;
          }
      }
      if (allZeroForGrid1) {
          res.status(200).json({message:"Row or Column is all 0",data:grid1Array,winner:"User 1"}); //
      } // Found a column with all zeros
      let allZeroForGrid2 = true;
      for (let i = 0; i < 3; i++) {
          if (grid2Array[i][j] !== 0) {
              allZeroForGrid2 = false;
              break;
          }
      }
      if (allZeroForGrid2) {
          res.status(200).json({message:"Row or Column is all 0",data:grid2Array,winner:"User 2"}); //
      } // Found a column with all zeros
  }   
    
    // set the row or column to 0 if all the numbers are 0

    // 
    
  } catch (error) {
    next(error);
    
  }
}

export const clearTheBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const {gridsBoardsId} = req.body;
    const lottery = await Lottery.findByIdAndDelete({_id:gridsBoardsId});
    if(!lottery){
      res.status(404).json({message:"Lottery not found"});
      return;
    }
    res.status(200).json({message:"Lottery board cleared successfully!"});
  } catch (error) {
    next(error);
    
  }
 }
