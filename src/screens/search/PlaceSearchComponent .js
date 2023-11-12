import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { GOOGLE_MAPS_APIKEY } from '~/helper/GeneralMain';

const PlaceSearchComponent = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 0) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_APIKEY}&language=vi`;
        const response = await fetch(url);
        const json = await response.json();
        console.log('Test search list: ', JSON.stringify(json));
        setSearchResults(json.predictions);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Tìm kiếm địa điểm..." value={query} onChangeText={handleSearch} />
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => item.place_id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.description}</Text>
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
  },
});

export default PlaceSearchComponent;
