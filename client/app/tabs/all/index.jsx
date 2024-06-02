import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";

import AllModal from "./modal";
import { API_URL, capitalizeFirstLetter } from "../../../lib/helper";
import MissingImageSource from '../../../assets/missing-photos.png';

export default function All({ loading, error, charities, viewPinned }) {
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [pinnedItems, setPinnedItems] = useState([]);
    const [refresh, setRefresh] = useState(0);

    if (loading) {
        return <View style={[styles.container, styles.scrollable]}>
            <View style={styles.spinnerContainer}>
                <ActivityIndicator
                    animating
                />
                <Text style={{ fontSize: 16, fontWeight: 500, marginTop: 10 }}>
                    Loading charities...
                </Text>
            </View>
        </View>;
    }
    useEffect(() => {
        (async () => {
            try {
                const stringValue = await AsyncStorage.getItem('pinned');
                if (stringValue !== null) {
                    const jsonValue = JSON.parse(stringValue);
                    setPinnedItems(typeof jsonValue === 'object' ? jsonValue : []);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [viewPinned, refresh]);
    return (
        <View style={styles.container}>
            <AllModal
                selectedCharity={selectedCharity}
                onClose={() => setSelectedCharity(null)}
                pinnedItems={pinnedItems}
                setPinnedItems={setPinnedItems}
                setRefresh={() => setRefresh(refresh+1)}
            />
            <ScrollView style={styles.scrollable} showsVerticalScrollIndicator={false}>
                <View>
                    {(viewPinned ? pinnedItems : charities).map((charity) => (
                        <TouchableOpacity style={styles.charityContainer} key={charity.link} onPress={() => setSelectedCharity(charity)}>
                            <Image
                                source={charity.photos ?
                                    {uri: `${API_URL}/photo?path=${charity.photos[0].name}`} :
                                    MissingImageSource
                                }
                                style={styles.charityMainImage}
                            />
                            <View style={[styles.charityContent, charity.photos && styles.borderGreyTop]}>
                                <View style={styles.row}>
                                    <Text style={styles.charityName}>{charity.name}</Text>
                                    <Text style={styles.charityDistance}>{charity.distance.toString().substr(0,3)} km</Text>
                                </View>
                                {charity.category && <Text style={styles.charityCategory}>
                                    {capitalizeFirstLetter(charity.category)}
                                </Text>}
                                <View style={styles.row}>
                                    <Text style={styles.charityRating}>
                                        {charity.rating ? `${charity.rating} stars` : 'No stars'}
                                    </Text>
                                    {charity.flags.noOpeningHours ? (
                                        <Text style={[
                                            styles.charityRating,
                                            styles.noOpeningHours
                                        ]}>
                                            No opening times
                                        </Text>
                                    ) : (
                                        <Text style={[
                                            styles.charityRating,
                                            charity.openNow ? styles.open : styles.closed
                                        ]}>
                                            {charity.openNow ? 'Open' : 'Closed'}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomColor: '#8B8B8B',
        borderBottomWidth: 1,
        borderTopColor: '#8B8B8B',
        borderTopWidth: 1,
        backgroundColor: '#F4F4F4',
    },
    charityMainImage: {
        width: '100%',
        height: 150,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    modalContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#FFFFFF'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollable: {
        height: '100%',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
    },
    charityContainer: {
        display: 'flex',
        backgroundColor: '#ffffff',
        marginTop: 10,
        marginBottom: 10,
        shadowRadius: 4,
        borderRadius: 10,
    },
    charityContent: {
        padding: 10,
    },
    borderGreyTop: {
        borderTopColor: '#8b8b8b',
        borderTopWidth: 1
    },
    charityName: {
        fontSize: 16,
        fontWeight: '500',
        width: '75%'
    },
    charityDistance: {
        color: '#8b8b8b',
    },
    charityRating: {
        marginTop: 5,
        color: '#8b8b8b'
    },
    charityCategory: {
        marginTop: 5,
        color: '#8b8b8b'
    },
    noOpeningHours: {
        color: 'orange'
    },
    open: {
        color: 'green'
    },
    closed: {
        color: '#8b8b8b'
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 200
    }
});
