import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useContext, useMemo} from 'react';
import {useResponsiveDimensions} from '../hooks';
import {COLORS, TEXT_STYLE} from '../enums';
import {AnyIcon, BackButton, IconType, Map} from '../components';
import {useRoute} from '@react-navigation/native';
import {AppDataContext} from '../context/AppDataContext';
import {convertUtcToLocalTime, formattedDate} from '../utils';

export const AttendanceDetails = () => {
  const {appLang} = useContext(AppDataContext);
  const route = useRoute();
  const {data} = route?.params as any;
  const newDate = new Date(data?.date);
  const dayName = newDate.toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const {hp, wp} = useResponsiveDimensions();

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
      map: {
        height: hp(300),
        width: '100%',
        marginTop: hp(10),
      },
      label: {
        ...TEXT_STYLE.bold,
        fontSize: hp(16),
        color: COLORS.BLUE,
        marginLeft: hp(10),
      },
      labelContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: hp(10),
      },
      detailText: {
        ...TEXT_STYLE.regular,
        fontSize: hp(16),
        marginLeft: hp(10),
        color: COLORS.BLACK,
      },
    });
  }, [hp, wp, COLORS]);
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <BackButton />
          <View style={styles.labelContainer}>
            <AnyIcon
              type={IconType.Entypo}
              name="location-pin"
              color={COLORS.PRIMARY}
              size={hp(18)}
            />
            <View
              style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <Text style={{...styles.label, marginLeft: hp(10)}}>
                {appLang.history.selectedLocation}
              </Text>
              <Text style={styles.detailText}>
                {data?.selectedLocationName}
              </Text>
            </View>
          </View>
          <View style={{width: '100%', height: hp(300)}}>
            <Map
              latitude={data?.selectedLocationCoords?.latitude || 0}
              longitude={data?.selectedLocationCoords?.longitude || 0}
            />
          </View>
          <View style={styles.labelContainer}>
            <AnyIcon
              type={IconType.Entypo}
              name="location-pin"
              color={COLORS.PRIMARY}
              size={hp(18)}
            />
            <View
              style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <Text style={{...styles.label, marginLeft: hp(10)}}>
                {appLang.history.currentLocationWhileCheckingIn}
              </Text>
              <Text style={styles.detailText}>
                {data?.currentLocationNameWhileCheckingIn !== null
                  ? data?.currentLocationNameWhileCheckingIn
                  : '---'}
              </Text>
            </View>
            <Text></Text>
          </View>
          <View style={{width: '100%', height: hp(300)}}>
            <Map
              latitude={
                data?.currentLocationCoordsWhileCheckingIn?.latitude || 0
              }
              longitude={
                data?.currentLocationCoordsWhileCheckingIn?.longitude || 0
              }
            />
          </View>
          <View style={styles.labelContainer}>
            <AnyIcon
              type={IconType.Entypo}
              name="location-pin"
              color={COLORS.PRIMARY}
              size={hp(18)}
            />
            <View
              style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <Text style={{...styles.label, marginLeft: hp(10)}}>
                {appLang.history.currentLocationWhileCheckingOut}
              </Text>
              <Text style={styles.detailText}>
                {data?.currentLocationNameWhileCheckingOut
                  ? data?.currentLocationNameWhileCheckingOut
                  : '---'}
              </Text>
            </View>
            <Text></Text>
          </View>
          <View style={{width: '100%', height: hp(300)}}>
            <Map
              latitude={
                data?.currentLocationCoordsWhileCheckingOut?.latitude || 0
              }
              longitude={
                data?.currentLocationCoordsWhileCheckingOut?.longitude || 0
              }
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: hp(20),
            }}>
            <View style={styles.labelContainer}>
              <AnyIcon
                type={IconType.Fontisto}
                name="date"
                color={COLORS.PRIMARY}
                size={hp(18)}
              />
              <Text style={styles.label}>{appLang.detail.date}</Text>
            </View>
            <Text>{formattedDate(data?.date)}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: hp(20),
            }}>
            <View style={styles.labelContainer}>
              <AnyIcon
                type={IconType.FontAwesome6}
                name="calendar-day"
                color={COLORS.PRIMARY}
                size={hp(18)}
              />
              <Text style={styles.label}>{appLang.detail.day}</Text>
            </View>
            <Text>{dayName}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: hp(20),
            }}>
            <View style={styles.labelContainer}>
              <AnyIcon
                type={IconType.Ionicons}
                name="time-sharp"
                color={COLORS.PRIMARY}
                size={hp(18)}
              />
              <Text style={styles.label}>{appLang.history.checkIn}</Text>
            </View>
            <Text>
              {data?.checkInTime === null
                ? '---'
                : convertUtcToLocalTime(data?.checkInTime, '12')}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: hp(20),
            }}>
            <View style={styles.labelContainer}>
              <AnyIcon
                type={IconType.Ionicons}
                name="time-sharp"
                color={COLORS.PRIMARY}
                size={hp(18)}
              />
              <Text style={styles.label}>{appLang.history.checkOut}</Text>
            </View>
            <Text>
              {data?.checkOutTime === null
                ? '---'
                : convertUtcToLocalTime(data?.checkOutTime, '12')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
