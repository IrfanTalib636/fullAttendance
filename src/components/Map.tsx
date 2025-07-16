import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import MapView, { Marker } from 'react-native-maps'
import { useResponsiveDimensions } from '../hooks'
import { COLORS } from '../enums'

interface mapProps{
    latitude:number,
    longitude:number,
    mapRef?:any,
    title?:string,
    description?:string
}

export const Map = (props : mapProps) => {
    const {latitude,longitude,mapRef,title,description}=props;
    const {hp,wp}=useResponsiveDimensions();

const styles = useMemo(()=>{
    return StyleSheet.create({
        mapContainer:{
            flex:1
          },
          map: {
           flex:1
          },
    })
},[hp,wp])


  return (
    <View style={styles.mapContainer}>
        <MapView
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor={COLORS.PRIMARY}
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: latitude || 37.78825,
          longitude: longitude || -122.4324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
          <Marker
            pinColor={COLORS.PRIMARY}
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
            title={title}
            description={description}
          />
        </MapView>
        </View>
  )
}
