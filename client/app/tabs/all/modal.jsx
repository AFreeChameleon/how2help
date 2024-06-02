import { useCallback, useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert } from "react-native";
import { Modal, Portal, PaperProvider, Button, IconButton } from "react-native-paper";

import { API_URL, capitalizeFirstLetter, green } from "../../../lib/helper";
import MissingImageSource from '../../../assets/missing-photos.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isEqual } from 'lodash';

export default function AllModal({ selectedCharity, onClose, setRefresh }) {
    const [openSchedule, setOpenSchedule] = useState(false);
    const [pinnedItems, setPinnedItems] = useState([]);

    const closeModal = useCallback(() => {
        onClose();
        setOpenSchedule(false);
        setRefresh(true);
    }, []);
    const openGoogleMapsLink  = useCallback(async () => {
        const supported = Linking.canOpenURL(selectedCharity.mapsLink);
        if (supported) {
            await Linking.openURL(selectedCharity.mapsLink);
        } else {
            Alert.alert('Unable to open link. Please try again later.')
        }
    }, [selectedCharity]);
    const openVolunteerLink = useCallback(async () => {
        const supported = Linking.canOpenURL(selectedCharity.link);
        if (supported) {
            await Linking.openURL(selectedCharity.link);
        } else {
            Alert.alert('Unable to open link. Please try again later.')
        }
    }, [selectedCharity]);
    const pinCharity = useCallback(async () => {
        try {
            let newPinnedItems = [...pinnedItems];
            if (newPinnedItems.find((item) => item.id === selectedCharity.id)) {
                newPinnedItems = newPinnedItems.filter(item => item.id !== selectedCharity.id);
            } else {
                newPinnedItems.push({...selectedCharity, distance: null});
            }
            if (!isEqual(newPinnedItems, pinnedItems)) {
                setPinnedItems(newPinnedItems);
            }
            await AsyncStorage.setItem('pinned', JSON.stringify(newPinnedItems));
        } catch (err) {
            await AsyncStorage.setItem('pinned', JSON.stringify(pinnedItems));
        }
    }, [selectedCharity, pinnedItems]);
    useEffect(() => {
        (async () => {
            try {
                const stringValue = await AsyncStorage.getItem('pinned');
                if (stringValue !== null) {
                    const jsonValue = JSON.parse(stringValue);
                    setPinnedItems(typeof jsonValue === 'object' ? jsonValue : []);
                }
            } catch (err) {
                // Create pinnedItems list
            }
        })();
    }, [selectedCharity]);
    return (
        <Portal>
            <Modal
                visible={Boolean(selectedCharity)}
                onDismiss={closeModal}
                contentContainerStyle={styles.modalContainer}
            >
                {selectedCharity && (
                    <View>
                        <Image
                            source={selectedCharity.photos ?
                                {uri: `${API_URL}/photo?path=${selectedCharity.photos[0].name}`} :
                                MissingImageSource
                            }
                            style={styles.charityLogo}
                        />
                        <View style={[styles.row, styles.title]}>
                            <Text style={styles.charityName}>{selectedCharity.name}</Text>
                            <IconButton
                                iconColor={green}
                                icon={pinnedItems.find(item => item.id === selectedCharity.id) ? "heart" : "heart-outline"}
                                onPress={pinCharity}
                            />
                        </View>
                        <View style={styles.charityContent}>
                            <Text style={[styles.charityDescription, styles.greyText]}>
                                {selectedCharity.description}
                            </Text>
                            <Text style={[styles.category, styles.greyText]}>Category: {capitalizeFirstLetter(selectedCharity.category)}</Text>
                            { !selectedCharity.flags.noOpeningHours && (
                                <>
                                    <View style={styles.schedule}>
                                        { openSchedule ? selectedCharity.openingHours.map((h) => (
                                            <Text style={styles.greyText} key={h}>{h}</Text>
                                        )) : <Text style={styles.greyText}>{getCurrentOpeningHours(selectedCharity.openingHours)}</Text> }
                                    </View>
                                    <Text style={styles.link} onPress={() => setOpenSchedule(!openSchedule)}>
                                        {openSchedule ? 'Hide schedule' : 'See schedule'}
                                    </Text>
                                </>
                            ) }
                            <View style={[styles.row, styles.marginTopLarge]}>
                                <Text style={[styles.charityAddress, styles.greyText]}>{selectedCharity.address}</Text>
                                <IconButton
                                    style={styles.mapButton}
                                    icon="map-marker"
                                    iconColor={green}
                                    onPress={openGoogleMapsLink}
                                />
                            </View>
                            <Button
                                mode="contained"
                                buttonColor={green}
                                style={[styles.marginTopMedium]}
                                onPress={openVolunteerLink}
                            >
                                Volunteer!
                            </Button>
                        </View>
                    </View>
                )}
            </Modal>
        </Portal>
    );
}

function getCurrentOpeningHours(hours) {
    const now = new Date();
    let currentDay = now.getDay() - 1;
    if (currentDay < 0) {
        currentDay = 6;
    }
    return hours[currentDay];
}

const styles = StyleSheet.create({
    modalContainer: {
        margin: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10
    },
    charityLogo: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    title: {
        paddingLeft: 20,
        paddingRight: 10,
        paddingBottom: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#8B8B8B',
        borderBottomWidth: 1,
        borderBottomColor: '#8B8B8B'
    },
    charityName: {
        fontSize: 16,
        fontWeight: '500',
        width: '75%'
    },
    greyText: {
        color: '#8b8b8b'
    },
    charityDescription: {
    },
    charityContent: {
        padding: 20
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    charityAddress: {
        width: '75%'
    },
    mapButton: {
        marginLeft: 'auto'
    },
    schedule: {
        marginTop: 10
    },
    marginTopLarge: {
        marginTop: 20
    },
    marginTopMedium: {
        marginTop: 10
    },
    category: {
        marginTop: 20
    },
    link: {
        color: green
    },
});
