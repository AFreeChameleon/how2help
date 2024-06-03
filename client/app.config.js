import * as dotenv from 'dotenv';

// initialize dotenv
dotenv.config();

export default ({ config }) => {
    return {
        ...config,
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.afreechameleon.howtohelp",
            permissions: [
                "android.permission.ACCESS_COARSE_LOCATION",
                "android.permission.ACCESS_FINE_LOCATION"
            ],
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GMAPS_KEY,
                },
            },
        },
    }
};
