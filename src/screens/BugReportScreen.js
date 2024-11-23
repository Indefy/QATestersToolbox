import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const BugReportScreen = () => {
  const [bugDetails, setBugDetails] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    priority: 'Medium',
    assignedDeveloper: '',
    attachments: []
  });

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera roll permissions to upload images!');
        }
      }
    })();
  }, []);

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        setBugDetails(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...result.assets]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
      console.error('Image upload error:', error);
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true
      });

      if (result.type === 'success') {
        setBugDetails(prev => ({
          ...prev,
          attachments: [...prev.attachments, result]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
      console.error('Document upload error:', error);
    }
  };

  const submitBug = async () => {
    if (!bugDetails.title || !bugDetails.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // TODO: Implement API call or local storage
      console.log('Bug Submitted:', bugDetails);
      Alert.alert('Success', 'Bug report submitted successfully');
      
      // Reset form
      setBugDetails({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedResult: '',
        actualResult: '',
        priority: 'Medium',
        assignedDeveloper: '',
        attachments: []
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit bug report');
      console.error('Submit error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report a Bug</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Bug Title</Text>
        <TextInput
          style={styles.input}
          value={bugDetails.title}
          onChangeText={(text) => setBugDetails(prev => ({ ...prev, title: text }))}
          placeholder="Enter bug title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={bugDetails.description}
          onChangeText={(text) => setBugDetails(prev => ({ ...prev, description: text }))}
          placeholder="Describe the bug in detail"
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={bugDetails.priority}
            onValueChange={(itemValue) => setBugDetails(prev => ({ ...prev, priority: itemValue }))}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
            <Picker.Item label="Critical" value="Critical" />
          </Picker>
        </View>
      </View>

      <View style={styles.attachmentSection}>
        <TouchableOpacity style={styles.attachButton} onPress={handleImageUpload}>
          <Text style={styles.attachButtonText}>Upload Screenshots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachButton} onPress={handleDocumentUpload}>
          <Text style={styles.attachButtonText}>Upload Logs/Documents</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitBug}>
        <Text style={styles.submitButtonText}>Submit Bug Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16
  },
  multilineInput: {
    height: 100
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8
  },
  attachmentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15
  },
  attachButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center'
  },
  attachButtonText: {
    color: '#ffffff',
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default BugReportScreen;
