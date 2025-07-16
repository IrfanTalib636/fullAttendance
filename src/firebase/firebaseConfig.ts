import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  onSnapshot,
} from '@react-native-firebase/firestore';
import {getAuth, signOut} from '@react-native-firebase/auth';
import {
  checkInAttendanceTime,
  checkOutAttendanceTime,
  convertToUTC,
  getCheckStatus,
  getDistanceInMiles,
  resetAndGo,
} from '../utils';
import {SCREENS, STACK} from '../enums';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firestore = getFirestore();
const auth = getAuth();

type LoginHandlerParams = {
  setLoading: (loading: boolean) => void;
  username: string;
  password: string;
  showToast: (msg: string, type: 'successToast' | 'errorToast') => void;
  navigation: any;
};


const loginWithUsername = async (navigation:LoginHandlerParams['navigation'],username:LoginHandlerParams['username'], password:LoginHandlerParams['password'],showToast:LoginHandlerParams['showToast'],setLoading: LoginHandlerParams['setLoading']) => {
  console.log("USERNAME===>",username);
  try {
    setLoading(true);
    if (!username || !password) {
      setLoading(false);
      showToast('Please fill all the fields', 'errorToast');
      return;
    }
    const res = await fetch(`https://us-central1-attendanceapp-78240.cloudfunctions.net/api/get-email/${username}`);
    const result=await res.json();
    console.log(result.email);
    await auth.signInWithEmailAndPassword(result?.email, password);
    setLoading(false);
    showToast('Logged In Successfully', 'successToast');
    resetAndGo(navigation,STACK.BOTTOM_NAV,null)
  } catch (error: any) {
    if (error.message.includes('invalid-credential')) {
      setLoading(false);
      showToast('Invalid Email or Password', 'errorToast');
    } else if (error.message.includes('invalid-email')) {
      setLoading(false);
      showToast('Email format is Invalid', 'errorToast');
    } else {
      setLoading(false);
      showToast('Something went wrong', 'errorToast');
    }
  }
};

// const handleLogin = async (
//   setLoading: LoginHandlerParams['setLoading'],
//   email: LoginHandlerParams['email'],
//   password: LoginHandlerParams['password'],
//   showToast: LoginHandlerParams['showToast'],
//   navigation: LoginHandlerParams['navigation'],
// ) => {
//   try {
//     setLoading(true);
//     if (!email || !password) {
//       setLoading(false);
//       showToast('Please fill all the fields', 'errorToast');
//     } else {
//       let res = await auth.signInWithEmailAndPassword(email, password);
//       setLoading(false);
//       showToast('Logged In Successfully', 'successToast');
//       resetAndGo(navigation, STACK.BOTTOM_NAV, null);
//     }
//   } catch (error: any) {
//     if (error.message.includes('invalid-credential')) {

//       showToast('Invalid Email or Password', 'errorToast');
//     } else if (error.message.includes('invalid-email')) {
//       showToast('Email format is Invalid', 'errorToast');
//     } else {
//       showToast('Something went wrong', 'errorToast');
//     }
//   }
// };

type LogoutHandlerParams = {
  setLoading: (loading: boolean) => void;
};

const handleLogout = async (setLoading: LogoutHandlerParams['setLoading']) => {
  try {
    setLoading(true);
    await signOut(auth);
    setLoading(false);
  } catch (error) {
    console.warn(error);
  }
};

//Check-In Function
type Coords = {
  latitude: number;
  longitude: number;
};

type AppLangType = {
  home: {
    oopsCheckIn: string;
    alreadyCheckedIn: string;
    selectLocation: string;
    checkinSuccess: string;
  };
};

type CheckinHandlerParams = {
  setLoading: (loading: boolean) => void;
  showToast: (msg: string, type: 'successToast' | 'infoToast') => void;
  appLang: AppLangType;
  selectedLocation: any;
  locationcoords: Coords;
  currentLocationName: string;
  address: string;
};

