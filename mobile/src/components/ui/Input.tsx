import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    style,
    onFocus,
    onBlur,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <View style={[{ width: '100%' }, style]}>
            {label && (
                <Typography variant="caption" style={styles.label}>
                    {label}
                </Typography>
            )}

            <View
                style={[
                    styles.inputContainer,
                    error ? styles.inputError : isFocused ? styles.inputFocused : styles.inputDefault
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={styles.textInput}
                    placeholderTextColor="#9ca3af"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {error && (
                <Typography variant="caption" style={styles.errorText}>
                    {error}
                </Typography>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        marginBottom: 8,
        color: '#666',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 56,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
    },
    inputDefault: {
        borderColor: '#e5e5e5',
    },
    inputFocused: {
        borderColor: '#000',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    leftIcon: {
        marginRight: 12,
    },
    rightIcon: {
        marginLeft: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        height: '100%',
    },
    errorText: {
        marginTop: 8,
        color: '#ef4444',
    }
});
