import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet } from "react-native";
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

const HEADER_HEIGHT = 250;
const DEFAULT_BOTTOM_TAB_HEIGHT = 60;

type Props = PropsWithChildren<{
	headerImage: ReactElement;
	headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const scrollOffset = useScrollViewOffset(scrollRef);
	let bottom;
	try {
		bottom = useBottomTabOverflow() || DEFAULT_BOTTOM_TAB_HEIGHT;
	} catch (e) {
		bottom = DEFAULT_BOTTOM_TAB_HEIGHT;
	}
	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]),
				},
				{
					scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
				},
			],
		};
	});

	return (
		<ThemedView style={styles.container}>
			<Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} scrollIndicatorInsets={{ bottom }} contentContainerStyle={{ paddingBottom: bottom }}>
				<Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }, headerAnimatedStyle]}>
					{headerImage}
				</Animated.View>
				<ThemedView style={styles.content}>{children}</ThemedView>
			</Animated.ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		height: HEADER_HEIGHT,
		overflow: "hidden",
	},
	content: {
		flex: 1,
		padding: 32,
		gap: 16,
		overflow: "hidden",
	},
});
