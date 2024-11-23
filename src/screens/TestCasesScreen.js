import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';

const TestCasesScreen = () => {
  const [testCases, setTestCases] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    title: '',
    description: '',
    steps: [],
    expectedResult: ''
  });

  useEffect(() => {
    loadTestCases();
  }, []);

  const loadTestCases = async () => {
    try {
      const storedTestCases = await AsyncStorage.getItem('testCases');
      if (storedTestCases) {
        setTestCases(JSON.parse(storedTestCases));
      }
    } catch (error) {
      console.error('Error loading test cases:', error);
    }
  };

  const addTestCase = async () => {
    const updatedTestCases = [
      ...testCases,
      {
        ...newTestCase,
        id: Date.now().toString(),
        status: 'Not Executed'
      }
    ];

    setTestCases(updatedTestCases);
    await AsyncStorage.setItem('testCases', JSON.stringify(updatedTestCases));
    
    setNewTestCase({
      title: '',
      description: '',
      steps: [],
      expectedResult: ''
    });
    setModalVisible(false);
  };

  const updateTestCaseStatus = async (id, status) => {
    const updatedTestCases = testCases.map(tc => 
      tc.id === id ? { ...tc, status } : tc
    );

    setTestCases(updatedTestCases);
    await AsyncStorage.setItem('testCases', JSON.stringify(updatedTestCases));
  };

  const renderTestCase = ({ item }) => (
    <View style={styles.testCaseCard}>
      <Text style={styles.testCaseTitle}>{item.title}</Text>
      <Text style={styles.testCaseDescription}>{item.description}</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText, 
          item.status === 'Passed' && styles.passedStatus,
          item.status === 'Failed' && styles.failedStatus,
          item.status === 'Blocked' && styles.blockedStatus
        ]}>
          {item.status}
        </Text>
        
        <View style={styles.actionButtons}>
          <CustomButton
            style={[styles.statusButton, styles.passButton]}
            onPress={() => updateTestCaseStatus(item.id, 'Passed')}
            title="Pass"
          />
          <CustomButton
            style={[styles.statusButton, styles.failButton]}
            onPress={() => updateTestCaseStatus(item.id, 'Failed')}
            title="Fail"
          />
          <CustomButton
            style={[styles.statusButton, styles.blockButton]}
            onPress={() => updateTestCaseStatus(item.id, 'Blocked')}
            title="Block"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Cases</Text>
      
      <FlatList
        data={testCases}
        renderItem={renderTestCase}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No test cases found</Text>
        }
      />
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Test Case</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Test Case</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Test Case Title"
              value={newTestCase.title}
              onChangeText={(text) => setNewTestCase(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Description"
              multiline
              value={newTestCase.description}
              onChangeText={(text) => setNewTestCase(prev => ({ ...prev, description: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Expected Result"
              multiline
              value={newTestCase.expectedResult}
              onChangeText={(text) => setNewTestCase(prev => ({ ...prev, expectedResult: text }))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton} 
                onPress={addTestCase}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  testCaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  testCaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  testCaseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d'
  },
  passedStatus: {
    color: '#28a745'
  },
  failedStatus: {
    color: '#dc3545'
  },
  blockedStatus: {
    color: '#ffc107'
  },
  actionButtons: {
    flexDirection: 'row'
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 5
  },
  passButton: {
    backgroundColor: '#28a745'
  },
  failButton: {
    backgroundColor: '#dc3545'
  },
  blockButton: {
    backgroundColor: '#ffc107'
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptyListText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16
  },
  multilineInput: {
    height: 100
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center'
  },
  modalSaveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16
  }
});

export default TestCasesScreen;
