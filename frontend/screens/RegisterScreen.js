import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform 
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Title,
  Card,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { register } from '../api/auth';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin ditolak', 'Aplikasi memerlukan izin untuk mengakses galeri');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleRegister = async () => {  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    
    if (photo) {
      formData.append('photo', {
        uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        type: photo.mimeType,
        name: photo.fileName,
      });
    }
  
    try {
      await register(formData);
      Alert.alert('Sukses', 'Akun berhasil dibuat!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Registrasi Akun</Title>
          <Text style={styles.subtitle}>Hara mendaftarkan akun terlebih dahulu</Text>

          <TextInput
            label="Nama"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />

          <Button mode="outlined" onPress={handleChoosePhoto}>
            Pilih Foto Profil
          </Button>

          {photo && (
            <Image
              source={{ uri: photo.uri }}
              style={styles.preview}
            />
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
          >
            Register
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerText}>
              Sudah punya akun? <Text style={styles.link}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  registerText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#333',
  },
  link: {
    color: '#1e88e5',
    fontWeight: 'bold',
  },
  preview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  }
});
