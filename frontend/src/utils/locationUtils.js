// utils/locationUtils.js
// Google Maps Geocoding utilities

const GOOGLE_MAPS_API_KEY = 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao';

/**
 * Convert coordinates to readable address using Google Geocoding API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address details
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract detailed address components
      const addressComponents = result.address_components;
      
      let street = '';
      let area = '';
      let city = '';
      let state = '';
      let country = '';
      let postalCode = '';

      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number') || types.includes('route')) {
          street += component.long_name + ' ';
        }
        if (types.includes('sublocality') || types.includes('neighborhood')) {
          area = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
        }
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      });

      return {
        success: true,
        formattedAddress: result.formatted_address,
        street: street.trim(),
        area: area,
        city: city,
        state: state,
        country: country,
        postalCode: postalCode,
        placeId: result.place_id
      };
    } else {
      return {
        success: false,
        error: 'No address found',
        formattedAddress: 'Location unavailable'
      };
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return {
      success: false,
      error: error.message,
      formattedAddress: 'Error getting location'
    };
  }
};

/**
 * Get short location name (City, State format)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Short location name
 */
export const getShortLocationName = async (latitude, longitude) => {
  const address = await getAddressFromCoordinates(latitude, longitude);
  
  if (!address.success) {
    return 'Location unavailable';
  }

  // Return format: "Area, City" or "City, State"
  if (address.area && address.city) {
    return `${address.area}, ${address.city}`;
  } else if (address.city && address.state) {
    return `${address.city}, ${address.state}`;
  } else if (address.city) {
    return address.city;
  } else {
    return address.formattedAddress.split(',').slice(0, 2).join(',');
  }
};