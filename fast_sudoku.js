// Inspired by a brilliant post by Peter Norvig: http://norvig.com/sudoku.html

// TERMINOLOGY:
// Unit - a row, column or box
// Peers of a square - all squares that share a unit with the specified square

// sudoku memory layout: row-major order, 1D array
// [ 0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 
//   9 , 10, 11, 12, 13, 14, 15, 16, 17
//   18, 19, 20, 21, 22, 23, 24, 25, 26

//   27, 28, 29, 30, 31, 32, 33, 34, 35
//   36, 37, 38, 39, 40, 41, 42, 43, 44
//   45, 46, 47, 48, 49, 50, 51, 52, 53

//   54, 55, 56, 57, 58, 59, 60, 61, 62
//   63, 64, 65, 66, 67, 68, 69, 70, 71
//   72, 73, 74, 75, 76, 77, 78, 79, 80 ]

const testSudoku = [0,0,3,0,2,0,6,0,0,9,0,0,3,0,5,0,0,1,0,0,1,8,0,6,4,0,0,0,0,8,1,0,2,9,0,0,
  7,0,0,0,0,0,0,0,8,0,0,6,7,0,8,2,0,0,0,0,2,6,0,9,5,0,0,8,0,0,2,0,3,0,0,9,0,0,5,0,1,0,3,0,0]

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ LOOKUP TABLES  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const grids = [
  [0 , 1 , 2 , 9 , 10, 11, 18, 19, 20,],
  [3 , 4 , 5 , 12, 13, 14, 21, 22, 23,],
  [6 , 7 , 8 , 15, 16, 17, 24, 25, 26,],
  [27, 28, 29, 36, 37, 38, 45, 46, 47,],
  [30, 31, 32, 39, 40, 41, 48, 49, 50,],
  [33, 34, 35, 42, 43, 44, 51, 52, 53,],
  [54, 55, 56, 63, 64, 65, 72, 73, 74,],
  [57, 58, 59, 66, 67, 68, 75, 76, 77,],
  [60, 61, 62, 69, 70, 71, 78, 79, 80 ],
]

