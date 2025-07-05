import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { firestore, auth } from "../Managers/FirebaseManager";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

export default function AppointmentScreen({ route, navigation }) {
  const { doctor } = route.params;

  // Patient info states
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");

  const genderTypes = [
    { label: "Select Gender", value: "" },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const [errors, setErrors] = useState({});

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!age) newErrors.age = "Age is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!bloodType) newErrors.bloodType = "Blood type is required";
    if (!emergencyContact) newErrors.emergencyContact = "Emergency contact is required";
    if (!address) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookAppointment = async () => {
    if (!validateForm()) {
      Alert.alert("Please fill all fields correctly.");
      return;
    }
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Login required.");
        return;
      }

      const appointmentData = {
        doctorName: doctor.name,
        patientId: currentUser.uid,
        appointmentTime: Timestamp.fromDate(date),
        status: "booked",
        notes,
        age,
        gender,
        bloodType,
        emergencyContact,
        address,
        bookedAt: Timestamp.now(),
      };

      await addDoc(collection(firestore, "appointments"), appointmentData);

      Alert.alert("Success", "Appointment booked!");
      navigation.goBack();
    } catch (err) {
      console.error("Error:", err);
      Alert.alert("Error", "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Book Appointment</Text>
        </View>

        {/* Doctor */}
        <View style={styles.doctorCard}>
          <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          {errors.age && <Text style={styles.error}>{errors.age}</Text>}

          <Picker
            selectedValue={gender}
            onValueChange={(value) => setGender(value)}
            style={styles.picker}
          >
            {genderTypes.map((g) => (
              <Picker.Item key={g.value} label={g.label} value={g.value} />
            ))}
          </Picker>
          {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Blood Type"
            value={bloodType}
            onChangeText={setBloodType}
          />
          {errors.bloodType && <Text style={styles.error}>{errors.bloodType}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Emergency Contact"
            keyboardType="phone-pad"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
          {errors.emergencyContact && <Text style={styles.error}>{errors.emergencyContact}</Text>}

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            multiline
          />
          {errors.address && <Text style={styles.error}>{errors.address}</Text>}

          {/* Date Picker */}
          <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleBookAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Book Appointment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
{/* 
        <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            date={date}
            minimumDate={new Date()}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
        /> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  scroll: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  doctorCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  doctorName: { fontSize: 18, fontWeight: "bold" },
  doctorSpecialty: { fontSize: 14, color: "#555" },
  inputGroup: { backgroundColor: "#fff", padding: 15, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  picker: { marginBottom: 10 },
  dateButton: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  dateText: { marginLeft: 10 },
  submitButton: { backgroundColor: "#4F46E5", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  submitText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", fontSize: 12, marginBottom: 5 },
});
