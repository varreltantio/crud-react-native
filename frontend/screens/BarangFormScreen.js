import React, { useState } from 'react';
import {
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Avatar,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { withAuthToken } from '../helpers/apiHelper';
import { createBarang, updateBarang } from '../api/barang';
import { API_URL } from '@env';

export default function BarangFormScreen({ navigation, route }) {
    const barang = route.params?.barang;
    const [nama, setNama] = useState(barang?.name || '');
    const [deskripsi, setDeskripsi] = useState(barang?.description || '');
    const [kondisi, setKondisi] = useState(barang?.condition || '');
    const [photo, setPhoto] = useState(barang?.photo ? { uri: `${API_URL}/uploads/${barang.photo}` } : null);

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Izin diperlukan');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
      const formData = new FormData();

      formData.append('name', nama);
      formData.append('description', deskripsi);
      formData.append('condition', kondisi);

      if (photo?.uri && !photo.uri.startsWith('http')) {
        formData.append('photo', {
          uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }

      try {
        if (barang) {
          await withAuthToken(updateBarang, barang.id, formData);
          Alert.alert('Berhasil', 'Barang diperbarui');
        } else {
          await withAuthToken(createBarang, formData);
          Alert.alert('Berhasil', 'Barang ditambahkan');
        }
        navigation.goBack();
      } catch (e) {
        Alert.alert('Gagal', e.message);
      }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{barang ? 'Edit Barang' : 'Tambah Barang'}</Title>
          <TextInput
            label="Nama"
            value={nama}
            onChangeText={setNama}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Deskripsi"
            value={deskripsi}
            onChangeText={setDeskripsi}
            style={styles.input}
            mode="outlined"
          />
            <Picker
                selectedValue={kondisi}
                onValueChange={(itemValue) => setKondisi(itemValue)}
                mode="dropdown"
            >
                <Picker.Item label="Pilih Kondisi" value="" enabled={false} />
                <Picker.Item label="Old" value="old" />
                <Picker.Item label="New" value="new" />
            </Picker>

          <Button onPress={handleChoosePhoto} mode="outlined" style={{ marginVertical: 10 }}>
            Pilih Foto
          </Button>

          {photo && <Avatar.Image size={64} source={{ uri: photo.uri }} />}

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            {barang ? 'Perbarui' : 'Tambah'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
    padding: 10,
    marginTop: 100
  },
  card: {
    marginVertical: 10,
    padding: 10,
  },
  input: {
    marginTop: 10,
  },
  submitButton: {
    marginTop: 15,
  },
});