/// lookup table that assigns each square "i" its 20 peers "peers[i]" 
/// generated using the calculate_peers function below
const peers = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 18, 27, 36, 45, 54, 63, 72, 10, 11, 19, 20], [0, 2, 3, 4, 5, 6, 7, 8, 10, 19, 28, 37, 46, 55, 64, 73, 9, 11, 18, 20], [0, 1, 3, 4, 5, 6, 7, 8, 11, 20, 29, 38, 47, 56, 65, 74, 9, 10, 18, 19], [0, 1, 2, 4, 5, 6, 7, 8, 12, 21, 30, 39, 48, 57, 66, 75, 13, 14, 22, 23], [0, 1, 2, 3, 5, 6, 7, 8, 13, 22, 31, 40, 49, 58, 67, 76, 12, 14, 21, 23], [0, 1, 2, 3, 4, 6, 7, 8, 14, 23, 32, 41, 50, 59, 68, 77, 12, 13, 21, 22], [0, 1, 2, 3, 4, 5, 7, 8, 15, 24, 33, 42, 51, 60, 69, 78, 16, 17, 25, 26], [0, 1, 2, 3, 4, 5, 6, 8, 16, 25, 34, 43, 52, 61, 70, 79, 15, 17, 24, 26], [0, 1, 2, 3, 4, 5, 6, 7, 17, 26, 35, 44, 53, 62, 71, 80, 15, 16, 24, 25], [10, 11, 12, 13, 14, 15, 16, 17, 0, 18, 27, 36, 45, 54, 63, 72, 1, 2, 19, 20], [9, 11, 12, 13, 14, 15, 16, 17, 1, 19, 28, 37, 46, 55, 64, 73, 0, 2, 18, 20], [9, 10, 12, 13, 14, 15, 16, 17, 2, 20, 29, 38, 47, 56, 65, 74, 0, 1, 18, 19], [9, 10, 11, 13, 14, 15, 16, 17, 3, 21, 30, 39, 48, 57, 66, 75, 4, 5, 22, 23], [9, 10, 11, 12, 14, 15, 16, 17, 4, 22, 31, 40, 49, 58, 67, 76, 3, 5, 21, 23], [9, 10, 11, 12, 13, 15, 16, 17, 5, 23, 32, 41, 50, 59, 68, 77, 3, 4, 21, 22], [9, 10, 11, 12, 13, 14, 16, 17, 6, 24, 33, 42, 51, 60, 69, 78, 7, 8, 25, 26], [9, 10, 11, 12, 13, 14, 15, 17, 7, 25, 34, 43, 52, 61, 70, 79, 6, 8, 24, 26], [9, 10, 11, 12, 13, 14, 15, 16, 8, 26, 35, 44, 53, 62, 71, 80, 6, 7, 24, 25], [19, 20, 21, 22, 23, 24, 25, 26, 0, 9, 27, 36, 45, 54, 63, 72, 1, 2, 10, 11], [18, 20, 21, 22, 23, 24, 25, 26, 1, 10, 28, 37, 46, 55, 64, 73, 0, 2, 9, 11], [18, 19, 21, 22, 23, 24, 25, 26, 2, 11, 29, 38, 47, 56, 65, 74, 0, 1, 9, 10], [18, 19, 20, 22, 23, 24, 25, 26, 3, 12, 30, 39, 48, 57, 66, 75, 4, 5, 13, 14], [18, 19, 20, 21, 23, 24, 25, 26, 4, 13, 31, 40, 49, 58, 67, 76, 3, 5, 12, 14], [18, 19, 20, 21, 22, 24, 25, 26, 5, 14, 32, 41, 50, 59, 68, 77, 3, 4, 12, 13], [18, 19, 20, 21, 22, 23, 25, 26, 6, 15, 33, 42, 51, 60, 69, 78, 7, 8, 16, 17], [18, 19, 20, 21, 22, 23, 24, 26, 7, 16, 34, 43, 52, 61, 70, 79, 6, 8, 15, 17], [18, 19, 20, 21, 22, 23, 24, 25, 8, 17, 35, 44, 53, 62, 71, 80, 6, 7, 15, 16], [28, 29, 30, 31, 32, 33, 34, 35, 0, 9, 18, 36, 45, 54, 63, 72, 37, 38, 46, 47], [27, 29, 30, 31, 32, 33, 34, 35, 1, 10, 19, 37, 46, 55, 64, 73, 36, 38, 45, 47], [27, 28, 30, 31, 32, 33, 34, 35, 2, 11, 20, 38, 47, 56, 65, 74, 36, 37, 45, 46], [27, 28, 29, 31, 32, 33, 34, 35, 3, 12, 21, 39, 48, 57, 66, 75, 40, 41, 49, 50], [27, 28, 29, 30, 32, 33, 34, 35, 4, 13, 22, 40, 49, 58, 67, 76, 39, 41, 48, 50], [27, 28, 29, 30, 31, 33, 34, 35, 5, 14, 23, 41, 50, 59, 68, 77, 39, 40, 48, 49], [27, 28, 29, 30, 31, 32, 34, 35, 6, 15, 24, 42, 51, 60, 69, 78, 43, 44, 52, 53], [27, 28, 29, 30, 31, 32, 33, 35, 7, 16, 25, 43, 52, 61, 70, 79, 42, 44, 51, 53], [27, 28, 29, 30, 31, 32, 33, 34, 8, 17, 26, 44, 53, 62, 71, 80, 42, 43, 51, 52], [37, 38, 39, 40, 41, 42, 43, 44, 0, 9, 18, 27, 45, 54, 63, 72, 28, 29, 46, 47], [36, 38, 39, 40, 41, 42, 43, 44, 1, 10, 19, 28, 46, 55, 64, 73, 27, 29, 45, 47], [36, 37, 39, 40, 41, 42, 43, 44, 2, 11, 20, 29, 47, 56, 65, 74, 27, 28, 45, 46], [36, 37, 38, 40, 41, 42, 43, 44, 3, 12, 21, 30, 48, 57, 66, 75, 31, 32, 49, 50], [36, 37, 38, 39, 41, 42, 43, 44, 4, 13, 22, 31, 49, 58, 67, 76, 30, 32, 48, 50], [36, 37, 38, 39, 40, 42, 43, 44, 5, 14, 23, 32, 50, 59, 68, 77, 30, 31, 48, 49], [36, 37, 38, 39, 40, 41, 43, 44, 6, 15, 24, 33, 51, 60, 69, 78, 34, 35, 52, 53], [36, 37, 38, 39, 40, 41, 42, 44, 7, 16, 25, 34, 52, 61, 70, 79, 33, 35, 51, 53], [36, 37, 38, 39, 40, 41, 42, 43, 8, 17, 26, 35, 53, 62, 71, 80, 33, 34, 51, 52], [46, 47, 48, 49, 50, 51, 52, 53, 0, 9, 18, 27, 36, 54, 63, 72, 28, 29, 37, 38], [45, 47, 48, 49, 50, 51, 52, 53, 1, 10, 19, 28, 37, 55, 64, 73, 27, 29, 36, 38], [45, 46, 48, 49, 50, 51, 52, 53, 2, 11, 20, 29, 38, 56, 65, 74, 27, 28, 36, 37], [45, 46, 47, 49, 50, 51, 52, 53, 3, 12, 21, 30, 39, 57, 66, 75, 31, 32, 40, 41], [45, 46, 47, 48, 50, 51, 52, 53, 4, 13, 22, 31, 40, 58, 67, 76, 30, 32, 39, 41], [45, 46, 47, 48, 49, 51, 52, 53, 5, 14, 23, 32, 41, 59, 68, 77, 30, 31, 39, 40], [45, 46, 47, 48, 49, 50, 52, 53, 6, 15, 24, 33, 42, 60, 69, 78, 34, 35, 43, 44], [45, 46, 47, 48, 49, 50, 51, 53, 7, 16, 25, 34, 43, 61, 70, 79, 33, 35, 42, 44], [45, 46, 47, 48, 49, 50, 51, 52, 8, 17, 26, 35, 44, 62, 71, 80, 33, 34, 42, 43], [55, 56, 57, 58, 59, 60, 61, 62, 0, 9, 18, 27, 36, 45, 63, 72, 64, 65, 73, 74], [54, 56, 57, 58, 59, 60, 61, 62, 1, 10, 19, 28, 37, 46, 64, 73, 63, 65, 72, 74], [54, 55, 57, 58, 59, 60, 61, 62, 2, 11, 20, 29, 38, 47, 65, 74, 63, 64, 72, 73], [54, 55, 56, 58, 59, 60, 61, 62, 3, 12, 21, 30, 39, 48, 66, 75, 67, 68, 76, 77], [54, 55, 56, 57, 59, 60, 61, 62, 4, 13, 22, 31, 40, 49, 67, 76, 66, 68, 75, 77], [54, 55, 56, 57, 58, 60, 61, 62, 5, 14, 23, 32, 41, 50, 68, 77, 66, 67, 75, 76], [54, 55, 56, 57, 58, 59, 61, 62, 6, 15, 24, 33, 42, 51, 69, 78, 70, 71, 79, 80], [54, 55, 56, 57, 58, 59, 60, 62, 7, 16, 25, 34, 43, 52, 70, 79, 69, 71, 78, 80], [54, 55, 56, 57, 58, 59, 60, 61, 8, 17, 26, 35, 44, 53, 71, 80, 69, 70, 78, 79], [64, 65, 66, 67, 68, 69, 70, 71, 0, 9, 18, 27, 36, 45, 54, 72, 55, 56, 73, 74], [63, 65, 66, 67, 68, 69, 70, 71, 1, 10, 19, 28, 37, 46, 55, 73, 54, 56, 72, 74], [63, 64, 66, 67, 68, 69, 70, 71, 2, 11, 20, 29, 38, 47, 56, 74, 54, 55, 72, 73], [63, 64, 65, 67, 68, 69, 70, 71, 3, 12, 21, 30, 39, 48, 57, 75, 58, 59, 76, 77], [63, 64, 65, 66, 68, 69, 70, 71, 4, 13, 22, 31, 40, 49, 58, 76, 57, 59, 75, 77], [63, 64, 65, 66, 67, 69, 70, 71, 5, 14, 23, 32, 41, 50, 59, 77, 57, 58, 75, 76], [63, 64, 65, 66, 67, 68, 70, 71, 6, 15, 24, 33, 42, 51, 60, 78, 61, 62, 79, 80], [63, 64, 65, 66, 67, 68, 69, 71, 7, 16, 25, 34, 43, 52, 61, 79, 60, 62, 78, 80], [63, 64, 65, 66, 67, 68, 69, 70, 8, 17, 26, 35, 44, 53, 62, 80, 60, 61, 78, 79], [73, 74, 75, 76, 77, 78, 79, 80, 0, 9, 18, 27, 36, 45, 54, 63, 55, 56, 64, 65], [72, 74, 75, 76, 77, 78, 79, 80, 1, 10, 19, 28, 37, 46, 55, 64, 54, 56, 63, 65], [72, 73, 75, 76, 77, 78, 79, 80, 2, 11, 20, 29, 38, 47, 56, 65, 54, 55, 63, 64], [72, 73, 74, 76, 77, 78, 79, 80, 3, 12, 21, 30, 39, 48, 57, 66, 58, 59, 67, 68], [72, 73, 74, 75, 77, 78, 79, 80, 4, 13, 22, 31, 40, 49, 58, 67, 57, 59, 66, 68], [72, 73, 74, 75, 76, 78, 79, 80, 5, 14, 23, 32, 41, 50, 59, 68, 57, 58, 66, 67], [72, 73, 74, 75, 76, 77, 79, 80, 6, 15, 24, 33, 42, 51, 60, 69, 61, 62, 70, 71], [72, 73, 74, 75, 76, 77, 78, 80, 7, 16, 25, 34, 43, 52, 61, 70, 60, 62, 69, 71], [72, 73, 74, 75, 76, 77, 78, 79, 8, 17, 26, 35, 44, 53, 62, 71, 60, 61, 69, 70]]

