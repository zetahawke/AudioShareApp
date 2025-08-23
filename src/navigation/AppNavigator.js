import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FAQScreen from '../screens/FAQScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
const Stack = createStackNavigator();
const AppNavigator = () => {
    const { isAuthenticated } = useAuth();
    return (<NavigationContainer>
      <Stack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}>
        {!isAuthenticated ? (
        // Auth screens
        <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
          </>) : (
        // Main app screens
        <>
            <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }}/>
            <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }}/>
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }}/>
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }}/>
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ title: 'Terms of Service' }}/>
            <Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: 'Contact Us' }}/>
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }}/>
            <Stack.Screen name="FAQ" component={FAQScreen} options={{ title: 'FAQ' }}/>
            <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ title: 'Audio Player' }}/>
          </>)}
      </Stack.Navigator>
    </NavigationContainer>);
};
export default AppNavigator;
