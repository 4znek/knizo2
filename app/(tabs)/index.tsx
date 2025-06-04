import React, { useState, useRef } from "react";
import { StyleSheet, View, Image, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Animated, PanResponder, Easing, ScrollView, Platform, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@rneui/themed";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.09;
const ICON_SIZE = 24;

// Theme constants
const THEME = {
  colors: {
    primary: '#6C63FF', // Modern purple
    secondary: '#FF6B6B', // Coral red
    accent: '#4ECDC4', // Turquoise
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
      light: '#B2BEC3'
    },
    action: {
      yes: '#00B894', // Fresh green
      no: '#FF7675', // Soft red
      save: '#FDCB6E' // Warm yellow
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24
  }
};

const EDGE_PADDING = THEME.spacing.md;
const MIN_ICON_SPACING = 4;
const COMPRESSED_ICON_SIZE = ICON_SIZE * 0.8; // Icons become 20% smaller when search is expanded

// Animation constants
const SWIPE_THRESHOLD = 80;
const SWIPE_OUT_DURATION = 400;
const SWIPE_OUT_DISTANCE = width * 2;
const FLIP_DURATION = 300;
const DIRECTION_LOCK_THRESHOLD = 20;

// Filter Icons configuration
const FILTER_ICONS = [
  {
    id: 'tags',
    icon: 'local-offer',
    label: 'Tags'
  },
  {
    id: 'calendar',
    icon: 'event',
    label: 'Time & Date'
  },
  {
    id: 'people',
    icon: 'people',
    label: 'People'
  },
  {
    id: 'location',
    icon: 'place',
    label: 'Location'
  },
  {
    id: 'search',
    icon: 'search',
    label: 'Search'
  }
] as const;

type FilterIconId = typeof FILTER_ICONS[number]['id'];

interface Hangout {
  id: string;
  title: string;
  description: string;
  poster: {
    username: string;
    profilePic: any;  // Using any for now since it's an imported image
  };
  location: string;
  date: string;
  time: string;
}

type TimeRange = {
  start?: string;
  end?: string;
};

type DateRange = {
  start?: Date;
  end?: Date;
};

type DateTimeSelection = {
  type: 'specific' | 'range';
  start?: Date;
  end?: Date;
};

type FilterState = {
  tags: string[];
  dateSelection: DateTimeSelection;
  timeSelection: DateTimeSelection;
  people: number;
  locations: string[];
};

const INITIAL_FILTER_STATE: FilterState = {
  tags: [],
  dateSelection: { type: 'specific' },
  timeSelection: { type: 'specific' },
  people: 2,
  locations: [],
};

const DUMMY_TAGS = ['Dinner', 'Walk', 'Study sesh', 'Cinema', 'Sports', 'Game Night'];
const LOCATION_OPTIONS = ['On Campus', 'Kunshan', 'Shanghai', 'Suzhou', 'Somewhere Else'];

// Add after the THEME constant
const CARD_COLORS = [
  {
    header: '#7C3AED', // Deep purple
    body: '#F5F3FF',   // Light purple tint
    text: '#FFFFFF',   // White text for header
    bodyText: '#1F2937' // Dark gray for body text
  },
  {
    header: '#0EA5E9', // Sky blue
    body: '#F0F9FF',   // Light blue tint
    text: '#FFFFFF',
    bodyText: '#1F2937'
  },
  {
    header: '#059669', // Emerald green
    body: '#ECFDF5',   // Light green tint
    text: '#FFFFFF',
    bodyText: '#1F2937'
  },
  {
    header: '#DC2626', // Red
    body: '#FEF2F2',   // Light red tint
    text: '#FFFFFF',
    bodyText: '#1F2937'
  },
  {
    header: '#F59E0B', // Amber
    body: '#FFFBEB',   // Light amber tint
    text: '#FFFFFF',
    bodyText: '#1F2937'
  }
];

export default function DiscoverScreen() {
  const [selectedIcon, setSelectedIcon] = useState<FilterIconId | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [moveDirection, setMoveDirection] = useState<'horizontal' | 'vertical' | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Animation value refs
  const position = useRef(new Animated.ValueXY()).current;
  const isAnimating = useRef(false);
  const colorAnimation = useRef(new Animated.Value(0)).current;
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const searchWidth = useRef(new Animated.Value(0)).current;
  const iconsSpacing = useRef(new Animated.Value(1)).current; // 1 = evenly spaced, 0 = compressed
  const menuAnimation = useRef(new Animated.Value(0)).current;

  // Add color interpolations for horizontal swipes
  const tintColorInterpolation = colorAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['rgba(255, 75, 75, 0.4)', 'rgba(255, 255, 255, 0)', 'rgba(76, 175, 80, 0.4)']
  });

  // Add color interpolation for vertical swipes
  const saveTintColorInterpolation = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 165, 0, 0.4)']
  });

  const updateColorAnimation = (dx: number, dy: number) => {
    if (moveDirection === 'horizontal') {
      const progress = Math.min(Math.max(dx / SWIPE_THRESHOLD, -1), 1);
      colorAnimation.setValue(progress);
    } else if (moveDirection === 'vertical') {
      const progress = Math.min(Math.max(dy / SWIPE_THRESHOLD, 0), 1);
      colorAnimation.setValue(progress);
    }
  };

  const DUMMY_HANGOUTS = [
    {
      id: '1',
      title: 'Dayu Bay walk',
      description: 'Hey guys! I\'m going to Dayu Bay for a walk. MAYBE go to Mammamia, if I have enough money lol. Join me?',
      poster: {
        username: 'houda_douda',
        profilePic: require('../../assets/images/avatar1.png')
      },
      location: 'Dayu Bay, right in front of the school',
      date: '2024-05-25',
      time: '15:00'
    },
    {
      id: '2',
      title: 'Board Game Night',
      description: 'We\'re hosting a game night in A lobby. Mainly play Catan. Pls read the rules before coming thx!',
      poster: {
        username: 'xia__xia',
        profilePic: require('../../assets/images/avatar3.png')
      },
      location: 'A Lobby',
      date: '2024-05-26',
      time: '19:00'
    },
    {
      id: '3',
      title: 'Morning jog guys!!! Join :D',
      description: 'Hey! Im going for a jog early in the morning before classes. Around campus. Comeee',
      poster: {
        username: 'fitness_sara',
        profilePic: require('../../assets/images/avatar5.png')
      },
      location: 'Around campus (or Dayu Bay)',
      date: '2024-05-26',
      time: '06:30'
    },
    {
      id: '4',
      title: 'New York Trip',
      description: 'Hi! I\'m looking for people who\'d be interested in going to New York for the upcoming break. Bonus: my Egyptian friend will be our tour guide!!!!',
      poster: {
        username: 'knizo_personellement',
        profilePic: require('../../assets/images/avatar2.png')
      },
      location: 'New York',
      date: '2024-05-26 to 2024-06-03',
      time: 'TBD'
    },
    {
      id: '5',
      title: 'Piano learning',
      description: 'Hello, my friend and I are organizing a piano learning class for beginners. Join if interested, it\'s free!',
      poster: {
        username: 'jack_macron',
        profilePic: require('../../assets/images/avatar4.png')
      },
      location: 'CCTE Music Rooms',
      date: '2024-05-26',
      time: '15:00'
    },
    {
      id: '6',
      title: 'Football table at CCTW lunch time',
      description: 'Hi peeps! Organizing a football table at CCTE for lunch time. Coach will be there. Join if interested!',
      poster: {
        username: 'lunaactions',
        profilePic: require('../../assets/images/avatar6.png')
      },
      location: 'CCTW 2nd floor, right outside of Zaatar',
      date: '2024-05-26',
      time: '12:00'
    },
    {
      id: '7',
      title: 'Clubbing after finals cuz we deserve it',
      description: 'Early morning jog in Central Park. Beginners welcome! We will take it easy and enjoy the sunrise.',
      poster: {
        username: 'fitness_sara',
        profilePic: require('../../assets/images/avatar7.png')
      },
      location: 'Shanghai - Lola Club - 46 Yueyang Road / 岳阳路46',
      date: '2024-05-26',
      time: '20:00'
    }
  ];

  const nextCard = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsFlipped(false);
    
    setTimeout(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prevIndex => (prevIndex + 1) % DUMMY_HANGOUTS.length);
      isAnimating.current = false;
      setIsTransitioning(false);
    }, 32);
  };

  const resetCard = (callback?: () => void) => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      tension: 40,
      friction: 5
    }).start(() => {
      setMoveDirection(null);
      callback?.();
    });
  };

  const animateCardOut = (toValue: number, axis: 'x' | 'y' = 'x') => {
    if (isAnimating.current) return;
    
    isAnimating.current = true;
    setIsFlipped(false);

    const animation = Animated.timing(axis === 'x' ? position.x : position.y, {
      toValue,
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease)
    });

    animation.start(({ finished }) => {
      if (finished) {
        nextCard();
      } else {
        isAnimating.current = false;
        resetCard();
      }
    });
  };

  const handleYesPress = () => {
    setIsVertical(false);
    Animated.timing(position.x, {
      toValue: DIRECTION_LOCK_THRESHOLD,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      animateCardOut(SWIPE_OUT_DISTANCE);
    });
  };

  const handleNoPress = () => {
    setIsVertical(false);
    Animated.timing(position.x, {
      toValue: -DIRECTION_LOCK_THRESHOLD,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      animateCardOut(-SWIPE_OUT_DISTANCE);
    });
  };

  const handleSavePress = () => {
    setIsVertical(true);
    Animated.timing(position.y, {
      toValue: DIRECTION_LOCK_THRESHOLD,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      animateCardOut(SWIPE_OUT_DISTANCE, 'y');
    });
  };

  const handleCardPress = () => {
    if (isAnimating.current) return;
    
    setIsFlipped(!isFlipped);
  };

  const handleSearchPress = () => {
    if (!isSearchExpanded) {
      setSelectedIcon('search');
      setIsSearchExpanded(true);
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(iconsSpacing, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    }
  };

  const handleSearchCollapse = () => {
    if (isSearchExpanded) {
      setSelectedIcon(null);
      setIsSearchExpanded(false);
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(iconsSpacing, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    }
  };

  const animateMenu = (show: boolean) => {
    Animated.spring(menuAnimation, {
      toValue: show ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  };

  const handleIconPress = (iconId: FilterIconId) => {
    if (iconId === 'search') {
      handleSearchPress();
    } else {
      if (isSearchExpanded) {
        handleSearchCollapse();
      }
      const isOpening = selectedIcon !== iconId;
      animateMenu(isOpening);
      setSelectedIcon(prev => prev === iconId ? null : iconId);
    }
  };

  const handleConfirmFilters = () => {
    setActiveFilters(draftFilters);
    setSelectedIcon(null);
  };

  const handleCancelFilters = () => {
    setDraftFilters(activeFilters);
    setSelectedIcon(null);
  };

  const [showDatePicker, setShowDatePicker] = useState<{
    show: boolean;
    mode: 'date' | 'time';
    for: 'start' | 'end';
  }>({ show: false, mode: 'date', for: 'start' });

  const handleDateTimeSelect = (event: any, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker({ ...showDatePicker, show: false });
      return;
    }

    if (selected) {
      const selectionType = showDatePicker.mode === 'date' ? 'dateSelection' : 'timeSelection';
      const newFilters = { ...draftFilters };

      if (showDatePicker.for === 'start') {
        newFilters[selectionType].start = selected;
      } else {
        newFilters[selectionType].end = selected;
      }

      setDraftFilters(newFilters);
    }
    setShowDatePicker({ ...showDatePicker, show: false });
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString();
  };

  const formatTime = (date?: Date) => {
    if (!date) return 'Not set';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderFilterIcons = () => {
    const otherIcons = FILTER_ICONS.filter(icon => icon.id !== 'search');
    const searchIcon = FILTER_ICONS.find(icon => icon.id === 'search');

    if (!searchIcon) return null;

    const searchBarStyle: Animated.AnimatedProps<ViewStyle> = {
      width: searchWidth.interpolate({
        inputRange: [0, 1],
        outputRange: [ICON_SIZE * 2, width - THEME.spacing.lg * 2]
      })
    };

    const otherIconsStyle: Animated.AnimatedProps<ViewStyle> = {
      opacity: iconsSpacing.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1]
      }),
      transform: [{
        scale: iconsSpacing.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }]
    };

    return (
      <TouchableWithoutFeedback onPress={handleSearchCollapse}>
        <View style={styles.filterIconsContainer}>
          {isSearchExpanded ? (
            // Pill-shaped search bar with icons
            <Animated.View style={[styles.searchPill, searchBarStyle]}>
              {/* Search Icon */}
              <TouchableOpacity
                style={[
                  styles.pillSearchIcon,
                  selectedIcon === 'search' && styles.selectedIconContainer
                ]}
                onPress={() => handleIconPress('search')}
              >
                <MaterialIcons
                  name={searchIcon.icon}
                  size={ICON_SIZE}
                  color={selectedIcon === 'search' ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>

              {/* Search Input */}
              <TextInput
                style={styles.pillSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search hangouts..."
                placeholderTextColor="#666"
                autoFocus
              />

              {/* Other Icons Group */}
              <Animated.View style={[styles.pillIconsGroup, otherIconsStyle]}>
                {otherIcons.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.pillIcon,
                      selectedIcon === item.id && styles.selectedIconContainer
                    ]}
                    onPress={() => handleIconPress(item.id)}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={COMPRESSED_ICON_SIZE}
                      color={selectedIcon === item.id ? '#FFFFFF' : '#000000'}
                    />
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </Animated.View>
          ) : (
            // Regular row of icons
            <View style={styles.filterIconsRow}>
              {FILTER_ICONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconContainer,
                    selectedIcon === item.id && styles.selectedIconContainer
                  ]}
                  onPress={() => handleIconPress(item.id)}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={ICON_SIZE}
                    color={selectedIcon === item.id ? '#FFFFFF' : '#000000'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderCards = () => {
    // Don't render during the brief transition
    if (isTransitioning) {
      return (
        <View style={styles.cardContainer}>
          {/* Preload next card with opacity 0 */}
          <View style={[styles.card, { opacity: 0 }]}>
              <View style={styles.frontCardContent}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                {/* Profile Row */}
                <View style={styles.profileRow}>
                  <Image
                    source={DUMMY_HANGOUTS[(currentIndex + 1) % DUMMY_HANGOUTS.length].poster.profilePic}
                    style={styles.profilePic}
                  />
                  <ThemedText style={styles.profileName}>
                    {DUMMY_HANGOUTS[(currentIndex + 1) % DUMMY_HANGOUTS.length].poster.username}
                  </ThemedText>
                </View>
                {/* Title */}
                <ThemedText style={styles.hangoutTitle}>
                  {DUMMY_HANGOUTS[(currentIndex + 1) % DUMMY_HANGOUTS.length].title}
                </ThemedText>
              </View>
              <View style={styles.separator} />
              <View style={styles.cardBody} />
            </View>
          </View>
        </View>
      );
    }

    return renderCard(DUMMY_HANGOUTS[currentIndex]);
  };

  const renderCard = (hangout: Hangout) => {
    const rotate = position.x.interpolate({
      inputRange: [-width/2, 0, width/2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    });

    const animatedCardStyle: Animated.AnimatedProps<ViewStyle> = {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate },
      ]
    };

    // Horizontal color interpolation (for Yes/No)
    const horizontalColor = position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -DIRECTION_LOCK_THRESHOLD, 0, DIRECTION_LOCK_THRESHOLD, SWIPE_THRESHOLD],
      outputRange: ['#FF4B4B', 'white', 'white', 'white', '#4CAF50'],
      extrapolate: 'clamp'
    });

    // Vertical color interpolation (for Save)
    const verticalColor = position.y.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: ['white', '#FFA500'],
      extrapolate: 'clamp'
    });

    // Combine both color styles
    const cardStyle: Animated.AnimatedProps<ViewStyle> = {
      backgroundColor: isVertical ? verticalColor : horizontalColor
    };

    // Inside the renderCard function, add color selection based on index
    const colorScheme = CARD_COLORS[currentIndex % CARD_COLORS.length];

    return (
      <View style={styles.cardContainer}>
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            animatedCardStyle,
            cardStyle
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableWithoutFeedback onPress={handleCardPress}>
            <View style={styles.frontCardContent}>
              {/* Header Section */}
              <View style={[styles.cardHeader, { backgroundColor: colorScheme.header }]}>
                {/* Profile Row */}
                <View style={styles.profileRow}>
                <Image
                  source={hangout.poster.profilePic}
                    style={styles.profilePic}
                  />
                  <ThemedText style={[styles.profileName, { color: colorScheme.text }]}>
                    {hangout.poster.username}
                  </ThemedText>
                </View>
                {/* Title */}
                <ThemedText style={[styles.hangoutTitle, { color: colorScheme.text }]}>
                  {hangout.title}
                </ThemedText>
              </View>

              {/* Separator */}
              <View style={styles.separator} />

              {/* Body Section */}
              <View style={[styles.cardBody, { backgroundColor: colorScheme.body }]}>
                <ThemedText style={[styles.description, { color: colorScheme.bodyText }]}>
                  {hangout.description}
                </ThemedText>
                <View style={styles.detailRow}>
                  <MaterialIcons name="place" size={18} color={colorScheme.bodyText} />
                  <ThemedText style={[styles.detailText, { color: colorScheme.bodyText }]}>
                    {hangout.location}
                  </ThemedText>
              </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="event" size={18} color={colorScheme.bodyText} />
                  <ThemedText style={[styles.detailText, { color: colorScheme.bodyText }]}>
                    {hangout.date}
                  </ThemedText>
            </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="access-time" size={18} color={colorScheme.bodyText} />
                  <ThemedText style={[styles.detailText, { color: colorScheme.bodyText }]}>
                    {hangout.time}
              </ThemedText>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setValue({ x: 0, y: 0 });
        setIsVertical(false);
      },
      onPanResponderMove: (_, gesture) => {
        if (isAnimating.current) return;

        // Calculate the dominant direction based on current gesture
        const isVerticalMove = Math.abs(gesture.dy) > Math.abs(gesture.dx);
        
        // If we've moved past the direction lock threshold
        if (Math.abs(gesture.dx) > DIRECTION_LOCK_THRESHOLD || 
            Math.abs(gesture.dy) > DIRECTION_LOCK_THRESHOLD) {
          setIsVertical(isVerticalMove);
          // Apply movement based on dominant direction
          if (isVerticalMove && gesture.dy > 0) { // Only for downward movement
            position.setValue({ x: 0, y: gesture.dy });
          } else if (!isVerticalMove) {
            position.setValue({ x: gesture.dx, y: 0 });
          }
        } else {
          // Free movement before threshold
          position.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isAnimating.current) return;

        const isVertical = Math.abs(gesture.dy) > Math.abs(gesture.dx);
        const hasPassedThreshold = isVertical 
          ? gesture.dy >= SWIPE_THRESHOLD 
          : Math.abs(gesture.dx) >= SWIPE_THRESHOLD;

        if (hasPassedThreshold) {
          if (isVertical && gesture.dy > 0) {
            animateCardOut(SWIPE_OUT_DISTANCE, 'y');
          } else if (!isVertical) {
            const direction = gesture.dx > 0 ? 1 : -1;
            animateCardOut(direction * SWIPE_OUT_DISTANCE);
          } else {
            resetCard();
          }
        } else {
          resetCard();
        }
      }
    })
  ).current;

  const renderMenu = () => {
    if (!selectedIcon || selectedIcon === 'search') return null;

  return (
      <View style={styles.menuOverlay}>
        <TouchableWithoutFeedback onPress={handleCancelFilters}>
          <View style={styles.menuBackground} />
        </TouchableWithoutFeedback>
        <View style={styles.menuContainer}>
          {selectedIcon === 'tags' && (
            <View style={styles.menuContent}>
              <View style={styles.tagsGrid}>
                {DUMMY_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagPill,
                      draftFilters.tags.includes(tag) && styles.tagPillSelected
                    ]}
                    onPress={() => {
                      const newTags = draftFilters.tags.includes(tag)
                        ? draftFilters.tags.filter(t => t !== tag)
                        : [...draftFilters.tags, tag];
                      setDraftFilters({ ...draftFilters, tags: newTags });
                    }}
                  >
                    <ThemedText style={[
                      styles.tagText,
                      draftFilters.tags.includes(tag) && styles.tagTextSelected
                    ]}>
                      {tag}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmFilters}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Apply Filters
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {selectedIcon === 'calendar' && (
            <View style={styles.menuContent}>
              <View style={styles.dateTimeSection}>
                {/* Date Selection Type */}
                <View style={styles.selectionTypeContainer}>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        draftFilters.dateSelection.type === 'specific' && styles.radioButtonSelected
                      ]}
                      onPress={() => setDraftFilters({
                        ...draftFilters,
                        dateSelection: { type: 'specific', start: draftFilters.dateSelection.start }
                      })}
                    >
                      <ThemedText style={[
                        styles.radioText,
                        draftFilters.dateSelection.type === 'specific' && styles.radioTextSelected
                      ]}>Specific Date</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        draftFilters.dateSelection.type === 'range' && styles.radioButtonSelected
                      ]}
                      onPress={() => setDraftFilters({
                        ...draftFilters,
                        dateSelection: { type: 'range', start: draftFilters.dateSelection.start, end: draftFilters.dateSelection.end }
                      })}
                    >
                      <ThemedText style={[
                        styles.radioText,
                        draftFilters.dateSelection.type === 'range' && styles.radioTextSelected
                      ]}>Date Range</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date Buttons */}
                <View style={styles.dateButtonsContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker({ show: true, mode: 'date', for: 'start' })}
                  >
                    <ThemedText style={styles.dateButtonLabel}>
                      {draftFilters.dateSelection.type === 'specific' ? 'Select Date' : 'Start Date'}
                    </ThemedText>
                    <ThemedText style={styles.dateButtonValue}>
                      {formatDate(draftFilters.dateSelection.start)}
                    </ThemedText>
                  </TouchableOpacity>

                  {draftFilters.dateSelection.type === 'range' && (
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker({ show: true, mode: 'date', for: 'end' })}
                    >
                      <ThemedText style={styles.dateButtonLabel}>End Date</ThemedText>
                      <ThemedText style={styles.dateButtonValue}>
                        {formatDate(draftFilters.dateSelection.end)}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Time Selection Type */}
                <View style={styles.selectionTypeContainer}>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        draftFilters.timeSelection.type === 'specific' && styles.radioButtonSelected
                      ]}
                      onPress={() => setDraftFilters({
                        ...draftFilters,
                        timeSelection: { type: 'specific', start: draftFilters.timeSelection.start }
                      })}
                    >
                      <ThemedText style={[
                        styles.radioText,
                        draftFilters.timeSelection.type === 'specific' && styles.radioTextSelected
                      ]}>Specific Time</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        draftFilters.timeSelection.type === 'range' && styles.radioButtonSelected
                      ]}
                      onPress={() => setDraftFilters({
                        ...draftFilters,
                        timeSelection: { type: 'range', start: draftFilters.timeSelection.start, end: draftFilters.timeSelection.end }
                      })}
                    >
                      <ThemedText style={[
                        styles.radioText,
                        draftFilters.timeSelection.type === 'range' && styles.radioTextSelected
                      ]}>Time Range</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Time Buttons */}
                <View style={styles.dateButtonsContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker({ show: true, mode: 'time', for: 'start' })}
                  >
                    <ThemedText style={styles.dateButtonLabel}>
                      {draftFilters.timeSelection.type === 'specific' ? 'Select Time' : 'Start Time'}
                    </ThemedText>
                    <ThemedText style={styles.dateButtonValue}>
                      {formatTime(draftFilters.timeSelection.start)}
                    </ThemedText>
                  </TouchableOpacity>

                  {draftFilters.timeSelection.type === 'range' && (
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker({ show: true, mode: 'time', for: 'end' })}
                    >
                      <ThemedText style={styles.dateButtonLabel}>End Time</ThemedText>
                      <ThemedText style={styles.dateButtonValue}>
                        {formatTime(draftFilters.timeSelection.end)}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmFilters}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Apply Filters
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {selectedIcon === 'people' && (
            <View style={styles.menuContent}>
              <View style={styles.sliderSection}>
                <View style={styles.sliderHeader}>
                  <ThemedText style={styles.sliderValue}>{draftFilters.people} people</ThemedText>
                </View>
                <View style={styles.customSlider}>
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.numberButton,
                        draftFilters.people === num && styles.numberButtonSelected
                      ]}
                      onPress={() => setDraftFilters({ ...draftFilters, people: num })}
                    >
                      <ThemedText style={[
                        styles.numberText,
                        draftFilters.people === num && styles.numberTextSelected
                      ]}>
                        {num}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmFilters}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Apply Filter
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
          {selectedIcon === 'location' && (
            <View style={styles.menuContent}>
              <View style={styles.checkboxSection}>
                {LOCATION_OPTIONS.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={styles.checkboxRow}
                    onPress={() => {
                      const newLocations = draftFilters.locations.includes(location)
                        ? draftFilters.locations.filter(loc => loc !== location)
                        : [...draftFilters.locations, location];
                      setDraftFilters({ ...draftFilters, locations: newLocations });
                    }}
                  >
                    <View style={[
                      styles.checkbox,
                      draftFilters.locations.includes(location) && styles.checkboxSelected
                    ]}>
                      {draftFilters.locations.includes(location) && (
                        <MaterialIcons name="check" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <ThemedText style={styles.checkboxLabel}>{location}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmFilters}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Apply Filter
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/knizo-symbol-only.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {renderFilterIcons()}
      {renderMenu()}
      {renderCards()}

      <View style={styles.buttonRow}>
        <Button
          title="No"
          onPress={handleNoPress}
          buttonStyle={styles.noButton}
          containerStyle={styles.actionButton}
          titleStyle={{ color: '#FFFFFF' }}
        />
        <Button
          title="Save"
          onPress={handleSavePress}
          buttonStyle={styles.saveButton}
          containerStyle={styles.actionButton}
          titleStyle={{ color: '#FFFFFF' }}
        />
        <Button
          title="Yes"
          onPress={handleYesPress}
          buttonStyle={styles.yesButton}
          containerStyle={styles.actionButton}
          titleStyle={{ color: '#FFFFFF' }}
        />
      </View>

      {/* Date/Time Picker Modal */}
      {showDatePicker.show && (
        <DateTimePicker
          value={
            showDatePicker.for === 'start'
              ? draftFilters[showDatePicker.mode === 'date' ? 'dateSelection' : 'timeSelection'].start || new Date()
              : draftFilters[showDatePicker.mode === 'date' ? 'dateSelection' : 'timeSelection'].end || new Date()
          }
          mode={showDatePicker.mode}
          onChange={handleDateTimeSelect}
        />
      )}
    </SafeAreaView>
  );
}

type Style = {
  container: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  cardContainer: ViewStyle;
  card: ViewStyle;
  cardContent: ViewStyle;
  frontCardContent: ViewStyle;
  cardHeader: ViewStyle;
  profileRow: ViewStyle;
  profilePic: ImageStyle;
  profileName: TextStyle;
  hangoutTitle: TextStyle;
  cardBody: ViewStyle;
  description: TextStyle;
  detailRow: ViewStyle;
  detailText: TextStyle;
  separator: ViewStyle;
  buttonRow: ViewStyle;
  actionButton: ViewStyle;
  noButton: ViewStyle;
  yesButton: ViewStyle;
  saveButton: ViewStyle;
  filterIconsContainer: ViewStyle;
  filterIconsRow: ViewStyle;
  iconContainer: ViewStyle;
  selectedIconContainer: ViewStyle;
  searchPill: ViewStyle;
  pillSearchIcon: ViewStyle;
  pillSearchInput: TextStyle;
  pillIconsGroup: ViewStyle;
  pillIcon: ViewStyle;
  menuOverlay: ViewStyle;
  menuBackground: ViewStyle;
  menuContainer: ViewStyle;
  menuContent: ViewStyle;
  tagsGrid: ViewStyle;
  tagPill: ViewStyle;
  tagPillSelected: ViewStyle;
  tagText: TextStyle;
  tagTextSelected: TextStyle;
  confirmButton: ViewStyle;
  confirmButtonText: TextStyle;
  sliderSection: ViewStyle;
  sliderHeader: ViewStyle;
  sliderValue: TextStyle;
  customSlider: ViewStyle;
  numberButton: ViewStyle;
  numberButtonSelected: ViewStyle;
  numberText: TextStyle;
  numberTextSelected: TextStyle;
  checkboxSection: ViewStyle;
  checkboxRow: ViewStyle;
  checkbox: ViewStyle;
  checkboxSelected: ViewStyle;
  checkboxLabel: TextStyle;
  dateTimeSection: ViewStyle;
  selectionTypeContainer: ViewStyle;
  radioGroup: ViewStyle;
  radioButton: ViewStyle;
  radioButtonSelected: ViewStyle;
  radioText: TextStyle;
  radioTextSelected: TextStyle;
  dateButtonsContainer: ViewStyle;
  dateButton: ViewStyle;
  dateButtonLabel: TextStyle;
  dateButtonValue: TextStyle;
  sectionTitle: TextStyle;
};

const baseStyles = StyleSheet.create<Style>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xs,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.md,
    marginBottom: 80, // Add space for the buttons
  },
  card: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 1.2,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },
  frontCardContent: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: THEME.borderRadius.lg,
  },
  cardHeader: {
    marginBottom: 8,
    height: '35%',
    padding: THEME.spacing.md,
    justifyContent: 'space-around',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  hangoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
  },
  cardBody: {
    flex: 1,
    padding: THEME.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    marginVertical: THEME.spacing.xs,
  },
  detailText: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    width: 110,
    height: 52,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: 'transparent',
  },
  noButton: {
    backgroundColor: THEME.colors.action.no,
  },
  yesButton: {
    backgroundColor: THEME.colors.action.yes,
  },
  saveButton: {
    backgroundColor: THEME.colors.action.save,
  },
  filterIconsContainer: {
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.lg,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  filterIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  iconContainer: {
    width: ICON_SIZE * 2,
    height: ICON_SIZE * 2,
    borderRadius: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedIconContainer: {
    backgroundColor: '#000000',
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: (ICON_SIZE * 2) / 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: ICON_SIZE * 2,
    paddingRight: THEME.spacing.xs,
  },
  pillSearchIcon: {
    width: ICON_SIZE * 2,
    height: ICON_SIZE * 2,
    borderRadius: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pillSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#000000',
    paddingHorizontal: THEME.spacing.xs,
  },
  pillIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    paddingLeft: THEME.spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  pillIcon: {
    width: COMPRESSED_ICON_SIZE * 1.5,
    height: COMPRESSED_ICON_SIZE * 1.5,
    borderRadius: COMPRESSED_ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  menuOverlay: {
    position: 'absolute',
    marginTop: 170,
    left: 0,
    right: 0,
    top: ICON_SIZE * 2,
    zIndex: 1000,
    transform: [{
      translateY: -20
    }]
  },
  menuBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',
    borderBottomLeftRadius: THEME.borderRadius.md,
    borderBottomRightRadius: THEME.borderRadius.md,
    marginHorizontal: THEME.spacing.lg,
    marginTop: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuContent: {
    padding: THEME.spacing.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
  },
  tagPill: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tagPillSelected: {
    backgroundColor: THEME.colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: THEME.colors.text.primary,
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeSection: {
    marginBottom: THEME.spacing.lg,
  },
  selectionTypeContainer: {
    marginBottom: THEME.spacing.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  radioButton: {
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: THEME.borderRadius.sm,
  },
  radioButtonSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: THEME.colors.text.primary,
  },
  dateButtonsContainer: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  dateButton: {
    flex: 1,
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: THEME.borderRadius.sm,
  },
  dateButtonLabel: {
    fontSize: 14,
    color: THEME.colors.text.primary,
  },
  dateButtonValue: {
    fontSize: 14,
    color: THEME.colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
  },
  sliderSection: {
    marginBottom: THEME.spacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  customSlider: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    marginVertical: THEME.spacing.md,
  },
  numberButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  numberButtonSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  numberText: {
    fontSize: 16,
    color: THEME.colors.text.primary,
  },
  numberTextSelected: {
    color: '#FFFFFF',
  },
  checkboxSection: {
    marginBottom: THEME.spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: THEME.colors.text.primary,
  },
  radioTextSelected: {
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create(baseStyles);