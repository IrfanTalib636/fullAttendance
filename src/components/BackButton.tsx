import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useResponsiveDimensions } from '../hooks';

export const BackButton = () => {
    const navigation=useNavigation();
    const {hp,wp}=useResponsiveDimensions();

    const styles =useMemo(()=>{
        return StyleSheet.create({
            btnContainer:{
                width:hp(32),
                height:hp(32),
                borderRadius:hp(16),
                justifyContent:"center",
                alignItems:"center",
                backgroundColor:"#F1F5F9",
                marginTop:hp(10)
            },
            img:{
                width:hp(15),
                height:hp(15),
                tintColor:"#475569"
            }
        })
    },[hp,wp])
  return (
    <TouchableOpacity style={styles.btnContainer} onPress={()=>navigation.goBack()}>
      <Image style={styles.img} source={require("../../assets/images/back.png")}/>
    </TouchableOpacity>
  )
}
