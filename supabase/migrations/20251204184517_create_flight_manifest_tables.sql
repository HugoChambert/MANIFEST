/*
  # Flight Manifest System for Southern Airways

  ## Overview
  This migration creates the database schema for a comprehensive flight manifest and weight & balance system.

  ## New Tables

  ### `aircraft_types`
  Stores specifications for all Southern Airways aircraft types
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Aircraft model name (e.g., "Cessna 208 Caravan")
  - `registration` (text) - Aircraft tail number (e.g., "N123SA")
  - `max_gross_weight` (numeric) - Maximum takeoff weight in pounds
  - `basic_empty_weight` (numeric) - Empty aircraft weight in pounds
  - `max_fuel_capacity` (numeric) - Maximum fuel capacity in gallons
  - `fuel_weight_per_gallon` (numeric) - Weight of fuel per gallon (typically 6 lbs for avgas)
  - `max_baggage_weight` (numeric) - Maximum baggage compartment weight in pounds
  - `max_passengers` (integer) - Maximum number of passengers
  - `cg_forward_limit` (numeric) - Forward CG limit in inches from datum
  - `cg_aft_limit` (numeric) - Aft CG limit in inches from datum
  - `pilot_station_arm` (numeric) - Distance from datum to pilot seats in inches
  - `passenger_row1_arm` (numeric) - Distance from datum to first passenger row in inches
  - `passenger_row2_arm` (numeric) - Distance from datum to second passenger row in inches
  - `passenger_row3_arm` (numeric) - Distance from datum to third passenger row in inches
  - `baggage_arm` (numeric) - Distance from datum to baggage compartment in inches
  - `fuel_arm` (numeric) - Distance from datum to fuel tanks in inches
  - `created_at` (timestamp) - Record creation timestamp

  ### `flight_manifests`
  Stores individual flight manifest records
  - `id` (uuid, primary key) - Unique identifier
  - `aircraft_id` (uuid, foreign key) - Reference to aircraft_types
  - `flight_date` (date) - Date of flight
  - `flight_number` (text) - Flight number or identifier
  - `pilot_in_command` (text) - PIC name
  - `second_in_command` (text, nullable) - SIC name if applicable
  - `pilot_weight` (numeric) - Combined pilot weight in pounds
  - `departure_time` (timestamptz) - Scheduled departure time
  - `arrival_time` (timestamptz) - Scheduled arrival time
  - `fuel_onboard` (numeric) - Fuel loaded in gallons
  - `total_passenger_weight` (numeric) - Total weight of all passengers in pounds
  - `total_baggage_weight` (numeric) - Total baggage weight in pounds
  - `calculated_cg` (numeric) - Calculated center of gravity
  - `calculated_total_weight` (numeric) - Calculated total aircraft weight
  - `is_within_limits` (boolean) - Whether aircraft is within weight and balance limits
  - `warnings` (jsonb) - JSON array of warning messages
  - `created_at` (timestamp) - Record creation timestamp
  - `updated_at` (timestamp) - Record last update timestamp

  ### `manifest_passengers`
  Stores individual passenger details for each manifest
  - `id` (uuid, primary key) - Unique identifier
  - `manifest_id` (uuid, foreign key) - Reference to flight_manifests
  - `passenger_name` (text) - Passenger full name
  - `weight` (numeric) - Passenger weight in pounds
  - `seat_position` (text) - Seat assignment (e.g., "1A", "2B")
  - `row_number` (integer) - Row number for calculations
  - `created_at` (timestamp) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their manifests
  - Public read access for aircraft types (reference data)

  ## Notes
  - All weight measurements in pounds (lbs)
  - All arm measurements in inches from datum point
  - CG calculations use moment/weight formula
  - Warnings include: overweight, CG out of limits, fuel burn needed, ballast required
*/

-- Create aircraft_types table
CREATE TABLE IF NOT EXISTS aircraft_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration text UNIQUE NOT NULL,
  max_gross_weight numeric NOT NULL,
  basic_empty_weight numeric NOT NULL,
  max_fuel_capacity numeric NOT NULL,
  fuel_weight_per_gallon numeric DEFAULT 6.0,
  max_baggage_weight numeric NOT NULL,
  max_passengers integer NOT NULL,
  cg_forward_limit numeric NOT NULL,
  cg_aft_limit numeric NOT NULL,
  pilot_station_arm numeric NOT NULL,
  passenger_row1_arm numeric,
  passenger_row2_arm numeric,
  passenger_row3_arm numeric,
  baggage_arm numeric NOT NULL,
  fuel_arm numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create flight_manifests table
CREATE TABLE IF NOT EXISTS flight_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id uuid REFERENCES aircraft_types(id) NOT NULL,
  flight_date date NOT NULL DEFAULT CURRENT_DATE,
  flight_number text NOT NULL,
  pilot_in_command text NOT NULL,
  second_in_command text,
  pilot_weight numeric NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  fuel_onboard numeric NOT NULL,
  total_passenger_weight numeric DEFAULT 0,
  total_baggage_weight numeric DEFAULT 0,
  calculated_cg numeric,
  calculated_total_weight numeric,
  is_within_limits boolean DEFAULT true,
  warnings jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create manifest_passengers table
CREATE TABLE IF NOT EXISTS manifest_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid REFERENCES flight_manifests(id) ON DELETE CASCADE NOT NULL,
  passenger_name text NOT NULL,
  weight numeric NOT NULL,
  seat_position text NOT NULL,
  row_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE aircraft_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest_passengers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aircraft_types (public read)
CREATE POLICY "Anyone can view aircraft types"
  ON aircraft_types FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert aircraft types"
  ON aircraft_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update aircraft types"
  ON aircraft_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for flight_manifests
CREATE POLICY "Anyone can view flight manifests"
  ON flight_manifests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert flight manifests"
  ON flight_manifests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update flight manifests"
  ON flight_manifests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete flight manifests"
  ON flight_manifests FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for manifest_passengers
CREATE POLICY "Anyone can view manifest passengers"
  ON manifest_passengers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert manifest passengers"
  ON manifest_passengers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update manifest passengers"
  ON manifest_passengers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete manifest passengers"
  ON manifest_passengers FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample Southern Airways aircraft
INSERT INTO aircraft_types (name, registration, max_gross_weight, basic_empty_weight, max_fuel_capacity, max_baggage_weight, max_passengers, cg_forward_limit, cg_aft_limit, pilot_station_arm, passenger_row1_arm, passenger_row2_arm, passenger_row3_arm, baggage_arm, fuel_arm)
VALUES 
  ('Cessna 208 Caravan', 'N208SA', 8750, 4730, 335, 340, 9, 117.4, 138.5, 137, 177, 217, 257, 312, 150),
  ('Beechcraft King Air 350', 'N350SA', 15000, 9385, 539, 550, 11, 254.6, 302.8, 137, 198, 239, 280, 370, 210),
  ('Cessna 402', 'N402SA', 6850, 4365, 213, 200, 8, 85.5, 94.0, 86, 118, 155, NULL, 178, 100),
  ('Piper Chieftain PA-31-350', 'N31SA', 7368, 4585, 180, 250, 8, 82.4, 96.4, 89, 121, 153, NULL, 195, 104),
  ('Pilatus PC-12', 'N12SA', 10450, 6163, 402, 440, 9, 115.0, 135.0, 140, 180, 220, 260, 315, 155);
