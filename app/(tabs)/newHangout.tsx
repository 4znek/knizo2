import React, { useState } from "react";
import { StyleSheet, Platform, View, KeyboardAvoidingView } from "react-native";
import { Input, Button } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { blue } from "react-native-reanimated/lib/typescript/Colors";

export default function NewHangoutScreen() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [maxPeople, setMaxPeople] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDatePress = () => setShowDatePicker(true);
  const handleTimePress = () => setShowTimePicker(true);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === "android") {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString();
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.headerContainer}>
            <ThemedText style={styles.pageTitle}>Post a Hangout</ThemedText>
          </View>

          <View style={styles.formContainer}>
            <Input
              placeholder="Give your hangout a name"
              value={title}
              onChangeText={setTitle}
              label="Title"
              labelStyle={styles.inputLabel}
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="Where will it take place?"
              value={location}
              onChangeText={setLocation}
              label="Location"
              labelStyle={styles.inputLabel}
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="What's the plan?"
              value={description}
              onChangeText={setDescription}
              label="Description"
              multiline
              numberOfLines={4}
              labelStyle={styles.inputLabel}
              inputContainerStyle={styles.textArea}
              containerStyle={styles.inputContainer}
            />

            <View style={styles.dateTimeContainer}>
              <Input
                placeholder="Select date"
                value={formatDate(date)}
                label="Date"
                labelStyle={styles.inputLabel}
                containerStyle={[styles.dateTimeInput, styles.inputContainer]}
                disabled
                onPressIn={handleDatePress}
              />

              <Input
                placeholder="Select time"
                value={formatTime(date)}
                label="Time"
                labelStyle={styles.inputLabel}
                containerStyle={[styles.dateTimeInput, styles.inputContainer]}
                disabled
                onPressIn={handleTimePress}
              />
            </View>

            <Input
              placeholder="Maximum number of people"
              value={maxPeople}
              onChangeText={setMaxPeople}
              keyboardType="numeric"
              label="Number of People"
              labelStyle={styles.inputLabel}
              containerStyle={styles.inputContainer}
            />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Preview"
              type="outline"
              containerStyle={[styles.button]}
							buttonStyle={{
								borderColor: '#3498db',
								borderWidth: 2,
								backgroundColor: 'white',
								paddingVertical: 10,
								borderRadius: 10,
							}}
              titleStyle={styles.buttonText}
              onPress={() => {}}
            />
            <Button
              title="Post"
              containerStyle={styles.button}
              titleStyle={styles.buttonText}
							buttonStyle={{
								borderWidth: 2,
								paddingVertical: 10,
								borderRadius: 10,
							}}
              onPress={() => {}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 40,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  pageTitle: {
		paddingTop: 12,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  formContainer: {
    gap: 4,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#86939e',
    marginBottom: 6,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateTimeInput: {
    flex: 1,
    padding: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});