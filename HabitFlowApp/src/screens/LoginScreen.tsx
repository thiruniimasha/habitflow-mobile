import React, { useEffect, useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { getUser } from '../services/storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Icons } from '../utils/Icon';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    const user = await getUser();
    if (user) {
      navigation.replace('Home');
    }
  };

  const onLogin = async () => {
    const user = await getUser();
    if (user && user.email === email && user.password === password) {
      navigation.replace('Home');
    } else {
      Alert.alert('Invalid credentials');
    }
  };

  const onForgotPassword = () => {
   
    Alert.alert('Reset Password', 'Password reset functionality will be implemented here.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Log In</Text>
        <TouchableOpacity 
          style={styles.signUpLink} 
          onPress={() => navigation.navigate('Register')}
        >
           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.signUpText}>Sign Up</Text>
          <Image source={Icons.vector} style={styles.arrowIcon} />
        </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
         
          
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={styles.checkbox}>
              {rememberMe && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onLogin}>
          <LinearGradient
            colors={['#FF9833', '#FF5B31']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontFamily: 'Nunito',
    fontWeight: 'bold',
    fontSize: 44,
    color: '#2F2F2F',
    marginTop: 82,
    marginLeft: 40,
  },
  signUpLink: {
    marginTop: 113,
    marginRight: 40,

    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
   color: '#FF7831',
    fontSize: 16,
    fontWeight: '500',
  },
  arrowIcon: {
     width: 8,
    height: 13,
    marginLeft: 5,
  },
  formContainer: {
    flex: 1,
    marginRight: 38,
    marginLeft: 38,
  },
  
  label: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    width: 300,
    height: 42,
    marginBottom: 22,
    
    
    fontSize: 16,
  },
  
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 27,
    marginBottom: 39,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#666666',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FF5C00',
  },
  checkboxLabel: {
    fontFamily: 'Nunito',
    fontWeight: 'regular',
    fontSize: 14,
    color: '#7F7F7F',
  },
  forgotPasswordText: {
    fontFamily: 'Nunito',
    color: '#FF5C00',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
   borderRadius: 4,
    width: 300,
    height: 49,
    marginRight: 38,
    padding: 14,
    alignItems: 'center',
    marginTop: 48,
  },
  loginButtonText: {
    color: '#FBFBFB',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LoginScreen;