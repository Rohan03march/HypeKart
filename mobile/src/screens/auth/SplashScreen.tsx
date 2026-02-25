import { View, StyleSheet } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { useEffect } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {

    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <View style={styles.container}>
            <Typography variant="h1" weight="bold" style={styles.title}>
                HYPEKART
            </Typography>
            <Typography variant="caption" style={styles.subtitle}>
                Premium Essentials
            </Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        color: '#ffffff',
        letterSpacing: 4,
        textTransform: 'uppercase'
    },
    subtitle: {
        color: '#9ca3af',
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase'
    }
});
