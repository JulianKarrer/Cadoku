
const gridstarts  = [72,63,54,45,36,27,18,9,0]
const rowstarts  = [0,3,6,27,30,33,54,57,60]
const rowstrides = [0,1,2,9,10,11,18,19,20]

export const rows = [
  [0 ,1 ,2 ,9 ,10,11,18,19,20,],
  [3 ,4 ,5 ,12,13,14,21,22,23,],
  [6 ,7 ,8 ,15,16,17,24,25,26,],
  [27,28,29,36,37,38,45,46,47,],
  [30,31,32,39,40,41,48,49,50,],
  [33,34,35,42,43,44,51,52,53,],
  [54,55,56,63,64,65,72,73,74,],
  [57,58,59,66,67,68,75,76,77,],
  [60,61,62,69,70,71,78,79,80,],
]
export const cols = [
  [0 ,3 ,6 ,27,30,33,54,57,60,],
  [1 ,4 ,7 ,28,31,34,55,58,61,],
  [2 ,5 ,8 ,29,32,35,56,59,62,],
  [9 ,12,15,36,39,42,63,66,69,],
  [10,13,16,37,40,43,64,67,70,],
  [11,14,17,38,41,44,65,68,71,],
  [18,21,24,45,48,51,72,75,78,],
  [19,22,25,46,49,52,73,76,79,],
  [20,23,26,47,50,53,74,77,80,],
]

const test_sudoku_valid=[
  5,3,4,6,7,2,1,9,8,
  6,7,8,1,9,5,3,4,2,
  9,1,2,3,4,8,5,6,7,
  8,5,9,4,2,6,7,1,3,
  7,6,1,8,5,3,9,2,4,
  4,2,3,7,9,1,8,5,6,
  9,6,1,2,8,7,3,4,5,
  5,3,7,4,1,9,2,8,6,
  2,8,4,6,3,5,1,7,9,
]
const test_sudoku_invalid=[
  5,4,3,6,7,2,1,9,8,
  6,7,8,1,9,5,3,4,2,
  9,1,2,3,4,8,5,6,7,
  8,5,9,4,2,6,7,1,3,
  7,6,1,8,5,3,9,2,4,
  4,2,3,7,9,1,8,5,6,
  9,6,1,2,8,7,3,4,5,
  5,3,7,4,1,9,2,8,6,
  2,8,4,6,3,5,1,7,9,
]

export const count_done_rows_cols_grids = (sudoku)=>{
  let rows_done = 9-rows.map((row)=>row.map((i)=>sudoku[i]).includes(0)).filter(Boolean).length
  let cols_done = 9-cols.map((col)=>col.map((i)=>sudoku[i]).includes(0)).filter(Boolean).length
  let grids_done = 9-gridstarts.map((start)=> [...Array(9).keys()].map(x => x+start).map((i=>{sudoku[i]}))
    .includes(0)).filter(Boolean).length
  return rows_done + cols_done + grids_done
}

const is_complete = (sudoku)=>{
  for (let i=0; i<9; i++){
    // 511 in decimal is 0b111111111 in binary
    let subgrid = 511;
    let row = 511;
    let col = 511;
    // traverse each subgrid, row and column, flipping the jth bit in 511
    // subgrids
    for (let j=0; j<9; j++){
      subgrid = subgrid^(1<<sudoku[i*9+j]-1)
    }
    if(subgrid !== 0){return false;}
    // rows
    for (let j=0; j<9; j++){
      row = row^(1<<sudoku[rowstarts[i]+rowstrides[j]]-1)
    }
    if(row !== 0){return false;}
    // columns
    for (let j=0; j<9; j++){
      col = col^(1<<sudoku[rowstrides[i]+rowstarts[j]]-1)
    }
    if(col !== 0){return false;}
  }
  return true;
}
const arrayRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 },(value, index) => start + index * step)

