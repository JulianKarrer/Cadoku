import {React, useEffect, useState} from 'react';
import {Text, Image, Animated, Easing, View, StyleSheet, useWindowDimensions, TouchableOpacity} from 'react-native';
import Grid from './Grid';
import Selector from "./Selector"
import { generate } from './fast_sudoku';

const App = () => {
  // LAYOUT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const {height, width} = useWindowDimensions();
  const padding = 30;
  const gridsize = Math.min(width,height) - padding*2;

  // CONSTANTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const GENERATING_TIMEOUT = 10; // in seconds, when generating the sudoku
  const EASY_HINTS = 60;
  const MEDIUM_HINTS = 45;
  const HARD_HINTS = 30;
  const CHALLENGE_HINTS = 25;

  // STATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // handle inputs
  const [tile, selectTile] = useState(-1)
  // generate sudoku
  const [sudoku, setSudoku] = useState(new Array(81).fill(0));
  const [solution, setSolution] = useState(new Array(81).fill(0));
  // sudoku difficulty
  const [hints, setHints] = useState(45);
  const [playing, setPlaying] = useState(false)
  const [difficulty, setDifficulty] = useState(-1)
  // cat images
  const [catState, setCatState] = useState(0);
  // fireworks images
  const [fireworkState, setFireworkState] = useState(0);
  // loading animation
  const [loading, setLoading] = useState(true);
  // exit to main modal
  const [modalOpen, setModalOpen] = useState(false);
  // reset everything
  useEffect(()=>{
    if(!playing){
      selectTile(-1)
      setSudoku(new Array(81).fill(0))
      setSolution(new Array(81).fill(0))
      setHints(45)
      setDifficulty(-1)
      setCatState(0)
      setLoading(true)
      setFireworkState(0)
      setModalOpen(false)
    }
  }, [playing])

  // ANIMATIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // handle cute cat
  let cats = [
    require('./assets/cat/mascot.png'),     //0
    require('./assets/cat/happy.png'),      //1
    require('./assets/cat/sparkle.png'),    //2
    require('./assets/cat/hearts.png'),     //3
    require('./assets/cat/firework.png'),   //4
    require('./assets/cat/easy.png'),       //5 // 5-8 must be preserved, see selector -> difficulty
    require('./assets/cat/medium.png'),     //6
    require('./assets/cat/hard.png'),       //7
    require('./assets/cat/challenge.png'),  //8
  ]

  // fireworks animation
  const fireworks = [
    require('./assets/cat/fireworks/empty.png'), 
    require('./assets/cat/fireworks/ref/0.png'), 
    require('./assets/cat/fireworks/ref/1.png'), 
    require('./assets/cat/fireworks/ref/2.png'), 
    require('./assets/cat/fireworks/ref/3.png'), 
    require('./assets/cat/fireworks/ref/4.png'), 
    require('./assets/cat/fireworks/ref/5.png'), 
    require('./assets/cat/fireworks/ref/6.png'), 
    require('./assets/cat/fireworks/ref/7.png'), 
    require('./assets/cat/fireworks/ref/8.png'), 
    require('./assets/cat/fireworks/ref/9.png'), 
  ]

  // loading animation
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start()
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <View style={styles.container} >
      {/* header */}
      <TouchableOpacity color="#FFFFFF" onPress={()=>{if(playing){setModalOpen(true)}}}>
        <Text style={styles.header}>Cadoku!</Text>
      </TouchableOpacity>

      {/* exit modal */}
      <TouchableOpacity style={{justifyContent: "center", width: "100%", height: "100%", position: "absolute", top:0, left:0, zIndex: 10, opacity: modalOpen?0.9:0, backgroundColor: bright, pointerEvents: modalOpen?"auto":"none"}}
      onPress={()=>{setModalOpen(false);}}>
        <TouchableOpacity color="#FFFFFF" style={{ 
          borderWidth: 2, borderColor: dark+"99", borderRadius: 20,  width: "60%", margin: "20%", marginBottom: 0, marginTop: 15, backgroundColor: highlighted}}
          onPress={() => {setModalOpen(false); setPlaying(false);}}>
          <Text style={{fontFamily: "Mooli", fontSize: 30, textAlign: "center", color: dark}}>Exit to Menu</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* main screen */}
      {playing?<>
        {/* game */}
        <View style={{justifyContent: "center", margin: padding}}>
          <View style={{zIndex: loading?1:-1, display:loading?"flex":"none"}}>
            <Image  
              source={require('./assets/cat/yarn_streak.png')} 
              style={{...styles.yarn, height: gridsize, }} />
            <Animated.Image  
              source={require('./assets/cat/yarn.png')} 
              style={{...styles.yarn, height: gridsize, transform: [{ rotate: spin}] }}/>
            <Text style={{...styles.loadingFont, top: 10,}}>Generating...</Text>
          </View>
          <Grid size={gridsize} sudoku={sudoku} selectTile={selectTile} tile={tile}/>
        </View>
        <Selector
          sudoku={sudoku} setSudoku={setSudoku}
          tileSelected={tile} solution={solution} 
          catState={catState} setCatState={setCatState}
          setFireworkState={setFireworkState} setPlaying={setPlaying} difficulty={difficulty}/>
      </>:<>
        {/* menu */}
        <View style={{justifyContent: "center", margin: padding, alignContent: "center"}}>
          <View style={{height: gridsize+50, width: gridsize,
          alignContent: "center",
          justifyContent: "center"}}>

            <TouchableOpacity color="#FFFFFF" style={{...styles.difficutlyButton, backgroundColor: difficulty===0?highlighted:transparent}}
              onPress={() => {setCatState(5); setDifficulty(0); setHints(EASY_HINTS)}}>
              <Text style={{fontFamily: "Mooli", fontSize: 30, textAlign: "center", color: dark}}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity color="#FFFFFF" style={{...styles.difficutlyButton, backgroundColor: difficulty===1?highlighted:transparent}}
              onPress={() => {setCatState(6); setDifficulty(1); setHints(MEDIUM_HINTS)}}>
              <Text style={{fontFamily: "Mooli", fontSize: 30, textAlign: "center", color: dark}}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity color="#FFFFFF" style={{...styles.difficutlyButton, backgroundColor: difficulty===2?highlighted:transparent}}
              onPress={() => {setCatState(7); setDifficulty(2); setHints(HARD_HINTS)}}>
              <Text style={{fontFamily: "Mooli", fontSize: 30, textAlign: "center", color: dark}}>Hard</Text>
            </TouchableOpacity>
            <TouchableOpacity color="#FFFFFF" style={{...styles.difficutlyButton, backgroundColor: difficulty===3?highlighted:transparent}}
              onPress={() => {setCatState(8); setDifficulty(3); setHints(CHALLENGE_HINTS)}}>
              <Text style={{fontFamily: "Mooli", fontSize: 30, textAlign: "center", color: dark}}>Challenge</Text>
            </TouchableOpacity>


            <TouchableOpacity
              color="#FFFFFF"
              onPress={() => {
                if (difficulty>=0){
                  setPlaying(true)
                  setTimeout(()=>{
                    let res = generate(hints, GENERATING_TIMEOUT)
                    setSudoku(res.sudoku)
                    setSolution(res.solution)
                    setLoading(false)
                    setCatState(0)
                  }, 0)
                }
              }}
              style={{...styles.difficutlyButton, opacity: difficulty>=0? 1:0.3, marginTop: 50}}
            >
              <Text style={{fontFamily: "Mooli", fontSize: 50, textAlign: "center", color: dark}}>Play!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>}

      {/* footer */}
      <View style={{height: headerHeight}}></View>
      <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}
        onTouchStart={e=> this.touchY = e.nativeEvent.pageY}
        onTouchEnd={e => {
          if (this.touchY - e.nativeEvent.pageY > 20 && catState===0){
            setCatState(3)
            setTimeout(()=>{
              setCatState(0)
            }, 1000)
          }
        }}>
        <Image  source={cats[catState]} style={styles.mascot} fadeDuration={0} />
      </View>
      <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5}}>
        <Image source={fireworks[fireworkState]} style={{...styles.mascot, height: 2*180}} fadeDuration={0} />
      </View>
    </View>
  );
};

const bright = "#FFE4E4";
const dark = "#3A1000";
const white = "#FFFFFF";
const highlighted = "#FFBBBB";
const transparent = "transparent";
const headerHeight = 100;
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: 'absolute',
    bottom:0,
    backgroundColor: bright,
  },  
  header: {
    fontFamily: "Mooli",
    fontSize: 50,
    color: dark,
    textAlign: "center",
    height: headerHeight,
  },
  mascot: {
    resizeMode: 'contain',
    height: 180, 
    width: "100%",
  },
  firework: {
    resizeMode: 'contain',
    height: 180*2, 
    width: "100%",
  },
  yarn: {
    resizeMode: 'contain',
    width: "100%",
    position: "absolute",
    zIndex: 1,
    top: 0
  },
  loadingFont: {
    position: "absolute", 
    zIndex: 1, 
    width: "100%", 
    textAlign: "center", 
    fontFamily: "Mooli",
    fontSize: 15, 
    color: dark
  },
  difficultyText: {
    fontFamily:"Mooli", fontSize: 20, 
  },
  difficutlyButton: {
    borderWidth: 2, borderColor: dark+"99", borderRadius: 20,  width: "50%", margin: "25%", marginBottom: 0, marginTop: 15,
  }
});


export default App;