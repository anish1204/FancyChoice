import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../config/constants';

export const Screen = ({ children, onRefresh, refreshing, contentStyle }) => (
  <ScrollView
    style={{ flex: 1, backgroundColor: COLORS.bg }}
    contentContainerStyle={[{ padding: 16, paddingBottom: 32 }, contentStyle]}
    refreshControl={
      onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
    }
  >
    {children}
  </ScrollView>
);
