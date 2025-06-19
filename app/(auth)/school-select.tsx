import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const universities = [
  'ALMA COLLEGE',
  'AMHERST COLLEGE',
  'BOSTON UNIVERSITY',
  'CARNEGIE MELLON UNIVERSITY',
  'COLUMBIA UNIVERSITY',
  'CORNELL UNIVERSITY',
  'DARTMOUTH COLLEGE',
  'DEPAUW UNIVERSITY',
  'DUKE KUNSHAN UNIVERSITY',
  'DUKE UNIVERSITY',
  'EMERSON COLLEGE',
  'GRINNELL COLLEGE',
  'HAMILTON COLLEGE',
  'HAMPSHIRE COLLEGE',
  'IE UNIVERSITY',
  'ILLINOIS INSTITUTE OF TECHNOLOGY',
  'JOHNS HOPKINS UNIVERSITY',
  'NEW YORK UNIVERSITY (SHANGHAI)',
  'NEW YORK UNIVERSITY',
  'POMONA COLLEGE',
  'RHODES COLLEGE',
  'RICE UNIVERSITY',
  'STANFORD UNIVERSITY',
  'TRINITY COLLEGE',
];

export default function SchoolSelect() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUniversities = universities.filter((uni) =>
    uni.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUniversity = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.universityItem}
      onPress={() => router.push('/(auth)/login')}
    >
      <Text style={styles.universityText}>{item}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find your campus</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your school"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredUniversities}
        renderItem={renderUniversity}
        keyExtractor={(item) => item}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  list: {
    flex: 1,
  },
  universityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  universityText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
}); 