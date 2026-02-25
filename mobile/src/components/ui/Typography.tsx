import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
    color?: 'primary' | 'secondary' | 'accent' | 'inverse';
    weight?: 'normal' | 'medium' | 'bold';
    align?: 'left' | 'center' | 'right';
    children: React.ReactNode;
}

export function Typography({
    variant = 'body',
    color = 'primary',
    weight = 'normal',
    align = 'left',
    style,
    children,
    ...props
}: TypographyProps) {

    return (
        <Text
            style={[
                styles.base,
                styles[`variant_${variant}`],
                styles[`color_${color}`],
                styles[`weight_${weight}`],
                styles[`align_${align}`],
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    base: {
        fontFamily: 'System', // Fallback, usually rely on weight/system font
    },
    variant_h1: {
        fontSize: 36,
        letterSpacing: -1,
    },
    variant_h2: {
        fontSize: 24,
        letterSpacing: -0.5,
    },
    variant_h3: {
        fontSize: 20,
        letterSpacing: -0.5,
    },
    variant_body: {
        fontSize: 16,
        letterSpacing: 0,
    },
    variant_caption: {
        fontSize: 14,
        letterSpacing: 0,
    },
    variant_button: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    color_primary: {
        color: '#000000',
    },
    color_secondary: {
        color: '#666666',
    },
    color_accent: {
        color: '#ccff00',
    },
    color_inverse: {
        color: '#ffffff',
    },
    weight_normal: {
        fontWeight: '400',
    },
    weight_medium: {
        fontWeight: '500',
    },
    weight_bold: {
        fontWeight: '700',
    },
    align_left: {
        textAlign: 'left',
    },
    align_center: {
        textAlign: 'center',
    },
    align_right: {
        textAlign: 'right',
    }
});
