import React from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';
import { StyleSheet, Text, View, TouchableOpacity, Animated, StatusBar } from 'react-native';

import FoodTab from './food';
import AllTab from './all';
import HealthTab from './health';
import EducationTab from './education';

const Tabs = {
    All: 'all',
    Food: 'food',
    Health: 'health',
    Education: 'education',
};

export default class CustomTabs extends React.Component {
    state = {
        index: 0,
        routes: [
            {
                key: Tabs.All,
                title: 'Home'
            },
            {
                key: Tabs.Food,
                title: 'Food'
            },
            {
                key: Tabs.Health,
                title: 'Health'
            },
            {
                key: Tabs.Education,
                title: 'Education'
            }
        ],
    };

    _handleIndexChange = (index) => this.setState({ index });

    _renderTabBar = (props) => {
        const inputRange = props.navigationState.routes.map((_, i) => i);

        return (
            <View style={styles.tabBar}>
                {props.navigationState.routes.map((route, i) => {
                    const opacity = props.position.interpolate({
                        inputRange,
                        outputRange: inputRange.map((inputIndex) =>
                            inputIndex === i ? 1 : 0.5
                        ),
                    });
                    const selected = this.state.index === i;

                    return (
                        <TouchableOpacity
                            key={i}
                            style={selected ? styles.tabItem : styles.tabItemSelected}
                            onPress={() => this.setState({ index: i })}
                        >
                            <View style={selected && styles.selected}>
                                <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    _renderScene = SceneMap({
        [Tabs.All]: AllTab,
        [Tabs.Food]: FoodTab,
        [Tabs.Health]: HealthTab,
        [Tabs.Education]: EducationTab,
    });

    render() {
        return (
            <TabView
                navigationState={this.state}
                renderScene={this._renderScene}
                renderTabBar={this._renderTabBar}
                onIndexChange={this._handleIndexChange}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        paddingTop: StatusBar.currentHeight,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        paddingBottom: 20
    },
    tabItemSelected: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        paddingBottom: 20
    },
    selected: {
        borderBottomColor: '#000000',
        borderBottomWidth: 2
    }
});