/// Calculate a lookup table of the peers of each square
const calculate_peers = ()=>{
  let peers = []
  for (let i=0; i<81; i++) {
    let res = []
    // add row-peers
    let rowStart = Math.floor(i/9)*9;
    res.push(...arrayRange(rowStart, rowStart+8, 1))
    // add column-peers
    let colStart = i%9
    res.push(...arrayRange(colStart, colStart+72, 9))
    // add grid-peers
    res.push(...grids.find((list)=>list.includes(i)))
    // remove duplicates and the index itself to get each peer once
    res = [...new Set(res)]
    res = res.filter((elem)=>elem!==i)
    if (res.length !== 20){console.log("failure")}
    peers.push(Array.from(res))
  }
  return peers
}

/// The units a square is in, accessed by the squares index, yielding three arrays for peers in the same row, column and box
const units =  [[[0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 9, 18, 27, 36, 45, 54, 63, 72], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [1, 10, 19, 28, 37, 46, 55, 64, 73], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [2, 11, 20, 29, 38, 47, 56, 65, 74], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [3, 12, 21, 30, 39, 48, 57, 66, 75], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [4, 13, 22, 31, 40, 49, 58, 67, 76], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [5, 14, 23, 32, 41, 50, 59, 68, 77], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [6, 15, 24, 33, 42, 51, 60, 69, 78], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [7, 16, 25, 34, 43, 52, 61, 70, 79], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[0, 1, 2, 3, 4, 5, 6, 7, 8], [8, 17, 26, 35, 44, 53, 62, 71, 80], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [0, 9, 18, 27, 36, 45, 54, 63, 72], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [1, 10, 19, 28, 37, 46, 55, 64, 73], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [2, 11, 20, 29, 38, 47, 56, 65, 74], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [3, 12, 21, 30, 39, 48, 57, 66, 75], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [4, 13, 22, 31, 40, 49, 58, 67, 76], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [5, 14, 23, 32, 41, 50, 59, 68, 77], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [6, 15, 24, 33, 42, 51, 60, 69, 78], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [7, 16, 25, 34, 43, 52, 61, 70, 79], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[9, 10, 11, 12, 13, 14, 15, 16, 17], [8, 17, 26, 35, 44, 53, 62, 71, 80], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [0, 9, 18, 27, 36, 45, 54, 63, 72], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [1, 10, 19, 28, 37, 46, 55, 64, 73], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [2, 11, 20, 29, 38, 47, 56, 65, 74], [0, 1, 2, 9, 10, 11, 18, 19, 20]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [3, 12, 21, 30, 39, 48, 57, 66, 75], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [4, 13, 22, 31, 40, 49, 58, 67, 76], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [5, 14, 23, 32, 41, 50, 59, 68, 77], [3, 4, 5, 12, 13, 14, 21, 22, 23]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [6, 15, 24, 33, 42, 51, 60, 69, 78], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [7, 16, 25, 34, 43, 52, 61, 70, 79], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[18, 19, 20, 21, 22, 23, 24, 25, 26], [8, 17, 26, 35, 44, 53, 62, 71, 80], [6, 7, 8, 15, 16, 17, 24, 25, 26]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [0, 9, 18, 27, 36, 45, 54, 63, 72], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [1, 10, 19, 28, 37, 46, 55, 64, 73], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [2, 11, 20, 29, 38, 47, 56, 65, 74], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [3, 12, 21, 30, 39, 48, 57, 66, 75], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [4, 13, 22, 31, 40, 49, 58, 67, 76], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [5, 14, 23, 32, 41, 50, 59, 68, 77], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [6, 15, 24, 33, 42, 51, 60, 69, 78], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [7, 16, 25, 34, 43, 52, 61, 70, 79], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[27, 28, 29, 30, 31, 32, 33, 34, 35], [8, 17, 26, 35, 44, 53, 62, 71, 80], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [0, 9, 18, 27, 36, 45, 54, 63, 72], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [1, 10, 19, 28, 37, 46, 55, 64, 73], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [2, 11, 20, 29, 38, 47, 56, 65, 74], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [3, 12, 21, 30, 39, 48, 57, 66, 75], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [4, 13, 22, 31, 40, 49, 58, 67, 76], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [5, 14, 23, 32, 41, 50, 59, 68, 77], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [6, 15, 24, 33, 42, 51, 60, 69, 78], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [7, 16, 25, 34, 43, 52, 61, 70, 79], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[36, 37, 38, 39, 40, 41, 42, 43, 44], [8, 17, 26, 35, 44, 53, 62, 71, 80], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [0, 9, 18, 27, 36, 45, 54, 63, 72], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [1, 10, 19, 28, 37, 46, 55, 64, 73], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [2, 11, 20, 29, 38, 47, 56, 65, 74], [27, 28, 29, 36, 37, 38, 45, 46, 47]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [3, 12, 21, 30, 39, 48, 57, 66, 75], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [4, 13, 22, 31, 40, 49, 58, 67, 76], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [5, 14, 23, 32, 41, 50, 59, 68, 77], [30, 31, 32, 39, 40, 41, 48, 49, 50]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [6, 15, 24, 33, 42, 51, 60, 69, 78], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [7, 16, 25, 34, 43, 52, 61, 70, 79], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[45, 46, 47, 48, 49, 50, 51, 52, 53], [8, 17, 26, 35, 44, 53, 62, 71, 80], [33, 34, 35, 42, 43, 44, 51, 52, 53]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [0, 9, 18, 27, 36, 45, 54, 63, 72], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [1, 10, 19, 28, 37, 46, 55, 64, 73], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [2, 11, 20, 29, 38, 47, 56, 65, 74], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [3, 12, 21, 30, 39, 48, 57, 66, 75], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [4, 13, 22, 31, 40, 49, 58, 67, 76], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [5, 14, 23, 32, 41, 50, 59, 68, 77], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [6, 15, 24, 33, 42, 51, 60, 69, 78], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [7, 16, 25, 34, 43, 52, 61, 70, 79], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[54, 55, 56, 57, 58, 59, 60, 61, 62], [8, 17, 26, 35, 44, 53, 62, 71, 80], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [0, 9, 18, 27, 36, 45, 54, 63, 72], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [1, 10, 19, 28, 37, 46, 55, 64, 73], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [2, 11, 20, 29, 38, 47, 56, 65, 74], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [3, 12, 21, 30, 39, 48, 57, 66, 75], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [4, 13, 22, 31, 40, 49, 58, 67, 76], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [5, 14, 23, 32, 41, 50, 59, 68, 77], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [6, 15, 24, 33, 42, 51, 60, 69, 78], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [7, 16, 25, 34, 43, 52, 61, 70, 79], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[63, 64, 65, 66, 67, 68, 69, 70, 71], [8, 17, 26, 35, 44, 53, 62, 71, 80], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [0, 9, 18, 27, 36, 45, 54, 63, 72], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [1, 10, 19, 28, 37, 46, 55, 64, 73], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [2, 11, 20, 29, 38, 47, 56, 65, 74], [54, 55, 56, 63, 64, 65, 72, 73, 74]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [3, 12, 21, 30, 39, 48, 57, 66, 75], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [4, 13, 22, 31, 40, 49, 58, 67, 76], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [5, 14, 23, 32, 41, 50, 59, 68, 77], [57, 58, 59, 66, 67, 68, 75, 76, 77]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [6, 15, 24, 33, 42, 51, 60, 69, 78], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [7, 16, 25, 34, 43, 52, 61, 70, 79], [60, 61, 62, 69, 70, 71, 78, 79, 80]], [[72, 73, 74, 75, 76, 77, 78, 79, 80], [8, 17, 26, 35, 44, 53, 62, 71, 80], [60, 61, 62, 69, 70, 71, 78, 79, 80]]]

