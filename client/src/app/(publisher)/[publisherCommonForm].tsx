import { ipURL } from '@/utils/backendURL'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import Checkbox from 'expo-checkbox'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,ActivityIndicator, Alert } from 'react-native'
import { Audio } from 'react-native-compressor'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import {BookCategoryLabels} from '../../utils/categoriesdata'


const publisherCommonForm = () => {
    const {publisherCommonForm} = useLocalSearchParams()
    console.log(publisherCommonForm, 'params');
    const [token, setToken] = useState(null);

    const [title, setTitle] = useState('')
    const [language, setLanguage] = useState('')
    const [categories, setCategories] = useState({});
    const [date, setDate] = useState(new Date(1598051730000));
    const [ISBNDOIISRC, setISBNDOIISRC] = useState('')
    const [synopsis, setSynopsis] = useState('')
    const [narrator, setNarrator] = useState('')
    const [narrationStyleSlow, setNarrationStyleSlow] = useState(false)
    const [narrationStyleFast, setNarrationStyleFast] = useState(false)
    const [narrationStyleIntimate, setNarrationStyleIntimate] = useState(false)
    const [narrationStyleCasual, setNarrationStyleCasual] = useState(false)
    const [narrationStyleStatic, setNarrationStyleStatic] = useState(false)
    const [narrationStyleOratoric, setNarrationStyleOratoric] = useState(false)
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [audioSample, setAudioSample] = useState({})
    const [audioCompressURL, setAudioCompressURL] = useState('')
    const [amount, setAmount] = useState('');

    const [doc1, setDoc1] = useState(null);
    const [rightsHolder, setRightsHolder] = useState(false)

    const [isChecked, setChecked] = useState(false);


    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    useEffect(() => {
        const getAsyncData = async () => {
          const tokenStore = await SecureStore.getItemAsync('userDetails');
          setToken(JSON.parse(tokenStore).userId);
          
    
        }
        getAsyncData();
      }, [])

    const pickAudio = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "audio/*",
            copyToCacheDirectory: true
        });
    
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: `audio/${fileType}`
            };
            setAudioSample(fileToUpload);
            
            const resultCompress = await Audio.compress(
                uri, // recommended wav file but can be use mp3 file. . Edit: convert to 192
                {
                    bitrate: 32000,
                    samplerate: 22050,
                    channels: 1,
                }
            );
            setAudioCompressURL(resultCompress)
              
    };
    

    const postAudio = async () => {
        const url = `${ipURL}/api/s3/upload-to-aws-audio`;
        const formData = new FormData();
       
        
        
        formData.append('audio1', {
            uri: audioCompressURL,
            name: audioSample.name,
            type: audioSample.type
        });
        console.log(publisherCommonForm,'companyId');
        
        formData.append('id', publisherCommonForm)

        formData.append('userId', token)

        
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        
        try {
            console.log(url, 'url', options, 'options');
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            return responseData
            
        } catch (error) {
            console.error('Error:', error);
            return error
        }
    };

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true
        });

        
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: "application/" + fileType
            };
            setDoc1(fileToUpload);
    };

    const postDocuments = async () => {
        
        const url = `${ipURL}/api/s3/upload-to-aws`;
        const formData = new FormData();
        
        if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type });       

        formData.append('id',publisherCommonForm,);
