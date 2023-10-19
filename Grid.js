import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';

const col = (i,j) => ((i*9+j)%3+i*3)%9
const row = (i,j) => Math.floor(i/3)*3+Math.floor(j/3)

const Grid = ({size, sudoku, selectTile, tile}) => {
  return (
    <View style={{width: size, height: size, ...styles.container}}>
      {[...Array(9)].map((_, i) =>
        <View style={styles.subgrid} key={i}>
        {[...Array(9)].map((_, j) =>
          <TouchableOpacity  key={i*9+j} 
            style={{...styles.tile, backgroundColor: tile===col(i,j)+9*row(i,j)?white:
              (row(i,j)===Math.floor(tile/9)||col(i,j)===tile%9?bright+"88":bright)
            }} onPress={()=>{selectTile(col(i,j)+9*row(i,j))}}>
            <Text key={i*9+j} style={{...styles.font, fontSize: size/12}}>
              {sudoku[col(i,j)+9*row(i,j)]===0?"":sudoku[col(i,j)+9*row(i,j)]}
            </Text>
          </TouchableOpacity >
        )}
        </View>
      )}
    </View>
  );
};

const bright = "#FFE4E4";
const dark = "#3A1000";
const white = "#FFFFFF";
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    overflow: "hidden", 
    borderWidth: 5, 
    borderRadius: 10,
    borderColor: white,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: white
  },
  subgrid: {
    width: "33.3333%", 
    height: "33.33333%", 
    flexDirection: "row", 
    flexWrap: "wrap", 
    borderWidth: 2, 
    borderColor: white
  },
  tile: {
    width: "33.3333%", 
    height: "33.3333%", 
    borderColor: white, 
    borderWidth: 1,
  },
  font: {
    fontFamily: "Mooli", 
    color: dark,
    textAlign: "center", 
    top: -1
  }
});


export default Grid;