const calculate_units = ()=>{
  let units = []
  for (let i=0; i<81; i++) {
    let res = []
    // add row-peers
    let rowStart = Math.floor(i/9)*9;
    res.push(arrayRange(rowStart, rowStart+8, 1))
    // add column-peers
    let colStart = i%9
    res.push(arrayRange(colStart, colStart+72, 9))
    // add grid-peers
    res.push(grids.find((list)=>list.includes(i)))
    if (res.length !== 3){console.log("failure")}
    if (res[0].length !== 9){console.log("failure")}
    if (res[1].length !== 9){console.log("failure")}
    if (res[2].length !== 9){console.log("failure")}
    units.push(res)
  }
  return units
}

/// A list of all unique units in the sudoku, meaning all rows, columns and boxes
/// given as a flat array of arrays of squares [row1, row2, ..., col1, col2, ... box1 ...] where row1=[0,1,2..8] etc. 
const unitsList = [[0, 1, 2, 3, 4, 5, 6, 7, 8], [0, 9, 18, 27, 36, 45, 54, 63, 72], [9, 10, 11, 12, 13, 14, 15, 16, 17], [1, 10, 19, 28, 37, 46, 55, 64, 73], [18, 19, 20, 21, 22, 23, 24, 25, 26], [2, 11, 20, 29, 38, 47, 56, 65, 74], [27, 28, 29, 30, 31, 32, 33, 34, 35], [3, 12, 21, 30, 39, 48, 57, 66, 75], [36, 37, 38, 39, 40, 41, 42, 43, 44], [4, 13, 22, 31, 40, 49, 58, 67, 76], [45, 46, 47, 48, 49, 50, 51, 52, 53], [5, 14, 23, 32, 41, 50, 59, 68, 77], [54, 55, 56, 57, 58, 59, 60, 61, 62], [6, 15, 24, 33, 42, 51, 60, 69, 78], [63, 64, 65, 66, 67, 68, 69, 70, 71], [7, 16, 25, 34, 43, 52, 61, 70, 79], [72, 73, 74, 75, 76, 77, 78, 79, 80], [8, 17, 26, 35, 44, 53, 62, 71, 80], [0, 1, 2, 9, 10, 11, 18, 19, 20], [3, 4, 5, 12, 13, 14, 21, 22, 23], [6, 7, 8, 15, 16, 17, 24, 25, 26], [27, 28, 29, 36, 37, 38, 45, 46, 47], [30, 31, 32, 39, 40, 41, 48, 49, 50], [33, 34, 35, 42, 43, 44, 51, 52, 53], [54, 55, 56, 63, 64, 65, 72, 73, 74], [57, 58, 59, 66, 67, 68, 75, 76, 77], [60, 61, 62, 69, 70, 71, 78, 79, 80]]

