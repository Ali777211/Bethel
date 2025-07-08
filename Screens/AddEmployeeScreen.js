import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../Managers/FirebaseManager";

export default function AddEmployeeScreen({ navigation, route }) {
  const isEditing = route?.params?.employee;
  const existingEmployee = route?.params?.employee;
  const business = route?.params?.business;

  const [formData, setFormData] = useState({
    name: existingEmployee?.name || "",
    email: existingEmployee?.email || "",
    phone: existingEmployee?.phone || "",
    role: existingEmployee?.role || "staff",
    salary: existingEmployee?.salary?.replace("$", "").replace(",", "") || "",
    startDate:
      existingEmployee?.joinDate || new Date().toISOString().split("T")[0],
    address: existingEmployee?.address || "",
    emergencyContact: existingEmployee?.emergencyContact || "",
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["manager", "staff", "developer", "designer", "analyst"];

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
    }
    if (currentStep === 2) {
      if (!formData.salary) newErrors.salary = "Salary is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
    }
    if (currentStep === 3) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.emergencyContact)
        newErrors.emergencyContact = "Emergency contact is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      if (isEditing) {
        const ref = doc(firestore, "employees", existingEmployee.id);
        await updateDoc(ref, {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(firestore, "employees"), {
          ...formData,
          createdAt: new Date(),
          businessId: business.id,
          ownerId: auth.currentUser.uid,
        });
      }
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Something went wrong.");
    }
    setIsLoading(false);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const renderInput = (field, label, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] ? styles.inputError : undefined]}
        value={formData[field]}
        onChangeText={(text) => updateFormData(field, text)}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderStep = () => {
    if (currentStep === 1)
      return (
        <View>
          {renderInput("name", "Full Name")}
          {renderInput("email", "Email")}
          {renderInput("phone", "Phone")}
          <View style={styles.rolesContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  formData.role === role && styles.roleButtonSelected,
                ]}
                onPress={() => updateFormData("role", role)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === role && styles.roleButtonTextSelected,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    if (currentStep === 2)
      return (
        <View>
          {renderInput("salary", "Salary", { keyboardType: "numeric" })}
          {renderInput("startDate", "Start Date (YYYY-MM-DD)")}
        </View>
      );
    if (currentStep === 3)
      return (
        <View>
          {renderInput("address", "Address", { multiline: true })}
          {renderInput("emergencyContact", "Emergency Contact")}
        </View>
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerText}>
            {isEditing ? "Edit Employee" : "Add Employee"}
          </Text>
          <Text style={styles.stepText}>
            Step {currentStep} of {totalSteps}
          </Text>
          {renderStep()}

          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={handlePrevious}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              style={styles.primaryButton}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {currentStep === totalSteps
                  ? isEditing
                    ? "Update"
                    : "Add"
                  : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={isLoading}>
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1f2937",
  },
  stepText: {
    marginBottom: 20,
    color: "#6b7280",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "red",
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  roleButton: {
    padding: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginRight: 8,
    marginTop: 8,
  },
  roleButtonSelected: {
    backgroundColor: "#1E40AF",
  },
  roleButtonText: {
    color: "#000",
  },
  roleButtonTextSelected: {
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    justifyContent: "space-between",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#1E40AF",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "#111827",
  },
  loaderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
