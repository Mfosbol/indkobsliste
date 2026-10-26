import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import ButtonComponent from '../components/ButtonComponent';
import CategoryChips from '../components/CategoryChips';
import KeyboardDoneAccessory, {
  KEYBOARD_DONE_ACCESSORY_ID,
} from '../components/KeyboardDoneAccessory';
import { categorizeProduct, categorizeScannedProduct } from '../data/categorize';
import { useShopping } from '../context/ShoppingContext';
import { lookupBarcode } from '../services/openFoodFacts';
import { GlobalStyle } from '../styles/GlobalStyle';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'];

// status: 'idle' | 'loading' | 'found' | 'saved' | 'notFound' | 'error'
const STATUS_TEXT = {
  found: 'Fundet i Open Food Facts. Ret navnet, hvis det skal være kortere.',
  saved: 'Du har scannet denne vare før.',
  notFound:
    'Varen findes ikke i databasen. Skriv navnet én gang, så husker appen den næste gang.',
  error: 'Kunne ikke slå varen op. Tjek internetforbindelsen, eller skriv navnet selv.',
};

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const { addItem, knownBarcodes, rememberBarcode } = useShopping();

  const [code, setCode] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categorizeProduct(''));
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  // Navnet på sidst tilføjede vare – bekræftelse når man scanner flere i træk
  const [lastAdded, setLastAdded] = useState(null);
  // Kameraet melder samme stregkode mange gange i træk – lås efter første hit
  const scanLock = useRef(false);
  // Tæller opslag, så et langsomt svar på en gammel stregkode ignoreres
  const requestId = useRef(0);

  const handleCode = async (scannedCode) => {
    const cleaned = (scannedCode || '').trim();
    if (scanLock.current) return;
    if (!cleaned) {
      Alert.alert('Tomt felt', 'Skriv tallene under stregkoden.');
      return;
    }
    scanLock.current = true;

    Keyboard.dismiss();
    setCode(cleaned);

    // Kendte stregkoder slås op lokalt først – virker også offline
    const known = knownBarcodes[cleaned];
    if (known) {
      setName(known.name);
      setCategory(known.category);
      setStatus('saved');
      return;
    }

    setStatus('loading');
    const thisRequest = ++requestId.current;
    try {
      const product = await lookupBarcode(cleaned);
      if (thisRequest !== requestId.current) return;
      if (product) {
        setName(product.name);
        setCategory(categorizeScannedProduct(product.name, product.tags));
        setStatus('found');
      } else {
        setName('');
        setCategory(categorizeProduct(''));
        setStatus('notFound');
      }
    } catch {
      if (thisRequest !== requestId.current) return;
      setName('');
      setCategory(categorizeProduct(''));
      setStatus('error');
    }
  };

  const handleNameChange = (value) => {
    setName(value);
    // Kun når varen var ukendt gætter vi kategori ud fra det brugeren skriver,
    // og aldrig hvis brugeren selv har valgt en kategori
    if ((status === 'notFound' || status === 'error') && !categoryTouched) {
      setCategory(categorizeProduct(value));
    }
  };

  const reset = () => {
    scanLock.current = false;
    requestId.current += 1;
    setCode(null);
    setManualCode('');
    setStatus('idle');
    setName('');
    setCategory(categorizeProduct(''));
    setCategoryTouched(false);
  };

  const handleCategorySelect = (value) => {
    setCategoryTouched(true);
    setCategory(value);
  };

  const addCurrent = () => {
    const success = addItem(name, 1, category);
    if (!success) {
      Alert.alert('Tomt felt', 'Skriv venligst navnet på varen.');
      return false;
    }
    rememberBarcode(code, name, category);
    return true;
  };

  // Nyt efter brugertests: bliv på skærmen og scan næste tomme pakke,
  // i stedet for at blive sendt tilbage til listen efter hver vare
  const handleAddAndScanNext = () => {
    if (!addCurrent()) return;
    setLastAdded(name.trim());
    reset();
  };

  const handleAdd = () => {
    if (!addCurrent()) return;
    // Nulstil først når skærmen er forladt (se effekten nedenfor). Nulstilles
    // der her, tændes kameraet igen i samme øjeblik som vi navigerer væk,
    // og det hurtige tænd/sluk kan crashe kameraet på iOS.
    navigation.navigate('Liste');
  };

  useEffect(() => {
    if (!isFocused) {
      reset();
      setTorchOn(false);
      setLastAdded(null);
    }
  }, [isFocused]);

  const hasResult = code && status !== 'loading';
  // Kameraet forbliver tændt mellem scanninger – scanningen sættes bare på
  // pause. Genstartes kameraet, tænder iOS ikke lommelygten igen af sig selv.
  const cameraActive = isFocused && permission?.granted;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={GlobalStyle.overviewContent}
        style={GlobalStyle.screen}
        keyboardShouldPersistTaps="handled"
      >
        <View style={GlobalStyle.scannerFrame}>
          {cameraActive ? (
            <>
              <CameraView
                style={GlobalStyle.scannerCamera}
                facing="back"
                enableTorch={torchOn}
                barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
                onBarcodeScanned={
                  code ? undefined : ({ data }) => handleCode(data)
                }
              />
              {code && (
                <View style={GlobalStyle.scannerPaused}>
                  {status === 'loading' ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  ) : (
                    <Text style={GlobalStyle.scannerPlaceholderText}>
                      Stregkode {code}
                    </Text>
                  )}
                </View>
              )}
              {/* Lommelygte til scanning i mørke rum, fx et dunkelt spisekammer */}
              <Pressable
                style={[
                  GlobalStyle.torchButton,
                  torchOn && GlobalStyle.torchButtonActive,
                ]}
                onPress={() => setTorchOn((prev) => !prev)}
                accessibilityLabel={
                  torchOn ? 'Sluk lommelygte' : 'Tænd lommelygte'
                }
              >
                <Ionicons
                  name={torchOn ? 'flashlight' : 'flashlight-outline'}
                  size={22}
                  color={torchOn ? '#1A3A2A' : '#FFFFFF'}
                />
                <Text
                  style={[
                    GlobalStyle.torchButtonText,
                    torchOn && GlobalStyle.torchButtonTextActive,
                  ]}
                >
                  {torchOn ? 'Lys til' : 'Lys'}
                </Text>
              </Pressable>
            </>
          ) : (
            <View style={GlobalStyle.scannerPlaceholder}>
              {status === 'loading' ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Text style={GlobalStyle.scannerPlaceholderText}>
                  {code
                    ? `Stregkode ${code}`
                    : 'Kameraet starter, når du har givet adgang'}
                </Text>
              )}
            </View>
          )}
        </View>

        {!permission?.granted && (
          <View style={GlobalStyle.card}>
            <Text style={GlobalStyle.sectionTitle}>Scan dine varer</Text>
            <Text style={GlobalStyle.frequentMeta}>
              Scan stregkoden på en tom pakke, så kommer varen på listen uden
              at du skal skrive noget.
            </Text>
            {/* Har brugeren afvist før, kan iOS ikke spørge igen – send til Indstillinger */}
            {permission && !permission.canAskAgain ? (
              <ButtonComponent
                title="Åbn Indstillinger"
                onPress={() => Linking.openSettings()}
                type="primary"
              />
            ) : (
              <ButtonComponent
                title="Giv adgang til kamera"
                onPress={requestPermission}
                type="primary"
              />
            )}
          </View>
        )}

        {permission?.granted && !code && lastAdded && (
          <Text style={GlobalStyle.scannerConfirm}>
            ✓ {lastAdded} er tilføjet. Scan den næste vare.
          </Text>
        )}

        {permission?.granted && !code && (
          <Text style={GlobalStyle.hintText}>
            Hold stregkoden foran kameraet · for mørkt? Tryk på Lys
          </Text>
        )}

        {hasResult && (
          <View style={GlobalStyle.card}>
            <Text style={GlobalStyle.frequentMeta}>{STATUS_TEXT[status]}</Text>

            <Text style={[GlobalStyle.label, { marginTop: 12 }]}>Varenavn</Text>
            <TextInput
              style={GlobalStyle.textInput}
              placeholder="Fx. Letmælk"
              value={name}
              onChangeText={handleNameChange}
              returnKeyType="done"
              inputAccessoryViewID={KEYBOARD_DONE_ACCESSORY_ID}
            />

            <Text style={GlobalStyle.label}>Kategori</Text>
            <CategoryChips selected={category} onSelect={handleCategorySelect} />

            <ButtonComponent
              title="Tilføj og scan næste"
              onPress={handleAddAndScanNext}
              type="primary"
            />
            <ButtonComponent
              title="Tilføj og gå til listen"
              onPress={handleAdd}
              type="secondary"
            />
            <ButtonComponent
              title="Annuller og scan igen"
              onPress={reset}
              type="danger"
            />
          </View>
        )}

        {!code && (
          <View style={GlobalStyle.frequentAddCard}>
            <Text style={GlobalStyle.label}>Eller skriv stregkoden</Text>
            <View style={GlobalStyle.frequentAddRow}>
              <TextInput
                style={GlobalStyle.frequentAddInput}
                placeholder="Fx. 5701234567890"
                value={manualCode}
                onChangeText={setManualCode}
                keyboardType="number-pad"
                inputAccessoryViewID={KEYBOARD_DONE_ACCESSORY_ID}
              />
              <Pressable
                style={GlobalStyle.frequentAddButton}
                onPress={() => handleCode(manualCode)}
              >
                <Text style={GlobalStyle.frequentAddButtonText}>Slå op</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <KeyboardDoneAccessory />
    </KeyboardAvoidingView>
  );
}