const calculate_units_list = ()=>{
  let res = []
  for (let i=0; i<9; i++) {
    // add row-peers
    let rowStart = i*9;
    res.push(arrayRange(rowStart, rowStart+8, 1))
    // add column-peers
    let colStart = i;
    res.push(arrayRange(colStart, colStart+72, 9))
  }
  for(const box of grids){res.push(box)}
  if (res.length !== 9*3){console.log("failure")}
  return res
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ UTILITY ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/// Create an array including the numbers from start to stop inclusive, counting up step at a time
const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 },(_, i) => start + i * step)

const printDomains = (domains) => {
  let p = arr => arr.toString().replaceAll(",","").padEnd(9 - arr.length) 
  let printeable = domains.map(set => setToArray(set))
  // console.log(
  //   "|| "+ p(printeable[0]) +"   "+ p(printeable[1]) +"   "+ p(printeable[2])  +" |"+
  //   "| "+  p(printeable[3]) +"   "+ p(printeable[4]) +"   "+ p(printeable[5])  +" |"+
  //   "| "+  p(printeable[6]) +"   "+ p(printeable[7]) +"   "+ p(printeable[8])  +" ||"
  // )
  for (let i=0; i<9; i++){
    console.log(
      "|| "+ p(printeable[i*9+0]) +"   "+ p(printeable[i*9+1]) +"   "+ p(printeable[i*9+2])  +" |"+
      "| "+  p(printeable[i*9+3]) +"   "+ p(printeable[i*9+4]) +"   "+ p(printeable[i*9+5])  +" |"+
      "| "+  p(printeable[i*9+6]) +"   "+ p(printeable[i*9+7]) +"   "+ p(printeable[i*9+8])  +" ||"
    )
    if (i===2 || i===5 || i===8) {console.log("---------------------------------------------------------------------------------------------------------------")}
  }
}
const printSudoku = (sudoku) => {
  for (let i=0; i<9; i++){
    console.log(
      "|| "+ sudoku[i*9+0] +"   "+ sudoku[i*9+1] +"   "+ sudoku[i*9+2]  +" |"+
      "| "+  sudoku[i*9+3] +"   "+ sudoku[i*9+4] +"   "+ sudoku[i*9+5]  +" |"+
      "| "+  sudoku[i*9+6] +"   "+ sudoku[i*9+7] +"   "+ sudoku[i*9+8]  +" ||"
    )
    if (i===2 || i===5 || i===8) {console.log("---------------------------------------------------------------------------------------------------------------")}
  }
}

