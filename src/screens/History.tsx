import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import {COLORS, SCREENS, TEXT_STYLE} from '../enums';
import {useNavigation} from '@react-navigation/native';
import MonthPicker from 'react-native-month-year-picker';
import {useResponsiveDimensions} from '../hooks';
import {AnyIcon, IconType} from '../components';
import {formattedDate} from '../utils';
import {
  auth,
  collection,
  firestore,
  getDocs,
  query,
  where,
} from '../firebase/firebaseConfig';
import {AppDataContext} from '../context/AppDataContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

// Define TypeScript type for Attendance Record
type AttendanceRecord = {
  id: string;
  currentLocationNameWhileCheckingIn: string;
  currentLocationNameWhileCheckingOut: string;
  selectedLocationName: any;
  date: any;
  checkInTime: any;
  checkOutTime: any;
};

export const History = () => {
  const {appLang} = useContext(AppDataContext);
  const {hp, wp} = useResponsiveDimensions();
  const navigation = useNavigation<any>();
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const showPicker = useCallback((value: any) => setOpen(value), []);

  const translateY = useSharedValue(-50); // Start 50px above the screen
const opacity = useSharedValue(0); // Start fully transparent

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  };
});


useEffect(() => {
  // Animate only after data is loaded
  if (!loading && attendanceHistory.length > 0) {
    translateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(1, {
      duration: 500,
    });
  }
}, [loading, attendanceHistory]);


  const listenToUserAttendance = async () => {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.log('User not authenticated');
        return [];
      }

      const attendanceRef = collection(firestore, 'attendance');
      const q = query(attendanceRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const attendanceData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[];

      return attendanceData;
    } catch (error) {
      console.log('Error fetching attendance data:', error);
      return [];
    }
  };

  useEffect(() => {
    const getAttendance = async () => {
      setLoading(true);
      const data = await listenToUserAttendance();

      const selectedMonth = moment(selectedDate).month(); // 0 index based
      const selectedYear = moment(selectedDate).year();

      const filteredData = data.filter(record => {
        const recordDate = moment(record.date, 'YYYY-MM-DD');
        return (
          recordDate.month() === selectedMonth &&
          recordDate.year() === selectedYear
        );
      });

      setAttendanceHistory(filteredData);
      setLoading(false);
    };

    getAttendance();
  }, [selectedDate]);

  const onValueChange = useCallback(
    (event: any, newDate: any) => {
      const selectDate = newDate || selectedDate;
      showPicker(false);
      setSelectedDate(selectDate);
    },
    [selectedDate, showPicker],
  );

  const styles = useMemo(() => {
    return StyleSheet.create({
      safeContainer: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
      },
      container: {
        flex: 1,
        padding: hp(16),
      },
      screenTitle: {
        ...TEXT_STYLE.bold,
        fontSize: hp(24),
        textAlign: 'center',
        marginTop: hp(10),
        textTransform: 'capitalize',
      },
      btnContainer: {
        backgroundColor: COLORS.PRIMARY,
        width: '60%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(10),
        borderRadius: hp(8),
      },
      btnText: {
        ...TEXT_STYLE.medium,
        fontSize: hp(18),
        paddingVertical: hp(16),
        color: COLORS.WHITE,
      },
      listContainer: {
        marginVertical: hp(10),
        marginBottom: hp(100),
        // paddingBottom:hp(50)
      },
      cardContainer: {
        padding: hp(16),
        backgroundColor: COLORS.WHITE,
        marginTop: hp(10),
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: hp(8),
        elevation: 2,
        overflow: 'hidden',
      },
      dateText: {
        // ...TEXT_STYLE.bold,
        fontSize: hp(16),
        color: COLORS.BLACK,
        fontWeight: '600',
        marginBottom: hp(10),
      },
      detailText: {
        ...TEXT_STYLE.regular,
        fontSize: hp(16),
        marginLeft: hp(10),
      },
      detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: hp(5),
      },
      label: {
        ...TEXT_STYLE.medium,
        fontSize: hp(18),
        color: COLORS.BLUE,
        marginLeft: hp(10),
        marginBottom: hp(5),
      },
      timesContainer: {
        width: '100%',
        flexDirection: 'row',
      },
    });
  }, [hp, wp, TEXT_STYLE]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>{appLang.history.title}</Text>
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => setOpen(true)}>
          <Text style={styles.btnText}>
            {moment(selectedDate).format('MMMM YYYY')}
          </Text>
        </TouchableOpacity>
        {open && (
          <MonthPicker
            onChange={onValueChange}
            value={selectedDate}
            locale="en"
          />
        )}
        {loading ? (
          <ActivityIndicator color={COLORS.PRIMARY} size={'large'} />
        ) : attendanceHistory.length === 0 ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>{appLang.history.noData}</Text>
          </View>
        ) : (
          <Animated.View style={[styles.listContainer, animatedStyle]}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={attendanceHistory}
              keyExtractor={item => item.id}
              renderItem={({item}) => {
                const {
                  currentLocationNameWhileCheckingIn,
                  currentLocationNameWhileCheckingOut,
                  date,
                  selectedLocationName,
                  checkInTime,
                  checkOutTime,
                } = item;
                // console.log("currentLocationNameWhileCheckingIn===>",currentLocationNameWhileCheckingIn);
                const newDate = new Date(date);
                const dayName = newDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                });
                return (
                  <TouchableOpacity
                    style={styles.cardContainer}
                    onPress={() =>
                      navigation.navigate(SCREENS.ATTENDANCE_DETAILS as never, {
                        data: item,
                      })
                    }>
                    <Text style={styles.dateText}>{formattedDate(date)}</Text>
                    <View style={styles.detailsContainer}>
                      <AnyIcon
                        type={IconType.FontAwesome6}
                        name="calendar-day"
                        color={COLORS.PRIMARY}
                        size={hp(18)}
                      />
                      <Text style={styles.detailText}>{dayName}</Text>
                    </View>
                    <View style={styles.detailsContainer}>
                      <AnyIcon
                        type={IconType.Ionicons}
                        name="time-sharp"
                        color={COLORS.PRIMARY}
                        size={hp(18)}
                      />
                      <View style={styles.timesContainer}>
                        <View
                          style={{
                            width: '50%',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                          }}>
                          <Text style={styles.label}>
                            {appLang.history.checkIn}
                          </Text>
                          <Text style={styles.detailText}>
                            {checkInTime === null
                              ? '---'
                              : checkInTime}
                          </Text>
                        </View>
                        <View
                          style={{
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                          }}>
                          <Text style={styles.label}>
                            {appLang.history.checkOut}
                          </Text>
                          <Text style={styles.detailText}>
                            {checkOutTime === null
                              ? '---'
                              : checkOutTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <AnyIcon
                        type={IconType.Entypo}
                        name="location-pin"
                        color={COLORS.PRIMARY}
                        size={hp(18)}
                      />
                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                        }}>
                        <Text style={styles.label}>
                          {appLang.history.selectedLocation}
                        </Text>
                        <Text style={styles.detailText}>
                          {selectedLocationName}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <AnyIcon
                        type={IconType.Entypo}
                        name="location-pin"
                        color={COLORS.PRIMARY}
                        size={hp(18)}
                      />
                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                        }}>
                        <Text style={styles.label}>
                          {appLang.history.currentLocationWhileCheckingIn}
                        </Text>
                        <Text style={styles.detailText}>
                          {currentLocationNameWhileCheckingIn !== null
                            ? currentLocationNameWhileCheckingIn
                            : '---'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <AnyIcon
                        type={IconType.Entypo}
                        name="location-pin"
                        color={COLORS.PRIMARY}
                        size={hp(18)}
                      />
                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                        }}>
                        <Text style={styles.label}>
                          {appLang.history.currentLocationWhileCheckingOut}
                        </Text>
                        <Text style={styles.detailText}>
                          {currentLocationNameWhileCheckingOut !== null
                            ? currentLocationNameWhileCheckingOut
                            : '---'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};
