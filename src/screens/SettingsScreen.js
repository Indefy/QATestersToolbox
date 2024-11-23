import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    jiraIntegration: false,
    jiraConfig: {
      host: '',
      username: '',
      token: ''
    },
    environmentProfiles: []
  });

  const [isJiraModalVisible, setJiraModalVisible] = useState(false);
  const [isEnvProfileModalVisible, setEnvProfileModalVisible] = useState(false);
  const [newEnvProfile, setNewEnvProfile] = useState({
    name: '',
    url: '',
    type: 'staging'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('appSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const saveJiraConfig = async () => {
    const updatedSettings = { 
      ...settings, 
      jiraIntegration: true,
      jiraConfig: settings.jiraConfig 
    };
    
    setSettings(updatedSettings);
    setJiraModalVisible(false);
    
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving Jira config:', error);
    }
  };

  const addEnvironmentProfile = async () => {
    const updatedProfiles = [
      ...settings.environmentProfiles, 
      { ...newEnvProfile, id: Date.now().toString() }
    ];
    
    const updatedSettings = { 
      ...settings, 
      environmentProfiles: updatedProfiles 
    };
    
    setSettings(updatedSettings);
    setEnvProfileModalVisible(false);
    setNewEnvProfile({ name: '', url: '', type: 'staging' });
    
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving environment profile:', error);
    }
  };

  const deleteEnvironmentProfile = async (id) => {
    const updatedProfiles = settings.environmentProfiles.filter(profile => profile.id !== id);
    
    const updatedSettings = { 
      ...settings, 
      environmentProfiles: updatedProfiles 
    };
    
    setSettings(updatedSettings);
    
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error deleting environment profile:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => updateSettings('darkMode', value)}
            trackColor={{ false: "#767577", true: "#007bff" }}
            thumbColor={settings.darkMode ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Jira Integration</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Jira Sync</Text>
          <Switch
            value={settings.jiraIntegration}
            onValueChange={(value) => updateSettings('jiraIntegration', value)}
            trackColor={{ false: "#767577", true: "#007bff" }}
            thumbColor={settings.jiraIntegration ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.configButton}
          onPress={() => setJiraModalVisible(true)}
        >
          <Text style={styles.configButtonText}>Configure Jira</Text>
        </TouchableOpacity>
      </View>

      {/* Environment Profiles Section */}
      <View style={styles.settingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Environment Profiles</Text>
          <TouchableOpacity 
            style={styles.addProfileButton}
            onPress={() => setEnvProfileModalVisible(true)}
          >
            <Text style={styles.addProfileButtonText}>+ Add Profile</Text>
          </TouchableOpacity>
        </View>

        {settings.environmentProfiles.map((profile) => (
          <View key={profile.id} style={styles.environmentProfileRow}>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileUrl}>{profile.url}</Text>
              <Text style={styles.profileType}>{profile.type}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteProfileButton}
              onPress={() => deleteEnvironmentProfile(profile.id)}
            >
              <Text style={styles.deleteProfileButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Jira Configuration Modal */}
      <Modal
        visible={isJiraModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Jira Configuration</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Jira Host (e.g., your-company.atlassian.net)"
              value={settings.jiraConfig.host}
              onChangeText={(text) => setSettings(prev => ({
                ...prev, 
                jiraConfig: { ...prev.jiraConfig, host: text }
              }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Jira Username"
              value={settings.jiraConfig.username}
              onChangeText={(text) => setSettings(prev => ({
                ...prev, 
                jiraConfig: { ...prev.jiraConfig, username: text }
              }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Jira API Token"
              secureTextEntry
              value={settings.jiraConfig.token}
              onChangeText={(text) => setSettings(prev => ({
                ...prev, 
                jiraConfig: { ...prev.jiraConfig, token: text }
              }))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setJiraModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton} 
                onPress={saveJiraConfig}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Environment Profile Modal */}
      <Modal
        visible={isEnvProfileModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Environment Profile</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Profile Name (e.g., Staging, Production)"
              value={newEnvProfile.name}
              onChangeText={(text) => setNewEnvProfile(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Environment URL"
              value={newEnvProfile.url}
              onChangeText={(text) => setNewEnvProfile(prev => ({ ...prev, url: text }))}
            />
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newEnvProfile.type}
                onValueChange={(itemValue) => setNewEnvProfile(prev => ({ ...prev, type: itemValue }))}
              >
                <Picker.Item label="Staging" value="staging" />
                <Picker.Item label="Production" value="production" />
                <Picker.Item label="Development" value="development" />
              </Picker>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setEnvProfileModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton} 
                onPress={addEnvironmentProfile}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  settingSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  settingLabel: {
    fontSize: 16,
    color: '#666'
  },
  configButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  configButtonText: {
    color: '#ffffff',
    fontSize: 16
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  addProfileButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5
  },
  addProfileButtonText: {
    color: '#ffffff',
    fontSize: 14
  },
  environmentProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  profileDetails: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  profileUrl: {
    fontSize: 14,
    color: '#666'
  },
  profileType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize'
  },
  deleteProfileButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5
  },
  deleteProfileButtonText: {
    color: '#ffffff',
    fontSize: 12
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10
  }
});

export default SettingsScreen;