/// Generate a random integer between min (inclusive) and max (inclusive)
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/// Get a uniformly random element from the array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

/// Shuffle an array, returning the shuffled version (not in place!)
const shuffle = (arr) => arr.map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SET FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Sets are represented by numbers between 0=0b 000 000 000 and 511=0b 111 111 111 where 0 signifies
//  a contradiction and 0b111111111 that every digit is possible.
//  This is used to represent the sets of possible digits that constitute the domain of valid digits 
//  for each square that are currently known. When only one digit is left, the value of the square is known.
//  This means that sets are immutable, since they are represented by a single number, on which bianry operations
//  are performed.

/// Check if a set contains a number from 1 to 9
const setContains = (set, number) => (set>>(number-1))%2===1
/// Add a number from 1 to 9 to a set, returning the updated set
const setAdd = (set, number) => (set | (1<<(number-1)))
/// Remove a number from 1 to 9 from a set, returning the updated set
const setRemove = (set, number) => set & (~(1<<(number-1)))
/// The empty set, representing a contradiction
const setEmpty = 0
/// The full set, representing that every digit 1-9 could fill the square
const setFull = 0b111111111
/// Converts a set to an array of digits
const setToArray = (set)=> Array.from({length: 9}, (_, i) => i + 1).filter(val=>setContains(set, val))
/// Returns all but the selected number from a set in the form of an array
const setAllBut = (set, number) => setToArray(setRemove(set, number))
/// Checks if the set only contains one or zero digits. 
/// This means detecting a power of two in the internal representation.
const setOneOptionLeft = (set) => (set & (set-1)) === 0 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ MAIN FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/// Entry point of code execution for testing
export const entry = ()=>{
  // let example = [0,0,3,0,2,0,6,0,0,9,0,0,3,0,5,0,0,1,0,0,1,8,0,6,4,0,0,0,0,8,1,0,2,9,0,0,7,0,0,0,0,0,0,0,8,0,0,6,7,0,8,2,0,0,0,0,2,6,0,9,5,0,0,8,0,0,2,0,3,0,0,9,0,0,5,0,1,0,3,0,0,]
  // printSudoku(solveWithoutGuessing(example))
  // console.log("random:")
  // printSudoku(generateRandomSolution())
  // console.log(calculate_units_list())
}

