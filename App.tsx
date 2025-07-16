import { StyleSheet, View } from 'react-native'
import React from 'react'
import { AppNavigator } from './src/navigation'
import Toast from 'react-native-toast-message'
import { LeaderboardToast } from './src/components'
import { AppDataProvider } from './src/context/AppDataContext'

const App = () => {
  const toastConfig = {
    successToast: ({ text1, text2 }: { text1?: string; text2?: string }) => (
      <LeaderboardToast
        text1={text1 || ''}
        text2={text2 || ''}
        type="successLeaderboard"
      />
    ),
    errorToast: ({ text1, text2 }: { text1?: string; text2?: string }) => (
      <LeaderboardToast
        text1={text1 || ''}
        text2={text2 || ''}
        type="errorLeaderboard"
      />
    ),
    infoToast: ({ text1, text2 }: { text1?: string; text2?: string }) => (
      <LeaderboardToast
        text1={text1 || ''}
        text2={text2 || ''}
        type="infoLeaderboard"
      />
    ),
  };
  return (
    <View style={{flex:1}}>
      <AppDataProvider>
      <AppNavigator/>
      <Toast config={toastConfig} />
      </AppDataProvider>
    </View>
  )
}

export default App

const styles = StyleSheet.create({})