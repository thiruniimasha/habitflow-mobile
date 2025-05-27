import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { saveUser } from '../services/storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Icons } from '../utils/Icon';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};


type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSignUp = async () => {
   
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid email format');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    await saveUser({ name, email, password });
    Alert.alert('Sign Up Successfully');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Sign Up</Text>
        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.loginText}>Log In </Text>
            <Image source={Icons.vector} style={styles.arrowIcon} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <Text style={styles.label}>Password Confirmation</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={onSignUp}>
          <LinearGradient
            colors={['#FFA450', '#FF5C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
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
  loginLink: {
    marginTop: 113,
    marginRight: 40,

    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#FF7831',
    fontSize: 16,
    fontWeight: '500',
  },
  arrowIcon: {
    width: 8,
    height: 13,
    marginLeft: 5,
  },
  form: {
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
  button: {
    borderRadius: 4,
    width: 300,
    height: 49,
    marginRight: 38,
    padding: 14,
    alignItems: 'center',
    marginTop: 48,
  },
  buttonText: {
    color: '#FBFBFB',
    fontSize: 14,
    fontWeight: '800',
  },
});



export default RegisterScreen;