/// Count the number of filled out units in a sudoku
export const count_correct_units = sudoku => unitsList.filter(unit => unit.map(i=>sudoku[i]!==0).every(Boolean)).length

/// Returns if the domains contain exactly one entry per set
const domains_unique = (domains) => {
  // check if there are no contradictions = empty sets = zeros in the domains array
  if (!domains.every(Boolean)) {return false}
  // check if there is one possible digit or less left in each domain
  if (!domains.every(setOneOptionLeft)) {return false}
  return true
}

const solveWithoutGuessing = (sudoku) => {
  let domains = Array(81).fill(setFull);
  // assign all given values and apply recursive constraint propagation to each
  for(let i=0; i<81; i++){
    if (sudoku[i] !== 0){
      if (!assign(domains, i, sudoku[i])){
        // return the empty array on a contradiction
        return []
      }
    }
  }
  // if the domains have one entry on each square, a solution was found without searching
  // in that case, return it as a sudoku
  if (domains_unique(domains)){
    return domains.map(elem => setToArray(elem)[0])
  }
  else {return []}
}

const generateRandomSolution = () => {
  let domains = Array(81).fill(setFull);
  while(!domains_unique(domains)){
    let i = getRandomInt(0, 80);
    if (setOneOptionLeft(domains[i])){continue}
    let val = getRandomElement(setToArray(domains[i]))
    let copyDomains = [...domains]
    if (assign(copyDomains, i, val)){
      domains = copyDomains
    }
  }
  return domains.map(elem => setToArray(elem)[0])
}

