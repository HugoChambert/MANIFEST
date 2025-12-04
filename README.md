# MANIFEST - Flight Manifest & Weight Balance System

A professional, production-ready flight manifest and weight & balance calculation system for aircraft operations.

## Features

### Dashboard & Management
- **Comprehensive Dashboard**: View all flight manifests with statistics and filtering
- **Search & Filter**: Search by flight number, pilot, or aircraft registration
- **Status Tracking**: Quickly identify safe flights vs. those with warnings
- **Statistics Overview**: Real-time stats showing total manifests, safe flights, warnings, and today's flights

### Flight Manifest Creation
- **Complete Flight Information**: Capture all required data including:
  - Flight number, date, departure/arrival times
  - Pilot in Command and Second in Command
  - Aircraft selection from fleet
  - Crew weight, fuel onboard, baggage weight
  - Detailed passenger list with seating assignments

### Weight & Balance Calculations
- **Real-time Calculations**: Automatic weight and balance calculations as data is entered
- **CG Position Tracking**: Visual indicator showing center of gravity position relative to limits
- **Comprehensive Warnings**: Intelligent warning system that detects:
  - Aircraft overweight conditions
  - CG out of forward/aft limits
  - Fuel burn requirements
  - Ballast recommendations
  - Baggage weight violations
  - Passenger capacity exceeded

### Visual Features
- **Interactive Seating Chart**: Visual representation of passenger seating and weight distribution
- **CG Indicator Bar**: Color-coded visualization of center of gravity position
- **Airworthiness Status**: Clear visual indicators of flight safety status

### Professional Manifest Viewer
- **Print-Ready Format**: Professional manifest layout optimized for printing
- **FAA Compliance**: Includes all required information per 14 CFR § 135.63
- **Detailed Calculations**: Complete weight and balance calculations with moments
- **Signature Section**: Official signature area for pilot in command
- **30-Day Retention Notice**: Includes regulatory compliance notes

### Validation & Safety
- **Form Validation**: Comprehensive validation of all required fields
- **Error Handling**: Clear error messages and guidance
- **Safety Checks**: Multiple layers of validation to ensure data accuracy
- **Toast Notifications**: User-friendly success and error messages

### Responsive Design
- **Mobile Optimized**: Fully responsive design works on all devices
- **Touch-Friendly**: Optimized for touch interactions on tablets
- **Print Styles**: Special print styles for physical manifest copies

## Aircraft Fleet

The system comes pre-loaded with sample aircraft:

1. **Cessna 208 Caravan** (N208SA)
   - Max Gross Weight: 8,750 lbs
   - Max Passengers: 9
   - Max Fuel: 335 gallons

2. **Beechcraft King Air 350** (N350SA)
   - Max Gross Weight: 15,000 lbs
   - Max Passengers: 11
   - Max Fuel: 539 gallons

3. **Cessna 402** (N402SA)
   - Max Gross Weight: 6,850 lbs
   - Max Passengers: 8
   - Max Fuel: 213 gallons

4. **Piper Chieftain PA-31-350** (N31SA)
   - Max Gross Weight: 7,368 lbs
   - Max Passengers: 8
   - Max Fuel: 180 gallons

5. **Pilatus PC-12** (N12SA)
   - Max Gross Weight: 10,450 lbs
   - Max Passengers: 9
   - Max Fuel: 402 gallons

## Technology Stack

- **Frontend**: React 19 with hooks
- **Styling**: Modern CSS with responsive design
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Production-ready build

## Database Schema

### Tables

1. **aircraft_types**: Aircraft specifications and performance data
2. **flight_manifests**: Individual flight manifest records
3. **manifest_passengers**: Passenger details for each manifest

### Security

- Row Level Security (RLS) enabled on all tables
- Public read access for reference data
- Authenticated access for manifest management

## Regulatory Compliance

This system is designed to meet FAA requirements:

- **14 CFR § 135.63**: Recordkeeping requirements for load manifests
- **AC 120-27F**: Aircraft Weight and Balance Control guidelines
- **30-Day Retention**: Automatic compliance reminders

## Usage

### Creating a New Manifest

1. Click "Create New Manifest" from the dashboard
2. Select aircraft from the fleet
3. Enter flight information (number, date, times)
4. Add crew information and weights
5. Specify fuel and baggage weights
6. Add passengers with seat assignments
7. Review weight & balance calculations
8. Check warnings and recommendations
9. Save the manifest

### Viewing & Printing

1. Select a manifest from the dashboard
2. Review all flight details and calculations
3. Click "Print Manifest" for physical copy
4. Print includes all required FAA information

### Managing Manifests

- **Search**: Find manifests by flight number, pilot, or aircraft
- **Filter**: View all, safe only, or warning manifests
- **Delete**: Remove old or incorrect manifests
- **Statistics**: Track flight operations metrics

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Support

For questions or issues with the flight manifest system, contact your flight operations team.

---

**Note**: This system is for operational use by authorized personnel only. All weight and balance calculations should be verified by qualified pilots before flight.
