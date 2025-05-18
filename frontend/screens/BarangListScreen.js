import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import { Card, Paragraph, Avatar, IconButton, FAB, Searchbar } from 'react-native-paper';
import { withAuthToken } from '../helpers/apiHelper';
import { getAllBarang, deleteBarang } from '../api/barang';
import { API_URL } from '@env';

export default function BarangListScreen({ navigation }) {
  const [barangs, setBarangs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadBarang();
    }, [])
  );

  const loadBarang = async () => {
    try {
      const res = await withAuthToken(getAllBarang);
      setBarangs(res.data);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Konfirmasi', 'Hapus barang ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        onPress: async () => {
          try {
            await withAuthToken(deleteBarang, id);
            loadBarang();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari barang..."
        onChangeText={(query) => setSearchQuery(query)}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {barangs
          .filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => (
          <Card key={item.id} style={styles.card}>
            <Card.Title title={item.name} />
            <Card.Content>
              <Paragraph>{item.description}</Paragraph>
              <Paragraph>Kondisi: {item.condition}</Paragraph>
              {item.photo && (
                <Avatar.Image
                  size={64}
                  source={{ uri: `${API_URL}/uploads/${item.photo}` }}
                  style={{ marginVertical: 10 }}
                />
              )}
              <View style={styles.actionRow}>
                <View style={styles.actionButton}>
                  <IconButton
                    icon="pencil"
                    iconColor="#ffffff"
                    style={{ backgroundColor: '#4caf50' }}
                    onPress={() => navigation.navigate('BarangForm', { barang: item })}
                  />
                </View>
                <View style={styles.actionButton}>
                  <IconButton
                    icon="delete"
                    iconColor="#ffffff"
                    style={{ backgroundColor: '#f44336' }}
                    onPress={() => handleDelete(item.id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('BarangForm')}
        color="white"
        customSize={56}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    marginBottom: 10,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
    padding: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    marginVertical: 10,
    padding: 10,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee', 
    elevation: 5,
  },
});