/// Generates a sudoku, reducing the number of hints until the given number of hints is reached or
/// a timeout, given in seconds, is reached
export const generate = (hints, timeout) => {
  let solution = generateRandomSolution();
  let sudoku = [...solution];
  let startTime = new Date().getTime();
  // return generate_recursive(hints, startTime, timeout, sudoku)
  let i = 0
  let order = shuffle(Array.from(Array(81).keys()))
  let best = sudoku
  let bestHints = 9999
  while (sudoku.filter(elem=>elem!==0).length > hints && (new Date().getTime() - startTime)/1000 < timeout ){
    if (i>=order.length){
      let numberOfHints = sudoku.filter(elem=>elem!==0).length
      // console.log("exhausted at ", numberOfHints, " hints"); 
      if (numberOfHints<bestHints){best = sudoku; bestHints = numberOfHints}
      order = shuffle(Array.from(Array(81).keys()))
      sudoku = [...solution]
    }
    let copy = [...sudoku]
    copy[order[i]] = 0
    i += 1
    // if the sudoku still has a unique solution without guessing, continue from there
    if (solveWithoutGuessing(copy).length>0){
      sudoku = copy
      // console.log("hints:", sudoku.filter(elem=>elem!==0).length, "i:", i, "order:", order)
      i = 0
      order = shuffle(Array.from(Array(81).keys()).filter(i => sudoku[i]!==0))
    }
  }
  // console.log("sudoku hints:", sudoku.filter(elem=>elem!==0).length, "best hints:", bestHints)
  return {sudoku: sudoku.filter(elem=>elem!==0).length<bestHints? sudoku:best, solution: solution}
}

const generate_recursive = (targetHints, startTime, timeout, sudoku) => {
  // base cases:
  if (
    // target number of hints reached
    sudoku.filter(elem=>elem!==0).length <= targetHints ||
    // timer has run out
    (new Date().getTime() - startTime)/1000 > timeout
  ){ return sudoku}

  let order = shuffle(Array.from(Array(81).keys()).filter(i => sudoku[i]!==0))
  for(const i of order){
    let copy = [...sudoku]
    copy[i] = 0
    // console.log("hints:", sudoku.filter(elem=>elem!==0).length, "i:", i)
    if (solveWithoutGuessing(copy).length>0){
      // new sudoku is solveable without guessing! continue recursively
      let res = generate_recursive(targetHints, startTime, timeout, copy);
      if (res.length > 0) {return res}
    }
  }
  // if at some level of recursion the sudoku can no longer be reduced locally, execution reaches
  // this point, an empty array is returned and a different branch is searched for a sudoku
  // with less hints
  return []
}
/// Updates domains, eliminating digit from square. Returns success (true) or failure (false).
const eliminate = (domains, square, digit) => {
  // digit is already eliminated from the square
  if (!setContains(domains[square], digit)){return true}
  // eliminate the digit
  domains[square] = setRemove(domains[square], digit)
  // did that lead to a contradiction?
  if (domains[square] === 0) {return false}

    // CONSTRAINTS
  // if the square is reduced to only one possible digit, remove that digit from all peers' domains
  if (setOneOptionLeft(domains[square])){
    let eliminated = setToArray(domains[square])[0];
    for(const peer of peers[square]){
      if (!eliminate(domains, peer, eliminated)){return false}
    }
  }
  // if a unit has only one permissible square to put a digit in, assign it there
  for (const unit of units[square]){
    let places_for_digit = unit.filter((s)=>setContains(domains[s], digit))
    if (places_for_digit.length === 0) {return false}
    if (places_for_digit.length === 1) {
      if (!assign(domains, places_for_digit[0], digit)){
        return false
      }
    }
  }

  // constraints have been recursively propagated with no errors, return true
  return true
}

const assign = (domains, square, digit) => {
  for(const eliminated of setAllBut(domains[square], digit)){
    if (!eliminate(domains, square, eliminated)){
      return false
    }
  }
  return true
}
