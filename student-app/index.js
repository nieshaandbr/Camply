import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import AppNavigator from './src/navigation/AppNavigator';

// This starts the app and points to the Navigation "Brain"
registerRootComponent(AppNavigator);