const get_domain = (sudoku, index) => {
  let dom = [1,2,3,4,5,6,7,8,9];
  // remove invalid values from the domain, performing forward checking
  let substart =  Math.floor(index/9)*9;
  let forbidden = arrayRange(substart, substart+8, 1).map((i)=>sudoku[i])
  dom = dom.filter((val)=>!(forbidden.includes(val)))

  let curGrid = Math.floor(index/9);
  let gridRow = Math.floor(curGrid/3)
  let rowWithinGrid = Math.floor((index%9)/3)
  let row = gridRow*3 + rowWithinGrid
  forbidden = Array.from(Array(9).keys()).map((i)=>sudoku[rowstarts[row]+rowstrides[i]])
  dom = dom.filter((val)=>!(forbidden.includes(val)))

  let gridCol = curGrid % 3;
  let colWithinGrid = (index%9)%3
  let col = gridCol*3+colWithinGrid
  forbidden = Array.from(Array(9).keys()).map((i)=>sudoku[rowstrides[col]+rowstarts[i]])
  dom = dom.filter((val)=>!(forbidden.includes(val)))

  // shuffle the domain 
  dom = dom
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  return dom
}

const get_domains = (sudoku) => Array.from(Array(81).keys()).map((i) => sudoku[i]===0 ? get_domain(sudoku, i):[])

export const get_affected_indices = (index)=>{
  let row = rows.find((row)=>row.includes(index))
  let col = cols.find((col)=>col.includes(index))
  let gridIndex = Math.floor(index/9)*9

  let res = new Set()
  row.forEach((i)=>res.add(i))
  col.forEach((i)=>res.add(i))
  for(let i=gridIndex; i<gridIndex+9; i++){
    res.add(i)
  }
  return res
}

export const fast_solve = (sudoku) => {
  let domains = get_domains(sudoku);
  return fast_solve_inner(sudoku, domains)
}

const fast_solve_inner = (sudoku, domains)=>{
  // select the zero square with the smallest domain 
  // => most constrained variable first
  let index = -1
  let minDom = 999
  for (let i=0; i<81; i++){
    if (sudoku[i]===0 && domains[i].length<=minDom) {
      index = i
      minDom = domains[i].length
    }
  }
  // base case: check if sudoku is completed
  if (index<0) {
    if (is_complete(sudoku)){
      return sudoku
    } else {return []}
  }

  for(const val of domains[index]){
    let sudokuCopy = [...sudoku];
    sudokuCopy[index] = val;
    // update the domains
    let domainsCopy = domains.map((dom)=>[...dom])
    get_affected_indices(index).forEach((i)=>{
      domainsCopy[i] = get_domain(sudokuCopy, i)
    })
    // recursively keep solving
    let res = fast_solve_inner(sudokuCopy, domainsCopy);
    if (res.length>0){return res}
  }
  return []
}

export const solve = (sudoku)=>{
  // base case: check if sudoku is completed
  let index = sudoku.findIndex((elem)=>elem===0);
  if (index<0) {
    if (is_complete(sudoku)){
      return sudoku
    } else {return []}
  }

  // get the domain of possible values with forward checking and shuffle them
  let dom = get_domain(sudoku, index)

  // try each value recursively until a solution is found
  for(const val of dom){
    let copy = [...sudoku];
    copy[index] = val;
    let res = solve(copy);
    if (res.length>0){return res}
  }
  return []
}

// returns 0 if there is none, 1 if there is a unique solution and 2 otherwise
// the solutions parameter should be 0 on the initial call
const unique_count = (sudoku, solutions)=>{
  // base case: check if sudoku is completed
  let index = sudoku.findIndex((elem)=>elem===0);
  if (index<0) {
    if (is_complete(sudoku)){
      return solutions+1
    } else {solutions}
  }

  // get the domain of possible values with forward checking and shuffle them
  let dom = get_domain(sudoku, index)

  for(const val of dom){
    let copy = [...sudoku];
    copy[index] = val;
    solutions = unique_count(copy, solutions);
    if(solutions > 1){return solutions}
  }
  return solutions
}

/// Generate a sudoku with the specified number of hints (17 to 81)
export const generate = (hints)=>{
  let puzzle = solve(new Array(81).fill(0))
  let solution = [...puzzle]
  while(puzzle.filter(val=>val!==0).length >= hints){
    // copy the puzzle and set a random non-zero value to zero
    let non_zero_indices = puzzle.map((v,i)=>{ return {val: v, ind: i} })
      .filter(elem=>elem.val!==0)
      .map(elem=>elem.ind)
    let copy = [...puzzle]
    copy[non_zero_indices[Math.floor(Math.random() * non_zero_indices.length)]] = 0
    // if the resultant puzzle has a unique solution, overwrite the current puzzle
    if (unique_count(copy, 0)===1){puzzle = copy}
  }
  return {sudoku: puzzle, solution: solution}
}
