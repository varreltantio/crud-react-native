import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  View,
  Platform
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Avatar,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { getProfile, updateProfile } from '../api/auth';
import { withAuthToken } from '../helpers/apiHelper';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await withAuthToken(getProfile);
        const data = res.data;
        
        if (data.id) {
          setProfile(data);
          setEmail(data.email);
          setName(data.name);
          setPhoto(data.photo);
        } else {
          Alert.alert('Error', 'Gagal mengambil profil, silakan login ulang.');
          navigation.replace('Login');
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Gagal mengambil profil');
        navigation.replace('Login');
      }
    }
    loadProfile();
  }, []);

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

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      if (password) formData.append('password', password);

      if (photo && photo.uri) {
        formData.append('photo', {
          uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
          type: photo.mimeType,
          name: photo.fileName,
        });
      }

      const res = await withAuthToken(updateProfile, formData);

      if (res.data.message) {
        Alert.alert('Sukses', res.data.message);
        setPassword('');
      } else {
        Alert.alert('Error', 'Gagal update profil');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  if (!profile) return <Text style={styles.loading}>Memuat data...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.centerContent}>
              {photo && typeof photo === 'string' ? (
                <Avatar.Image
                  size={64}
                  source={{ uri: `${API_URL}/uploads/${photo}` }}
                  style={styles.avatar}
                />
              ) : photo?.uri ? (
                <Avatar.Image
                  size={64}
                  source={{ uri: photo.uri }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Icon size={64} icon="account" style={styles.avatar} />
              )}

              <Button onPress={handleChoosePhoto} mode="outlined" style={{ marginTop: 10 }}>
                Pilih Foto
              </Button>

              <Title style={styles.title}>Profil Pengguna</Title>
              <Paragraph>Kelola informasi akun Anda di sini.</Paragraph>
            </View>

            <Text style={styles.profileText}>Nama: {profile.name}</Text>
            <Text style={styles.profileText}>Email saat ini: {profile.email}</Text>

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
              autoCapitalize="none"
              style={styles.input}
              keyboardType="email-address"
            />

            <TextInput
              label="Password Baru"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              placeholder="Kosongkan jika tidak diubah"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleUpdate}
              style={styles.button}
            >
              Simpan Perubahan
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    marginTop: 10,
    marginBottom: 10,
  },
  profileText: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    marginTop: 15,
  },
  button: {
    marginTop: 25,
  },
  logoutButton: {
    marginTop: 10,
    borderColor: 'red',
  },
  loading: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 18,
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 10,
  },
});
