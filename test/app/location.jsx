import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import MapView from 'react-native-maps';
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
    useEffect(() => {
        (async () => {
            let { status } = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            let location = await getCurrentPositionAsync({});
            setLocation(location.coords);
        })();
    }, []);
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
            const coords = JSON.stringify({
                latitude: location.latitude,
                longitude: location.longitude,
            });
            await AsyncStorage.setItem('location', coords);
        } catch (e) {
            console.error(e);
        } finally {
            navigation.navigate('index');
        }
    }, [location])

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

