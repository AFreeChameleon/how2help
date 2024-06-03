import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground, TouchableWithoutFeedback } from "react-native";
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";

import AllModal from "./modal";
import { capitalizeFirstLetter, Tabs } from "../../../lib/helper";
import MissingImageSource from '../../../assets/missing-photos.png';
import BackgroundSource from '../../../assets/background.png';

export default function All({ loading, error, charities, viewPinned, category }) {
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [pinnedItems, setPinnedItems] = useState([]);
    const [refresh, setRefresh] = useState(0);

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
    if (loading) {
        return <View style={[styles.container, {height: '100%'}]}>
            <ImageBackground resizeMode="repeat" source={BackgroundSource} style={{ height: '100%', width: '100%' }}>
            <View style={styles.spinnerContainer}>
                <ActivityIndicator
                    animating
                />
                <Text style={{ fontSize: 16, fontWeight: 500, marginTop: 10 }}>
                    Loading charities...
                </Text>
            </View>
            </ImageBackground>
        </View>;
    }
    let items = viewPinned ? pinnedItems : charities;
    if (category !== Tabs.All) {
        items = items.filter(item => item.category === category);
    }
    return (
        <View style={styles.container}>
            <AllModal
                selectedCharity={selectedCharity}
                onClose={() => setSelectedCharity(null)}
                setRefresh={() => setRefresh(refresh + 1)}
            />
            <ImageBackground source={BackgroundSource} resizeMode="repeat">
                <ScrollView style={styles.scrollable} showsVerticalScrollIndicator={false}>
                    <View>
                        {items.length ? items.map((charity) => (
                            <TouchableWithoutFeedback key={charity.link} onPress={() => setSelectedCharity(charity)}>
                                <View style={styles.charityContainer}>
                                <Image
                                    source={charity.photos ?
                                        {uri: `${process.env.EXPO_PUBLIC_API_URL}/photo?path=${charity.photos[0].name}`} :
                                        MissingImageSource
                                    }
                                    style={styles.charityMainImage}
                                />
                                <View style={[styles.charityContent, charity.photos && styles.borderGreyTop]}>
                                    <View style={styles.row}>
                                        <Text style={styles.charityName}>{charity.name}</Text>
                                        <Text style={styles.charityDistance}>{charity.distance && charity.distance.toString().substr(0,3) + ' km'}</Text>
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
                                </View>
                            </TouchableWithoutFeedback>
                        )) : (
                            <View style={styles.spinnerContainer}>
                                <Text style={{ fontSize: 16, fontWeight: 500, marginTop: 10 }}>
                                    No results :(
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomColor: '#8B8B8B',
        borderBottomWidth: 1,
        borderTopColor: '#8B8B8B',
        borderTopWidth: 1,
        backgroundColor: '#EDF1ED',
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
