import {API_KEY} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';
import {PermissionsAndroid, Platform} from 'react-native';
import GetLocation from 'react-native-get-location';


const language = [
  {label: 'English', value: 'en'},
  {label: 'Portuguese', value: 'pt'},
  {label: 'Spanish', value: 'es'},
];

const resetAndGo = (navigation: any, routeName: string, routeParams: any) => {
  if (navigation && !isEmptyString(routeName)) {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: routeName,
            params: routeParams || {},
          },
        ],
      }),
    );
  }
};

const isEmptyString = (str: string) => {
  return str == '' || !str;
};

const storeStringValue = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log(error);
  }
};

const getStoredStringValue = async (
  key: string,
  setStoredValue: any,
  defaultValue: any,
) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      setStoredValue(value);
    } else {
      setStoredValue(defaultValue);
    }
  } catch (error) {
    console.log(error);
  }
};
const getPlaceName = async (lat: Number, lon: Number, setLocation: any) => {
  const apiKey = API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK') {
      const placeName = data.results[0];
      console.log('Place Name:', placeName);
      setLocation(placeName);
    } else {
      console.log('No address found');
    }
  } catch (error) {
    console.error('Error fetching place name:', error);
  }
};

const hasLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const NOON_MINUTES = 12 * 60; // 12:00 PM — switch between check-in and check-out

const getMinutesSinceMidnight = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

function getCheckStatus() {
  return getMinutesSinceMidnight() < NOON_MINUTES ? 'Check In' : 'Check Out';
}

 // Get local time without any UTC conversion
 function getLocalTime(): string {
  const now = new Date(); // current local time
  // Format it in local timezone with AM/PM format
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const formattedDate=(rawDate:any)=>{
const date = new Date(rawDate);

const day = String(date.getDate()).padStart(2, '0');
const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
const year = date.getFullYear();

const formattedDate = `${month}-${day}-${year}`;
return formattedDate;
}

const getLocation = async (setCurrentLocationCoords:any,handleSetLocation:any) => {
  try {
    let res = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    });
    getPlaceName(res.latitude, res.longitude, handleSetLocation);
    setCurrentLocationCoords({
      latitude: res.latitude,
      longitude: res.longitude,
    });
    console.log('USER_LOCATION===>', res);
  } catch (error) {
    console.log(error);
  }
};

function getDistanceInMiles(lat1 : any, lon1 : any, lat2 : any, lon2 : any) {
  console.log(`lat 1 = ${lat1}\n lon 1 = ${lon1}\n lat 2 = ${lat2}\n lon 2 = ${lon2}`);
    const toRadians = (degrees : any) => degrees * (Math.PI / 180);
    const R = 3958.8; // Radius of the Earth in miles
  
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }

  function convertToUTC(): string {
    const now = new Date(); // current local time
    // Format it to UTC in AM/PM format
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  }
  function convertUtcToLocalTime(utcTimeStr: string, format: '12' | '24' = '24') {
    const parsed = new Date(`1970-01-01T${convertTo24Hour(utcTimeStr)}Z`); // Treat as UTC
    if (isNaN(parsed.getTime())) return 'Invalid time';
    return parsed.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12',
    });
  }
  function convertTo24Hour(timeStr: string) {
    // Normalize special spaces like narrow no-break space
    timeStr = timeStr.replace(/\u202F/g, ' ').trim();
  
    // If already in 24-hour format, just append ":00" if needed
    if (!timeStr.toLowerCase().includes('am') && !timeStr.toLowerCase().includes('pm')) {
      const parts = timeStr.split(':');
      if (parts.length === 2) return `${timeStr}:00`; // e.g. "14:30" -> "14:30:00"
      return timeStr; // assume it's already "HH:mm:ss"
    }
  
    // Convert from 12-hour to 24-hour format
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  // Check-in: 12:00 AM – 11:59 AM (before noon)
  const checkInAttendanceTime = () => {
    return getMinutesSinceMidnight() < NOON_MINUTES;
  };

  // Check-out: 12:00 PM – 11:59 PM (noon and after)
  const checkOutAttendanceTime = () => {
    return getMinutesSinceMidnight() >= NOON_MINUTES;
  };
  
export {
  resetAndGo,
  getStoredStringValue,
  storeStringValue,
  getPlaceName,
  hasLocationPermission,
  getCheckStatus,
  formattedDate,
  getLocation,
  getDistanceInMiles,
  checkInAttendanceTime,
  checkOutAttendanceTime,
  language,
  getLocalTime
};
