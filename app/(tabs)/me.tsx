import { StyleSheet, Image, View, ScrollView, Dimensions, Switch } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@rneui/themed";
import React, { useState } from 'react';

const { width, height } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = 75;

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <ThemedView style={styles.headerContainer}>
        <View style={styles.profileRow}>
          <Image
            style={styles.profileImage}
            source={require('@/assets/images/adaptive-icon.png')}
          />
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.nameText}>evanDoe</ThemedText>
            <ThemedText style={styles.classText}>Class of 2027</ThemedText>
            <ThemedText style={styles.majorText}>Undeclared</ThemedText>
          </View>

          <View style={styles.editIconContainer}>
            <Ionicons name="pencil" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.bioContainer}>
          <ThemedText style={styles.bioText}>
            If I were a class, I would be Psych101
          </ThemedText>
        </View>

        <View style={styles.interestsContainer}>
          <View style={styles.tagsContainer}>
            {['Basketball', 'Volleyball', 'Astronomy', 'Psychology', 'Electronic & Dance'].map((interest, index) => (
              <View key={index} style={styles.tag}>
                <ThemedText style={styles.tagText}>{interest}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ThemedView>

      {/* Settings Sections */}
      <View style={styles.settingsContainer}>
        {/* General Settings */}
        <ThemedText style={styles.sectionTitle}>General Settings</ThemedText>
        <View style={styles.settingRow}>
          <ThemedText style={styles.settingText}>Dark mode</ThemedText>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>

        <View style={styles.separator} />

        {/* Questionnaire Settings */}
        <ThemedText style={styles.sectionTitle}>Questionnaire Settings</ThemedText>
        <View style={styles.settingRow}>
          <ThemedText style={styles.settingText}>Personality test</ThemedText>
          <Button
            title="Retake"
            type="clear"
            size="sm"
          />
        </View>
        <View style={styles.settingRow}>
          <ThemedText style={styles.settingText}>Interests list</ThemedText>
          <Button
            title="Update"
            type="clear"
            size="sm"
          />
        </View>
        <View style={styles.settingRow}>
          <ThemedText style={styles.settingText}>Lifestyle questions</ThemedText>
          <Button
            title="Retake"
            type="clear"
            size="sm"
          />
        </View>

        <View style={styles.separator} />

        {/* Contact */}
        <ThemedText style={styles.sectionTitle}>Contact</ThemedText>
        <View style={styles.settingRow}>
          <ThemedText style={styles.settingText}>Knizo Help Center</ThemedText>
          <Button
            title="Get Help"
            type="clear"
            size="sm"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 20,
    margin: 20,
    marginTop: 90,
    borderColor: '#000',
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 2,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    backgroundColor: '#DDD',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    height: PROFILE_IMAGE_SIZE,
    marginLeft: 10,
  },
  editIconContainer: {
    height: PROFILE_IMAGE_SIZE,
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
	settingText: {
		color: '#000',
	},
  classText: {
    color: '#000',
    fontSize: 16,
    marginTop: 4,
  },
  majorText: {
    color: '#000',
    fontSize: 16,
    marginTop: 2,
  },
  bioContainer: {
    marginTop: 14,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
  },
  interestsContainer: {
    marginTop: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: '#FFF',
    fontSize: 14,
  },
  // Settings Styles
  settingsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
    width: '100%',
  },
});