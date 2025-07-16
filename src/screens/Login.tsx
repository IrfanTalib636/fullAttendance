import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useMemo, useState} from 'react';
import {useResponsiveDimensions, useToast} from '../hooks';
import {COLORS, TEXT_STYLE} from '../enums';
import {useNavigation} from '@react-navigation/native';
import { loginWithUsername } from '../firebase/firebaseConfig';
import { AppDataContext } from '../context/AppDataContext';

export const Login = () => {
  const {appLang}=useContext(AppDataContext);
  const navigation = useNavigation<any>();
  const showToast = useToast();
  const {hp, wp} = useResponsiveDimensions();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        fontSize: hp(30),
        fontWeight: '700',
        textAlign: 'center',
        marginTop: hp(50),
      },
      formContainer: {
        marginTop: hp(50),
      },
      label: {
        ...TEXT_STYLE.regular,
        marginTop: hp(18),
        fontSize: hp(14),
        color: COLORS.PRIMARY_TEXT,
        fontWeight: '400',
      },
      input: {
        width: '100%',
        height: hp(50),
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: hp(8),
        marginTop: hp(5),
        paddingLeft: hp(10),
        color: COLORS.INPUT_TEXT,
      },
      passwordContainer: {
        width: '100%',
        height: hp(50),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: hp(8),
        marginTop: hp(5),
        paddingLeft: hp(10),
      },
      icon: {
        height: hp(20),
        width: hp(20),
        marginRight: hp(15),
      },
      btnContainer: {
        width: '100%',
        height: hp(50),
        backgroundColor: COLORS.PRIMARY,
        borderRadius: hp(30),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(30),
      },
      btnText: {
        ...TEXT_STYLE.regular,
        fontSize: hp(14),
        color: COLORS.WHITE,
        fontWeight: '500',
      },
    });
  }, [hp, wp]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>{appLang.login.login}</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>{appLang.login.username}</Text>
          <TextInput
            style={styles.input}
            placeholder={appLang.login.enterYourUsername}
            placeholderTextColor={COLORS.INPUT_PLACEHOLDER}
            value={email}
            onChangeText={text => setEmail(text)}
          />
          <Text style={styles.label}>{appLang.login.password}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={{flex: 1}}
              placeholder={appLang.login.enterYourPassword}
              secureTextEntry={!isPasswordVisible}
              placeholderTextColor={COLORS.INPUT_PLACEHOLDER}
              value={password}
              onChangeText={text => setPassword(text)}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Image
                style={styles.icon}
                source={
                  isPasswordVisible
                    ? require('../../assets/images/hide.png')
                    : require('../../assets/images/show.png')
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.btnContainer} onPress={()=>loginWithUsername(navigation,email,password,showToast,setLoading)}>
          {loading ? (
            <ActivityIndicator color={COLORS.WHITE}/>
          ):(
            <Text style={styles.btnText}>{appLang.login.login}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
