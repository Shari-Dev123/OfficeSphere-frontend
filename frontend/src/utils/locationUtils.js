// utils/locationUtils.js
// ✅ SECURE VERSION - API keys from environment variables

// ✅ SECURE: Get API key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Validate API key is present
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ WARNING: VITE_GOOGLE_MAPS_API_KEY not found in environment variables');
  console.warn('📝 Add it to your .env file: VITE_GOOGLE_MAPS_API_KEY=your-api-key-here');
}

/**
 * Convert coordinates to readable address using Google Geocoding API
 * Falls back to OpenStreetMap if Google fails
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address details
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    console.log('🌍 Geocoding coordinates:', { latitude, longitude });

    // TRY GOOGLE GEOCODING FIRST (if API key is available)
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'undefined') {
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );

        const googleData = await googleResponse.json();
        console.log('📍 Google Geocoding Status:', googleData.status);

        if (googleData.status === 'OK' && googleData.results && googleData.results.length > 0) {
          const result = googleData.results[0];
          
          // Extract detailed address components
          const addresscomponents = result.address_components;
          
          let street = '';
          let area = '';
          let city = '';
          let state = '';
          let country = '';
          let postalCode = '';

          addresscomponents.forEach(component => {
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

          console.log('✅ Google Geocoding Success:', {
            city,
            state,
            country
          });

          return {
            success: true,
            source: 'google',
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
          console.warn('⚠️ Google Geocoding returned:', googleData.status);
          throw new Error(`Google Geocoding failed: ${googleData.status}`);
        }
      } catch (googleError) {
        console.error('❌ Google Geocoding error:', googleError.message);
        // Fall through to OpenStreetMap
      }
    } else {
      console.log('⚠️ No Google Maps API key - using OpenStreetMap only');
    }
    
    // FALLBACK TO OPENSTREETMAP
    console.log('🔄 Using OpenStreetMap...');
    return await getAddressFromOpenStreetMap(latitude, longitude);

  } catch (error) {
    console.error('❌ Geocoding error:', error);
    
    // FALLBACK TO OPENSTREETMAP
    try {
      console.log('🔄 Falling back to OpenStreetMap...');
      return await getAddressFromOpenStreetMap(latitude, longitude);
    } catch (osmError) {
      console.error('❌ OpenStreetMap also failed:', osmError);
      
      // LAST RESORT - RETURN COORDINATES
      return {
        success: false,
        source: 'none',
        error: 'All geocoding services failed',
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      };
    }
  }
};

/**
 * Fallback geocoding using OpenStreetMap Nominatim
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Address details
 */
const getAddressFromOpenStreetMap = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AttendanceApp/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error('OpenStreetMap request failed');
    }

    const data = await response.json();
    console.log('📍 OpenStreetMap Response:', data);

    if (data && data.display_name) {
      const address = data.address || {};

      // Extract components
      const street = address.road || '';
      const area = address.suburb || address.neighbourhood || address.quarter || '';
      const city = address.city || address.town || address.village || '';
      const state = address.state || address.province || '';
      const country = address.country || '';
      const postalCode = address.postcode || '';

      console.log('✅ OpenStreetMap Success:', {
        city,
        state,
        country
      });

      return {
        success: true,
        source: 'openstreetmap',
        formattedAddress: data.display_name,
        street: street,
        area: area,
        city: city,
        state: state,
        country: country,
        postalCode: postalCode,
        placeId: data.place_id
      };
    } else {
      throw new Error('No address found in OpenStreetMap response');
    }
  } catch (error) {
    console.error('❌ OpenStreetMap error:', error);
    throw error;
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

  // Return format based on available data
  if (address.area && address.city) {
    return `${address.area}, ${address.city}`;
  } else if (address.city && address.state) {
    return `${address.city}, ${address.state}`;
  } else if (address.city) {
    return address.city;
  } else if (address.state && address.country) {
    return `${address.state}, ${address.country}`;
  } else if (address.formattedAddress) {
    // Extract first 2 parts from formatted address
    const parts = address.formattedAddress.split(',').slice(0, 2);
    return parts.join(',').trim();
  } else {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Validate if coordinates are within reasonable bounds
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean} True if valid
 */
export const validateCoordinates = (latitude, longitude) => {
  return (
    latitude >= -90 && 
    latitude <= 90 && 
    longitude >= -180 && 
    longitude <= 180
  );
};

/**
 * Calculate distance between two coordinates (in meters)
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export default {
  getAddressFromCoordinates,
  getShortLocationName,
  validateCoordinates,
  calculateDistance
};