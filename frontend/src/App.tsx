import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import cross from "./assets/cross.svg";

interface GridProps {
  index: number;
  value: number;
  grid: string[];
  setGrid: React.Dispatch<React.SetStateAction<string[]>>;
}
const App = () => {
  const [grid1, setGrid1] = useState(Array(9).fill(""));
  const [selectiveArray, setSelectiveArray] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [grid2, setGrid2] = useState(Array(9).fill(""));
  const [gridsBoardsId, setGridsBoardsId] = useState("");
  const [randomNumber, setRandomNumber] = useState(0);
  const [lotteryNumbers, setLotteryNumbers] = useState<number[]>([]);
  const [winner, setWinner] = useState("");
  const getGrids = async () => {
    try {
      const grids = await axios.get(
        `http://localhost:5500/api/lottery/get/${gridsBoardsId}`
      );
      console.log("grids", grids.data);
      if (grids.status === 200 && grids.data.data !== null) {
        console.log("....................")
        setGrid1(grids?.data?.data?.grid1);
        setGrid2(grids?.data?.data?.grid2);
        setLotteryNumbers(grids?.data?.data?.lotteryNumbers);
        setSelectiveArray((prev) => prev.filter((num) => num !== randomNumber));
        
      }
    } catch (error) {
      const err = error as any;
      console.log(error);
    }
  };
  const generateRandomNumber = () => {
    if (selectiveArray.length === 0) {
      console.log("All numbers have been used!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * selectiveArray.length);
    const randomNumber = selectiveArray[randomIndex];

    // Remove the selected number from the available list
    setSelectiveArray((prev) => prev.filter((num) => num !== randomNumber));

    // Update state with the selected random number
    setRandomNumber(randomNumber);
    setLotteryNumbers((prev) => [...prev, randomNumber]);
    console.log("randomNumber", randomNumber);
    console.log("lotteryNumbers", lotteryNumbers);
    console.log("selectiveArray", selectiveArray);
  };


  useEffect(() => {
    const gridsBoardsId = localStorage.getItem("gridsBoardsId");
    if (gridsBoardsId) {
      setGridsBoardsId(gridsBoardsId);
    }
    else {
      localStorage.removeItem("gridsBoardsId");
    }
  }, []);
  useEffect(() => {
    if (
      gridsBoardsId && 
      grid1.every((num) => num === "") &&
      grid2.every((num) => num === "")
    ) {
      getGrids();
    }
  }, [getGrids]);
  const handleInputChange = ({ index, value, grid, setGrid }: GridProps) => {
    if (value < 1 || value > 9 || isNaN(value)) return;

    setGrid((prevGrid) => {
      if (prevGrid.includes(value.toString())) {
        toast.error("Number already exists in the grid");
        return prevGrid; // Return the old state to prevent updates
      }

      const newGrid = [...prevGrid];
      newGrid[index] = value.toString();
      return newGrid;
    });
  };

  const getWinnersOfTheGame = async () => {
    if(!gridsBoardsId && grid1.every((num) => num === "") &&
    grid2.every((num) => num === "")  ) return;
    try {
      const sendGridForWinning = await axios.post("http://localhost:5500/api/lottery/win", {
        grid1,
        grid2,
        randomNumber,
        gridsBoardsId,
      });
      if(sendGridForWinning.status === 200 && sendGridForWinning){
        setLotteryNumbers(sendGridForWinning?.data?.data.lotteryNumbers);
        console.log(sendGridForWinning);
        setWinner(sendGridForWinning.data.winner);
        if(sendGridForWinning.data.winner){
          alert(`Winner is ${sendGridForWinning.data.winner}`);
        }
      }
    } catch (error) {
      const err = error as any;
      console.log(error);
      
    }
  }

  // console.log("grid1", grid1);
  // console.log("grid2", grid2);

  const filledGrid = async () => {
    try {
      const grids = await axios.post(
        "http://localhost:5500/api/lottery/create",
        {
          grid1,
          grid2,
        }
      );
      console.log(grids);
      if (grids.status === 201 && grids) {
        localStorage.setItem("gridsBoardsId", grids.data.id);
      }
      alert("Grid Boards Filled Successfully!");
    } catch (error) {
      const err = error as any;
      alert("Error: " + err.response?.data.message);
    }
  };

  useEffect(() => {
    // Don't send the request if gridsBoardsId already exists
    if (gridsBoardsId) return;
  
    // Check if both grids are completely filled
    if (grid1.every((num) => num !== "") && grid2.every((num) => num !== "")) {
      filledGrid();
    }
  }, [grid1, grid2, gridsBoardsId]); // Added `gridsBoardsId` as a dependency
  

  const [isGameRunning, setIsGameRunning] = useState(false);

  const startTheGame = () => {
    if (!gridsBoardsId) return;
    if (winner) return;
  
    setIsGameRunning(true);
  };
  
  useEffect(() => {
    if (isGameRunning && selectiveArray.length > 0 && !winner) {
      console.log("Game is running...",randomNumber);
      const timer = setTimeout(() => {
        generateRandomNumber();
        getWinnersOfTheGame();
      }, 2000);
  
      return () => clearTimeout(timer);
    } else {
      console.log("Game is over...",randomNumber);
      setIsGameRunning(false); // Stop when game is over
    }
  }, [randomNumber, isGameRunning, selectiveArray, winner]);
  // useEffect(() => {
  //   startTheGame();
  // }, [winner, selectiveArray]);

  const clearTheBoard = async () => {
    try {
      const clearBoard = await axios.put("http://localhost:5500/api/lottery/clear", {
        gridsBoardsId,
      });
      console.log("clearBoard", clearBoard);
      if(clearBoard.status === 200 && clearBoard){
       localStorage.removeItem("gridsBoardsId");
       localStorage.clear();
      }
      toast("Board Cleared Successfully!");
    } catch (error) {
      const err = error as any;
      console.log("Error: " , err.response?.data.message);
    }
  }
 


  return (
    <>
      <h1 className="text-4xl mx-auto w-2/3 text-center py-4  my-2">
        Lottery Game
      </h1>
      {/* <img src={`${cross}`} alt="" /> */}
      <div className=" flex  mx-auto  w-2/3 p-5 h-screen border-red-300 border-2 rounded-xl">
        <div className="w-full">
          <h3 className="font-bold text-lg text-center w-1/4 py-3">User 1</h3>
          <div className="grid grid-cols-3 gap-4 items-center w-1/4 border-2 border-gray-500 rounded-lg p-3">
            { grid1.map((num, index) => (
              <div className="relative" key={index}>
                <input
                  className="border-2 text-center border-gray-500 px-2 py-3 appearance-none"
                  key={index}
                  type="number"
                  min="1"
                  max="9"
                  value={num}
                  onChange={(e) =>
                    handleInputChange({
                      index,
                      value: parseInt(e.target.value),
                      grid: grid1,
                      setGrid: setGrid1,
                    })
                  }
                />
                {/* filed with the generated number used lottery numbers */}
                {lotteryNumbers.includes(parseInt(num)) && num !== "" && (
                  <img
                    className="absolute top-1 right-1  cursor-pointer"
                    src={cross}
                    alt="cross"
                  />
                )}
              </div>
            ))}
          </div>

          <h3 className="text-lg text-center w-1/4 py-3 font-bold  mt-5">
            User 2
          </h3>
          <div className="grid grid-cols-3 gap-4 w-1/4 border-2 border-gray-500 rounded-lg p-3">
            {grid2.map((num, index) => (
              <div className="relative" key={index}>
                <input
                  className="border-2 text-center border-gray-500 px-2 py-3 appearance-none"
                  key={index}
                  type="number"
                  min="1"
                  max="9"
                  value={num}
                  onChange={(e) =>
                    handleInputChange({
                      index,
                      value: parseInt(e.target.value),
                      grid: grid2,
                      setGrid: setGrid2,
                    })
                  }
                />
                {lotteryNumbers.includes(parseInt(num)) && num !== "" && (
                  <img
                    className="absolute top-1 right-1  cursor-pointer"
                    src={cross}
                    alt="cross"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col h-[50vh] mt-4 w-1/3 items-center justify-center p-3 pt-2 gap-y-5">
          <div className="text-center flex-1">
            <h2 className="text-3xl">Lottery Number...</h2>
            <p className="text-xl">{randomNumber}</p>
          </div>
          <button
            onClick={startTheGame}
            className="w-36 h-16 border-2 border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white"
          >
            START
          </button>
          <button onClick={()=>setIsGameRunning(false)} className="w-36 h-16 border-2 border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white">
            STOP
          </button>
          <button onClick={()=>clearTheBoard()} className="w-36 h-16 border-2 border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white">
            CLEAR BOARD
          </button>
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default App;
