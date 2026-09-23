/** 화면 공통 셸: 배경 + 세이프에어리어 + 패딩 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Backdrop } from './Backdrop';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'alarm';
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, variant = 'default', style }: Props) {
  return (
    <View style={styles.root}>
      <Backdrop variant={variant} />
      <SafeAreaView style={[styles.safe, style]} edges={['top', 'bottom', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16, gap: 16 },
});
