import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';

// Dữ liệu sẵn có (Danh sách B)
const localData = [
  // ... (dữ liệu danh sách B của bạn)
];

const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Thay thế với API Key của bạn

const SearchFastScreen = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [combinedResults, setCombinedResults] = useState([]);

  const fetchGooglePlaces = async (text) => {
    if (text.length > 0) {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_PLACES_API_KEY}&language=vi`);
        const json = await response.json();
        if (json.status === 'OK') {
          setSearchResults(json.predictions);
        } else {
          console.error('Google Places API Error:', json.status);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Gọi hàm này mỗi khi searchResults hoặc localData thay đổi
  useEffect(() => {
    const mergeResults = () => {
      const merged = [...localData];

      // Chỉ thêm những kết quả từ API không trùng lặp với localData
      searchResults.forEach((apiResult) => {
        if (!merged.find((localItem) => localItem.desc === apiResult.description)) {
          merged.push({
            // Định nghĩa thông tin bạn cần từ kết quả API
            id: apiResult.place_id,
            text: apiResult.structured_formatting.main_text,
            desc: apiResult.description,
            location: {
              // Thông tin vị trí giả sử, vì API không trả về vị trí chính xác
              latitude: 0,
              longitude: 0,
            },
            country: 'VietNam',
          });
        }
      });

      setCombinedResults(merged);
    };

    mergeResults();
  }, [searchResults, localData]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm địa điểm..."
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          fetchGooglePlaces(text);
        }}
      />
      <FlatList
        data={combinedResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.text}</Text>
            <Text>{item.desc}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchFastScreen;
