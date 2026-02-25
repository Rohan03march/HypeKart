import React from 'react';
import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export function Button({
    title,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    style,
    onPress,
    disabled,
    ...props
}: ButtonProps) {

    const handlePress = (e: any) => {
        if (disabled || isLoading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress(e);
    };

    const textColors: Record<NonNullable<ButtonProps['variant']>, 'inverse' | 'primary' | 'secondary'> = {
        primary: 'inverse',
        outline: 'primary',
        ghost: 'secondary',
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            disabled={disabled || isLoading}
            style={[
                styles.baseContainer,
                styles[`variant_${variant}`],
                styles[`size_${size}`],
                fullWidth ? { width: '100%' } : { alignSelf: 'flex-start' },
                disabled ? { opacity: 0.5 } : { opacity: 1 },
                style
            ]}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? '#fff' : '#000'} />
            ) : (
                <View style={styles.contentContainer}>
                    {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
                    <Typography
                        variant="button"
                        color={textColors[variant]}
                        weight="medium"
                    >
                        {title}
                    </Typography>
                    {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    baseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    variant_primary: {
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    variant_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    variant_ghost: {
        backgroundColor: 'transparent',
    },
    size_sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    size_md: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    size_lg: {
        paddingVertical: 20,
        paddingHorizontal: 32,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftIconContainer: {
        marginRight: 8,
    },
    rightIconContainer: {
        marginLeft: 8,
    }
});
