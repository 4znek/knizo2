import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: {
					...Platform.select({
						ios: {
							position: "absolute",
							bottom: 0,
							height: 84,
							paddingBottom: 20,
						},
						android: {
							height: 60,
							paddingBottom: 8,
						},
					}),
					...styles.tabBar,
				},
				tabBarLabelStyle: styles.tabBarLabel,
				tabBarIconStyle: styles.tabBarIcon,
			}}
		>
			<Tabs.Screen
				name="newHangout"
				options={{
					title: "New Hangout",
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="index"
				options={{
					title: "Discover",
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="me"
				options={{
					title: "My Profile",
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		borderTopWidth: 0.5,
		borderTopColor: 'rgba(0, 0, 0, 0.1)',
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	tabBarLabel: {
		fontSize: 12,
		fontWeight: '500',
		marginBottom: 4,
	},
	tabBarIcon: {
		marginTop: 0,
	},
});