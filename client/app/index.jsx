import { useState, useEffect, useMemo } from 'react';
import { isEqual } from 'lodash';
import { Link, useNavigation, use } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Switch, TextInput, TouchableRipple } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomTabs from './tabs/tabview';
import { green } from '../lib/helper';

export default function Index() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [viewPinned, setViewPinned] = useState(false);
    const [location, setLocation] = useState(null);
    const [charities, setCharities] = useState([]);
    const [charitiesError, setCharitiesError] = useState(null);
    navigation.addListener('focus', async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('location');
            if (jsonValue === null) {
                return navigation.navigate('location');
            }
            const savedLocation = JSON.parse(jsonValue);
            if (!savedLocation.coords || !savedLocation.address) {
                return navigation.navigate('location');
            }
            if (!isEqual(savedLocation, location)) {
                setLocation(savedLocation);
            }
        } catch (e) {
            console.error(e);
            return navigation.navigate('location');
        }
    });
    useEffect(() => {
        (async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('location');
                if (jsonValue === null) {
                    return navigation.navigate('location');
                }
                const savedLocation = JSON.parse(jsonValue);
                if (!savedLocation.coords || !savedLocation.address) {
                    return navigation.navigate('location');
                }
                if (!isEqual(savedLocation, location)) {
                    setLocation(savedLocation);
                }
            } catch (e) {
                console.error(e);
                return navigation.navigate('location');
            }
        })();
    }, []);

    const locationText = useMemo(() => {
        if (!location) {
            return '';
        }
        const fullAddress = location.address.map(a => a.long_name).join(', ');
        if (fullAddress.length > 30) {
            return fullAddress.substr(0, 29) + '...';
        }
        return location.address.map(a => a.long_name).join(', ');
    }, [location]);

    useEffect(() => {
        if (!location || loading) {
            return;
        }
        setLoading(true);
        fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/charities?lat=${location.coords.latitude}&lon=${location.coords.longitude}`
        )
        .then(res => res.json())
        .then(async ({charities}) => {
            try {
                if (charities) {
                    setCharities(charities);
                }
                setCharitiesError(null);
            } catch (err) {
                throw err;
            }
        })
        .catch((err) => {
            console.error(err);
            setCharitiesError(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [location]);

    return (
        <View style={styles.container}>
            <View style={styles.locationContainer}>
                <Text style={styles.currentLocation}>
        guh
                </Text>
                <View style={{ display: 'flex' }}>
                    <Text style={{ fontSize: 16, fontWeight: 500 }}>
                        {locationText}&nbsp;
                        <Link
                            href="/location"
                            style={{ fontSize: 12, padding: 10, marginLeft: 20, color: green, textDecorationLine: 'underline' }}
                        >
                            Change
                        </Link>
                    </Text>
                </View>
            </View>
            <Text style={{ marginTop: 20, paddingLeft: 20, fontSize: 18, fontWeight: 600 }}>
                Charities near you:
            </Text>
            <CustomTabs
                viewPinned={viewPinned}
                loading={loading}
                charities={charities}
                error={charitiesError}
            />
            <TouchableRipple onPress={() => setViewPinned(!viewPinned)}>
                <View style={[styles.footer, styles.row]}>
                    <Switch
                        value={viewPinned}
                        onValueChange={() => setViewPinned(!viewPinned)}
                        style={{ pointerEvents: 'none' }}
                        color={green}
                    />
                    <Text>
                        View liked charities
                    </Text>
                </View>
            </TouchableRipple>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    currentLocation: {
        fontSize: 12,
        color: '#8B8B8B'
    },
    locationContainer: {
        height: 100,
        width: '100%',
        borderBottomColor: '#8B8B8B',
        borderBottomWidth: 1,
        paddingTop: 40,
        paddingLeft: 20
    },
    searchInput: {
        margin: 20,
        marginBottom: 0,
        backgroundColor: '#F4F4F4'
    },
    footer: {
        height: 60
    },
    row: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    }
});