console.log(publisherCommonForm,'companyId in document submit');

        formData.append('userId',token);
    
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            return responseData
            
        } catch (error) {
            console.error('Error:', error);
            return error
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (permissionResult.granted === false) {
          Alert.alert('Permission to access the gallery is required!');
          return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
    
        if (!result.canceled) {
          const manipResult = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 800 } }], // Resize the image
            { compress: 0.0, format: ImageManipulator.SaveFormat.WEBP } // Compress the image
          );
          setImage(manipResult.uri);
        }
      };
    
      const uploadImageToBe = async () => {
        if (!image) return;
    
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
    
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
        formData.append('id', publisherCommonForm);
        formData.append('userId', token);
    
        try {
          console.log(formData, 'form data');
          
          const response = await axios.post(`${ipURL}/api/s3/upload-to-aws-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Image uploaded successfully', response.data.data.Location);
    
          // Update the form data with the image URL
          const imageURL = response.data.data;
          setImageURL(imageURL)
          
          // You can either update the state with the image URL or proceed with form submission
          Alert.alert('Image uploaded successfully');
          
          // If you want to include the image URL in the form submission, you can store it in state
          // setImageURL(imageURL);
          
        } catch (error) {
          console.error('Image upload failed', error);
          Alert.alert('Image upload failed', error.message);
        }
      };

    const handleSubmit = async () => {
        try{
            setLoading(true);
            const audioData = await postAudio()
            const docData = await postDocuments()
            console.log(audioData, 'audioData', docData, 'docData');
    
            const data ={
                id:publisherCommonForm,
                title: title,
                language: language,
                categories: categories,
                date: date,
                ISBNDOIISRC: ISBNDOIISRC,
                synopsis: synopsis,
                narrator: narrator,
                narrationStyleSlow: narrationStyleSlow,
                narrationStyleFast: narrationStyleFast,
                narrationStyleIntimate: narrationStyleIntimate,
                narrationStyleCasual: narrationStyleCasual,
                narrationStyleStatic: narrationStyleStatic,
                narrationStyleOratoric: narrationStyleOratoric,
                audioSampleURL: audioData.data,
                pdfURL: docData.data[0],
                rightsHolder: rightsHolder,
                coverImage: imageURL,
                amount: amount,
            }
    
            console.log(data, 'data');
            const response = await axios.put(`${ipURL}/api/publisher/update-company`, data)
            console.log(response, 'responsein common form');
            setLoading(false);
            router.push('/(tabs)/home')

        }
       catch (error) {
        setLoading(false);
        console.error('Error:', error);
        
       }

    }

    


    return (
      <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                  <View style={styles.headerContainer}>
                      <Text style={styles.headerText}>
                          Last Steps
                      </Text>
                      <Text style={styles.subHeaderText}>
                          Fill in the details to publish your audiobook
                      </Text>
                  </View>

                  <View style={styles.formContainer}>
                      <FormInput
                          label="Title"
                          placeholder="Enter Title Name"
                          value={title}
                          onChangeText={setTitle}
                      />

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Category</Text>
                          <View style={styles.pickerContainer}>
                              <Picker
                                  mode='dropdown'
                                  dropdownIconColor="#FFFFFF"
                                  style={styles.picker}
                                  selectedValue={categories}
                                  onValueChange={(itemValue) => setCategories(itemValue)}>
                                  <Picker.Item style={styles.pickerItem} label="Select a category" value="none" color='white' />
                                  {Object.entries(BookCategoryLabels).map(([value, label]) => (
                                      <Picker.Item 
                                        color='white'
                                          key={value} 
                                          style={styles.pickerItem} 
                                          label={label} 
                                          value={value} 

                                      />
                                  ))}
                                  {/* ... other picker items ... */}
                              </Picker>
                          </View>
                      </View>

                      <FormInput
                          label="Language"
                          placeholder="Enter Language"
                          value={language}
                          onChangeText={setLanguage}
                      />

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Release Date</Text>
                          <TouchableOpacity 
                              style={styles.dateButton}
                              onPress={showDatepicker}
                          >
                              <Text style={styles.dateButtonText}>
                                  {date.toLocaleDateString()}
                              </Text>
                          </TouchableOpacity>
                          {show && (
                              <DateTimePicker
                                  testID="dateTimePicker"
                                  value={date}
                                  is24Hour={true}
                                  onChange={onChange}
                              />
                          )}
                      </View>

                      <FormInput
                          label="ISBN/DOI/ISRC Number"
                          placeholder="Enter ISBN/DOI/ISRC No."
                          value={ISBNDOIISRC}
                          onChangeText={setISBNDOIISRC}
                      />

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Synopsis</Text>
                          <TextInput
                              placeholder="Enter Synopsis"
                              placeholderTextColor="#A0A0A0"
                              multiline={true}
                              numberOfLines={4}
                              value={synopsis}
                              onChangeText={setSynopsis}
                              style={styles.textArea}
                          />
                      </View>
                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Enter Your Price</Text>
                          <TextInput
                              placeholder="Enter Your Price"
                              placeholderTextColor="#A0A0A0"
                              value={amount}
                              onChangeText={setAmount}
                              style={styles.textArea}
                          />
                      </View>

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Narration Style</Text>
                          <View style={styles.checkboxGrid}>
                              <View style={styles.checkboxRow}>
                                  <CheckboxItem
                                      label="Slow"
                                      value={narrationStyleSlow}
                                      onValueChange={setNarrationStyleSlow}
                                  />
                                  <CheckboxItem
                                      label="Fast"
                                      value={narrationStyleFast}
                                      onValueChange={setNarrationStyleFast}
                                  />
                              </View>
                              <View style={styles.checkboxRow}>
                                  <CheckboxItem
                                      label="Intimate"
                                      value={narrationStyleIntimate}
                                      onValueChange={setNarrationStyleIntimate}
                                  />
                                  <CheckboxItem
                                      label="Casual"
                                      value={narrationStyleCasual}
                                      onValueChange={setNarrationStyleCasual}
                                  />
                              </View>
                              <View style={styles.checkboxRow}>
                                  <CheckboxItem
                                      label="Oratoric"
                                      value={narrationStyleOratoric}
                                      onValueChange={setNarrationStyleOratoric}
                                  />
                                  <CheckboxItem
                                      label="Static"
                                      value={narrationStyleStatic}
                                      onValueChange={setNarrationStyleStatic}
                                  />
                              </View>
                          </View>
                      </View>

                      <View style={styles.uploadSection}>
                          <Text style={styles.label}>Upload Files</Text>
                          <TouchableOpacity 
                              style={styles.uploadButton} 
                              onPress={pickAudio}
                          >
                              <Text style={styles.uploadButtonText}>
                                  {audioSample.name || 'Upload Audio Sample'}
                              </Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                              style={styles.uploadButton} 
                              onPress={pickDocument}
                          >
                              <Text style={styles.uploadButtonText}>
                                  {doc1?.name || 'Upload PDF Document'}
                              </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                              style={styles.uploadButton} 
                              onPress={pickImage}
                          >
                              <Text style={styles.uploadButtonText}>
                                  {image ? 'Image Selected' : 'Upload Cover Image'}
                              </Text>
                          </TouchableOpacity>
                          
                          {image && (
                              <TouchableOpacity 
                                  style={[styles.uploadButton, styles.uploadButtonPrimary]} 
                                  onPress={uploadImageToBe}
                              >
                                  <Text style={styles.uploadButtonText}>
                                      Submit Image
                                  </Text>
                              </TouchableOpacity>
                          )}
                      </View>

                      <View style={styles.rightsHolder}>
                          <Checkbox
                              value={rightsHolder}
                              onValueChange={setRightsHolder}
                              color={rightsHolder ? '#4A4DFF' : undefined}
                          />
                          <Text style={styles.rightsHolderText}>
                              I confirm that I am the rights holder
                          </Text>
                      </View>

                      <TouchableOpacity 
                          style={styles.submitButton}
                          onPress={handleSubmit}
                      >
                          {loading? <ActivityIndicator/>:
                          <Text style={styles.submitButtonText}>
                              Submit Publication
                          </Text>}
                      </TouchableOpacity>
                  </View>
              </View>
          </ScrollView>
      </SafeAreaView>
  )
}

const FormInput = ({ label, ...props }) => (
  <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
          {...props}
          placeholderTextColor="#A0A0A0"
          style={styles.input}
      />
  </View>
)

const CheckboxItem = ({ label, value, onValueChange }) => (
  <View style={styles.checkboxItem}>
      <Checkbox
          value={value}
          onValueChange={onValueChange}
          color={value ? '#4A4DFF' : undefined}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#000000',
  },
  content: {
      flex: 1,
      padding: moderateScale(20),
  },
  headerContainer: {
      marginBottom: verticalScale(30),
  },
  headerText: {
      fontSize: moderateScale(28),
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: verticalScale(8),
  },
  subHeaderText: {
      fontSize: moderateScale(16),
      color: '#A0A0A0',
  },
  formContainer: {
      gap: verticalScale(20),
  },
  inputContainer: {
      marginBottom: verticalScale(16),
  },
  label: {
      fontSize: moderateScale(14),
      color: '#FFFFFF',
      marginBottom: verticalScale(8),
      fontWeight: '500',
  },
  input: {
      backgroundColor: '#1A1A1A',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#333333',
  },
  textArea: {
      backgroundColor: '#1A1A1A',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      color: '#FFFFFF',
      height: verticalScale(100),
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: '#333333',
  },
  pickerContainer: {
      backgroundColor: '#1A1A1A',
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: '#333333',
  },
  picker: {
      color: '#FFFFFF',
  },
  pickerItem: {
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
  },
  checkboxGrid: {
      gap: verticalScale(12),
  },
  checkboxRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: horizontalScale(20),
  },
  checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: horizontalScale(8),
  },
  checkboxLabel: {
      color: '#FFFFFF',
      fontSize: moderateScale(14),
  },
  uploadSection: {
      gap: verticalScale(12),
  },
  uploadButton: {
      backgroundColor: '#1A1A1A',
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#4A4DFF',
  },
  uploadButtonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(14),
  },
  dateButton: {
      backgroundColor: '#1A1A1A',
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#333333',
  },
  dateButtonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(14),
  },
  rightsHolder: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: horizontalScale(8),
      marginVertical: verticalScale(20),
  },
  rightsHolderText: {
      color: '#FFFFFF',
      fontSize: moderateScale(14),
  },
  submitButton: {
      backgroundColor: '#4A4DFF',
      padding: moderateScale(16),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      marginTop: verticalScale(20),
  },
  submitButtonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(16),
      fontWeight: '600',
  },
  uploadButtonPrimary: {
    backgroundColor: '#4A4DFF',
    borderColor: '#4A4DFF',
  },
});

export default publisherCommonForm;