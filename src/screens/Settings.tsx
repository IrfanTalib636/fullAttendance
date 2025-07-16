import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useMemo, useState} from 'react';
import {useResponsiveDimensions} from '../hooks';
import {COLORS, TEXT_STYLE} from '../enums';
import {AnyIcon, DropdownComponent, IconType} from '../components';
import {AppDataContext} from '../context/AppDataContext';
import {handleLogout} from '../firebase/firebaseConfig';
import {language} from '../utils';

export const Settings = () => {
  const {appLang, setActiveLang, activeLang} = useContext(AppDataContext);
  const [languageVal, setLanguageVal] = useState(activeLang);
  const {hp, wp} = useResponsiveDimensions();
  const [loading, setLoading] = useState(false);

  const switchLanguage = (lang: string) => {
    setActiveLang(lang);
  };

  const handleLanguage = (val: any) => {
    switchLanguage(val);
    setLanguageVal(val);
  };

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        padding: hp(26),
        backgroundColor: COLORS.WHITE,
      },
      screenTitle: {
        ...TEXT_STYLE.bold,
        fontSize: hp(30),
        fontWeight: '700',
        textAlign: 'center',
        marginTop: hp(30),
      },
      buttonsContainer: {
        marginTop: hp(30),
      },
      btnContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
      },
      btnText: {
        ...TEXT_STYLE.medium,
        fontSize: hp(24),
        color: COLORS.BLACK,
        marginLeft: hp(20),
      },
      logOutContainer: {
        height: hp(50),
        width: '80%',
        alignSelf: 'center',
        position: 'absolute',
        bottom: hp(50),
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp(26),
      },
      logOutText: {
        ...TEXT_STYLE.medium,
        fontSize: hp(24),
        color: COLORS.WHITE,
      },
      label: {
        marginBottom: hp(5),
        ...TEXT_STYLE.medium,
        fontSize: hp(18),
        color: COLORS.PRIMARY,
      },
    });
  }, [hp, wp]);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>{appLang.settings.title}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.btnContainer}>
          <AnyIcon
            type={IconType.Feather}
            name="user"
            color={COLORS.PRIMARY}
            size={hp(20)}
          />
          <Text style={styles.btnText}>{appLang.settings.profile}</Text>
        </TouchableOpacity>
      </View>
      <View style={{width: '100%', marginTop: hp(30)}}>
        <Text style={styles.label}>{appLang.settings.language}</Text>
        <DropdownComponent
          data={language}
          value={languageVal}
          handleValue={handleLanguage}
          placeholder={'Language'}
          fullWidth
        />
      </View>
      <TouchableOpacity
        style={styles.logOutContainer}
        onPress={() => handleLogout(setLoading)}>
        {loading ? (
          <ActivityIndicator color={COLORS.WHITE} />
        ) : (
          <Text style={styles.logOutText}>{appLang.settings.logout}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
