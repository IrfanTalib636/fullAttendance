import 'react-native-get-random-values';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useResponsiveDimensions} from '../hooks';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {API_KEY} from '@env';
import MapView, {Marker} from 'react-native-maps';
import {COLORS, SCREENS, STACK, TEXT_STYLE} from '../enums';
import {useNavigation} from '@react-navigation/native';
import GetLocation from 'react-native-get-location';
import {getPlaceName} from '../utils';
import { AppDataContext } from '../context/AppDataContext';

export const Location = () => {
  const {appLang}=useContext(AppDataContext);
  const navigation = useNavigation<any>();
  const {hp, wp} = useResponsiveDimensions();
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [fullAddress, setFullAddress] = useState('');
  const [title, setTitle] = useState<any>('');
  const [location, setLocation] = useState<any>(null);

  // Create a ref for MapView
  const mapRef = useRef<MapView | null>(null);
  const handleConfirmLocation = () => {
    navigation.navigate(STACK.BOTTOM_NAV, {
      screen: SCREENS.HOME,
      params: {
        locationData: {
          coords: {latitude: latitude, longitude: longitude},
          formattedName: fullAddress,
          title: title,
        },
      },
    });
  };

  const getLocation = async () => {
    try {
      let res = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });
      setLatitude(res?.latitude);
      setLongitude(res?.longitude);
      getPlaceName(
        res?.latitude,
        res?.longitude,
        handleSetLocation,
      );
    } catch (error) {
      console.log("GET_LOCATION_ERROR===>",error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSetLocation = (val: any) => {
    setFullAddress(val.formatted_address);
    setLocation(val);
  };

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
      },
      map: {
        flex: 1,
      },
      btnContainer: {
        height: hp(50),
        width: '80%',
        alignSelf: 'center',
        position: 'absolute',
        bottom: hp(50),
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp(26),
        zIndex: 100,
      },
      btnText: {
        ...TEXT_STYLE.medium,
        fontSize: hp(24),
        color: COLORS.WHITE,
      },
    });
  }, [hp, wp]);

  return (
    <SafeAreaView style={styles.container}>
      {API_KEY ? (
        <View style={{flex: 1}}>
          <GooglePlacesAutocomplete
            placeholder={appLang.location.search}
            query={{
              key: API_KEY,
              language: 'en',
              types: 'geocode',
            }}
            autoFillOnNotFound={false}
            currentLocation={false}
            currentLocationLabel={appLang.location.currentLocation}
            debounce={0}
            disableScroll={false}
            enableHighAccuracyLocation={true}
            enablePoweredByContainer={true}
            fetchDetails={true}
            filterReverseGeocodingByTypes={[]}
            GooglePlacesDetailsQuery={{}}
            GooglePlacesSearchQuery={{
              rankby: 'distance',
              type: 'restaurant',
            }}
            GoogleReverseGeocodingQuery={{}}
            isRowScrollable={true}
            keyboardShouldPersistTaps="always"
            listUnderlayColor="#c8c7cc"
            listViewDisplayed="auto"
            keepResultsAfterBlur={false}
            minLength={1}
            nearbyPlacesAPI="GooglePlacesSearch"
            numberOfLines={1}
            onFail={() => {}}
            onNotFound={() => {}}
            onPress={(data, details = null) => {
              setFullAddress(details?.formatted_address ?? '');
              setTitle(details?.name);
              if (details?.geometry?.location) {
                const newLatitude = details.geometry.location.lat;
                const newLongitude = details.geometry.location.lng;
                setLatitude(newLatitude);
                setLongitude(newLongitude);

                // Animate the map to the new location
                mapRef.current?.animateToRegion(
                  {
                    latitude: newLatitude,
                    longitude: newLongitude,
                    latitudeDelta: 0.01, // Zoom level
                    longitudeDelta: 0.01,
                  },
                  1000,
                ); // Animation duration in ms
              }
            }}
            onTimeout={() =>
              console.warn('google places autocomplete: request timeout')
            }
            predefinedPlaces={[]}
            predefinedPlacesAlwaysVisible={false}
            styles={{
              textInput: {
                fontSize: 18,
                height: 50,
                width: '90%',
                alignSelf: 'center',
                borderRadius: 20,
                paddingHorizontal: 10,
                backgroundColor: '#fff',
                color: '#000',
                position: 'absolute',
                top: 20,
                zIndex: 20,
              },
              listView: {
                backgroundColor: '#fff',
                position: 'absolute',
                zIndex: 30,
                top: 73,
                width: '90%',
                alignSelf: 'center',
              },
              row: {
                padding: 13,
                height: 50,
                flexDirection: 'row',
              },
              separator: {
                height: 1,
                backgroundColor: '#c8c7cc',
              },
              description: {
                fontSize: 16, // Increase dropdown text size
              },
            }}
            suppressDefaultStyles={true}
            textInputHide={false}
            textInputProps={{}}
            timeout={20000}
          />
          {/* </View> */}
          <TouchableOpacity
            style={styles.btnContainer}
            onPress={handleConfirmLocation}>
              <Text style={styles.btnText}>{appLang.location.confirmLocation}</Text>
          </TouchableOpacity>
          <MapView
            showsUserLocation
            ref={mapRef}
            style={styles.map}
            region={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}>
            <Marker
              draggable
              pinColor={COLORS.PRIMARY}
              coordinate={{latitude: latitude, longitude: longitude}}
              description={location?.formatted_address}
              onDragEnd={e => {
                let marketLocation = {x: e.nativeEvent.coordinate};
                setLatitude(marketLocation.x.latitude);
                setLongitude(marketLocation.x.longitude);
                getPlaceName(
                  marketLocation.x.latitude,
                  marketLocation.x.longitude,
                  handleSetLocation,
                );
              }}
            />
          </MapView>
        </View>
      ) : (
        <Text>API_KEY has not found.</Text>
      )}
    </SafeAreaView>
  );
};
