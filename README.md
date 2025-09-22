<div align="center">
</div>

# Places Autocomplete Visualizer

An interactive React application for exploring and testing the [Google Places Autocomplete API](https://developers.google.com/maps/documentation/places/web-service/autocomplete) with advanced features like location biasing, location restriction, and field mask selection. Visualize autocomplete predictions and place details directly on a map, and experiment with API parameters in real time.

---

## Features

- **Interactive Map:** Visualize autocomplete results, location bias, and restriction areas on a live Google Map.
- **Flexible Request Builder:** Easily configure all supported parameters for the Places Autocomplete API, including:
  - Input text
  - Language and region codes
  - Primary place types and region filters
  - Location bias and restriction (draw or enter coordinates)
  - Origin point (click or enter coordinates)
  - Field mask for Place Details
- **Draw Shapes:** Draw or edit bias/restriction circles and rectangles directly on the map.
- **Result Visualization:** See predictions as map markers, inspect place details, and view distances from the origin.
- **Generated cURL:** Instantly get a ready-to-use cURL command for your current request.
- **Accessibility:** Keyboard navigation and focus ring support for all controls.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- A [Google Cloud API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with **Places API** and **Maps JavaScript API** enabled

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Bricyyy/autocomplete-new-tool.git
   cd places-autocomplete-visualizer
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```

4. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173) (or the URL shown in your terminal).

---

## Usage

1. **Enter your Google API key** in the left panel.  
   > Your key is stored in local storage for convenience and never leaves your browser.

2. **Configure your request:**  
   - Enter an input string (e.g., "San Francisco").
   - Optionally set language, region, types, and other parameters.
   - Draw or enter location bias/restriction shapes.
   - Set an origin point if desired.

3. **Send the request:**  
   - Click **Send Request** to fetch autocomplete predictions.
   - Markers will appear on the map for each prediction.
   - Click a marker or list item to view place details.

4. **Inspect results:**  
   - See the full API response and generated cURL command in the right panel.
   - Copy the cURL command for use in your own scripts or testing.

---

## Project Structure

- [`App.tsx`](App.tsx): Main application logic and state management
- [`components/`](components/): UI components (map, forms, panels, etc.)
- [`services/placesService.ts`](services/placesService.ts): API request logic
- [`utils/`](utils/): Utility functions and constants
- [`types.ts`](types.ts): TypeScript type definitions

---

## License

This project is for educational and demonstration purposes.  
Not affiliated with Google.  
See [LICENSE](LICENSE) if present.

---

## Credits

- [Google Maps Platform](https://developers.google.com/maps)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Disclaimer

**Do not share your Google API key publicly.**  
API usage may incur costs or be subject to quota limits.