const handleCheckIn = async (
  setLoading: CheckinHandlerParams['setLoading'],
  showToast: CheckinHandlerParams['showToast'],
  appLang: CheckinHandlerParams['appLang'],
  selectedLocation: CheckinHandlerParams['selectedLocation'],
  locationcoords: CheckinHandlerParams['locationcoords'],
  currentLocationName: CheckinHandlerParams['currentLocationName'],
  address: CheckinHandlerParams['address'],
) => {
  try {
    setLoading(true);
    const res= await fetch("https://us-central1-attendanceapp-78240.cloudfunctions.net/api/settings/daylight-saving");
    const result=await res.json();
     const isDayLightSaving = result?.isDayLightSaving ?? false;
    console.log("isDayLightSaving===>",isDayLightSaving)
    if (getCheckStatus() === 'Check Out' || !checkInAttendanceTime()) {
      showToast(`${appLang.home.oopsCheckIn}`, 'infoToast');
      setLoading(false);
      return;
    }
    const userId = auth.currentUser?.uid;

    const todayDate = moment(
      new Date().toDateString(),
      'ddd MMM DD YYYY',
    ).format('YYYY-MM-DD');

    // Step 1: Check if user already checked in today
    const q = query(
      collection(firestore, 'attendance'),
      where('userId', '==', userId),
      where('date', '==', todayDate),
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      showToast(`${appLang.home.alreadyCheckedIn}`, 'infoToast');
      setLoading(false);
      return;
    }

    if (selectedLocation === null) {
      showToast(`${appLang.home.selectLocation}`, 'infoToast');
      setLoading(false);
      return;
    }

    // Get current time and adjust for daylight saving
    let now = new Date();
    if (isDayLightSaving) {
      now = new Date(now.getTime() + 60 * 60 * 1000); // add 1 hour
    }

    const docRef = doc(collection(firestore, 'attendance'));
    // const now = new Date();
    await setDoc(docRef, {
      userId: userId,
      date: moment(now.toDateString(), 'ddd MMM DD YYYY').format('YYYY-MM-DD'),
      checkInTime: convertToUTC(now),
      checkOutTime: null,
      currentLocationCoordsWhileCheckingIn: {
        latitude: locationcoords.latitude,
        longitude: locationcoords.longitude,
      },
      currentLocationNameWhileCheckingIn: currentLocationName,
      currentLocationCoordsWhileCheckingOut: null,
      currentLocationNameWhileCheckingOut: null,
      selectedLocationName: address,
      selectedLocationCoords: {
        latitude: selectedLocation?.coords.latitude,
        longitude: selectedLocation?.coords.longitude,
      },
      withInWorkSpaceWhileCheckingIn:
        getDistanceInMiles(
          locationcoords.latitude,
          locationcoords.longitude,
          selectedLocation?.coords.latitude,
          selectedLocation?.coords.longitude,
        ) <= 0.75,
      distanceWhileCheckingIn: getDistanceInMiles(
        locationcoords.latitude,
        locationcoords.longitude,
        selectedLocation?.coords.latitude,
        selectedLocation?.coords.longitude,
      ),
      withInWorkSpaceWhileCheckingOut: null,
      distanceWhileCheckingOut: null,
    });
    await AsyncStorage.setItem(
      'latitude',
      selectedLocation?.coords?.latitude.toString(),
    );
    await AsyncStorage.setItem(
      'longitude',
      selectedLocation?.coords?.longitude.toString(),
    );
    showToast(`${appLang.home.checkinSuccess}`, 'successToast');
  } catch (error) {
    console.log('Oops..! CheckIn Error===>', error);
  } finally {
    setLoading(false);
  }
};

//Check-Out Function
type CoordsCheckOut = {
  latitude: number;
  longitude: number;
};

type AppLangTypeCheckOut = {
  home: {
    oopsCheckOut: string;
    alreadtCheckOut: string;
    selectLocation: string;
    checkoutSuccess: string;
    selectLocationToCheckout:string;
    checkOutSecond:string;
    checkOutError:string
  };
};

type CheckOutHandlerParams = {
  setLoading: (loading: boolean) => void;
  showToast: (msg: string, type: 'successToast' | 'infoToast' | 'errorToast') => void;
  appLang: AppLangTypeCheckOut;
  selectedLocation: any;
  locationcoords: CoordsCheckOut;
  currentLocationName: string;
  address: string;
};

