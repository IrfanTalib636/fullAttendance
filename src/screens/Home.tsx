import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {COLORS, SCREENS, TEXT_STYLE} from '../enums';
import {useResponsiveDimensions, useToast} from '../hooks';
import MapView from 'react-native-maps';
import {getCheckStatus, getLocation} from '../utils';
import {AnyIcon, IconType, Map} from '../components';
import {RouteProp} from '@react-navigation/native';
import {AppDataContext} from '../context/AppDataContext';
import moment from 'moment';
import {
  auth,
  collection,
  firestore,
  handleCheckIn,
  handleCheckout,
  onSnapshot,
  query,
  where,
} from '../firebase/firebaseConfig';


type LocationType = {
  coords: {
    latitude: number;
    longitude: number;
  };
};
type RootStackParamList = {
  Home: {
    locationData?: {
      coords: {
        latitude: number;
        longitude: number;
      };
      formattedName?: string;
      title?: string;
    };
  };
};

export const Home = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const {appLang} = useContext(AppDataContext);
  const showToast = useToast();
  const {hp, wp} = useResponsiveDimensions();
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );
  const [address, setAddress] = useState<any>('');
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 0,
    longitude: 0,
  });
  const [locationState, setLocationState] = useState(
    route?.params?.locationData || null,
  );
  const [startTime, setStartTime] = useState<any>('');
  const [endTime, setEndTime] = useState<any>('');
  const [locationcoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    // 1. Get current location
    getLocation(setLocationCoords, handleSetCurrentLocationName);

    // 2. Set up Firestore attendance listener
    const userId = auth.currentUser?.uid;
    const today = moment().format('YYYY-MM-DD');
    const attendanceQuery = query(
      collection(firestore, 'attendance'),
      where('userId', '==', userId),
      where('date', '==', today),
    );

    const unsubscribe = onSnapshot(attendanceQuery, snapshot => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        setStartTime(
          docData?.checkInTime === null
            ? ''
            : docData?.checkInTime,
        );
        setEndTime(docData?.checkOutTime === null ? '' : docData?.checkOutTime);
        setAddress(
          docData?.selectedLocation !== null
            ? docData?.selectedLocationName
            : '',
        );
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: docData?.selectedLocationCoords?.latitude,
              longitude: docData?.selectedLocationCoords?.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }
        setCurrentLocationCoords({
          latitude:docData?.selectedLocationCoords?.latitude,
          longitude:docData?.selectedLocationCoords?.longitude
        })
      } else {
        console.log('No attendance found for today');
      }
    });

    return () => unsubscribe(); // clean up listener
  }, []);

  const handleSetCurrentLocationName = (val: any) => {
    setCurrentLocationName(val?.formatted_address);
  };

  const handleSelectedLocation = (val: any) => {
    setCurrentLocationCoords({
      latitude: val.coords.latitude,
      longitude: val.coords.longitude,
    });
    setSelectedLocation(val);
    setAddress(val.formattedName);
  };

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.locationData) {
        console.log('PARAMS_DATA===>', route?.params?.locationData);
        setLocationState(route.params.locationData);
        handleSelectedLocation(route.params.locationData);
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: route?.params?.locationData?.coords.latitude,
              longitude: route?.params?.locationData?.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }

        // Clear params only after saving them
        navigation.setParams({locationData: null});
      }
    }, [route?.params?.locationData]),
  );

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
      },
      bottomContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'flex-start',
        padding: hp(16),
      },
      btnContainer: {
        height: hp(50),
        width: '80%',
        alignSelf: 'center',
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp(26),
      },
      btnText: {
        ...TEXT_STYLE.medium,
        fontSize: hp(18),
        color: COLORS.WHITE,
      },
      pickBtnContainer: {
        height: hp(50),
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp(26),
      },
      addressInput: {
        height: hp(50),
        width: '100%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: hp(8),
        paddingHorizontal: hp(5),
        marginTop: hp(10),
      },
      label: {
        ...TEXT_STYLE.bold,
        fontSize: hp(16),
        color: COLORS.PRIMARY,
      },
    });
  }, [hp, wp, COLORS]);

  return (
    <SafeAreaView style={styles.container}>
      <Map
        latitude={currentLocationCoords.latitude}
        longitude={currentLocationCoords.longitude}
        mapRef={mapRef}
        title={locationState?.title}
        description={locationState?.formattedName}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.pickBtnContainer}
          onPress={() => navigation.navigate(SCREENS.LOCATION as never)}>
          <AnyIcon
            type={IconType.Entypo}
            name="location-pin"
            color={COLORS.WHITE}
            size={hp(20)}
          />
          <Text style={styles.btnText}>{appLang.pickLocation}</Text>
        </TouchableOpacity>
        <View style={{width: '100%'}}>
          <Text style={styles.label}>{appLang.selectedLocationAddress}</Text>
          <TextInput
            style={styles.addressInput}
            placeholder={appLang.selectedLocation}
            value={address}
            onChangeText={val => setAddress(val)}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: hp(20),
            }}>
            <View style={{width: '50%'}}>
              <Text style={styles.label}>{appLang.startTime}</Text>
              <Text
                style={{
                  ...styles.label,
                  color: COLORS.PLACEHOLDER,
                  fontSize: hp(14),
                  marginTop: hp(5),
                }}>
                {startTime === '' ? '---' : startTime}
              </Text>
            </View>
            <View style={{width: '50%'}}>
              <Text style={styles.label}>{appLang.endTime}</Text>
              <Text
                style={{
                  ...styles.label,
                  color: COLORS.PLACEHOLDER,
                  fontSize: hp(14),
                  marginTop: hp(5),
                }}>
                {endTime === '' ? '---' : endTime}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={
            getCheckStatus() === 'Check In'
              ? () =>
                  handleCheckIn(
                    setLoading,
                    showToast,
                    appLang,
                    selectedLocation,
                    locationcoords,
                    currentLocationName,
                    address,
                  )
              : () =>
                  handleCheckout(
                    setLoading,
                    showToast,
                    appLang,
                    locationcoords,
                    currentLocationName,
                    selectedLocation,
                    address,
                  )
          }
          >
          {loading ? (
            <ActivityIndicator color={COLORS.WHITE} />
          ) : (
            <Text style={styles.btnText}>
              {getCheckStatus() === 'Check In'
                ? appLang.home.checkIn
                : appLang.home.checkOut}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
