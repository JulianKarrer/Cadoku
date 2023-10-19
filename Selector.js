import React from 'react';
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import { count_correct_units } from './fast_sudoku';


const Selector = ({sudoku, tileSelected, setSudoku, solution, catState, setCatState, setFireworkState, setPlaying, difficulty}) => {
  return (
    <View style={{width: "100%", height: 50, ...styles.container, ...styles.font}}>
      {[...Array(9)].map((_, i) =>
          <TouchableOpacity
          key={i}
          color="#FFFFFF"
          onPress={() => {
            if (tileSelected >= 0 && solution[tileSelected] === i+1 && sudoku[tileSelected]===0){
              let copy = [...sudoku];
              copy[tileSelected] = i+1;
              // if the game is done, play fireworks
              if (copy.map((val, i) => val===solution[i]).every(Boolean)){
                setCatState(4)

                setTimeout(()=>{setFireworkState(1)}, 200)
                setTimeout(()=>{setFireworkState(2)}, 400)
                setTimeout(()=>{setFireworkState(3)}, 600)
                setTimeout(()=>{setFireworkState(4)}, 800)
                setTimeout(()=>{setFireworkState(5)}, 1000)
                setTimeout(()=>{setFireworkState(6)}, 1200)
                setTimeout(()=>{setFireworkState(7)}, 1400)
                setTimeout(()=>{setFireworkState(8)}, 1600)
                setTimeout(()=>{setFireworkState(9)}, 1800)
                setTimeout(()=>{setFireworkState(0)}, 2000)

                setTimeout(()=>{setFireworkState(1)}, 2200)
                setTimeout(()=>{setFireworkState(2)}, 2400)
                setTimeout(()=>{setFireworkState(3)}, 2600)
                setTimeout(()=>{setFireworkState(4)}, 2800)
                setTimeout(()=>{setFireworkState(5)}, 3000)
                setTimeout(()=>{setFireworkState(6)}, 3200)
                setTimeout(()=>{setFireworkState(7)}, 3400)
                setTimeout(()=>{setFireworkState(8)}, 3600)
                setTimeout(()=>{setFireworkState(9)}, 3800)
                setTimeout(()=>{setFireworkState(0)}, 4000)
                setTimeout(()=>{setPlaying(false)}, 4500)

                setSudoku(copy)
                return;
              }
              // correct entries make the cat happy
              if (catState===0){
                if (count_correct_units(sudoku)!==count_correct_units(copy)) {
                  // the cat is especially happy when rows, columns and grids are completed
                  setCatState(2)
                  setTimeout(()=>{
                    setCatState(0)
                  }, 1000)
                } else {
                  // otherwise they are also happy
                  setCatState(1)
                  setTimeout(()=>{
                    setCatState(0)
                  }, 1000)
                }
              }
              // update the sudoku
              setSudoku(copy)
            }
          }}
          style = {styles.button}
        ><Text style={styles.font}>{i+1}</Text></TouchableOpacity>
      )}
    </View>
  );
};

const bright = "#FFE4E4";
const dark = "#3A1000";
const white = "#FFF";
const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 40,
    width: "9%",
    borderWidth: 4,
    borderColor: white,
  },
  container: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    overflow: "hidden", 
    alignContent: "space-around",
    justifyContent: "space-between",
    padding: 10
  },
  subgrid: {
    width: "33.3333%", 
    height: "33.33333%", 
    flexDirection: "row", 
    flexWrap: "wrap", 
    borderWidth: 2, 
    borderColor: white
  },
  font: {
    fontFamily: "Mooli", 
    textAlign: "center", 
    color: white,
    fontSize: 30,
    top:-3,
  }
});


export default Selector;