const handleCheckout = async (
  setLoading:CheckOutHandlerParams['setLoading'],
  showToast:CheckOutHandlerParams['showToast'],
  appLang:CheckOutHandlerParams['appLang'],
  locationcoords:CheckOutHandlerParams['locationcoords'],
  currentLocationName:CheckOutHandlerParams['currentLocationName'],
  selectedLocation:CheckOutHandlerParams['selectedLocation'],
  address:CheckOutHandlerParams['address']
) => {
  try {
    setLoading(true);

    if (getCheckStatus() === 'Check In' || !checkOutAttendanceTime()) {
      showToast(`${appLang.home.oopsCheckOut}`,'infoToast');
      setLoading(false);
      return;
    }
    // Fetch daylight saving status
    const res = await fetch("https://us-central1-attendanceapp-78240.cloudfunctions.net/api/settings/daylight-saving");
    const result = await res.json();
    const isDayLightSaving = result?.isDayLightSaving ?? false;
    console.log("Daylight Saving Status:", isDayLightSaving);

    const userId = auth.currentUser?.uid;
    const today = moment().format('YYYY-MM-DD');
    const attendanceRef = collection(firestore, 'attendance');

    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      where('date', '==', today),
    );

     // Get current time and apply daylight saving adjustment
    let now = new Date();
    if (isDayLightSaving) {
      now = new Date(now.getTime() + 60 * 60 * 1000); // add 1 hour
    }

    const querySnapshot = await getDocs(q);
    // const now = new Date();
    const checkOutTime = convertToUTC(now);

    const selectedLat = await AsyncStorage.getItem('latitude');
    const selectedLon = await AsyncStorage.getItem('longitude');

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const docData = docSnapshot.data();
      const docRef = docSnapshot.ref;

      // ✅ Check if already checked out
      if (docData.checkOutTime) {
        showToast(`${appLang.home.alreadtCheckOut}`, 'infoToast');
        setLoading(false);
        return;
      }

      // ✅ Perform update only if not checked out
      await updateDoc(docRef, {
        checkOutTime: checkOutTime,
        currentLocationCoordsWhileCheckingOut: {
          latitude: locationcoords.latitude,
          longitude: locationcoords.longitude,
        },
        currentLocationNameWhileCheckingOut: currentLocationName,
        withInWorkSpaceWhileCheckingOut:
          getDistanceInMiles(
            locationcoords.latitude,
            locationcoords.longitude,
            selectedLocation?.coords.latitude || selectedLat,
            selectedLocation?.coords.longitude || selectedLon,
          ) <= 0.75,
        distanceWhileCheckingOut: getDistanceInMiles(
          locationcoords.latitude,
          locationcoords.longitude,
          selectedLocation?.coords.latitude || selectedLat,
          selectedLocation?.coords.longitude || selectedLon,
        ),
      });
      showToast(`${appLang.home.checkoutSuccess}`, 'successToast');
    } else {
      // ✅ No record — create a new document
      if (!selectedLocation?.coords) {
        showToast(`${appLang.home.selectLocationToCheckout}`, 'infoToast');
        return;
      }

      const docRef = doc(collection(firestore, 'attendance'));
      await setDoc(docRef, {
        userId,
        date: today,
        checkInTime: null,
        checkOutTime: checkOutTime,
        currentLocationCoordsWhileCheckingIn: null,
        currentLocationNameWhileCheckingIn: null,
        currentLocationCoordsWhileCheckingOut: {
          latitude: locationcoords.latitude,
          longitude: locationcoords.longitude,
        },
        currentLocationNameWhileCheckingOut: currentLocationName,
        selectedLocationName: address,
        selectedLocationCoords: {
          latitude: selectedLocation?.coords.latitude,
          longitude: selectedLocation?.coords.longitude,
        },
        withInWorkSpaceWhileCheckingIn: null,
        distanceWhileCheckingIn: null,
        withInWorkSpaceWhileCheckingOut:
          getDistanceInMiles(
            locationcoords.latitude,
            locationcoords.longitude,
            selectedLocation?.coords.latitude,
            selectedLocation?.coords.longitude,
          ) <= 0.75,
        distanceWhileCheckingOut: getDistanceInMiles(
          locationcoords.latitude,
          locationcoords.longitude,
          selectedLocation?.coords.latitude,
          selectedLocation?.coords.longitude,
        ),
      });
      showToast(`${appLang.home.checkOutSecond}`, 'successToast');
    }
  } catch (error) {
    console.log('Oops..! CheckOut Error===>', error);
    showToast(`${appLang.home.checkOutError}`, 'errorToast');
  } finally {
    setLoading(false);
  }
};

export {
  firestore,
  auth,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  // handleLogin,
  handleLogout,
  handleCheckIn,
  handleCheckout,
  onSnapshot,
  loginWithUsername
};
