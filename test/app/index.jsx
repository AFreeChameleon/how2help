import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomTabs from './tabs/tabview';

export default function Index() {
    const [searchText, setSearchText] = useState('');
    const [location, setLocation] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('location');
                setLocation(jsonValue != null ? JSON.parse(jsonValue) : null);
            } catch (e) {
                console.error(e);
            }
        })()
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.locationContainer}>
                <Link
                    href="/location"
                    style={{ fontSize: 16, fontWeight: 500, padding: 10 }}
                >
                    Set Location
                </Link>
            </View>
            <TextInput
                style={styles.searchInput}
                label="Search..."
                mode="outlined"
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                right={<TextInput.Icon icon="store-search" />}
            />
            <CustomTabs/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    locationContainer: {
        height: 100,
        borderBottomColor: '#8B8B8B',
        borderBottomWidth: 1,
        paddingTop: 40,
        paddingLeft: 10
    },
    searchInput: {
        margin: 20,
        marginBottom: 0,
        backgroundColor: '#F4F4F4'
    },
});

