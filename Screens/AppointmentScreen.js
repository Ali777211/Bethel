import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { firestore, auth } from "../Managers/FirebaseManager";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const genderTypes = [
  { label: "Select Gender", value: "Select Gender" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export default function AppointmentScreen({ route, navigation }) {
  const { doctor } = route.params;
  const [userData, setUserData] = useState({ name: "Citizen" });
  const [role, setRole] = useState(null);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const userString = await AsyncStorage.getItem("userData");
      const userRole = await AsyncStorage.getItem("role");
      if (userString) setUserData(JSON.parse(userString));
      if (userRole) setRole(userRole);
    };
    loadData();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!age.trim()) newErrors.age = "Age is required";
    else if (isNaN(age) || parseInt(age) < 1 || parseInt(age) > 120)
      newErrors.age = "Please enter a valid age (1-120)";
    if (!gender.trim()) newErrors.gender = "Gender is required";
    if (!bloodType.trim()) newErrors.bloodType = "Blood type is required";
    if (!emergencyContact.trim())
      newErrors.emergencyContact = "Emergency contact is required";
    else if (emergencyContact.length < 10)
      newErrors.emergencyContact = "Please enter a valid phone number";
    if (!address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseTime = (timeStr) => {
    const isPM = timeStr.toUpperCase().includes("PM");
    const clean = timeStr.replace(/AM|PM/i, "").trim();
    const [hourStr, minuteStr = "0"] = clean.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return { hour, minute };
  };

  const parseAvailability = (availabilityStr) => {
    const lastCommaIndex = availabilityStr.lastIndexOf(",");
    if (lastCommaIndex === -1) throw new Error("Invalid availability format");

    const daysPart = availabilityStr.substring(0, lastCommaIndex).trim();
    const timePart = availabilityStr.substring(lastCommaIndex + 1).trim();

    const daysRange = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    let allowedDays = [];

    if (daysPart.includes("-")) {
      const [startDayStr, endDayStr] = daysPart.split("-").map((s) => s.trim());
      const startDay = daysRange[startDayStr];
      const endDay = daysRange[endDayStr];
      if (startDay <= endDay) {
        for (let d = startDay; d <= endDay; d++) allowedDays.push(d);
      } else {
        for (let d = startDay; d <= 6; d++) allowedDays.push(d);
        for (let d = 0; d <= endDay; d++) allowedDays.push(d);
      }
    } else {
      allowedDays = daysPart
        .split(",")
        .map((dayStr) => daysRange[dayStr.trim()])
        .filter((d) => d !== undefined);
    }

    const [startTimeStr, endTimeStr] = timePart.split("-").map((s) => s.trim());
    return {
      allowedDays,
      startTime: parseTime(startTimeStr),
      endTime: parseTime(endTimeStr),
    };
  };

  const isDateWithinAvailability = (selectedDate, availabilityArray) => {
    for (const availability of availabilityArray) {
      const { allowedDays, startTime, endTime } =
        parseAvailability(availability);

      const selectedDay = selectedDate.getDay();
      const selectedTotalMinutes =
        selectedDate.getHours() * 60 + selectedDate.getMinutes();
      const startTotalMinutes = startTime.hour * 60 + startTime.minute;
      const endTotalMinutes = endTime.hour * 60 + endTime.minute;

      if (
        allowedDays.includes(selectedDay) &&
        selectedTotalMinutes >= startTotalMinutes &&
        selectedTotalMinutes < endTotalMinutes
      ) {
        return true;
      }
    }
    return false;
  };

  const handleBookAppointment = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please correct the highlighted fields.");
      return;
    }

    const availabilityArr = Array.isArray(doctor.availability)
      ? doctor.availability
      : [doctor.availability];

    if (!isDateWithinAvailability(date, availabilityArr)) {
      Alert.alert(
        "Invalid Time",
        `Please choose a time within the doctor's availability:\n\n${availabilityArr.join(
          "\n"
        )}`
      );
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Authentication Required", "Please log in to continue.");
        return;
      }

      const appointmentData = {
        doctorId: doctor.id || doctor.name,
        doctorName: doctor.name,
        patientId: currentUser.uid,
        patientEmail: currentUser.email,
        patientName: userData.name || "Citizen",
        hospitalId: doctor.hospitalId,
        appointmentTime: Timestamp.fromDate(date),
        status: "booked",
        notes,
        bookedAt: Timestamp.now(),
        age: parseInt(age),
        gender,
        bloodType,
        emergencyContact,
        address,
      };

      const docRef = await addDoc(
        collection(firestore, "appointments"),
        appointmentData
      );

      const patientRef = doc(firestore, "patients", currentUser.uid);
      const patientDoc = await getDoc(patientRef);

      const appointmentEntry = {
        hospitalId: doctor.hospitalId,
        appointmentId: docRef.id,
        doctorId: doctor.id || doctor.name,
        doctorName: doctor.name,
        date: Timestamp.fromDate(date),
        notes,
      };

      if (patientDoc.exists()) {
        await updateDoc(patientRef, {
          hospitalId: doctor.hospitalId,
          updatedAt: Timestamp.now(),
          age: parseInt(age),
          gender,
          bloodType,
          emergencyContact,
          address,
          appointments: arrayUnion(appointmentEntry),
        });
      } else {
        await setDoc(patientRef, {
          name: userData.name || "Citizen",
          email: currentUser.email,
          hospitalId: doctor.hospitalId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          age: parseInt(age),
          gender,
          bloodType,
          emergencyContact,
          address,
          appointments: [appointmentEntry],
        });
      }

      navigation.goBack();
    } catch (err) {
      console.error("Booking error:", err);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Doctor: {doctor.name}</Text>

        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.dateBtn}>
          <Text>{date.toLocaleString()}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          date={date}
          minimumDate={new Date()}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        {errors.age && <Text style={styles.error}>{errors.age}</Text>}

        <Text style={styles.label}>Gender</Text>
        <Picker selectedValue={gender} onValueChange={setGender}>
          {genderTypes.map((g) => (
            <Picker.Item key={g.value} label={g.label} value={g.value} />
          ))}
        </Picker>
        {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

        <Text style={styles.label}>Blood Type</Text>
        <TextInput
          style={styles.input}
          value={bloodType}
          onChangeText={setBloodType}
        />
        {errors.bloodType && (
          <Text style={styles.error}>{errors.bloodType}</Text>
        )}

        <Text style={styles.label}>Emergency Contact</Text>
        <TextInput
          style={styles.input}
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          keyboardType="phone-pad"
        />
        {errors.emergencyContact && (
          <Text style={styles.error}>{errors.emergencyContact}</Text>
        )}

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={address}
          onChangeText={setAddress}
          multiline
        />
        {errors.address && <Text style={styles.error}>{errors.address}</Text>}

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity
          onPress={handleBookAppointment}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Book Appointment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
  },
  dateBtn: {
    padding: 10,
    marginTop: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  button: {
    backgroundColor: "#1E40AF",
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
