import React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";

export default function All() {
    return (
        <ScrollView style={styles.container}>
            <View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomColor: '#8B8B8B',
        borderBottomWidth: 1,
        borderTopColor: '#8B8B8B',
        borderTopWidth: 1,
        height: '100%',
        backgroundColor: '#F4F4F4'
    },
});
