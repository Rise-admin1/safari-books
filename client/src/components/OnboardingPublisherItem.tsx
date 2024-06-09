import { StyleSheet, Text, View, Image, useWindowDimensions} from 'react-native'
import React from 'react'

const OnboardingPublisherItem = ({item}) => {
  const {width} = useWindowDimensions()
  return (
    <View style={[styles.container,{width}]}>
      <Image source={item.image} style={[styles.image,{width,resizeMode:'contain'}]} />

      <View style={{flex:0.3}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  )
}

export default OnboardingPublisherItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image:{
    flex:0.7,
    justifyContent:'center',
  },
  title:{
    fontWeight:'800',
    fontSize:28,
    marginBottom:16,
    color:'red',
    textAlign:'center'
  },
  description:{
    fontWeight:'300',
    color:'white',
    textAlign:'center',
    paddingHorizontal:64
    
  }
})