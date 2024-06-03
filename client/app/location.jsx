import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Location() {
    const navigation = useNavigation();
    const { height, width } = useWindowDimensions();
    const map = useRef();
    let zoomed = useRef(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [saving, setSaving] = useState(false);
    navigation.addListener('focus', async () => {
        let { status } = await requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
        let googleLocation = await getCurrentPositionAsync({});
        setLocation(googleLocation.coords);
    });
    useEffect(() => {
        if (!map.current || zoomed.current || !location) {
            return;
        }
        map.current.setCamera({
            center: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
            zoom: 19
        });
        zoomed.current = true;
    }, [location]);

    const saveLocation = useCallback(async () => {
        try {
            setSaving(true);
            fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/postal-code?lat=${location.latitude}&lon=${location.longitude}`
            )
            .then(res => res.json())
            .then(async (data) => {
                const savedLocation = JSON.stringify({
                    coords: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                    address: data.results[0].address_components
                });
                await AsyncStorage.setItem('location', savedLocation);
            })
            .catch((err) => {
                Alert.alert('An error occurred', err.message + 
                `${process.env.EXPO_PUBLIC_API_URL}/postal-code?lat=${location.latitude}&lon=${location.longitude}`
                );
            })
            .finally(() => {
                setSaving(false);
                navigation.navigate('index');
            });
        } catch (e) {
            console.error(e);
        }
    }, [location]);

    return (
        <View>
            <View style={styles.title}>
                <Text style={styles.titleText}>Choose a location</Text>
            </View>
            {(location || errorMsg) ? <>
                <MapView
                    ref={map}
                    style={{...styles.mapView, height: height - 75}}
                    onRegionChangeComplete={(e) => setLocation(e)}
                    provider={PROVIDER_GOOGLE}
                />
                <View
                    style={{
                        ...styles.mapMarker,
                        left: (width / 2) - 36,
                        bottom: (height / 2) - 36
                    }}
                >
                    <Icon
                        source="map-marker"
                        size={32}
                        color="#6B4FA8"
                    />
                </View>
                <Button
                    loading={saving}
                    style={{
                        ...styles.selectButton,
                        left: (width / 2) - 75
                    }}
                    mode="contained"
                    onPress={saveLocation}
                >
                    Select
                </Button>
            </> : <>
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator
                        animating
                    />
                    <Text style={{ fontSize: 16, fontWeight: 500, marginTop: 10 }}>
                        Loading map...
                    </Text>
                </View>
            </>}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        height: 100,
        borderBottomColor: '#8B8B8B',
        borderBottomWidth: 1,
    },
    titleText: {
        paddingTop: 50,
        paddingLeft: 20,
        fontWeight: '500',
        fontSize: 18
    },
    mapView: {
        width: '100%',
    },
    mapMarker: {
        position: 'absolute',
        zIndex: 20,
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 79, 167, 0.1)',
        borderRadius: 72,
        pointerEvents: 'none'
    },
    selectButton: {
        position: 'absolute',
        bottom: 200,
        width: 150,
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 200
    }
});

