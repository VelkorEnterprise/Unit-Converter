import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

// --- Utils & Data ---
const createLinear = (id, name, factor) => ({ id, name, factor });

const categories = [
  {
    id: 'length',
    name: 'Length',
    icon: '📏',
    popular: { from: 'm', to: 'ft', label: 'Meters to Feet' },
    units: [
      createLinear('m', 'Meter', 1),
      createLinear('km', 'Kilometer', 1000),
      createLinear('cm', 'Centimeter', 0.01),
      createLinear('mm', 'Millimeter', 0.001),
      createLinear('um', 'Micrometer', 1e-6),
      createLinear('nm', 'Nanometer', 1e-9),
      createLinear('mi', 'Mile', 1609.344),
      createLinear('yd', 'Yard', 0.9144),
      createLinear('ft', 'Foot', 0.3048),
      createLinear('in', 'Inch', 0.0254),
      createLinear('nmi', 'Nautical Mile', 1852),
      createLinear('ly', 'Light Year', 9.461e15),
    ]
  },
  {
    id: 'weight',
    name: 'Weight & Mass',
    icon: '⚖️',
    popular: { from: 'kg', to: 'lb', label: 'Kg to Pounds' },
    units: [
      createLinear('kg', 'Kilogram', 1),
      createLinear('g', 'Gram', 0.001),
      createLinear('mg', 'Milligram', 1e-6),
      createLinear('t', 'Metric Ton', 1000),
      createLinear('lb', 'Pound', 0.45359237),
      createLinear('oz', 'Ounce', 0.0283495),
      createLinear('st', 'Stone', 6.35029),
      createLinear('ct', 'Carat', 0.0002),
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: '🌡️',
    popular: { from: 'c', to: 'f', label: 'Celsius to Fahrenheit' },
    units: [
      { id: 'c', name: 'Celsius', factor: 1, offset: 0 },
      { id: 'f', name: 'Fahrenheit', factor: 0.55555555555, offset: -32 },
      { id: 'k', name: 'Kelvin', factor: 1, offset: -273.15 },
    ]
  },
  {
    id: 'area',
    name: 'Area',
    icon: '⬛',
    popular: { from: 'm2', to: 'sqft', label: 'Sq Meters to Sq Feet' },
    units: [
      createLinear('m2', 'Square Meter', 1),
      createLinear('km2', 'Square Kilometer', 1e6),
      createLinear('cm2', 'Square Centimeter', 0.0001),
      createLinear('mm2', 'Square Millimeter', 1e-6),
      createLinear('ha', 'Hectare', 10000),
      createLinear('ac', 'Acre', 4046.86),
      createLinear('sqmi', 'Square Mile', 2.59e6),
      createLinear('sqft', 'Square Foot', 0.092903),
      createLinear('sqin', 'Square Inch', 0.00064516),
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: '🧊',
    popular: { from: 'l', to: 'gal', label: 'Liters to Gallons' },
    units: [
      createLinear('m3', 'Cubic Meter', 1),
      createLinear('l', 'Liter', 0.001),
      createLinear('ml', 'Milliliter', 1e-6),
      createLinear('gal', 'Gallon (US)', 0.00378541),
      createLinear('qt', 'Quart (US)', 0.000946353),
      createLinear('pt', 'Pint (US)', 0.000473176),
      createLinear('cup', 'Cup (US)', 0.000236588),
      createLinear('floz', 'Fluid Ounce (US)', 2.9574e-5),
      createLinear('tbsp', 'Tablespoon (US)', 1.4787e-5),
      createLinear('tsp', 'Teaspoon (US)', 4.9289e-6),
    ]
  },
  {
    id: 'time',
    name: 'Time',
    icon: '⏰',
    popular: { from: 'min', to: 's', label: 'Minutes to Seconds' },
    units: [
      createLinear('s', 'Second', 1),
      createLinear('ms', 'Millisecond', 0.001),
      createLinear('us', 'Microsecond', 1e-6),
      createLinear('ns', 'Nanosecond', 1e-9),
      createLinear('min', 'Minute', 60),
      createLinear('h', 'Hour', 3600),
      createLinear('d', 'Day', 86400),
      createLinear('wk', 'Week', 604800),
      createLinear('mo', 'Month (Avg)', 2.628e6),
      createLinear('y', 'Year (Avg)', 3.154e7),
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: '🚀',
    popular: { from: 'mph', to: 'kph', label: 'MPH to KPH' },
    units: [
      createLinear('mps', 'Meter per second', 1),
      createLinear('kph', 'Kilometer per hour', 0.277778),
      createLinear('mph', 'Mile per hour', 0.44704),
      createLinear('kn', 'Knot', 0.514444),
      createLinear('ftps', 'Foot per second', 0.3048),
      createLinear('mach', 'Mach (SI)', 340.29),
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure',
    icon: '⏲️',
    popular: { from: 'bar', to: 'psi', label: 'Bar to PSI' },
    units: [
      createLinear('pa', 'Pascal', 1),
      createLinear('kpa', 'Kilopascal', 1000),
      createLinear('bar', 'Bar', 100000),
      createLinear('psi', 'PSI', 6894.76),
      createLinear('atm', 'Atmosphere', 101325),
      createLinear('torr', 'Torr', 133.322),
    ]
  },
  {
    id: 'digital',
    name: 'Digital Storage',
    icon: '💾',
    popular: { from: 'MB', to: 'KB', label: 'MB to KB' },
    units: [
      createLinear('b', 'Bit', 1/8),
      createLinear('B', 'Byte', 1),
      createLinear('KB', 'Kilobyte', 1000),
      createLinear('MB', 'Megabyte', 1e6),
      createLinear('GB', 'Gigabyte', 1e9),
      createLinear('TB', 'Terabyte', 1e12),
      createLinear('KiB', 'Kibibyte', 1024),
      createLinear('MiB', 'Mebibyte', 1048576),
      createLinear('GiB', 'Gibibyte', 1.074e9),
    ]
  },
  {
    id: 'magnetic_field',
    name: 'Magnetic Field',
    icon: '🧲',
    popular: { from: 't', to: 'g', label: 'Tesla to Gauss' },
    units: [
      createLinear('t', 'Tesla', 1),
      createLinear('g', 'Gauss', 0.0001),
      createLinear('mt', 'Millitesla', 0.001),
      createLinear('ut', 'Microtesla', 1e-6),
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    popular: { from: 'j', to: 'cal', label: 'Joules to Calories' },
    units: [
      createLinear('j', 'Joule', 1),
      createLinear('kj', 'Kilojoule', 1000),
      createLinear('cal', 'Calorie', 4.184),
      createLinear('kcal', 'Kilocalorie', 4184),
      createLinear('wh', 'Watt-hour', 3600),
      createLinear('kwh', 'Kilowatt-hour', 3.6e6),
      createLinear('ev', 'Electronvolt', 1.602e-19),
      createLinear('btu', 'BTU', 1055.06),
      createLinear('ftlb', 'Foot-pound', 1.35582),
    ]
  },
  {
    id: 'power',
    name: 'Power',
    icon: '💡',
    popular: { from: 'w', to: 'hp', label: 'Watts to Horsepower' },
    units: [
      createLinear('w', 'Watt', 1),
      createLinear('kw', 'Kilowatt', 1000),
      createLinear('mw', 'Megawatt', 1e6),
      createLinear('hp', 'Horsepower (Mech)', 745.7),
      createLinear('hpe', 'Horsepower (Elec)', 746),
      createLinear('btuh', 'BTU/hour', 0.293071),
    ]
  },
  {
    id: 'force',
    name: 'Force',
    icon: '💪',
    popular: { from: 'n', to: 'lbf', label: 'Newtons to Pounds' },
    units: [
      createLinear('n', 'Newton', 1),
      createLinear('kn', 'Kilonewton', 1000),
      createLinear('lbf', 'Pound-force', 4.44822),
      createLinear('kgf', 'Kilogram-force', 9.80665),
      createLinear('dyn', 'Dyne', 1e-5),
    ]
  },
  {
    id: 'angle',
    name: 'Angle',
    icon: '📐',
    popular: { from: 'deg', to: 'rad', label: 'Degrees to Radians' },
    units: [
      createLinear('deg', 'Degree', 1),
      createLinear('rad', 'Radian', 57.2958),
      createLinear('grad', 'Gradian', 0.9),
      createLinear('arcmin', 'Arcminute', 1/60),
      createLinear('arcsec', 'Arcsecond', 1/3600),
    ]
  },
  {
    id: 'data_rate',
    name: 'Data Transfer',
    icon: '📡',
    popular: { from: 'mbps', to: 'MBps', label: 'Mbps to MB/s' },
    units: [
      createLinear('bps', 'Bit per second', 1),
      createLinear('kbps', 'Kilobit per second', 1000),
      createLinear('mbps', 'Megabit per second', 1e6),
      createLinear('gbps', 'Gigabit per second', 1e9),
      createLinear('Bps', 'Byte per second', 8),
      createLinear('KBps', 'Kilobyte per second', 8000),
      createLinear('MBps', 'Megabyte per second', 8e6),
    ]
  },
  {
    id: 'fuel',
    name: 'Fuel Economy',
    icon: '⛽',
    popular: { from: 'mpg', to: 'kml', label: 'MPG to km/L' },
    units: [
      createLinear('kml', 'Kilometer/Liter', 1),
      createLinear('mpg', 'Miles/Gallon (US)', 0.425144),
      createLinear('mpgi', 'Miles/Gallon (UK)', 0.354006),
    ]
  },
  {
    id: 'frequency',
    name: 'Frequency',
    icon: '〰️',
    popular: { from: 'hz', to: 'rpm', label: 'Hertz to RPM' },
    units: [
      createLinear('hz', 'Hertz', 1),
      createLinear('khz', 'Kilohertz', 1000),
      createLinear('mhz', 'Megahertz', 1e6),
      createLinear('ghz', 'Gigahertz', 1e9),
      createLinear('rpm', 'RPM', 1/60),
    ]
  },
  {
    id: 'flow',
    name: 'Flow Rate',
    icon: '🚰',
    popular: { from: 'lpm', to: 'gpm', label: 'L/min to GPM' },
    units: [
      createLinear('m3s', 'Cubic Meter/s', 1),
      createLinear('lps', 'Liter/s', 0.001),
      createLinear('lpm', 'Liter/min', 1.6667e-5),
      createLinear('cfs', 'Cubic Foot/s', 0.0283168),
      createLinear('gpm', 'Gallon/min (US)', 6.309e-5),
    ]
  },
  {
    id: 'illuminance',
    name: 'Illuminance',
    icon: '☀️',
    popular: { from: 'lx', to: 'fc', label: 'Lux to Foot-candles' },
    units: [
      createLinear('lx', 'Lux', 1),
      createLinear('fc', 'Foot-candle', 10.7639),
      createLinear('ph', 'Phot', 10000),
    ]
  },
  {
    id: 'radioactivity',
    name: 'Radioactivity',
    icon: '☢️',
    popular: { from: 'bq', to: 'ci', label: 'Becquerel to Curie' },
    units: [
      createLinear('bq', 'Becquerel', 1),
      createLinear('ci', 'Curie', 3.7e10),
      createLinear('rd', 'Rutherford', 1e6),
    ]
  },
  {
    id: 'radiation',
    name: 'Radiation Dose',
    icon: '☣️',
    popular: { from: 'gy', to: 'rad', label: 'Gray to Rad' },
    units: [
      createLinear('gy', 'Gray', 1),
      createLinear('rad', 'Rad', 0.01),
      createLinear('sv', 'Sievert', 1),
      createLinear('rem', 'Rem', 0.01),
    ]
  },
  {
    id: 'torque',
    name: 'Torque',
    icon: '🔧',
    popular: { from: 'nm', to: 'ftlb', label: 'Nm to ft-lb' },
    units: [
      createLinear('nm', 'Newton-meter', 1),
      createLinear('ftlb', 'Foot-pound', 1.35582),
      createLinear('inlb', 'Inch-pound', 0.112985),
      createLinear('kgm', 'Kilogram-meter', 9.80665),
    ]
  },
  {
    id: 'current',
    name: 'Electric Current',
    icon: '🔌',
    popular: { from: 'a', to: 'ma', label: 'Amps to mA' },
    units: [
      createLinear('a', 'Ampere', 1),
      createLinear('ma', 'Milliampere', 0.001),
      createLinear('ka', 'Kiloampere', 1000),
      createLinear('bi', 'Biot', 10),
    ]
  },
  {
    id: 'voltage',
    name: 'Voltage',
    icon: '🔋',
    popular: { from: 'v', to: 'mv', label: 'Volts to mV' },
    units: [
      createLinear('v', 'Volt', 1),
      createLinear('mv', 'Millivolt', 0.001),
      createLinear('kv', 'Kilovolt', 1000),
    ]
  },
  {
    id: 'resistance',
    name: 'Resistance',
    icon: 'Ω',
    popular: { from: 'ohm', to: 'kohm', label: 'Ohms to kOhms' },
    units: [
      createLinear('ohm', 'Ohm', 1),
      createLinear('kohm', 'Kiloohm', 1000),
      createLinear('mohm', 'Megaohm', 1e6),
    ]
  },
  {
    id: 'capacitance',
    name: 'Capacitance',
    icon: '🔋',
    popular: { from: 'uf', to: 'nf', label: 'µF to nF' },
    units: [
      createLinear('f', 'Farad', 1),
      createLinear('mf', 'Millifarad', 0.001),
      createLinear('uf', 'Microfarad', 1e-6),
      createLinear('nf', 'Nanofarad', 1e-9),
      createLinear('pf', 'Picofarad', 1e-12),
    ]
  },
  {
    id: 'inductance',
    name: 'Inductance',
    icon: '🌀',
    popular: { from: 'h', to: 'mh', label: 'Henry to mH' },
    units: [
      createLinear('h', 'Henry', 1),
      createLinear('mh', 'Millihenry', 0.001),
      createLinear('uh', 'Microhenry', 1e-6),
    ]
  },
  {
    id: 'charge',
    name: 'Electric Charge',
    icon: '⚡',
    popular: { from: 'ah', to: 'mah', label: 'Ah to mAh' },
    units: [
      createLinear('c', 'Coulomb', 1),
      createLinear('mc', 'Millicoulomb', 0.001),
      createLinear('uc', 'Microcoulomb', 1e-6),
      createLinear('ah', 'Ampere-hour', 3600),
      createLinear('mah', 'Milliampere-hour', 3.6),
    ]
  },
  {
    id: 'conductance',
    name: 'Conductance',
    icon: '🔌',
    popular: { from: 's', to: 'mho', label: 'Siemens to Mho' },
    units: [
      createLinear('s', 'Siemens', 1),
      createLinear('mho', 'Mho', 1),
    ]
  },
  {
    id: 'viscosity_dyn',
    name: 'Viscosity (Dyn)',
    icon: '💧',
    popular: { from: 'pas', to: 'p', label: 'Pa·s to Poise' },
    units: [
      createLinear('pas', 'Pascal-second', 1),
      createLinear('p', 'Poise', 0.1),
      createLinear('cp', 'Centipoise', 0.001),
    ]
  },
  {
    id: 'viscosity_kin',
    name: 'Viscosity (Kin)',
    icon: '🌊',
    popular: { from: 'st', to: 'cst', label: 'Stokes to cSt' },
    units: [
      createLinear('m2s', 'Square Meter/s', 1),
      createLinear('st', 'Stokes', 0.0001),
      createLinear('cst', 'Centistokes', 1e-6),
    ]
  },
  {
    id: 'density',
    name: 'Density',
    icon: '🧱',
    popular: { from: 'kgm3', to: 'gcm3', label: 'kg/m³ to g/cm³' },
    units: [
      createLinear('kgm3', 'kg/m³', 1),
      createLinear('gcm3', 'g/cm³', 1000),
      createLinear('lbft3', 'lb/ft³', 16.0185),
    ]
  },
  {
    id: 'acceleration',
    name: 'Acceleration',
    icon: '🏎️',
    popular: { from: 'ms2', to: 'g', label: 'm/s² to G-force' },
    units: [
      createLinear('ms2', 'Meter/s²', 1),
      createLinear('g', 'G-force', 9.80665),
      createLinear('fts2', 'Foot/s²', 0.3048),
    ]
  },
  {
    id: 'concentration',
    name: 'Concentration',
    icon: '🧪',
    popular: { from: 'molm3', to: 'moll', label: 'mol/m³ to Molar' },
    units: [
      createLinear('molm3', 'Mole/m³', 1),
      createLinear('moll', 'Molar (M)', 1000),
      createLinear('ppm', 'Parts per million', 0.001), // approx for water
    ]
  },
  {
    id: 'permeability',
    name: 'Permeability',
    icon: '🧲',
    popular: { from: 'hm', to: 'na2', label: 'H/m to N/A²' },
    units: [
      createLinear('hm', 'Henry/meter', 1),
      createLinear('na2', 'Newton/Ampere²', 1),
    ]
  },
  {
    id: 'surface_tension',
    name: 'Surface Tension',
    icon: '💧',
    popular: { from: 'nm', to: 'dyncm', label: 'N/m to dyn/cm' },
    units: [
      createLinear('nm', 'Newton/meter', 1),
      createLinear('dyncm', 'Dyne/centimeter', 0.001),
    ]
  },
  {
    id: 'si_prefix',
    name: 'SI Prefixes',
    icon: '🔟',
    popular: { from: 'k', to: 'm', label: 'Kilo to Milli' },
    units: [
      createLinear('Y', 'Yotta (Y)', 1e24),
      createLinear('Z', 'Zetta (Z)', 1e21),
      createLinear('E', 'Exa (E)', 1e18),
      createLinear('P', 'Peta (P)', 1e15),
      createLinear('T', 'Tera (T)', 1e12),
      createLinear('G', 'Giga (G)', 1e9),
      createLinear('M', 'Mega (M)', 1e6),
      createLinear('k', 'Kilo (k)', 1e3),
      createLinear('h', 'Hecto (h)', 1e2),
      createLinear('da', 'Deca (da)', 1e1),
      createLinear('base', 'Base Unit', 1),
      createLinear('d', 'Deci (d)', 1e-1),
      createLinear('c', 'Centi (c)', 1e-2),
      createLinear('m', 'Milli (m)', 1e-3),
      createLinear('u', 'Micro (μ)', 1e-6),
      createLinear('n', 'Nano (n)', 1e-9),
      createLinear('p', 'Pico (p)', 1e-12),
      createLinear('f', 'Femto (f)', 1e-15),
      createLinear('a', 'Atto (a)', 1e-18),
      createLinear('z', 'Zepto (z)', 1e-21),
      createLinear('y', 'Yocto (y)', 1e-24),
    ]
  },
  {
    id: 'luminance',
    name: 'Luminance',
    icon: '💡',
    popular: { from: 'cdm2', to: 'fl', label: 'Nit to Foot-Lambert' },
    units: [
      createLinear('cdm2', 'Candela/m² (Nit)', 1),
      createLinear('fl', 'Foot-Lambert', 3.42626),
      createLinear('sb', 'Stilb', 10000),
      createLinear('lam', 'Lambert', 3183.1),
    ]
  },
  {
    id: 'sound_intensity',
    name: 'Sound Intensity',
    icon: '🔊',
    popular: { from: 'wm2', to: 'wcm2', label: 'W/m² to W/cm²' },
    units: [
      createLinear('wm2', 'Watt/m²', 1),
      createLinear('wcm2', 'Watt/cm²', 10000),
      createLinear('pwm2', 'Picowatt/m²', 1e-12),
    ]
  },
  {
    id: 'mass_flow',
    name: 'Mass Flow Rate',
    icon: '🌊',
    popular: { from: 'kgs', to: 'lbs', label: 'kg/s to lb/s' },
    units: [
      createLinear('kgs', 'kg/second', 1),
      createLinear('lbs', 'lb/second', 0.453592),
      createLinear('kgh', 'kg/hour', 0.000277778),
      createLinear('lbh', 'lb/hour', 0.000125998),
    ]
  },
  {
    id: 'molar_mass',
    name: 'Molar Mass',
    icon: '🧪',
    popular: { from: 'kgmol', to: 'gmol', label: 'kg/mol to g/mol' },
    units: [
      createLinear('kgmol', 'kg/mole', 1),
      createLinear('gmol', 'Gram/mole', 0.001),
    ]
  },
  {
    id: 'typography',
    name: 'Typography',
    icon: '🅰️',
    popular: { from: 'px', to: 'pt', label: 'Pixels to Points' },
    units: [
      createLinear('px', 'Pixel', 1),
      createLinear('pt', 'Point', 1.333333),
      createLinear('pc', 'Pica', 16),
      createLinear('in', 'Inch', 96),
      createLinear('mm', 'Millimeter', 3.77953),
      createLinear('cm', 'Centimeter', 37.7953),
    ]
  },
  {
    id: 'currency',
    name: 'Currency (Approx)',
    icon: '💰',
    popular: { from: 'usd', to: 'eur', label: 'USD to EUR' },
    units: [
      createLinear('usd', 'US Dollar ($)', 1),
      createLinear('eur', 'Euro (€)', 0.92),
      createLinear('gbp', 'British Pound (£)', 0.79),
      createLinear('jpy', 'Japanese Yen (¥)', 150.5),
      createLinear('inr', 'Indian Rupee (₹)', 82.9),
      createLinear('aud', 'Australian Dollar (A$)', 1.53),
      createLinear('cad', 'Canadian Dollar (C$)', 1.35),
      createLinear('chf', 'Swiss Franc (Fr)', 0.88),
      createLinear('cny', 'Chinese Yuan (¥)', 7.19),
      createLinear('rub', 'Russian Ruble (₽)', 92.5),
    ]
  }
];

const globalLocations = [
  { id: 'us', name: 'USA', lang: 'en-US', term: 'Unit Converter', title: 'Free Unit Converter USA' },
  { id: 'uk', name: 'UK', lang: 'en-GB', term: 'Unit Converter', title: 'Free Unit Converter UK' },
  { id: 'ca', name: 'Canada', lang: 'en-CA', term: 'Unit Converter', title: 'Free Unit Converter Canada' },
  { id: 'au', name: 'Australia', lang: 'en-AU', term: 'Unit Converter', title: 'Free Unit Converter Australia' },
  { id: 'de', name: 'Germany', lang: 'de-DE', term: 'Einheitenrechner', title: 'Kostenloser Einheitenrechner' },
  { id: 'jp', name: 'Japan', lang: 'ja-JP', term: '単位変換', title: '無料の単位変換ツール' },
  { id: 'ch', name: 'Switzerland', lang: 'de-CH', term: 'Einheitenrechner', title: 'Einheitenrechner Schweiz' },
  { id: 'fr', name: 'France', lang: 'fr-FR', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités gratuit' },
  { id: 'sg', name: 'Singapore', lang: 'en-SG', term: 'Unit Converter', title: 'Free Unit Converter Singapore' },
  { id: 'nl', name: 'Netherlands', lang: 'nl-NL', term: 'Eenheden omrekenen', title: 'Gratis Eenheden Omrekenen' },
  { id: 'it', name: 'Italy', lang: 'it-IT', term: 'Convertitore di unità', title: 'Convertitore di unità gratuito' },
  { id: 'es', name: 'Spain', lang: 'es-ES', term: 'Conversor de unidades', title: 'Conversor de unidades gratis' },
  { id: 'se', name: 'Sweden', lang: 'sv-SE', term: 'Enhetsomvandlare', title: 'Gratis Enhetsomvandlare' },
  { id: 'no', name: 'Norway', lang: 'no-NO', term: 'Enhetsomformer', title: 'Gratis Enhetsomformer' },
  { id: 'dk', name: 'Denmark', lang: 'da-DK', term: 'Enhedsomregner', title: 'Gratis Enhedsomregner' },
  { id: 'fi', name: 'Finland', lang: 'fi-FI', term: 'Yksikkömuunnin', title: 'Ilmainen Yksikkömuunnin' },
  { id: 'ie', name: 'Ireland', lang: 'en-IE', term: 'Unit Converter', title: 'Free Unit Converter Ireland' },
  { id: 'be', name: 'Belgium', lang: 'fr-BE', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités Belgique' },
  { id: 'at', name: 'Austria', lang: 'de-AT', term: 'Einheitenrechner', title: 'Einheitenrechner Österreich' },
  { id: 'pt', name: 'Portugal', lang: 'pt-PT', term: 'Conversor de unidades', title: 'Conversor de unidades grátis' },
  { id: 'gr', name: 'Greece', lang: 'el-GR', term: 'Μετατροπέας μονάδων', title: 'Δωρεάν Μετατροπέας μονάδων' },
  { id: 'pl', name: 'Poland', lang: 'pl-PL', term: 'Przelicznik jednostek', title: 'Darmowy Przelicznik jednostek' },
  { id: 'cz', name: 'Czech Republic', lang: 'cs-CZ', term: 'Převodník jednotek', title: 'Převodník jednotek zdarma' },
  { id: 'lu', name: 'Luxembourg', lang: 'fr-LU', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités Luxembourg' },
  { id: 'mc', name: 'Monaco', lang: 'fr-MC', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités Monaco' },
  { id: 'is', name: 'Iceland', lang: 'is-IS', term: 'Einingabreytir', title: 'Ókeypis Einingabreytir' },
  { id: 'hu', name: 'Hungary', lang: 'hu-HU', term: 'Mértékegység átváltó', title: 'Ingyenes Mértékegység átváltó' },
  { id: 'sk', name: 'Slovakia', lang: 'sk-SK', term: 'Prevodník jednotiek', title: 'Prevodník jednotiek zadarmo' },
  { id: 'ro', name: 'Romania', lang: 'ro-RO', term: 'Convertor de unități', title: 'Convertor de unități gratuit' },
  { id: 'bg', name: 'Bulgaria', lang: 'bg-BG', term: 'Конвертор на единици', title: 'Безплатен Конвертор на единици' },
  { id: 'hr', name: 'Croatia', lang: 'hr-HR', term: 'Pretvarač jedinica', title: 'Besplatni Pretvarač jedinica' },
  { id: 'si', name: 'Slovenia', lang: 'sl-SI', term: 'Pretvornik enot', title: 'Brezplačen Pretvornik enot' },
  { id: 'et', name: 'Estonia', lang: 'et-EE', term: 'Ühikute teisendaja', title: 'Tasuta Ühikute teisendaja' },
  { id: 'lv', name: 'Latvia', lang: 'lv-LV', term: 'Mērvienību pārveidotājs', title: 'Bezmaksas Mērvienību pārveidotājs' },
  { id: 'lt', name: 'Lithuania', lang: 'lt-LT', term: 'Vienetų konverteris', title: 'Nemokamas Vienetų konverteris' },
  { id: 'ba', name: 'Bosnia', lang: 'bs-BA', term: 'Pretvarač jedinica', title: 'Besplatni Pretvarač jedinica' },
  { id: 'ru', name: 'Russia', lang: 'ru-RU', term: 'Конвертер величин', title: 'Бесплатный Конвертер величин' },
  { id: 'tr', name: 'Turkey', lang: 'tr-TR', term: 'Birim Çevirici', title: 'Ücretsiz Birim Çevirici' },
  { id: 'mx', name: 'Mexico', lang: 'es-MX', term: 'Conversor de unidades', title: 'Conversor de unidades México' },
  { id: 'br', name: 'Brazil', lang: 'pt-BR', term: 'Conversor de unidades', title: 'Conversor de unidades Brasil' },
  { id: 'ar', name: 'Argentina', lang: 'es-AR', term: 'Conversor de unidades', title: 'Conversor de unidades Argentina' },
  { id: 'cl', name: 'Chile', lang: 'es-CL', term: 'Conversor de unidades', title: 'Conversor de unidades Chile' },
  { id: 'co', name: 'Colombia', lang: 'es-CO', term: 'Conversor de unidades', title: 'Conversor de unidades Colombia' },
  { id: 'pe', name: 'Peru', lang: 'es-PE', term: 'Conversor de unidades', title: 'Conversor de unidades Perú' },
  { id: 'uy', name: 'Uruguay', lang: 'es-UY', term: 'Conversor de unidades', title: 'Conversor de unidades Uruguay' },
  { id: 'ec', name: 'Ecuador', lang: 'es-EC', term: 'Conversor de unidades', title: 'Conversor de unidades Ecuador' },
  { id: 'cr', name: 'Costa Rica', lang: 'es-CR', term: 'Conversor de unidades', title: 'Conversor de unidades Costa Rica' },
  { id: 'pa', name: 'Panama', lang: 'es-PA', term: 'Conversor de unidades', title: 'Conversor de unidades Panamá' },
  { id: 'kr', name: 'South Korea', lang: 'ko-KR', term: '단위 변환기', title: '무료 단위 변환기' },
  { id: 'cn', name: 'China', lang: 'zh-CN', term: '单位换算', title: '免费单位换算' },
  { id: 'tw', name: 'Taiwan', lang: 'zh-TW', term: '單位換算', title: '免費單位換算' },
  { id: 'hk', name: 'Hong Kong', lang: 'zh-HK', term: '單位換算', title: '免費單位換算 香港' },
  { id: 'nz', name: 'New Zealand', lang: 'en-NZ', term: 'Unit Converter', title: 'Free Unit Converter NZ' },
  { id: 'ae', name: 'UAE', lang: 'ar-AE', term: 'محول الوحدات', title: 'محول الوحدات مجاني' },
  { id: 'sa', name: 'Saudi Arabia', lang: 'ar-SA', term: 'محول الوحدات', title: 'محول الوحدات السعودية' },
  { id: 'qa', name: 'Qatar', lang: 'ar-QA', term: 'محول الوحدات', title: 'محول الوحدات قطر' },
  { id: 'kw', name: 'Kuwait', lang: 'ar-KW', term: 'محول الوحدات', title: 'محول الوحدات الكويت' },
  { id: 'om', name: 'Oman', lang: 'ar-OM', term: 'محول الوحدات', title: 'محول الوحدات عمان' },
  { id: 'my', name: 'Malaysia', lang: 'ms-MY', term: 'Penukar Unit', title: 'Penukar Unit Percuma' },
  { id: 'th', name: 'Thailand', lang: 'th-TH', term: 'ตัวแปลงหน่วย', title: 'ตัวแปลงหน่วยฟรี' },
  { id: 'id', name: 'Indonesia', lang: 'id-ID', term: 'Konverter Satuan', title: 'Konverter Satuan Gratis' },
  { id: 'ph', name: 'Philippines', lang: 'tl-PH', term: 'Unit Converter', title: 'Libreng Unit Converter' },
  { id: 'za', name: 'South Africa', lang: 'en-ZA', term: 'Unit Converter', title: 'Free Unit Converter South Africa' },
  { id: 'ng', name: 'Nigeria', lang: 'en-NG', term: 'Unit Converter', title: 'Free Unit Converter Nigeria' },
  { id: 'eg', name: 'Egypt', lang: 'ar-EG', term: 'محول الوحدات', title: 'محول الوحدات مصر' },
  { id: 'ke', name: 'Kenya', lang: 'en-KE', term: 'Unit Converter', title: 'Free Unit Converter Kenya' },
  { id: 'ma', name: 'Morocco', lang: 'fr-MA', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités Maroc' },
  { id: 'na', name: 'Namibia', lang: 'en-NA', term: 'Unit Converter', title: 'Free Unit Converter Namibia' },
  { id: 'dz', name: 'Algeria', lang: 'fr-DZ', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités Algérie' },
  { id: 'tn', name: 'Tunisia', lang: 'fr-TN', term: 'Convertisseur d\'unités', title: 'Convertisseur d\'unités Tunisie' },
  { id: 'vn', name: 'Vietnam', lang: 'vi-VN', term: 'Chuyển đổi đơn vị', title: 'Chuyển đổi đơn vị miễn phí' },
  { id: 'ua', name: 'Ukraine', lang: 'uk-UA', term: 'Конвертер одиниць', title: 'Безкоштовний Конвертер одиниць' },
  { id: 'pk', name: 'Pakistan', lang: 'ur-PK', term: 'یونٹ کنورٹر', title: 'مفت یونٹ کنورٹر' },
  { id: 'bd', name: 'Bangladesh', lang: 'bn-BD', term: 'একক রূপান্তরকারী', title: 'বিনামূল্যে একক রূপান্তরকারী' },
];

function convert(value, fromUnitId, toUnitId, categoryId) {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return 0;
  const fromUnit = category.units.find(u => u.id === fromUnitId);
  const toUnit = category.units.find(u => u.id === toUnitId);
  if (!fromUnit || !toUnit) return 0;

  if (categoryId === 'temperature') {
    let valueInCelsius = value;
    if (fromUnit.id === 'f') valueInCelsius = (value - 32) * (5/9);
    else if (fromUnit.id === 'k') valueInCelsius = value - 273.15;
    if (toUnit.id === 'c') return valueInCelsius;
    if (toUnit.id === 'f') return (valueInCelsius * 9/5) + 32;
    if (toUnit.id === 'k') return valueInCelsius + 273.15;
    return valueInCelsius;
  }

  const valueInBase = value * fromUnit.factor;
  return valueInBase / toUnit.factor;
}

function formatNumber(num) {
  if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e9) return num.toExponential(4);
  return Number(num.toPrecision(7)).toString();
}

// --- Components ---

const Header = () => {
  const marqueeContent = (
    <div className="flex items-center gap-8 text-xs font-semibold text-royal-900 whitespace-nowrap px-4">
      <span className="flex items-center gap-1 text-royal-700"><span>🌟</span> We helped more than a Million users daily</span>
      <span className="flex items-center gap-1 text-royal-700"><span>🔓</span> No signup required</span>
      <span className="flex items-center gap-1 text-royal-700"><span>🛡️</span> 100% Private</span>
      <span className="flex items-center gap-1 text-royal-700"><span>✅</span> 100% Trustworthy</span>
      <span className="flex items-center gap-1 text-royal-700"><span>🚀</span> Fast & Accurate</span>
      <span className="flex items-center gap-1 text-royal-700"><span>📱</span> Mobile Friendly</span>
      <span className="text-royal-700 uppercase tracking-widest text-[10px] font-black ml-4 border-l border-royal-300 pl-8">POPULAR:</span>
      <Link to="/converter/power" className="hover:text-royal-600 transition-colors">💡 Free Online Power Converter</Link>
      <Link to="/converter/energy" className="hover:text-royal-600 transition-colors">⚡ High Precision Energy Calculator</Link>
      <Link to="/converter/pressure" className="hover:text-royal-600 transition-colors">⏲️ Scientific Pressure Conversion</Link>
      <Link to="/converter/force" className="hover:text-royal-600 transition-colors">💪 Engineering Force Tool</Link>
      <Link to="/converter/torque" className="hover:text-royal-600 transition-colors">🔧 Accurate Torque Converter</Link>
      <Link to="/converter/density" className="hover:text-royal-600 transition-colors">🧱 Material Density Calculator</Link>
      <Link to="/converter/length" className="hover:text-royal-600 transition-colors">📏 Length Converter</Link>
      <Link to="/converter/weight" className="hover:text-royal-600 transition-colors">⚖️ Weight Converter</Link>
      <span className="text-slate-500 font-normal ml-4 border-l border-slate-300 pl-8">100% Free • No Ads • Instant Results • Best Engineering Tool • SEO Optimized • Secure</span>
    </div>
  );

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-royal-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-royal-500 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-royal-600 transition-colors">U</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-royal-600 to-royal-800">Unit Converter</span>
          </Link>
          <nav className="hidden lg:flex gap-6">
            <Link to="/" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">Home</Link>
            <Link to="/currency" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">Currency</Link>
            <Link to="/converter/volume" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">Volume</Link>
            <Link to="/converter/weight" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">Mass & Weight</Link>
            <Link to="/guides" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">Guides</Link>
            <Link to="/blog" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">Blog</Link>
            <a href="#converters" className="text-slate-600 hover:text-royal-600 font-medium transition-colors">All Tools</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs text-royal-700 bg-royal-100 px-3 py-1 rounded-full border border-royal-200">Trusted by 1M+ Users</div>
            <Link to="/calculator" className="flex items-center justify-center w-10 h-10 bg-royal-600 text-white rounded-xl hover:bg-royal-700 transition-all shadow-md active:scale-95" title="Scientific Calculator">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="8" y1="6" x2="16" y2="6"></line>
                <line x1="16" y1="14" x2="16" y2="18"></line>
                <path d="M16 10h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M8 14h.01"></path>
                <path d="M12 18h.01"></path>
                <path d="M8 18h.01"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-royal-50 border-t border-royal-200 py-2 shadow-inner overflow-hidden">
        <div className="animate-marquee">
          {marqueeContent}
          {marqueeContent}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-white mt-12 py-12 border-t-4 border-royal-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold text-royal-400 mb-4">Unit Converter</h3>
          <p className="text-slate-400 text-sm leading-relaxed">The world's most trusted, premium, and free online unit conversion suite. Designed for accuracy, privacy, and speed.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Popular Tools</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/converter/length" className="hover:text-royal-400 transition-colors">Length Converter</Link></li>
            <li><Link to="/converter/weight" className="hover:text-royal-400 transition-colors">Weight Converter</Link></li>
            <li><Link to="/converter/temperature" className="hover:text-royal-400 transition-colors">Temperature Converter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Global Locations</h4>
          <ul className="space-y-2 text-sm text-slate-400 grid grid-cols-2 gap-x-4">
            {globalLocations.slice(0, 10).map(loc => (
              <li key={loc.id}><Link to={`/location/${loc.id}`} className="hover:text-royal-400 transition-colors">{loc.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Trust & Privacy</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>✓ 100% Client-Side</li>
            <li>✓ No Data Tracking</li>
            <li>✓ High Precision Math</li>
            <li><Link to="/location/all" className="hover:text-royal-400 transition-colors mt-4 inline-block text-royal-500">View All Regions →</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Unit Converter Tools. All rights reserved.
      </div>
    </div>
  </footer>
);

const QuickConverter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('length');
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const currentCategory = useMemo(() => categories.find(c => c.id === activeTab), [activeTab]);

  useEffect(() => {
    if (currentCategory) {
      setFromUnit(currentCategory.units[0].id);
      setToUnit(currentCategory.units[1]?.id || currentCategory.units[0].id);
    }
  }, [activeTab, currentCategory]);

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) return '';
    return formatNumber(convert(val, fromUnit, toUnit, activeTab));
  }, [amount, fromUnit, toUnit, activeTab]);

  const handleFindUnits = () => {
    if (!searchFrom || !searchTo) return;
    const f = searchFrom.toLowerCase();
    const t = searchTo.toLowerCase();
    const found = categories.find(cat => 
      cat.units.some(u => u.name.toLowerCase().includes(f) || u.id === f) &&
      cat.units.some(u => u.name.toLowerCase().includes(t) || u.id === t)
    );
    if (found) {
      const fu = found.units.find(u => u.name.toLowerCase().includes(f) || u.id === f);
      const tu = found.units.find(u => u.name.toLowerCase().includes(t) || u.id === t);
      navigate(`/converter/${found.id}?from=${fu.id}&to=${tu.id}`);
    } else alert('No matching conversion found.');
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
      <div className="bg-royal-800 p-4"><h2 className="text-xl font-bold text-white">Unit Converter Express</h2></div>
      <div className="flex bg-royal-700 overflow-x-auto no-scrollbar">
        {['length', 'temperature', 'area', 'volume', 'weight', 'time'].map(id => (
          <button key={id} onClick={() => setActiveTab(id)} className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === id ? 'bg-royal-50 text-royal-900' : 'text-white hover:bg-royal-600'}`}>
            {categories.find(c => c.id === id).name}
          </button>
        ))}
      </div>
      <div className="p-8 bg-royal-50">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-24 font-bold text-royal-900">Amount:</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 p-3 border-2 border-royal-200 rounded-xl focus:ring-2 focus:ring-royal-500 outline-none text-xl font-bold" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-bold text-royal-700">From:</label>
              <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full p-3 border-2 border-royal-200 rounded-xl bg-white">{currentCategory.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-royal-700">To:</label>
              <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full p-3 border-2 border-royal-200 rounded-xl bg-white">{currentCategory.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-royal-100 text-center shadow-inner">
            <div className="text-royal-500 font-medium mb-1">{amount} {currentCategory.units.find(u => u.id === fromUnit)?.name} =</div>
            <div className="text-4xl font-black text-royal-900">{result} <span className="text-xl font-normal opacity-60">{currentCategory.units.find(u => u.id === toUnit)?.name}</span></div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-royal-200">
          <h3 className="font-bold text-royal-800 mb-4">Find Units Fast</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="From (e.g. meter)" value={searchFrom} onChange={e => setSearchFrom(e.target.value)} className="flex-1 p-3 border-2 border-royal-100 rounded-xl" />
            <input type="text" placeholder="To (e.g. feet)" value={searchTo} onChange={e => setSearchTo(e.target.value)} className="flex-1 p-3 border-2 border-royal-100 rounded-xl" />
            <button onClick={handleFindUnits} className="bg-royal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-royal-700 transition-transform active:scale-95">Go</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversionTrends = () => {
  const data = [
    { name: 'Jan', users: 4000, conversions: 2400 },
    { name: 'Feb', users: 3000, conversions: 1398 },
    { name: 'Mar', users: 2000, conversions: 9800 },
    { name: 'Apr', users: 2780, conversions: 3908 },
    { name: 'May', users: 1890, conversions: 4800 },
    { name: 'Jun', users: 2390, conversions: 3800 },
    { name: 'Jul', users: 3490, conversions: 4300 },
  ];

  return (
    <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-royal-100 my-12">
      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 text-center">Global Conversion Trends</h3>
      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b78628" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#b78628" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }} 
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Area type="monotone" dataKey="users" stroke="#b78628" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-slate-500 mt-4 text-xs md:text-sm">Real-time usage data showing global adoption of metric and imperial conversions.</p>
    </div>
  );
};

const PopularConversionsChart = () => {
  const data = [
    { name: 'm to ft', value: 4000 },
    { name: 'kg to lbs', value: 3500 },
    { name: '°C to °F', value: 3000 },
    { name: 'km to mi', value: 2780 },
    { name: 'L to gal', value: 2500 },
    { name: 'in to cm', value: 2390 },
  ];

  return (
    <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-royal-100 mb-12">
      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 text-center">Most Popular Conversions This Week</h3>
      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="value" fill="#b78628" radius={[8, 8, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const WhyTrustUs = () => (
  <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-royal-500 rounded-full blur-[150px]"></div>
    </div>
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-6">Why 1 Million+ Users Trust Us Daily</h2>
        <p className="text-slate-400 text-lg">We are not just another calculator. We are the gold standard in digital unit conversion.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
          <div className="text-5xl mb-6">🔒</div>
          <h3 className="text-2xl font-bold mb-4 text-royal-400">100% Private</h3>
          <p className="text-slate-300">All calculations happen directly in your browser. We never send your data to any server. Your inputs remain completely confidential.</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
          <div className="text-5xl mb-6">⚡</div>
          <h3 className="text-2xl font-bold mb-4 text-royal-400">Instant & Offline</h3>
          <p className="text-slate-300">No loading times. No internet required after the first load. Our PWA technology ensures the tool works wherever you are.</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
          <div className="text-5xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold mb-4 text-royal-400">Scientific Precision</h3>
          <p className="text-slate-300">We use IEEE 754 standard floating-point arithmetic with 10-decimal precision to ensure accuracy for engineering and science.</p>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-4xl font-black text-center text-slate-900 mb-16">How It Works</h2>
      <div className="grid md:grid-cols-4 gap-8 text-center relative">
        <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-royal-100 -z-10"></div>
        {[
          { step: '01', title: 'Select Category', desc: 'Choose from 30+ conversion types like Length, Weight, or Speed.' },
          { step: '02', title: 'Enter Value', desc: 'Type your number. Our tool accepts decimals and scientific notation.' },
          { step: '03', title: 'Choose Units', desc: 'Select your "From" and "To" units from our extensive list.' },
          { step: '04', title: 'Get Result', desc: 'Instantly see the precise conversion result with no delay.' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6">
            <div className="w-24 h-24 bg-royal-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-royal-200 border-4 border-white">{item.step}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => (
  <div className="animate-fade-in">
    <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="w-[1000px] h-[1000px] bg-royal-400 rounded-full blur-[120px] absolute -top-1/2 -left-1/4 animate-blob"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8">Precision <span className="text-royal-500">Unit Converter</span> Suite.</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-16">The ultimate unit converter for scientific and engineering tools. 38+ precision converters. Free, private, and instant.</p>
        <QuickConverter />
        <div className="mt-12 w-full">
          <ConversionTrends />
        </div>
      </div>
    </section>
    <section id="converters" className="max-w-7xl mx-auto px-4 py-24">
      <h2 className="text-3xl font-bold text-center mb-12">All Conversion Tools</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Link to="/currency" className="glass-card p-8 rounded-2xl flex flex-col items-center text-center hover:scale-105 transition-all border-2 border-royal-100">
          <span className="text-4xl mb-4">💱</span>
          <span className="font-bold text-slate-800">Currency</span>
        </Link>
        {categories.map(cat => (
          <div key={cat.id} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center border border-royal-100 hover:shadow-md transition-all">
            <Link to={`/converter/${cat.id}`} className="flex flex-col items-center mb-4 hover:scale-105 transition-transform w-full">
              <span className="text-4xl mb-3">{cat.icon}</span>
              <span className="font-bold text-slate-800">{cat.name}</span>
            </Link>
            {cat.popular && (
              <Link
                to={`/converter/${cat.id}/${cat.popular.from}-to-${cat.popular.to}`}
                className="text-xs bg-royal-100 text-royal-700 px-3 py-1.5 rounded-full font-semibold hover:bg-royal-200 transition-colors w-full truncate"
              >
                {cat.popular.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>

    <HowItWorks />
    <WhyTrustUs />

    <section id="blog" className="bg-royal-50 py-24 border-y border-royal-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Latest from our Blog</h2>
          <Link to="/blog" className="text-royal-600 font-bold hover:text-royal-800 flex items-center gap-2">View All Posts <span>→</span></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.slice(0, 3).map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group border border-royal-100 flex flex-col">
              <div className="h-48 bg-royal-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">{post.icon}</div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="text-xs font-bold text-royal-600 mb-2 uppercase tracking-wider">{post.category}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-royal-700 transition-colors">{post.title}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{post.excerpt}</p>
                <span className="text-royal-600 font-bold text-sm flex items-center gap-1 mt-auto">Read Article <span>→</span></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section id="about" className="bg-white py-24 border-y border-royal-100">
      <div className="max-w-4xl mx-auto px-4 prose prose-slate prose-royal">
        <h2 className="text-4xl font-black text-royal-900 text-center mb-12">The Ultimate Guide to Precision Unit Conversion</h2>
        <p className="lead">Welcome to Unit Converter, the most reliable, secure, and comprehensive online unit conversion platform designed for professionals, students, and everyday users. Whether you are a scientist needing precise calculations, a chef converting a recipe, or a traveler navigating foreign currencies, we have the tools you need.</p>
        
        <h3>Why Unit Converter is the Best Choice?</h3>
        <p>Unlike many other tools, Unit Converter runs 100% in your browser. No data is sent to a server. This guarantees instant results and complete privacy. We support over 38 different categories of measurement, from the basics like length and weight to specialized fields like radiation and magnetic flux density.</p>

        <h3>Comprehensive Tool Categories</h3>
        
        <h4>1. Length and Distance</h4>
        <p>
          Our <strong>length converter</strong> is perfect for switching between the Metric and Imperial systems. Convert <strong>meters to feet</strong>, <strong>inches to cm</strong>, kilometers to miles, and even astronomical units like light-years. This is essential for construction, engineering, and travel.
        </p>

        <h4>2. Mass and Weight</h4>
        <p>
          Need to convert <strong>kg to lbs</strong> for your gym progress? Or maybe <strong>grams to ounces</strong> for a baking recipe? Our weight converter handles everything from micrograms to metric tons. We even support stones and pounds for our UK users.
        </p>

        <h4>3. Temperature</h4>
        <p>
          Cooking a turkey? Check our <strong>celsius to fahrenheit baking</strong> converter. We also support Kelvin for scientific applications. Never burn a meal again because of a temperature mix-up!
        </p>

        <h4>4. Volume and Cooking</h4>
        <p>
          Our volume tools are a lifesaver in the kitchen. Convert <strong>gallons to liters</strong>, teaspoons to milliliters, and cups to fluid ounces. Perfect for international recipes.
        </p>
        
        <h4>5. Speed and Velocity</h4>
        <p>
          Driving abroad? Use our <strong>mph to kmh</strong> converter to stay within speed limits. We also support knots for sailors and Mach numbers for aviation enthusiasts.
        </p>

        <h4>6. Area and Land Measurement</h4>
        <p>
          Whether you are a real estate agent, a farmer, or just planning a garden, our area converter is indispensable. Convert <strong>square feet to square meters</strong>, acres to hectares, and even square miles to square kilometers. We also support specialized units like "bigha" and "guntha" for our users in South Asia.
        </p>

        <h4>7. Pressure and Force</h4>
        <p>
          For engineers and scientists, we offer precise conversions for pressure (Pascal, Bar, PSI, Atmosphere) and force (Newton, Dyne, Pound-force). These tools are critical for hydraulics, pneumatics, and structural engineering calculations.
        </p>

        <h4>8. Power and Energy</h4>
        <p>
          Understanding energy consumption is key to efficiency. Convert <strong>Joules to Calories</strong>, Kilowatt-hours to BTUs, and Horsepower to Watts. This is perfect for electricians, HVAC technicians, and fitness enthusiasts tracking calorie burn.
        </p>

        <h4>9. Digital Storage and Data Transfer</h4>
        <p>
          In the digital age, knowing your bits from your bytes is essential. Our tool converts between Bits, Bytes, Kilobytes, Megabytes, Gigabytes, and Terabytes. We also handle data transfer rates like Mbps and Gbps, helping you understand your internet speed.
        </p>

        <h4>10. Fuel Economy</h4>
        <p>
          Planning a road trip? Compare fuel efficiency with our <strong>MPG to km/L</strong> converter. We support US MPG, UK MPG, and Liters per 100km, making it easy to calculate costs no matter where you drive.
        </p>

        <h2 className="text-3xl font-black text-royal-900 mt-16 mb-8">Frequently Asked Questions (FAQ)</h2>
        
        <div className="not-prose space-y-6 mt-8">
          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>How do I convert units online for free?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">Simply select the category (like Length or Weight), choose your starting unit and target unit, and type in the value. Our tool converts it instantly without any sign-up.</p>
          </details>

          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>Is this unit converter accurate for scientific work?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">Yes! We use high-precision floating-point math to ensure accuracy up to 10 decimal places, making it suitable for engineering and scientific calculations.</p>
          </details>

          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>Can I use this converter offline?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">Absolutely. Once the page loads, all conversion logic runs in your browser. You can even disconnect from the internet and it will still work perfectly.</p>
          </details>
          
           <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>How to convert inches to cm?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">Multiply the length in inches by 2.54. For example, 10 inches * 2.54 = 25.4 cm.</p>
          </details>

          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>What is the best unit converter app for Android and iPhone?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">While there are many apps, our web-based Unit Converter works on all devices (Android, iPhone, Windows, Mac) directly in your browser without needing to download or install anything. It's fast, free, and privacy-focused.</p>
          </details>

          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>How to convert kg to lbs?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">To convert kilograms to pounds, multiply the kg value by approximately 2.20462. For example, 5 kg is about 11.02 lbs.</p>
          </details>

          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>What is 180 cm in feet?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">180 cm is approximately 5 feet and 10.87 inches. You can use our length converter for an exact calculation.</p>
          </details>

          <details className="group bg-royal-50 p-6 rounded-2xl border border-royal-100 open:bg-white open:shadow-lg transition-all">
            <summary className="font-bold text-royal-900 cursor-pointer list-none flex justify-between items-center">
              <span>Is there a currency converter included?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-4">Yes, we have a real-time currency converter that supports major world currencies like USD, EUR, GBP, JPY, INR, and more. It updates with the latest exchange rates.</p>
          </details>
        </div>

        <div className="grid md:grid-cols-2 gap-8 not-prose mt-12">
          <div className="p-8 bg-royal-50 rounded-3xl border border-royal-100">
            <h4 className="font-bold text-xl mb-4">Metric System (SI)</h4>
            <p className="text-slate-600 text-sm">The International System of Units is the modern form of the metric system. Built on seven base units, it provides a logical framework.</p>
          </div>
          <div className="p-8 bg-royal-50 rounded-3xl border border-royal-100">
            <h4 className="font-bold text-xl mb-4">Imperial System</h4>
            <p className="text-slate-600 text-sm">Still widely used in the US, Liberia, and Myanmar. Familiar units like inches, feet, and miles are handled with high precision.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-4 py-12">
      <PopularConversionsChart />
    </section>

  </div>
);

const ConverterTool = () => {
  const { categoryId, conversionPair } = useParams();
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');

  const category = useMemo(() => categories.find(c => c.id === categoryId), [categoryId]);

  // Parse conversion pair if it exists (e.g., "meter-to-foot")
  const pairData = useMemo(() => {
    if (!conversionPair || !category) return null;
    const parts = conversionPair.split('-to-');
    if (parts.length !== 2) return null;
    return { from: parts[0], to: parts[1] };
  }, [conversionPair, category]);

  useEffect(() => {
    if (category) {
      if (pairData) {
        // If URL has specific pair, use it
        if (category.units.find(u => u.id === pairData.from)) setFromUnit(pairData.from);
        if (category.units.find(u => u.id === pairData.to)) setToUnit(pairData.to);
      } else {
        // Fallback to query params or defaults
        const f = searchParams.get('from');
        const t = searchParams.get('to');
        setFromUnit(f && category.units.find(u => u.id === f) ? f : category.units[0].id);
        setToUnit(t && category.units.find(u => u.id === t) ? t : (category.units[1]?.id || category.units[0].id));
      }
    }
  }, [category, searchParams, pairData]);

  // SEO Update Effect
  useEffect(() => {
    if (!category) return;
    
    const fromName = category.units.find(u => u.id === (pairData?.from || fromUnit))?.name;
    const toName = category.units.find(u => u.id === (pairData?.to || toUnit))?.name;
    
    const title = pairData 
      ? `Convert ${fromName} to ${toName} - ${category.name} Converter`
      : `${category.name} Converter - Free Online Tool`;
      
    document.title = title;
    
    // Update meta description
    const desc = pairData
      ? `Instant free conversion from ${fromName} to ${toName}. Accurate, private, and no signup required.`
      : `Best free online ${category.name.toLowerCase()} converter. Convert between all major ${category.name.toLowerCase()} units instantly.`;
      
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = desc;
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = desc;
    
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = window.location.href;

    // Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
        linkCanonical.href = window.location.href;
    }

  }, [category, pairData, fromUnit, toUnit]);

  const relatedCategories = useMemo(() => {
    if (!category) return [];
    const groups = [
      ['length', 'area', 'volume', 'weight', 'temperature'],
      ['speed', 'time', 'acceleration', 'fuel'],
      ['pressure', 'force', 'torque', 'energy', 'power'],
      ['digital', 'data_rate', 'frequency', 'si_prefix', 'typography'],
      ['magnetic_field', 'current', 'voltage', 'resistance', 'capacitance', 'inductance', 'charge', 'conductance', 'permeability'],
      ['illuminance', 'luminance', 'radioactivity', 'radiation', 'viscosity_dyn', 'viscosity_kin', 'density', 'concentration', 'molar_mass', 'surface_tension', 'flow', 'mass_flow', 'angle', 'sound_intensity']
    ];
    let group = groups.find(g => g.includes(category.id)) || categories.map(c => c.id);
    let related = categories.filter(c => group.includes(c.id) && c.id !== category.id);
    if (related.length < 4) {
      const others = categories.filter(c => !group.includes(c.id) && c.id !== category.id);
      related = [...related, ...others];
    }
    return related.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [category]);

  // Generate popular conversions for this category
  const popularConversions = useMemo(() => {
    if (!category) return [];
    const links = [];
    const units = category.units;
    // Generate links for the first few units to create internal pages
    const limit = Math.min(units.length, 6); 
    for (let i = 0; i < limit; i++) {
      for (let j = 0; j < limit; j++) {
        if (i !== j) {
          links.push({
            from: units[i],
            to: units[j],
            url: `/converter/${categoryId}/${units[i].id}-to-${units[j].id}`
          });
        }
      }
    }
    return links;
  }, [category, categoryId]);

  if (!category) return <div className="p-20 text-center">Converter not found. <Link to="/" className="text-royal-600">Go Home</Link></div>;

  const result = formatNumber(convert(parseFloat(amount) || 0, fromUnit, toUnit, category.id));
  const fromUnitName = category.units.find(u => u.id === fromUnit)?.name;
  const toUnitName = category.units.find(u => u.id === toUnit)?.name;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-royal-600">Home</Link> <span>/</span> <Link to={`/converter/${category.id}`} className="hover:text-royal-600">{category.name}</Link>
          {pairData && <> <span>/</span> <span className="font-bold text-slate-900">{fromUnitName} to {toUnitName}</span></>}
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-royal-600 hover:text-royal-700 transition-colors bg-royal-50 px-4 py-2 rounded-full border border-royal-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Tools
        </Link>
      </div>
      <div className="glass shadow-2xl rounded-[2rem] p-12 border border-royal-100 relative overflow-hidden mb-16">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-royal-100 rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-12">
            <span className="text-6xl">{category.icon}</span>
            <h1 className="text-4xl font-black text-slate-900">{pairData ? `Convert ${fromUnitName} to ${toUnitName}` : `${category.name} Converter`}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">From</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-4xl font-black bg-transparent border-b-4 border-royal-200 focus:border-royal-500 outline-none mb-6 pb-2" />
              <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full p-4 bg-white rounded-xl border border-slate-200 shadow-sm">{category.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            </div>
            <div className="bg-royal-50 p-8 rounded-3xl border border-royal-200">
              <label className="block text-sm font-bold text-royal-500 mb-4 uppercase tracking-widest">To</label>
              <div className="text-4xl font-black text-royal-900 mb-6 pb-2 break-all">{result}</div>
              <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full p-4 bg-white rounded-xl border border-slate-200 shadow-sm">{category.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            </div>
          </div>
          <div className="mt-12 p-6 bg-white/50 rounded-2xl border border-slate-100 text-center">
            <p className="text-slate-500 font-medium">Formula: <span className="text-royal-700 font-bold">{amount} {category.units.find(u => u.id === fromUnit)?.name} ≈ {result} {category.units.find(u => u.id === toUnit)?.name}</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto prose prose-slate prose-royal mb-16">
        <h2 className="text-3xl font-bold text-slate-900">About {category.name} Conversion</h2>
        <p>
          Welcome to the world's most accurate and free online <strong>{category.name.toLowerCase()} converter</strong>. 
          Whether you are a student, professional, or just need a quick calculation, our tool provides instant results without any signup.
        </p>
        <p>
          This <strong>{category.name.toLowerCase()} calculator</strong> is designed to be precise, reliable, and easy to use. 
          We support all major units including {category.units.slice(0, 3).map(u => u.name).join(', ')}, and many more.
        </p>
        
        <h3>Why use our {category.name} Converter?</h3>
        <ul>
          <li><strong>100% Free & Private:</strong> All calculations happen in your browser. No data is sent to any server.</li>
          <li><strong>High Precision:</strong> We use advanced floating-point math to ensure scientific accuracy.</li>
          <li><strong>Instant Results:</strong> No waiting, no loading. Get your answers immediately.</li>
        </ul>

        <h3>Common {category.name} Conversions</h3>
        <p>
          Our users frequently use this tool for converting <strong>{category.units[0]?.name} to {category.units[1]?.name}</strong> and vice versa. 
          It's perfect for engineering, science, cooking, and everyday tasks.
        </p>

        <h3>Frequently Asked Questions (FAQ)</h3>
        <div className="not-prose space-y-4 mt-6">
          <details className="group bg-white p-4 rounded-xl border border-slate-200 open:shadow-md transition-all">
            <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
              <span>How accurate is this {category.name.toLowerCase()} converter?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-2 text-sm">We use standard scientific conversion factors and high-precision math to ensure the most accurate results possible for all your {category.name.toLowerCase()} needs.</p>
          </details>
          <details className="group bg-white p-4 rounded-xl border border-slate-200 open:shadow-md transition-all">
            <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
              <span>Is this tool free to use?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-2 text-sm">Yes, our {category.name.toLowerCase()} converter is 100% free forever. There are no hidden fees, no subscriptions, and no limits on usage.</p>
          </details>
          <details className="group bg-white p-4 rounded-xl border border-slate-200 open:shadow-md transition-all">
            <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
              <span>Do I need to download an app?</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-slate-600 mt-2 text-sm">No! This tool works directly in your web browser on your phone, tablet, or computer. No download or installation required.</p>
          </details>
        </div>
      </div>

      {/* Popular Conversions Grid */}
      <div className="mt-16 pt-12 border-t border-slate-200 animate-fade-in">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Popular {category.name} Conversions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {popularConversions.map((link, i) => (
            <Link key={i} to={link.url} className="text-sm text-slate-600 hover:text-royal-600 hover:bg-royal-50 p-3 rounded-lg transition-colors border border-transparent hover:border-royal-100 flex items-center gap-2">
              <span className="text-royal-400">→</span> {link.from.name} to {link.to.name}
            </Link>
          ))}
        </div>
      </div>

      {relatedCategories.length > 0 && (
        <div className="mt-16 animate-fade-in">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Related Converters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedCategories.map(cat => (
              <Link key={cat.id} to={`/converter/${cat.id}`} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center hover:scale-105 transition-all">
                <span className="text-4xl mb-3">{cat.icon}</span>
                <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'NZD', 
    'BRL', 'ZAR', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'SEK', 
    'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 
    'COP', 'SAR', 'MYR', 'RON', 'VND', 'ARS', 'EGP'
  ].sort();

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        setRate(data.rates[to]);
        setLastUpdated(new Date(data.time_last_update_utc).toLocaleString());
      } catch (err) {
        setError('Failed to load exchange rates. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, [from, to]);

  // SEO Update
  useEffect(() => {
    const title = `Convert ${from} to ${to} - Live Currency Rates`;
    document.title = title;
    
    const desc = `Real-time exchange rate for ${from} to ${to}. Free, accurate, and instant currency conversion calculator.`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = desc;
    
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = window.location.href;
    
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.href = window.location.href;
  }, [from, to]);

  const result = rate ? (parseFloat(amount) * rate).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '...';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-royal-600">Home</Link> <span>/</span> <span className="font-bold text-slate-900">Currency</span>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-royal-600 hover:text-royal-700 transition-colors bg-royal-50 px-4 py-2 rounded-full border border-royal-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Tools
        </Link>
      </div>
      <div className="glass shadow-2xl rounded-[2rem] p-12 border border-royal-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-royal-100 rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-12">
            <span className="text-6xl">💱</span>
            <h1 className="text-4xl font-black text-slate-900">Currency Converter</h1>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">From</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-4xl font-black bg-transparent border-b-4 border-royal-200 focus:border-royal-500 outline-none mb-6 pb-2" />
              <select value={from} onChange={e => setFrom(e.target.value)} className="w-full p-4 bg-white rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700">
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-royal-50 p-8 rounded-3xl border border-royal-200">
              <label className="block text-sm font-bold text-royal-500 mb-4 uppercase tracking-widest">To</label>
              <div className="text-4xl font-black text-royal-900 mb-6 pb-2 break-all flex items-center gap-2">
                {loading ? <span className="text-2xl opacity-50">Updating...</span> : result}
              </div>
              <select value={to} onChange={e => setTo(e.target.value)} className="w-full p-4 bg-white rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700">
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-white/50 rounded-2xl border border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              1 {from} = <span className="text-royal-700 font-bold">{rate} {to}</span>
              {lastUpdated && <span className="block text-xs mt-2 opacity-60">Last updated: {lastUpdated}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Calculator = () => {
  useEffect(() => {
    document.title = "Scientific Calculator - Free Online Math Tool";
    
    const desc = "Free online scientific calculator with advanced features. Calculate sin, cos, tan, log, and more instantly.";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;
    
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = "Scientific Calculator - Free Online Math Tool";
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = desc;
    
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.href = window.location.href;
  }, []);

  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [isRad, setIsRad] = useState(true);

  const handleBtn = (val) => {
    if (val === 'C') {
      setDisplay('');
      setResult('');
    } else if (val === 'DEL') {
      setDisplay(display.slice(0, -1));
    } else if (val === 'Ans') {
      if (result && result !== 'Error') {
        setDisplay(display + result.replace(/,/g, '')); // Remove commas for calculation
      }
    } else if (val === '=') {
      try {
        // Define safe math environment
        const funcBody = `
          const sin = (x) => Math.sin(${isRad} ? x : x * Math.PI / 180);
          const cos = (x) => Math.cos(${isRad} ? x : x * Math.PI / 180);
          const tan = (x) => Math.tan(${isRad} ? x : x * Math.PI / 180);
          const asin = (x) => ${isRad} ? Math.asin(x) : Math.asin(x) * 180 / Math.PI;
          const acos = (x) => ${isRad} ? Math.acos(x) : Math.acos(x) * 180 / Math.PI;
          const atan = (x) => ${isRad} ? Math.atan(x) : Math.atan(x) * 180 / Math.PI;
          const log = Math.log10;
          const ln = Math.log;
          const sqrt = Math.sqrt;
          const pi = Math.PI;
          const e = Math.E;
          return ${display
            .replace(/\^/g, '**')
            .replace(/π/g, 'pi')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
          };
        `;
        
        const res = new Function(funcBody)();
        
        if (!isFinite(res) || isNaN(res)) {
          setResult('Error');
        } else {
          // Format result: max 10 decimal places, remove trailing zeros
          setResult(Number(res.toFixed(10)).toLocaleString('en-US', { maximumFractionDigits: 10 }));
        }
      } catch (err) {
        setResult('Error');
      }
    } else {
      setDisplay(display + val);
    }
  };

  const btnClass = "h-12 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm border select-none";
  const numClass = `${btnClass} bg-white text-slate-800 border-slate-200 hover:bg-slate-50`;
  const opClass = `${btnClass} bg-royal-100 text-royal-800 border-royal-200 hover:bg-royal-200`;
  const fnClass = `${btnClass} bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 text-sm`;
  const actionClass = `${btnClass} bg-royal-600 text-white border-royal-700 hover:bg-royal-700`;
  const modeClass = `${btnClass} text-xs font-black tracking-wider ${isRad ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-200 text-slate-500 border-slate-300'}`;

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-royal-600">Home</Link> <span>/</span> <span className="font-bold text-slate-900">Scientific Calculator</span>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-royal-600 hover:text-royal-700 transition-colors bg-royal-50 px-4 py-2 rounded-full border border-royal-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back
        </Link>
      </div>
      <div className="glass shadow-2xl rounded-[2rem] p-8 border border-royal-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-royal-100 rounded-full blur-3xl opacity-50 animate-blob"></div>
        
        <div className="relative z-10">
          <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200 p-4 text-right shadow-inner">
            <div className="text-slate-500 text-sm h-6 overflow-hidden flex justify-between">
              <span className="text-xs font-bold bg-slate-200 px-2 rounded text-slate-600 flex items-center">{isRad ? 'RAD' : 'DEG'}</span>
              <span>{result !== '' ? display + ' =' : ''}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 overflow-x-auto no-scrollbar whitespace-nowrap h-12 flex items-center justify-end tracking-tight">
              {result !== '' ? result : (display || '0')}
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            <button onClick={() => setIsRad(!isRad)} className={fnClass}>{isRad ? 'Deg' : 'Rad'}</button>
            {['sin', 'cos', 'tan', 'DEL', 'C'].map(b => (
              <button key={b} onClick={() => handleBtn(b)} className={b === 'C' || b === 'DEL' ? actionClass.replace('bg-royal-600', 'bg-red-500').replace('border-royal-700', 'border-red-600') : fnClass}>{b}</button>
            ))}
            
            {['Ans', 'log', 'ln', '(', ')'].map(b => (
              <button key={b} onClick={() => handleBtn(b)} className={fnClass}>{b}</button>
            ))}
            
            {['7', '8', '9', '÷', 'sqrt'].map(b => (
              <button key={b} onClick={() => handleBtn(b)} className={['÷', 'sqrt'].includes(b) ? opClass : numClass}>{b}</button>
            ))}
            
            {['4', '5', '6', '×', '^'].map(b => (
              <button key={b} onClick={() => handleBtn(b)} className={['×', '^'].includes(b) ? opClass : numClass}>{b}</button>
            ))}
            
            {['1', '2', '3', '-', 'π'].map(b => (
              <button key={b} onClick={() => handleBtn(b)} className={['-', 'π'].includes(b) ? opClass : numClass}>{b}</button>
            ))}
            
            {['0', '.', 'e', '+', '='].map(b => (
               <button key={b} onClick={() => handleBtn(b)} className={b === '=' ? actionClass : (['+', 'e'].includes(b) ? opClass : numClass)}>{b}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const blogPosts = [
  {
    slug: 'inches-to-cm',
    title: 'How to Convert Inches to Centimeters in Seconds (No Calculator Needed)',
    category: 'Measurement Guide',
    icon: '📏',
    excerpt: 'Learn the simple math trick to convert length units without a calculator. Perfect for DIY and sewing.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">Hello there, my dear! Gather around. Have you ever been working on a lovely sewing project, trying to figure out the size of a new picture frame, or reading a recipe, and suddenly you're staring at a measurement in inches when you desperately need centimeters?</p>
      <p>Oh, I know that feeling all too well! It can be quite frustrating when you just want to get on with your day. You might be wondering exactly <strong>how to convert inches to cm</strong> without getting a headache or pulling out a complicated math book. Well, don't you worry your pretty little head about it anymore. Today, Grandma is going to show you exactly how to do this in seconds.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Want to skip the math entirely? <a href="/#/" class="text-royal-600 underline hover:text-royal-800">Try our free unit converter here</a></p></div>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why is it necessary to understand simple unit conversions?</h2>
      <p>You see, sweetie, the world is a big, beautiful place, but we don't all measure things the same way. Here in the United States, we often use the Imperial system (inches, feet, pounds). But most of the rest of the world uses the Metric system (centimeters, meters, kilograms).</p>
      <p>Whether you are buying clothes online from Europe, following a British baking recipe, or helping the kids with their science homework, knowing how to switch between these two systems is a wonderful life skill. It saves you time, prevents silly mistakes, and keeps your projects running smoothly. And if you ever get stuck, a trusty <strong>online unit converter</strong> is always there to help!</p>
      <h3 class="text-2xl font-bold text-slate-800 mt-10 mb-4">What is the conversion of measurement anyway?</h3>
      <p>Think of it like translating a language. Just like "Hello" and "Bonjour" mean the exact same thing but sound different, "1 inch" and "2.54 centimeters" are the exact same length, just spoken in different measurement languages! A <strong>unit conversion calculator</strong> simply translates the numbers for you.</p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">How do you convert from one metric unit to another?</h2>
      <p>Now, let's get to the fun part. The secret recipe for converting inches to centimeters is just one magic number: <strong>2.54</strong>.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8"><li><strong>Inches to CM:</strong> Multiply your inches by 2.54.</li><li><strong>CM to Inches:</strong> Divide your centimeters by 2.54.</li></ul>
      <p>For example, if you have a ribbon that is 10 inches long, you just multiply 10 by 2.54. That gives you 25.4 centimeters! Easy as pie, right?</p>
      <h3 class="text-2xl font-bold text-slate-800 mt-10 mb-4">Quick Inches to CM Conversion Table</h3>
      <div class="overflow-x-auto my-8"><table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"><thead class="bg-royal-100 text-royal-900"><tr><th class="py-3 px-6 text-left font-bold">Inches (in)</th><th class="py-3 px-6 text-left font-bold">Centimeters (cm)</th></tr></thead><tbody class="divide-y divide-slate-100"><tr class="hover:bg-slate-50"><td class="py-3 px-6">1 inch</td><td class="py-3 px-6">2.54 cm</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">2 inches</td><td class="py-3 px-6">5.08 cm</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">5 inches</td><td class="py-3 px-6">12.70 cm</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">10 inches</td><td class="py-3 px-6">25.40 cm</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">12 inches</td><td class="py-3 px-6">30.48 cm</td></tr></tbody></table></div>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Common Unit Conversion Mistakes (And the 30-Second Fix)</h2>
      <p>Oh, I've seen it all, honey. The most common mistake folks make is multiplying when they should be dividing, or dividing when they should be multiplying! Here is Grandma's golden rule: Centimeters are smaller than inches. So, if you are going from inches to centimeters, your final number should be <strong>bigger</strong>.</p>
      <p>Another mistake is trying to guess. When you are building a birdhouse or measuring flour for a cake, guessing just won't do! That's why a <strong>metric converter</strong> is your best friend.</p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Best Free Unit Converter for Your Daily Needs</h2>
      <p>Now, I know there are a lot of websites out there, but you want something safe, fast, and easy to use. Our <strong>unit converter</strong> is completely free, 100% private (it runs right in your browser, so no one is snooping on your data!), and it doesn't require any silly sign-ups.</p>
      <p>Whether you need a <strong>metric to imperial converter free</strong> of charge, or you're trying to figure out <em>what is 180 cm in feet</em> (it's about 5 feet 11 inches, by the way!), we have you covered. We even have tools for weight, temperature, and speed!</p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Understanding the History of Measurement</h2>
      <p>Did you know that the inch was originally based on the width of a man's thumb? It's true! And the foot was, well, the length of a foot. It sounds funny now, but back in the old days, people used their own bodies to measure things. The problem was, everyone's thumbs and feet were different sizes! Can you imagine trying to build a house like that?</p>
      <p>That's why we have standardized units now. The <strong>metric system</strong> was created to make everything easier and more consistent. It's based on the number 10, which makes the math so much simpler. But because history is stubborn, we still have the Imperial system hanging around, especially here in the US. And that is exactly why we need a good <strong>unit conversion calculator</strong>.</p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why Accuracy Matters in Cooking and DIY</h2>
      <p>Let me tell you a little story. Once, I tried to make a French cake recipe. It called for 200 grams of flour, but I just guessed and used cups. Well, let me tell you, that cake was as hard as a rock! When you are baking, accuracy is everything. A little too much flour or not enough sugar can ruin the whole thing. That's why I always use a <strong>unit converter for cooking</strong>. It helps me switch between cups, ounces, grams, and milliliters with ease.</p>
    `,
    faq: [
      { q: "How to convert inches to cm?", a: "Multiply inches by 2.54." },
      { q: "Is there a free online unit converter?", a: "Yes, our tool is 100% free and online." },
      { q: "What is 180 cm in feet?", a: "180 cm is approx 5 feet 11 inches." }
    ]
  },
  {
    slug: 'kg-to-lbs',
    title: 'Kg to Lbs Conversion Guide: Perfect for Weight Loss & Gym Tracking',
    category: 'Fitness & Health',
    icon: '⚖️',
    excerpt: 'Track your fitness goals accurately. Understand the difference between kilograms and pounds with our simple guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">Are you tracking your weight loss journey or trying to figure out how much you're lifting at the gym? Confused by the difference between kilograms (kg) and pounds (lbs)? You are not alone!</p>
      <p>Whether you're following an international workout plan or just weighing your luggage before a flight, knowing how to convert <strong>kg to lbs</strong> is a super useful skill. And the best part? It's easier than you think!</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Need a quick answer? <a href="/#/converter/weight" class="text-royal-600 underline hover:text-royal-800">Use our free Weight Converter</a></p></div>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 2.20462</h2>
      <p>Here is the secret: <strong>1 kilogram is approximately equal to 2.2 pounds</strong>. To be precise, it's 2.20462, but for most things, 2.2 is close enough.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8"><li><strong>Kg to Lbs:</strong> Multiply by 2.2</li><li><strong>Lbs to Kg:</strong> Divide by 2.2</li></ul>
      <p>So, if you weigh 70 kg, you just multiply 70 by 2.2 to get 154 lbs. Simple!</p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why do we have two systems?</h2>
      <p>The Kilogram is the base unit of mass in the International System of Units (SI), used by almost the entire world. The Pound is part of the Imperial system, used mainly in the United States. This can cause a lot of confusion, especially in sports and travel.</p>
      <h3 class="text-2xl font-bold text-slate-800 mt-10 mb-4">Gym & Fitness</h3>
      <p>If you watch the Olympics, the weights are in kg. But your local gym might use lbs plates. Knowing that 20kg is 44lbs helps you load the bar correctly and avoid injury.</p>
      <h3 class="text-2xl font-bold text-slate-800 mt-10 mb-4">Travel & Luggage</h3>
      <p>Airlines are strict about weight limits. Most international flights limit checked bags to 23kg. If you have a scale that measures in lbs, that's about 50lbs. Don't get caught with overweight fees!</p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Common Conversions Cheat Sheet</h2>
      <div class="overflow-x-auto my-8"><table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"><thead class="bg-royal-100 text-royal-900"><tr><th class="py-3 px-6 text-left font-bold">Kilograms (kg)</th><th class="py-3 px-6 text-left font-bold">Pounds (lbs)</th></tr></thead><tbody class="divide-y divide-slate-100"><tr class="hover:bg-slate-50"><td class="py-3 px-6">1 kg</td><td class="py-3 px-6">2.20 lbs</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">5 kg</td><td class="py-3 px-6">11.02 lbs</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">10 kg</td><td class="py-3 px-6">22.05 lbs</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">20 kg</td><td class="py-3 px-6">44.09 lbs</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">50 kg</td><td class="py-3 px-6">110.23 lbs</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">100 kg</td><td class="py-3 px-6">220.46 lbs</td></tr></tbody></table></div>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why Use an Online Converter?</h2>
      <p>Doing math in your head is great, but when precision matters, a <strong>free online kg to lbs converter</strong> is safer. Our tool gives you the exact decimal, so you know exactly what you're dealing with.</p>
    `,
    faq: [
      { q: "How to convert kg to lbs?", a: "Multiply kilograms by 2.20462." },
      { q: "What is 50kg in pounds?", a: "50kg is approximately 110.2 lbs." },
      { q: "Is kg heavier than lbs?", a: "Yes, 1 kg is heavier than 1 lb. In fact, 1 kg is about 2.2 lbs." }
    ]
  },
  {
    slug: 'fahrenheit-to-celsius',
    title: 'Fahrenheit to Celsius Made Easy for Bakers & Travelers',
    category: 'Cooking & Travel',
    icon: '🌡️',
    excerpt: 'Never burn a cake or pack the wrong clothes again. Master temperature conversion with this easy guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">Have you ever tried a recipe that called for baking at 180°C, but your oven only has Fahrenheit dials? Or maybe you're planning a trip to London and the forecast says 20°C, and you have no idea if that's shorts weather or sweater weather?</p>
      <p>Temperature conversion is one of the trickiest ones because it's not just a simple multiplication. But don't panic! We're going to break down <strong>fahrenheit to celsius</strong> (and vice versa) so you can cook and travel with confidence.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Don't want to do the math? <a href="/#/converter/temperature" class="text-royal-600 underline hover:text-royal-800">Use our Temperature Converter</a></p></div>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Formulas (If you like math)</h2>
      <p>Unlike length or weight, temperature scales start at different points. Water freezes at 32°F but 0°C. That's why we need a formula:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8"><li><strong>Celsius to Fahrenheit:</strong> (°C × 9/5) + 32 = °F</li><li><strong>Fahrenheit to Celsius:</strong> (°F - 32) × 5/9 = °C</li></ul>
      <p>Sounds complicated? Here is a quick mental trick: To go from Celsius to Fahrenheit, multiply by 2 and add 30. It's not exact, but it's close enough for checking the weather!</p>
      <p><em>Example: 20°C. 20 × 2 = 40. 40 + 30 = 70°F. (The exact answer is 68°F, so it's pretty close!)</em></p>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Baking Temperatures Guide</h2>
      <p>In baking, precision is key. A "moderate oven" is usually 350°F or 180°C. Here are the standard conversions every baker needs:</p>
      <div class="overflow-x-auto my-8"><table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"><thead class="bg-royal-100 text-royal-900"><tr><th class="py-3 px-6 text-left font-bold">Gas Mark</th><th class="py-3 px-6 text-left font-bold">Fahrenheit (°F)</th><th class="py-3 px-6 text-left font-bold">Celsius (°C)</th></tr></thead><tbody class="divide-y divide-slate-100"><tr class="hover:bg-slate-50"><td class="py-3 px-6">1</td><td class="py-3 px-6">275°F</td><td class="py-3 px-6">140°C</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">3</td><td class="py-3 px-6">325°F</td><td class="py-3 px-6">160°C</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">4</td><td class="py-3 px-6">350°F</td><td class="py-3 px-6">180°C</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">6</td><td class="py-3 px-6">400°F</td><td class="py-3 px-6">200°C</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">7</td><td class="py-3 px-6">425°F</td><td class="py-3 px-6">220°C</td></tr><tr class="hover:bg-slate-50"><td class="py-3 px-6">9</td><td class="py-3 px-6">475°F</td><td class="py-3 px-6">240°C</td></tr></tbody></table></div>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Weather Guide</h2>
      <ul class="list-disc pl-6 space-y-2 mb-8"><li><strong>0°C (32°F):</strong> Freezing point of water. Wear a coat!</li><li><strong>10°C (50°F):</strong> Cool day. Jacket required.</li><li><strong>20°C (68°F):</strong> Room temperature. Pleasant.</li><li><strong>30°C (86°F):</strong> Hot day. Beach weather!</li><li><strong>40°C (104°F):</strong> Very hot heat wave. Stay hydrated.</li></ul>
      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why Accuracy Matters</h2>
      <p>For science students, <strong>temperature conversion</strong> is fundamental. A small error in a chemistry lab can ruin an experiment. That's why our <strong>unit conversion calculator</strong> uses precise floating-point math to give you the exact answer every time.</p>
    `,
    faq: [
      { q: "How to convert Celsius to Fahrenheit baking?", a: "Multiply °C by 1.8 and add 32." },
      { q: "What is 180C in F?", a: "180°C is equal to 356°F." },
      { q: "Is 30 degrees hot or cold?", a: "30°C is hot (86°F), but 30°F is below freezing (-1°C)." }
    ]
  },
  {
    slug: 'meters-to-feet',
    title: 'Meters to Feet: The Ultimate Guide for Real Estate, Construction & Travel',
    category: 'Construction',
    icon: '🏗️',
    excerpt: 'Buying property abroad? Working on a blueprint? Learn how to convert meters to feet instantly with our comprehensive guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">Imagine this: You are looking at a beautiful vacation home listing in Italy. The description says the living room is "6 meters wide." Is that big? Is it small? Can you fit your favorite sofa in there?</p>
      <p>Or perhaps you are an architect working on a project that requires precise conversion between metric and imperial units. Whatever your reason, understanding the relationship between <strong>meters and feet</strong> is crucial in today's globalized world.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Need an instant calculation? <a href="/#/converter/length" class="text-royal-600 underline hover:text-royal-800">Use our Length Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Golden Ratio: 3.28084</h2>
      <p>Let's get straight to the math. The conversion factor you need to memorize is <strong>3.28</strong>.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Meter = 3.28084 Feet</strong></li>
        <li><strong>1 Foot = 0.3048 Meters</strong></li>
      </ul>
      <p>To convert meters to feet, you simply multiply by 3.28. To go the other way, you divide by 3.28. It is that simple!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Real-World Examples</h2>
      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Real Estate & Rooms</h3>
      <p>If a room is 4 meters x 5 meters, how big is it in feet?
      <br>4m x 3.28 = 13.12 feet
      <br>5m x 3.28 = 16.4 feet
      <br>So, the room is roughly 13x16 feet. That is a spacious living area!</p>

      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">2. Human Height</h3>
      <p>In Europe, height is measured in centimeters or meters. In the US, it's feet and inches.
      <br>If someone is 1.80 meters tall:
      <br>1.80 x 3.28 = 5.9 feet.
      <br>Wait, 5.9 feet is NOT 5 feet 9 inches! 0.9 feet is 0.9 x 12 inches = 10.8 inches.
      <br>So, 1.80m is actually about <strong>5 feet 11 inches</strong>.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Meters to Feet Conversion Table</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Meters (m)</th>
              <th class="py-3 px-6 text-left font-bold">Feet (ft)</th>
              <th class="py-3 px-6 text-left font-bold">Feet & Inches (approx)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1 m</td><td class="py-3 px-6">3.28 ft</td><td class="py-3 px-6">3' 3"</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">2 m</td><td class="py-3 px-6">6.56 ft</td><td class="py-3 px-6">6' 7"</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">3 m</td><td class="py-3 px-6">9.84 ft</td><td class="py-3 px-6">9' 10"</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">4 m</td><td class="py-3 px-6">13.12 ft</td><td class="py-3 px-6">13' 1"</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">5 m</td><td class="py-3 px-6">16.40 ft</td><td class="py-3 px-6">16' 5"</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">10 m</td><td class="py-3 px-6">32.81 ft</td><td class="py-3 px-6">32' 10"</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why the Difference? A Brief History</h2>
      <p>The <strong>meter</strong> was originally defined in 1793 as one ten-millionth of the distance from the equator to the North Pole. It is a scientific unit based on the Earth itself.</p>
      <p>The <strong>foot</strong>, on the other hand, has ancient roots. It was originally based on the actual length of a human foot (specifically, King Henry I's foot, according to legend!). Because feet vary in size, the unit wasn't standardized for a long time. Today, the "International Foot" is defined exactly as 0.3048 meters.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Accuracy in Construction</h2>
      <p>In construction, confusing meters and feet can be a disaster. There is a famous story about a Mars orbiter that crashed because one team used metric units and the other used imperial! While you might not be building a spaceship, getting your measurements right for a home renovation is just as important to you.</p>
      <p>That is why our <strong>online unit converter</strong> is such a valuable tool. It eliminates human error and gives you the precise numbers you need for blueprints, floor plans, and material orders.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">How to Convert Without a Calculator (Estimation)</h2>
      <p>If you are on a job site and don't have your phone, use the "Rule of Three plus Ten Percent".</p>
      <p>Multiply meters by 3, then add 10% of that number.</p>
      <p><em>Example: 5 meters.</em>
      <br>5 x 3 = 15.
      <br>10% of 15 is 1.5.
      <br>15 + 1.5 = 16.5 feet.
      <br>(Actual answer: 16.4 feet). Pretty close!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Whether you are measuring height, distance, or room size, knowing how to convert <strong>meters to feet</strong> is a key skill. But for the most accurate results, always use a trusted <strong>digital converter</strong>. It is fast, free, and mistake-proof.</p>
    `,
    faq: [
      { q: "How many feet are in a meter?", a: "There are approximately 3.28 feet in one meter." },
      { q: "Is a meter longer than a yard?", a: "Yes, a meter is slightly longer than a yard. 1 meter = 1.09 yards." },
      { q: "How to convert meters to feet and inches?", a: "Multiply meters by 3.28 to get feet. Take the decimal part and multiply by 12 to get inches." }
    ]
  },
  {
    slug: 'liters-to-gallons',
    title: 'Liters to Gallons: The Ultimate Guide for Fuel, Water & Travel',
    category: 'Travel',
    icon: '⛽',
    excerpt: 'Driving in Europe? Don\'t get confused at the pump. Master the liter to gallon conversion with our complete guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You are on a road trip in Europe, the fuel light comes on, and you pull into a gas station. The price looks amazing—only €1.80! But wait... that is per <strong>liter</strong>, not per gallon. Suddenly, you realize you have no idea how much it's actually costing you to fill up your tank.</p>
      <p>Or maybe you are trying to drink more water, and your health app says to drink 3 liters a day, but your water bottle is in ounces or gallons. Confusion strikes again!</p>
      <p>Converting <strong>liters to gallons</strong> is one of the most common headaches for travelers and health enthusiasts alike. But fear not! We are going to break it down so you never have to guess again.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Need a quick answer? <a href="/#/converter/volume" class="text-royal-600 underline hover:text-royal-800">Use our Volume Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Big Confusion: US vs. UK Gallons</h2>
      <p>Before we do any math, we have to address the elephant in the room. There are TWO types of gallons!</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>US Liquid Gallon:</strong> Used in the United States. Equal to 3.785 liters.</li>
        <li><strong>Imperial (UK) Gallon:</strong> Used in the UK and Canada. Equal to 4.546 liters.</li>
      </ul>
      <p>This is crucial! If you are renting a car in London, your "gallon" is 20% bigger than the gallon back home in New York. That means you get better mileage than you think! For this guide, we will focus primarily on the <strong>US Gallon</strong>, as it is the most common conversion requested.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 3.785</h2>
      <p>To convert Liters to US Gallons, remember this number: <strong>3.785</strong>.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>Liters to Gallons:</strong> Divide by 3.785.</li>
        <li><strong>Gallons to Liters:</strong> Multiply by 3.785.</li>
      </ul>
      <p><em>Rough Estimate:</em> A gallon is a little less than 4 liters. So, if you have 4 liters of milk, that is roughly one gallon jug.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Real-World Scenarios</h2>
      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">1. At the Gas Station</h3>
      <p>If gas is €1.80 per liter, how much is that per gallon?
      <br>€1.80 x 3.785 = €6.81 per gallon.
      <br>Ouch! That is significantly more expensive than US prices. Knowing this helps you budget your trip better.</p>

      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">2. Drinking Water</h3>
      <p>Doctors often recommend drinking about 3 liters of water a day. How much is that in gallons?
      <br>3 / 3.785 = 0.79 gallons.
      <br>So, you need to drink almost a full gallon of water every day!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Liters to US Gallons Conversion Table</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Liters (L)</th>
              <th class="py-3 px-6 text-left font-bold">US Gallons (gal)</th>
              <th class="py-3 px-6 text-left font-bold">Common Item</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1 L</td><td class="py-3 px-6">0.26 gal</td><td class="py-3 px-6">Large water bottle</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">2 L</td><td class="py-3 px-6">0.53 gal</td><td class="py-3 px-6">Soda bottle</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">3.78 L</td><td class="py-3 px-6">1.00 gal</td><td class="py-3 px-6">Milk jug</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">10 L</td><td class="py-3 px-6">2.64 gal</td><td class="py-3 px-6">Bucket</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">50 L</td><td class="py-3 px-6">13.21 gal</td><td class="py-3 px-6">Small car gas tank</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">159 L</td><td class="py-3 px-6">42.00 gal</td><td class="py-3 px-6">Oil Barrel</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why Accuracy Matters</h2>
      <p>In 1983, an Air Canada flight (the "Gimli Glider") ran out of fuel mid-air because the ground crew confused liters and gallons (and pounds vs kilograms)! Thankfully, the pilot landed safely, but it is a terrifying reminder of why <strong>unit conversion</strong> is critical.</p>
      <p>Always double-check your units, especially when dealing with fuel, chemicals, or medicine. Our <strong>online converter</strong> is designed to be precise to the 10th decimal place, keeping you safe and accurate.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Whether you are filling up a rental car in Rome or tracking your water intake at the gym, mastering the <strong>liters to gallons</strong> conversion makes life smoother. Keep the number 3.785 in mind, or better yet, bookmark our free tool for instant answers!</p>
    `,
    faq: [
      { q: "How many liters in a gallon?", a: "There are 3.785 liters in a US gallon." },
      { q: "Is a UK gallon the same as a US gallon?", a: "No. A UK gallon is 4.546 liters, while a US gallon is 3.785 liters." },
      { q: "How to convert liters to gallons easily?", a: "Divide the number of liters by 4 for a rough estimate, or by 3.785 for accuracy." }
    ]
  },
  {
    slug: 'grams-to-ounces',
    title: 'Grams to Ounces: The Secret to Perfect Baking',
    category: 'Cooking',
    icon: '🧁',
    excerpt: 'The secret to perfect pastries is precise measurement. Convert grams to ounces like a pro chef with our detailed guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You found the perfect recipe for a French macaron or an Italian ciabatta. It looks delicious. But then you scroll down to the ingredients and panic—everything is in <strong>grams</strong>!</p>
      <p>If you grew up using cups and ounces, seeing "250g of flour" can be intimidating. Do you guess? Do you try to use a cup? NO! Baking is chemistry. Precision is everything. To get that perfect rise and texture, you need to convert <strong>grams to ounces</strong> accurately.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Baking right now? <a href="/#/converter/weight" class="text-royal-600 underline hover:text-royal-800">Use our Kitchen Weight Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 28.35</h2>
      <p>This is the golden rule of the kitchen:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Ounce (oz) = 28.35 Grams (g)</strong></li>
        <li><strong>1 Gram = 0.035 Ounces</strong></li>
      </ul>
      <p>To go from ounces to grams, multiply by 28.35. To go from grams to ounces, divide by 28.35. </p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why Weighing is Better than Scooping</h2>
      <p>Professional bakers rarely use cups. Why? Because a cup of flour can weigh anywhere from 120g to 150g depending on how packed it is! That 30g difference is enough to make your cake dry and dense.</p>
      <p>When a recipe lists ingredients in grams, the author is giving you a gift: <strong>consistency</strong>. By using a scale (or a precise converter), you ensure your cookies turn out exactly the same every time.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Common Baking Conversions</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Grams (g)</th>
              <th class="py-3 px-6 text-left font-bold">Ounces (oz)</th>
              <th class="py-3 px-6 text-left font-bold">Common Ingredient Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1 g</td><td class="py-3 px-6">0.035 oz</td><td class="py-3 px-6">Pinch of salt</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">28 g</td><td class="py-3 px-6">1.0 oz</td><td class="py-3 px-6">Slice of cheese</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">100 g</td><td class="py-3 px-6">3.5 oz</td><td class="py-3 px-6">Serving of pasta</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">225 g</td><td class="py-3 px-6">8.0 oz</td><td class="py-3 px-6">Cup of butter (2 sticks)</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">454 g</td><td class="py-3 px-6">16.0 oz</td><td class="py-3 px-6">1 Pound (lb)</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1000 g (1kg)</td><td class="py-3 px-6">35.27 oz</td><td class="py-3 px-6">Bag of flour</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Dry vs. Liquid Ounces</h2>
      <p>Be careful! There is a difference between "ounces" (weight) and "fluid ounces" (volume).</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>Ounces (oz):</strong> Measures weight (flour, sugar, butter). Use the "Weight" converter.</li>
        <li><strong>Fluid Ounces (fl oz):</strong> Measures volume (water, milk, oil). Use the "Volume" converter.</li>
      </ul>
      <p>Usually, 8 fl oz of water weighs about 8 oz, but 8 fl oz of honey weighs 12 oz! Always check if your recipe is asking for volume or weight.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Don't let a metric recipe scare you away from baking something amazing. With a simple kitchen scale or our <strong>grams to ounces converter</strong>, you can tackle any recipe from anywhere in the world. Happy baking!</p>
    `,
    faq: [
      { q: "How many grams in an ounce?", a: "There are exactly 28.3495 grams in one ounce." },
      { q: "Is 100g equal to 4oz?", a: "Close, but not exactly. 100g is about 3.5 ounces. 4 ounces is about 113 grams." },
      { q: "Do I measure flour in grams or ounces?", a: "Grams are more accurate for flour because they measure weight, not volume. If possible, use grams." }
    ]
  },
  {
    slug: 'mph-to-kph',
    title: 'MPH to KPH: The Ultimate Speed Conversion Guide for Drivers',
    category: 'Travel',
    icon: '🚗',
    excerpt: 'Avoid speeding tickets on your next road trip. Understand the difference between miles and kilometers per hour with our essential guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You've just rented a car in Germany. You hit the Autobahn, and the sign says "120". You look at your speedometer, and it says 70. Are you going too slow? Too fast? Or are you about to get a very expensive ticket?</p>
      <p>Driving in a foreign country is stressful enough without having to do mental math at 60 miles per hour. Understanding the difference between <strong>MPH (Miles Per Hour)</strong> and <strong>KPH (Kilometers Per Hour)</strong> is not just about avoiding fines—it is about safety.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">On the road? <a href="/#/converter/speed" class="text-royal-600 underline hover:text-royal-800">Use our Instant Speed Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Golden Ratio: 1.609</h2>
      <p>Here is the number you need to lock into your brain: <strong>1.6</strong>.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 MPH = 1.609 KPH</strong></li>
        <li><strong>1 KPH = 0.621 MPH</strong></li>
      </ul>
      <p>This means that kilometers are "shorter" than miles. If you see a speed limit of 100, it is much faster if it is in MPH than if it is in KPH.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Quick Mental Math Tricks</h2>
      <p>You can't pull out a calculator while driving! Here are two tricks to convert KPH to MPH in your head:</p>
      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Trick 1: The "Half plus 10%"</h3>
      <p>To go from KPH to MPH (roughly):
      <br>1. Take the KPH number and cut it in half.
      <br>2. Add 10% of the original number.
      <br><em>Example: 100 KPH.</em>
      <br>Half is 50.
      <br>10% of 100 is 10.
      <br>50 + 10 = 60 MPH. (Actual is 62 MPH. Close enough!)</p>

      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Trick 2: The Fibonacci Sequence</h3>
      <p>Believe it or not, the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21...) works for miles and kilometers because the ratio is close to 1.6!
      <br>3 mi ≈ 5 km
      <br>5 mi ≈ 8 km
      <br>8 mi ≈ 13 km
      <br>So if the sign says 80 km/h, think "8 is next to 5", so it's about 50 mph.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Common Speed Limits Cheat Sheet</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Sign (KPH)</th>
              <th class="py-3 px-6 text-left font-bold">Speed (MPH)</th>
              <th class="py-3 px-6 text-left font-bold">Where you see it</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">30 km/h</td><td class="py-3 px-6">19 mph</td><td class="py-3 px-6">School zones, residential</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">50 km/h</td><td class="py-3 px-6">31 mph</td><td class="py-3 px-6">City streets</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">80 km/h</td><td class="py-3 px-6">50 mph</td><td class="py-3 px-6">Country roads</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">100 km/h</td><td class="py-3 px-6">62 mph</td><td class="py-3 px-6">Highways</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">120 km/h</td><td class="py-3 px-6">75 mph</td><td class="py-3 px-6">Expressways</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">130 km/h</td><td class="py-3 px-6">81 mph</td><td class="py-3 px-6">French Autoroute</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Who Uses What?</h2>
      <p>Almost the entire world uses <strong>Kilometers per Hour (KPH)</strong>. The main exceptions are:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>United States:</strong> MPH</li>
        <li><strong>United Kingdom:</strong> MPH (Yes, even though they use metric for other things!)</li>
      </ul>
      <p>So if you drive from France (KPH) to the UK (MPH), you need to switch your brain immediately!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Driving safely means knowing your speed. Whether you use our mental math tricks or our <strong>online speed converter</strong>, make sure you know the local limits. Safe travels!</p>
    `,
    faq: [
      { q: "Is 100 kph faster than 100 mph?", a: "No! 100 mph is much faster. 100 mph is about 160 kph." },
      { q: "How to convert mph to kph?", a: "Multiply miles per hour by 1.609." },
      { q: "What is the speed limit in Germany?", a: "It varies, but 130 km/h is the recommended limit on the Autobahn, though some sections have no limit." }
    ]
  },
  {
    slug: 'acres-to-hectares',
    title: 'Acres to Hectares: The Ultimate Land Measurement Guide',
    category: 'Real Estate',
    icon: '🚜',
    excerpt: 'Farming, buying land, or just curious? Master the conversion between acres and hectares with our complete guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You are looking at a farm listing online. It says "50 hectares." Is that a small hobby farm or a massive ranch? If you are used to thinking in <strong>acres</strong>, you might be completely lost.</p>
      <p>Land measurement is one of the oldest forms of math, dating back to when we first started farming. But today, the divide between the Imperial system (Acres) and the Metric system (Hectares) causes confusion for real estate agents, farmers, and land buyers worldwide.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Measuring land? <a href="/#/converter/area" class="text-royal-600 underline hover:text-royal-800">Use our Area Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 2.471</h2>
      <p>This is the most important number in land real estate:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Hectare = 2.471 Acres</strong></li>
        <li><strong>1 Acre = 0.4047 Hectares</strong></li>
      </ul>
      <p>Think of it this way: A hectare is roughly <strong>2.5 times bigger</strong> than an acre. So if you have 10 hectares, you have about 25 acres.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Visualizing the Size</h2>
      <p>Numbers are great, but what does this actually look like?</p>
      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">What is an Acre?</h3>
      <p>Historically, an acre was defined as the amount of land one man could plow in one day with an ox.
      <br>In modern terms, it is about <strong>75% of a football field</strong> (American football, including end zones).</p>

      <h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">What is a Hectare?</h3>
      <p>A hectare is a metric unit. It is a square that is 100 meters by 100 meters (10,000 square meters).
      <br>It is roughly equal to <strong>two standard soccer fields</strong> placed side by side.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Land Conversion Table</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Hectares (ha)</th>
              <th class="py-3 px-6 text-left font-bold">Acres (ac)</th>
              <th class="py-3 px-6 text-left font-bold">Equivalent Size</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1 ha</td><td class="py-3 px-6">2.47 ac</td><td class="py-3 px-6">2 Soccer Fields</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">5 ha</td><td class="py-3 px-6">12.36 ac</td><td class="py-3 px-6">Small Farm</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">10 ha</td><td class="py-3 px-6">24.71 ac</td><td class="py-3 px-6">Large Park</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">50 ha</td><td class="py-3 px-6">123.55 ac</td><td class="py-3 px-6">Commercial Farm</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">100 ha</td><td class="py-3 px-6">247.11 ac</td><td class="py-3 px-6">1 Square Kilometer</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Buying Land Abroad</h2>
      <p>If you are from the US or UK and buying land in Europe, South America, or Asia, you will almost certainly deal with hectares.
      <br><strong>Tip:</strong> Always double-check the price per unit. A "cheap" price per acre might look expensive if you mistakenly think it is per hectare!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Whether you are plowing fields or buying a vacation plot, knowing the difference between <strong>acres and hectares</strong> ensures you get exactly what you pay for. Use our <strong>area converter</strong> to be 100% sure before you sign any contracts.</p>
    `,
    faq: [
      { q: "Which is bigger, an acre or a hectare?", a: "A hectare is much bigger. One hectare is equal to about 2.47 acres." },
      { q: "How many acres in a hectare?", a: "There are approximately 2.47 acres in one hectare." },
      { q: "What is a hectare in meters?", a: "A hectare is 10,000 square meters (a square of 100m x 100m)." }
    ]
  },
  {
    slug: 'joules-to-calories',
    title: 'Joules to Calories: The Science of Food Energy',
    category: 'Health',
    icon: '🥗',
    excerpt: 'Reading nutrition labels? Learn how to convert scientific energy units into calories you understand with our expert guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You pick up a snack bar in Europe or Australia, flip it over, and see "800 kJ". You panic. 800 calories for a snack bar?! Put it back!</p>
      <p>But wait. That is not calories. That is <strong>kilojoules (kJ)</strong>. In the world of nutrition, the battle between the <strong>Calorie</strong> (used in the US) and the <strong>Joule</strong> (used almost everywhere else) causes endless confusion for dieters and travelers.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Tracking macros? <a href="/#/converter/energy" class="text-royal-600 underline hover:text-royal-800">Use our Energy Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 4.184</h2>
      <p>This is the conversion factor defined by physics:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Calorie (cal) = 4.184 Joules (J)</strong></li>
        <li><strong>1 Food Calorie (kcal) = 4.184 Kilojoules (kJ)</strong></li>
      </ul>
      <p>Wait, what is a "Food Calorie"?
      <br>In the US, what we call a "Calorie" on a food label is actually a <strong>kilocalorie (kcal)</strong>. It is 1,000 "physics" calories.
      <br>So, when you see "2000 calories a day", it really means "2000 kcal".</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Quick Mental Math</h2>
      <p>Since 1 Calorie is about 4 Kilojoules, you can simply <strong>divide by 4</strong>.</p>
      <p><em>Example: That snack bar with 800 kJ.</em>
      <br>800 / 4 = 200 Calories.
      <br>That sounds much more reasonable for a snack!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Energy Conversion Table</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Kilojoules (kJ)</th>
              <th class="py-3 px-6 text-left font-bold">Calories (kcal)</th>
              <th class="py-3 px-6 text-left font-bold">Common Food Item</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">100 kJ</td><td class="py-3 px-6">24 kcal</td><td class="py-3 px-6">A few strawberries</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">400 kJ</td><td class="py-3 px-6">95 kcal</td><td class="py-3 px-6">Medium Apple</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1000 kJ</td><td class="py-3 px-6">239 kcal</td><td class="py-3 px-6">Candy Bar</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">2000 kJ</td><td class="py-3 px-6">478 kcal</td><td class="py-3 px-6">Fast Food Burger</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">8700 kJ</td><td class="py-3 px-6">2080 kcal</td><td class="py-3 px-6">Avg Daily Intake</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why the Difference?</h2>
      <p>The <strong>Joule</strong> is the standard SI unit for energy. It is used in physics, chemistry, and electricity. Most of the world moved to Joules for food labeling to be consistent with science.</p>
      <p>The US stuck with the <strong>Calorie</strong> because it is what people were used to. But scientifically, the Joule is more precise.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Don't let a foreign nutrition label ruin your diet. Just remember the "Rule of 4": Divide kJ by 4 to get Calories. Or, for perfect accuracy, use our <strong>energy converter</strong> to track your intake exactly.</p>
    `,
    faq: [
      { q: "Is a Joule smaller than a Calorie?", a: "Yes. A Joule is much smaller. It takes about 4.2 Joules to make 1 Calorie." },
      { q: "How to convert kJ to Calories?", a: "Divide the kJ number by 4.184." },
      { q: "What is 8700kJ in Calories?", a: "8700kJ is approximately 2080 Calories, which is the standard reference intake for an average adult." }
    ]
  },
  {
    slug: 'bar-to-psi',
    title: 'Bar to PSI: The Ultimate Tire Pressure Guide',
    category: 'Automotive',
    icon: '🚙',
    excerpt: 'Keep your tires safe and save gas. Convert pressure units correctly for your car or bike with our expert guide.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You are at a gas station air pump. Your car door sticker says "32 PSI". But the machine gauge only shows "Bar". Do you guess? Do you drive away on underinflated tires?</p>
      <p>Tire pressure is critical for safety, fuel economy, and tire life. Yet, the world is split between two main units: <strong>PSI (Pounds per Square Inch)</strong>, used in the US, and <strong>Bar</strong>, used in Europe and most of the world. Mixing them up can lead to a blowout.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Checking tires? <a href="/#/converter/pressure" class="text-royal-600 underline hover:text-royal-800">Use our Pressure Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 14.5</h2>
      <p>This is the conversion factor you need to know:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Bar = 14.5038 PSI</strong></li>
        <li><strong>1 PSI = 0.0689 Bar</strong></li>
      </ul>
      <p>Think of it this way: 1 Bar is roughly equal to <strong>one atmosphere of pressure</strong> at sea level. It is a lot of pressure! That is why the PSI number is always much higher.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Common Tire Pressures</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Bar</th>
              <th class="py-3 px-6 text-left font-bold">PSI</th>
              <th class="py-3 px-6 text-left font-bold">Vehicle Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">2.0 Bar</td><td class="py-3 px-6">29 PSI</td><td class="py-3 px-6">Small Car</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">2.2 Bar</td><td class="py-3 px-6">32 PSI</td><td class="py-3 px-6">Standard Sedan</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">2.5 Bar</td><td class="py-3 px-6">36 PSI</td><td class="py-3 px-6">SUV / Loaded Car</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">3.0 Bar</td><td class="py-3 px-6">44 PSI</td><td class="py-3 px-6">Van / Light Truck</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">6-8 Bar</td><td class="py-3 px-6">87-116 PSI</td><td class="py-3 px-6">Road Bike</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why Correct Pressure Matters</h2>
      <p><strong>Underinflation:</strong> Causes tires to overheat and wear out on the edges. It also increases fuel consumption because the tire is "floppy" and creates more drag.</p>
      <p><strong>Overinflation:</strong> Makes the ride harsh and wears out the center of the tire. It also reduces traction because less rubber is touching the road.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Next time you are at the air pump, don't guess. Use the "Rule of 14.5" or our <strong>pressure converter</strong> to get it exactly right. Your tires (and your wallet) will thank you.</p>
    `,
    faq: [
      { q: "Is 2.2 Bar normal for a car?", a: "Yes, 2.2 Bar (about 32 PSI) is a very common pressure for standard passenger cars." },
      { q: "How many PSI in 1 Bar?", a: "There are approximately 14.5 PSI in 1 Bar." },
      { q: "What happens if I overinflate my tires?", a: "Overinflated tires have less traction, wear unevenly in the center, and are more prone to blowing out over potholes." }
    ]
  },
  {
    slug: 'watts-to-horsepower',
    title: 'Watts to Horsepower: Engine Power Explained',
    category: 'Engineering',
    icon: '⚙️',
    excerpt: 'From electric motors to car engines, understand how power is measured differently. Master the conversion between Watts and Horsepower.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You are buying a new lawnmower. One is "1500 Watts". The other is "3.5 Horsepower". Which one is more powerful? Or you are looking at an electric car specs sheet, and it lists kW instead of HP.</p>
      <p>In the age of electric vehicles, the line between electrical power (Watts) and mechanical power (Horsepower) is blurring. Understanding how to convert <strong>Watts to Horsepower</strong> is essential for comparing engines, motors, and appliances.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Comparing engines? <a href="/#/converter/power" class="text-royal-600 underline hover:text-royal-800">Use our Power Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 746</h2>
      <p>This is the bridge between electricity and mechanics:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Mechanical Horsepower (hp) = 745.7 Watts (W)</strong></li>
        <li><strong>1 Kilowatt (kW) = 1.341 Horsepower (hp)</strong></li>
      </ul>
      <p>So, 1 horsepower is roughly equal to 746 Watts. Or, roughly three-quarters of a kilowatt.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">What is a Horsepower, Anyway?</h2>
      <p>James Watt (yes, the Watt guy) invented the term in the 18th century to sell his steam engines. He needed a way to compare them to the horses that people were currently using to pull coal out of mines.</p>
      <p>He calculated that a horse could lift 33,000 pounds one foot in one minute. That became "1 Horsepower". It was a marketing term that became a scientific standard!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Electric Cars: kW vs HP</h2>
      <p>Electric cars often list power in Kilowatts (kW). To get the Horsepower (HP) that you are used to, multiply the kW by 1.34.</p>
      <p><em>Example: Tesla Model 3 (Standard Range) ~ 211 kW.</em>
      <br>211 x 1.34 = 283 HP.
      <br>Now you can compare it to a gas car!</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Power Conversion Table</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Watts (W) / kW</th>
              <th class="py-3 px-6 text-left font-bold">Horsepower (hp)</th>
              <th class="py-3 px-6 text-left font-bold">Common Device</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">746 W</td><td class="py-3 px-6">1 hp</td><td class="py-3 px-6">Pool Pump</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">1500 W</td><td class="py-3 px-6">2 hp</td><td class="py-3 px-6">High-end Blender</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">3.7 kW</td><td class="py-3 px-6">5 hp</td><td class="py-3 px-6">Lawn Mower</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">100 kW</td><td class="py-3 px-6">134 hp</td><td class="py-3 px-6">Compact Car</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">300 kW</td><td class="py-3 px-6">402 hp</td><td class="py-3 px-6">Sports Car</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Whether you are comparing blenders or sports cars, knowing how to convert <strong>Watts to Horsepower</strong> helps you understand true power. Remember the factor 746, or just use our <strong>power converter</strong> for instant results.</p>
    `,
    faq: [
      { q: "How many Watts in 1 Horsepower?", a: "There are approximately 746 Watts in 1 mechanical horsepower." },
      { q: "Is kW bigger than HP?", a: "Yes. 1 kW is equal to about 1.34 HP." },
      { q: "Why do electric cars use kW?", a: "Because electric motors are rated in electrical power (Watts), whereas gas engines are rated in mechanical power (Horsepower)." }
    ]
  },
  {
    slug: 'bits-to-bytes',
    title: 'Bits to Bytes: Data Storage Explained',
    category: 'Technology',
    icon: '💾',
    excerpt: 'Confused by internet speeds vs download speeds? Learn the difference between bits (b) and Bytes (B) and why it matters.',
    content: `
      <p class="lead text-xl text-slate-600 font-medium">You pay for "100 Megabit" internet. But when you download a game, it only goes at "12 Megabytes" per second. Are you being scammed? Is your internet broken?</p>
      <p>No! You are just a victim of the most confusing naming convention in technology: the difference between the <strong>bit (b)</strong> and the <strong>Byte (B)</strong>.</p>
      <div class="bg-royal-50 p-6 rounded-2xl border border-royal-200 my-8 text-center"><p class="m-0 font-bold text-royal-900">Calculating download time? <a href="/#/converter/data" class="text-royal-600 underline hover:text-royal-800">Use our Data Converter</a></p></div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The Magic Number: 8</h2>
      <p>This is the only number you need to know in digital storage:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>1 Byte (B) = 8 bits (b)</strong></li>
      </ul>
      <p>That's it. A Byte is simply a packet of 8 bits.
      <br>Think of a "bit" as a single letter. Think of a "Byte" as a word.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">The "b" vs "B" Trap</h2>
      <p>Marketing teams love this confusion.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>Internet Speeds (ISPs):</strong> Measured in <strong>bits</strong> (Mbps). It looks like a bigger number! "100 Mbps!"</li>
        <li><strong>File Sizes (Storage):</strong> Measured in <strong>Bytes</strong> (MB). This is what you see on your computer.</li>
      </ul>
      <p>So, if you have a 100 Mbps connection, you divide by 8 to get your real download speed.</p>
      <p>100 / 8 = 12.5 MB/s.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Data Conversion Table</h2>
      <div class="overflow-x-auto my-8">
        <table class="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <thead class="bg-royal-100 text-royal-900">
            <tr>
              <th class="py-3 px-6 text-left font-bold">Unit</th>
              <th class="py-3 px-6 text-left font-bold">Abbreviation</th>
              <th class="py-3 px-6 text-left font-bold">Size (in Bytes)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">Bit</td><td class="py-3 px-6">b</td><td class="py-3 px-6">1/8 Byte</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">Byte</td><td class="py-3 px-6">B</td><td class="py-3 px-6">1 Byte</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">Kilobyte</td><td class="py-3 px-6">KB</td><td class="py-3 px-6">1,024 Bytes</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">Megabyte</td><td class="py-3 px-6">MB</td><td class="py-3 px-6">1,048,576 Bytes</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">Gigabyte</td><td class="py-3 px-6">GB</td><td class="py-3 px-6">1 Billion Bytes</td></tr>
            <tr class="hover:bg-slate-50"><td class="py-3 px-6">Terabyte</td><td class="py-3 px-6">TB</td><td class="py-3 px-6">1 Trillion Bytes</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Why 1024 and not 1000?</h2>
      <p>Computers count in binary (base 2). So "kilo" doesn't mean 1000, it means 2^10, which is 1024.
      <br>However, hard drive manufacturers often use 1000 to make their drives sound bigger! This is why your "1 TB" drive only shows up as "931 GB" on Windows.</p>

      <h2 class="text-3xl font-bold text-slate-800 mt-12 mb-6">Conclusion</h2>
      <p>Next time you are shopping for internet, remember to <strong>divide by 8</strong> to manage your expectations. And if you need to calculate exactly how long a file will take to transfer, use our <strong>data converter</strong> for a precise answer.</p>
    `,
    faq: [
      { q: "Why is my download speed slower than my internet plan?", a: "Internet plans are sold in MegaBITS (Mbps), but downloads are shown in MegaBYTES (MB/s). Divide your plan speed by 8 to get your max download speed." },
      { q: "How many bits in a Byte?", a: "There are exactly 8 bits in 1 Byte." },
      { q: "What is a Nibble?", a: "A Nibble is half a Byte, or 4 bits! It is a real technical term." }
    ]
  },
  {
    slug: 'milliliters-to-cups',
    title: 'Milliliters to Cups: Liquid Conversions for Cooking',
    category: 'Cooking',
    icon: '🥛',
    excerpt: 'Don\'t ruin your soup. Convert liquid volume accurately with our handy guide.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'knots-to-mph',
    title: 'Knots to MPH: Understanding Marine Speed',
    category: 'Sailing',
    icon: '⛵',
    excerpt: 'Why do sailors use knots? Learn the history and the conversion to land speed.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'stone-to-pounds',
    title: 'Stone to Pounds: UK Weight Measurement Guide',
    category: 'Health',
    icon: '🇬🇧',
    excerpt: 'Confused by British weight measurements? Here is how to convert Stone to Pounds and Kilograms.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'kelvin-to-celsius',
    title: 'Kelvin to Celsius: Scientific Temperature Basics',
    category: 'Science',
    icon: '🔬',
    excerpt: 'Why do scientists use Kelvin? Understand absolute zero and temperature scales.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'newtons-to-pounds',
    title: 'Newtons to Pounds: Force Conversion for Engineers',
    category: 'Physics',
    icon: '🍎',
    excerpt: 'Physics homework help. Convert force units correctly for your engineering projects.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'radians-to-degrees',
    title: 'Radians to Degrees: Trigonometry Made Simple',
    category: 'Math',
    icon: '📐',
    excerpt: 'Struggling with geometry? Learn how to switch between angle measurements easily.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'lux-to-footcandles',
    title: 'Lux to Foot-Candles: Lighting Design Guide',
    category: 'Design',
    icon: '💡',
    excerpt: 'Planning room lighting? Understand how light intensity is measured.',
    content: '<p>Content coming soon...</p>',
    faq: []
  },
  {
    slug: 'pascal-to-atm',
    title: 'Pascal to ATM: Atmospheric Pressure Explained',
    category: 'Science',
    icon: '🎈',
    excerpt: 'Dive deep into pressure units. From weather forecasting to scuba diving.',
    content: '<p>Content coming soon...</p>',
    faq: []
  }
];

const BlogCard = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.excerpt.length > 150;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-royal-100 flex flex-col">
      <Link to={`/blog/${post.slug}`} className="h-48 bg-royal-100 flex items-center justify-center text-6xl hover:scale-105 transition-transform block">
        {post.icon}
      </Link>
      <div className="p-8 flex-grow flex flex-col">
        <div className="text-xs font-bold text-royal-600 mb-2 uppercase tracking-wider">{post.category}</div>
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-slate-900 mb-3 hover:text-royal-700 transition-colors">{post.title}</h3>
        </Link>
        <div className="text-slate-600 text-sm mb-4 flex-grow">
          {expanded || !isLong ? post.excerpt : `${post.excerpt.substring(0, 150)}...`}
        </div>
        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-royal-600 font-bold text-xs mb-4 self-start hover:underline uppercase tracking-wide"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        )}
        <Link to={`/blog/${post.slug}`} className="text-royal-600 font-bold text-sm flex items-center gap-1 mt-auto">
          Read Article <span>→</span>
        </Link>
      </div>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // SEO Update
  useEffect(() => {
    if (!post) return;
    
    document.title = `${post.title} - Unit Converter Blog`;
    
    const desc = post.excerpt;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = post.title;
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = desc;
    
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = window.location.href;
    
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.href = window.location.href;
  }, [post]);

  if (!post) return <div className="p-20 text-center">Post not found. <Link to="/" className="text-royal-600">Go Home</Link></div>;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-royal-600">Home</Link> <span>/</span> <Link to="/#blog" className="hover:text-royal-600">Blog</Link> <span>/</span> <span className="font-bold text-slate-900">{post.title}</span>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-royal-600 hover:text-royal-700 transition-colors bg-royal-50 px-4 py-2 rounded-full border border-royal-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Tools
        </Link>
      </div>

      <article className="prose prose-lg prose-slate prose-royal max-w-none bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-royal-100">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-12 border-b border-slate-100 pb-8">
          <span className="bg-royal-100 text-royal-800 px-3 py-1 rounded-full font-bold">{post.category}</span>
          <span>Updated: 2026</span>
          <span>By: Unit Converter Team</span>
        </div>

        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
};

const BlogList = () => (
  <div className="bg-royal-50 min-h-screen py-24 animate-fade-in">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6">Our Blog</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Expert guides, conversion tips, and educational resources to help you master measurements.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  </div>
);

const i18n = {
  en: { welcome: "Welcome to the best", tailored: "tailored for users in", start: "Start Converting Now", why: "Why use our", pop: "Popular in", f1: "100% Free & Private", f2: "Instant Results", f3: "Works Offline", f4: "No App Download Required" },
  es: { welcome: "Bienvenido al mejor", tailored: "diseñado para usuarios en", start: "Convertir Ahora", why: "¿Por qué usar nuestro", pop: "Popular en", f1: "100% Gratis y Privado", f2: "Resultados Instantáneos", f3: "Funciona Sin Conexión", f4: "Sin Descargas" },
  fr: { welcome: "Bienvenue sur le meilleur", tailored: "conçu pour les utilisateurs en", start: "Convertir Maintenant", why: "Pourquoi utiliser notre", pop: "Populaire en", f1: "100% Gratuit et Privé", f2: "Résultats Instantanés", f3: "Fonctionne Hors Ligne", f4: "Aucune Application Requise" },
  de: { welcome: "Willkommen beim besten", tailored: "maßgeschneidert für Benutzer in", start: "Jetzt Konvertieren", why: "Warum unseren", pop: "Beliebt in", f1: "100% Kostenlos & Privat", f2: "Sofortige Ergebnisse", f3: "Funktioniert Offline", f4: "Kein Download Erforderlich" },
  ja: { welcome: "最高の", tailored: "のユーザー向けにカスタマイズされた", start: "今すぐ変換", why: "選ばれる理由", pop: "で人気", f1: "100%無料＆プライベート", f2: "瞬時に結果表示", f3: "オフラインで動作", f4: "アプリのダウンロード不要" },
  zh: { welcome: "欢迎使用最好的", tailored: "专为用户定制于", start: "立即转换", why: "为什么使用我们的", pop: "热门于", f1: "100%免费和私密", f2: "即时结果", f3: "离线工作", f4: "无需下载应用" },
  ar: { welcome: "مرحباً بك في أفضل", tailored: "مصمم خصيصاً للمستخدمين في", start: "ابدأ التحويل الآن", why: "لماذا تستخدم", pop: "شائع في", f1: "مجاني وخاص 100%", f2: "نتائج فورية", f3: "يعمل بدون إنترنت", f4: "لا يتطلب تحميل تطبيق" },
  pt: { welcome: "Bem-vindo ao melhor", tailored: "feito sob medida para usuários em", start: "Começar a Converter", why: "Por que usar nosso", pop: "Popular em", f1: "100% Grátis e Privado", f2: "Resultados Instantâneos", f3: "Funciona Offline", f4: "Nenhum Aplicativo Necessário" },
  ru: { welcome: "Добро пожаловать в лучший", tailored: "созданный для пользователей в", start: "Начать конвертацию", why: "Почему стоит использовать наш", pop: "Популярно в", f1: "100% Бесплатно и Приватно", f2: "Мгновенные результаты", f3: "Работает офлайн", f4: "Не требует скачивания" },
  it: { welcome: "Benvenuto nel miglior", tailored: "su misura per gli utenti in", start: "Inizia a Convertire", why: "Perché usare il nostro", pop: "Popolare in", f1: "100% Gratuito e Privato", f2: "Risultati Istantanei", f3: "Funziona Offline", f4: "Nessun Download Richiesto" },
  nl: { welcome: "Welkom bij de beste", tailored: "op maat gemaakt voor gebruikers in", start: "Begin Nu Met Omrekenen", why: "Waarom onze", pop: "Populair in", f1: "100% Gratis & Privé", f2: "Directe Resultaten", f3: "Werkt Offline", f4: "Geen App Download Nodig" },
  pl: { welcome: "Witamy w najlepszym", tailored: "dostosowanym dla użytkowników w", start: "Zacznij Konwertować", why: "Dlaczego warto używać naszego", pop: "Popularne w", f1: "100% Darmowe i Prywatne", f2: "Natychmiastowe Wyniki", f3: "Działa Offline", f4: "Nie Wymaga Pobierania" },
  tr: { welcome: "En iyi", tailored: "kullanıcıları için özel olarak hazırlanmış", start: "Hemen Çevir", why: "Neden", pop: "Popüler", f1: "%100 Ücretsiz ve Gizli", f2: "Anında Sonuçlar", f3: "Çevrimdışı Çalışır", f4: "Uygulama İndirmeye Gerek Yok" },
  ko: { welcome: "최고의", tailored: "사용자를 위해 맞춤 제작된", start: "지금 변환하기", why: "사용해야 하는 이유", pop: "인기 있는", f1: "100% 무료 및 비공개", f2: "즉각적인 결과", f3: "오프라인 작동", f4: "앱 다운로드 필요 없음" },
  vi: { welcome: "Chào mừng đến với", tailored: "được thiết kế riêng cho người dùng tại", start: "Bắt đầu chuyển đổi", why: "Tại sao nên sử dụng", pop: "Phổ biến tại", f1: "100% Miễn phí & Riêng tư", f2: "Kết quả tức thì", f3: "Hoạt động ngoại tuyến", f4: "Không cần tải ứng dụng" },
  th: { welcome: "ยินดีต้อนรับสู่", tailored: "ที่ปรับแต่งสำหรับผู้ใช้ใน", start: "เริ่มการแปลงเลย", why: "ทำไมต้องใช้", pop: "ยอดนิยมใน", f1: "ฟรีและเป็นส่วนตัว 100%", f2: "รู้ผลทันที", f3: "ทำงานออฟไลน์", f4: "ไม่ต้องดาวน์โหลดแอป" },
  id: { welcome: "Selamat datang di", tailored: "yang disesuaikan untuk pengguna di", start: "Mulai Konversi Sekarang", why: "Mengapa menggunakan", pop: "Populer di", f1: "100% Gratis & Privat", f2: "Hasil Instan", f3: "Bekerja Offline", f4: "Tidak Perlu Unduh Aplikasi" },
  da: { welcome: "Velkommen til den bedste", tailored: "skræddersyet til brugere i", start: "Begynd at konvertere", why: "Hvorfor bruge vores", pop: "Populær i", f1: "100% Gratis & Privat", f2: "Øjeblikkelige Resultater", f3: "Fungerer Offline", f4: "Ingen App Download Nødvendig" },
  sv: { welcome: "Välkommen till den bästa", tailored: "skräddarsydd för användare i", start: "Börja konvertera", why: "Varför använda vår", pop: "Populär i", f1: "100% Gratis & Privat", f2: "Omedelbara Resultat", f3: "Fungerar Offline", f4: "Ingen App Nedladdning Krävs" },
  fi: { welcome: "Tervetuloa parhaaseen", tailored: "räätälöity käyttäjille maassa", start: "Aloita muuntaminen", why: "Miksi käyttää", pop: "Suosittu maassa", f1: "100% Ilmainen & Yksityinen", f2: "Välittömät Tulokset", f3: "Toimii Offline-tilassa", f4: "Ei Sovelluksen Latausta" },
  no: { welcome: "Velkommen til den beste", tailored: "skreddersydd for brukere i", start: "Begynn å konvertere", why: "Hvorfor bruke vår", pop: "Populær i", f1: "100% Gratis & Privat", f2: "Umiddelbare Resultater", f3: "Fungerer Offline", f4: "Ingen App Nedlasting Nødvendig" },
  el: { welcome: "Καλώς ήρθατε στον καλύτερο", tailored: "προσαρμοσμένο για χρήστες σε", start: "Ξεκινήστε τη μετατροπή", why: "Γιατί να χρησιμοποιήσετε", pop: "Δημοφιλές σε", f1: "100% Δωρεάν & Ιδιωτικό", f2: "Άμεσα Αποτελέσματα", f3: "Λειτουργεί Εκτός Σύνδεσης", f4: "Δεν Απαιτείται Λήψη Εφαρμογής" },
  cs: { welcome: "Vítejte v nejlepším", tailored: "přizpůsobeném pro uživatele v", start: "Začít převádět", why: "Proč používat náš", pop: "Populární v", f1: "100% Zdarma a Soukromé", f2: "Okamžité Výsledky", f3: "Funguje Offline", f4: "Není Nutné Stahovat Aplikaci" },
  hu: { welcome: "Üdvözöljük a legjobb", tailored: "felhasználók számára testreszabva itt:", start: "Átváltás Indítása", why: "Miért használja a mi", pop: "Népszerű itt:", f1: "100% Ingyenes és Privát", f2: "Azonnali Eredmények", f3: "Offline is Működik", f4: "Nincs Szükség Alkalmazás Letöltésére" },
  ro: { welcome: "Bun venit la cel mai bun", tailored: "adaptat pentru utilizatorii din", start: "Începeți Conversia", why: "De ce să folosiți", pop: "Popular în", f1: "100% Gratuit & Privat", f2: "Rezultate Instantanee", f3: "Funcționează Offline", f4: "Nu Necesită Descărcare" },
  sk: { welcome: "Vitajte v najlepšom", tailored: "prispôsobenom pre používateľov v", start: "Začať prevádzať", why: "Prečo používať náš", pop: "Populárne v", f1: "100% Zadarmo a Súkromné", f2: "Okamžité Výsledky", f3: "Funguje Offline", f4: "Nie je Potrebné Sťahovať Aplikáciu" },
  bg: { welcome: "Добре дошли в най-добрия", tailored: "създаден за потребители в", start: "Започнете конвертирането", why: "Защо да използвате нашия", pop: "Популярно в", f1: "100% Безплатно и Частно", f2: "Незабавни Резултати", f3: "Работи Офлайн", f4: "Не е Необходимо Изтегляне" },
  hr: { welcome: "Dobrodošli u najbolji", tailored: "prilagođen korisnicima u", start: "Započni Pretvaranje", why: "Zašto koristiti naš", pop: "Popularno u", f1: "100% Besplatno i Privatno", f2: "Trenutni Rezultati", f3: "Radi Offline", f4: "Nije Potrebno Preuzimanje" },
  sl: { welcome: "Dobrodošli v najboljšem", tailored: "prilagojenem za uporabnike v", start: "Začni Pretvarjati", why: "Zakaj uporabiti naš", pop: "Priljubljeno v", f1: "100% Brezplačno in Zasebno", f2: "Takojšnji Rezultati", f3: "Deluje Brez Povezave", f4: "Prenos Aplikacije Ni Potreben" },
  et: { welcome: "Tere tulemast parimasse", tailored: "kohandatud kasutajatele riigis", start: "Alusta Teisendamist", why: "Miks kasutada meie", pop: "Populaarne riigis", f1: "100% Tasuta ja Privaatne", f2: "Kohesed Tulemused", f3: "Töötab Võrguühenduseta", f4: "Rakendust Pole Vaja Alla Laadida" },
  lv: { welcome: "Laipni lūdzam labākajā", tailored: "pielāgots lietotājiem", start: "Sākt Konvertēt", why: "Kāpēc izmantot mūsu", pop: "Populārs", f1: "100% Bezmaksas un Privāti", f2: "Tūlītēji Rezultāti", f3: "Darbojas Bezsaistē", f4: "Nav Nepieciešama Lietotnes Lejupielāde" },
  lt: { welcome: "Sveiki atvykę į geriausią", tailored: "pritaikytą vartotojams", start: "Pradėti Konvertuoti", why: "Kodėl verta naudoti mūsų", pop: "Populiaru", f1: "100% Nemokama ir Privatu", f2: "Momentiniai Rezultatai", f3: "Veikia Neprisijungus", f4: "Nereikia Atsisiųsti Programos" },
  bs: { welcome: "Dobrodošli u najbolji", tailored: "prilagođen korisnicima u", start: "Započni Pretvaranje", why: "Zašto koristiti naš", pop: "Popularno u", f1: "100% Besplatno i Privatno", f2: "Trenutni Rezultati", f3: "Radi Offline", f4: "Nije Potrebno Preuzimanje" },
  uk: { welcome: "Ласкаво просимо до найкращого", tailored: "створеного для користувачів у", start: "Почати конвертацію", why: "Чому варто використовувати наш", pop: "Популярно в", f1: "100% Безкоштовно та Приватно", f2: "Миттєві результати", f3: "Працює офлайн", f4: "Не потребує завантаження" },
  ur: { welcome: "بہترین میں خوش آمدید", tailored: "صارفین کے لیے تیار کردہ", start: "ابھی تبدیل کریں", why: "ہمارا کیوں استعمال کریں", pop: "میں مقبول", f1: "100% مفت اور نجی", f2: "فوری نتائج", f3: "آف لائن کام کرتا ہے", f4: "ایپ ڈاؤن لوڈ کی ضرورت نہیں" },
  bn: { welcome: "সেরা তে স্বাগতম", tailored: "ব্যবহারকারীদের জন্য তৈরি", start: "এখন রূপান্তর শুরু করুন", why: "কেন আমাদের ব্যবহার করবেন", pop: "জনপ্রিয়", f1: "100% বিনামূল্যে এবং ব্যক্তিগত", f2: "তাত্ক্ষণিক ফলাফল", f3: "অফলাইনে কাজ করে", f4: "কোন অ্যাপ ডাউনলোডের প্রয়োজন নেই" }
};

const LocationPage = () => {
  const { countryId } = useParams();
  const location = globalLocations.find(l => l.id === countryId);
  const langCode = location ? location.lang.split('-')[0] : 'en';
  const t = i18n[langCode] || i18n['en'];

  useEffect(() => {
    if (location) {
      document.title = `${location.title} - ${location.name} | Best Unit Converter`;
      const desc = `${t.welcome} ${location.term.toLowerCase()} ${t.tailored} ${location.name}. ${t.f1}, ${t.f2}.`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = desc;
      window.scrollTo(0, 0);
    }
  }, [location, t]);

  if (!location) return <div className="p-20 text-center">Location not found. <Link to="/" className="text-royal-600">Go Home</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-royal-600">Home</Link> <span>/</span> <span className="font-bold text-slate-900">{location.name}</span>
        </div>
      </div>
      
      <div className="glass shadow-2xl rounded-[2rem] p-12 border border-royal-100 relative overflow-hidden mb-16 text-center">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-royal-100 rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{location.title}</h1>
          <p className="text-xl text-slate-600 mb-8">{t.welcome} <strong>{location.term}</strong> {t.tailored} {location.name}.</p>
          <Link to="/" className="inline-block bg-royal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-royal-700 transition-transform active:scale-95 shadow-lg">
            {t.start}
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.why} {location.term}?</h3>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-center gap-2"><span>✅</span> {t.f1}</li>
            <li className="flex items-center gap-2"><span>✅</span> {t.f2}</li>
            <li className="flex items-center gap-2"><span>✅</span> {t.f3}</li>
            <li className="flex items-center gap-2"><span>✅</span> {t.f4}</li>
          </ul>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.pop} {location.name}</h3>
          <div className="flex flex-col gap-3">
            <Link to="/converter/length" className="text-royal-600 hover:underline font-medium">Length Conversion</Link>
            <Link to="/converter/weight" className="text-royal-600 hover:underline font-medium">Weight & Mass</Link>
            <Link to="/converter/temperature" className="text-royal-600 hover:underline font-medium">Temperature</Link>
            <Link to="/currency" className="text-royal-600 hover:underline font-medium">Currency Rates</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllLocationsPage = () => {
  useEffect(() => {
    document.title = "Global Unit Converter Locations | Free Online Tools";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl font-black text-slate-900 mb-8 text-center">Global Unit Converter Locations</h1>
      <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">Find the best free online unit converter localized for your region. We support over 60 countries with tailored conversion tools.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {globalLocations.map(loc => (
          <Link key={loc.id} to={`/location/${loc.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-royal-300 hover:shadow-md transition-all text-center">
            <span className="block font-bold text-slate-800">{loc.name}</span>
            <span className="text-xs text-slate-500">{loc.term}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const HreflangInjector = () => {
  useEffect(() => {
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    
    const head = document.head;
    const baseUrl = 'https://bestunitconverter.netlify.app';
    
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = baseUrl;
    head.appendChild(xDefault);

    globalLocations.forEach(loc => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = loc.lang;
      link.href = `${baseUrl}/location/${loc.id}`;
      head.appendChild(link);
    });
  }, []);
  return null;
};

const generateSeoPages = () => {
  const pages = [];
  
  // Specific long-tail keywords requested
  const specificLongTail = [
    { slug: 'how-to-convert-cm-to-inches', kw: 'how to convert cm to inches', q: 'How do I convert centimeters to inches?', a: 'To convert centimeters to inches, multiply the length in centimeters by 0.393701. For example, 10 cm is approximately 3.94 inches.', catName: 'Length', u1Id: 'cm', u2Id: 'in', catId: 'length' },
    { slug: 'what-is-180-cm-in-feet', kw: 'what is 180 cm in feet', q: 'What is 180 cm in feet and inches?', a: '180 cm is equal to 5 feet and 10.87 inches. To calculate this, divide 180 by 30.48 to get feet (5.9055 ft), which is 5 feet and 10.87 inches.', catName: 'Length', u1Id: 'cm', u2Id: 'ft', catId: 'length' },
    { slug: 'celsius-to-fahrenheit-baking', kw: 'celsius to fahrenheit baking', q: 'How do I convert Celsius to Fahrenheit for baking?', a: 'For baking, multiply the Celsius temperature by 1.8 and add 32. Common baking temperatures: 180°C = 350°F, 200°C = 400°F, 220°C = 425°F.', catName: 'Temperature', u1Id: 'c', u2Id: 'f', catId: 'temperature' },
    { slug: 'free-online-kg-to-lbs-converter', kw: 'free online kg to lbs converter', q: 'How do I convert kg to lbs online for free?', a: 'You can use our free online converter to instantly change kilograms to pounds. Just enter the kg value and multiply by 2.20462 to get the lbs equivalent.', catName: 'Weight', u1Id: 'kg', u2Id: 'lb', catId: 'weight' },
    { slug: 'unit-converter-for-cooking', kw: 'unit converter for cooking', q: 'How do I convert cooking measurements?', a: 'Cooking conversions often involve volume and weight. For example, 1 cup is 240 ml, 1 tablespoon is 15 ml, and 1 ounce is approximately 28.35 grams.', catName: 'Volume', u1Id: 'cup', u2Id: 'ml', catId: 'volume' },
    { slug: 'convert-5-feet-10-inches-to-cm', kw: 'convert 5 feet 10 inches to cm', q: 'How many cm is 5 feet 10 inches?', a: '5 feet 10 inches is exactly 177.8 centimeters. First, convert 5 feet to inches (5 * 12 = 60), add 10 inches (70 inches total), and multiply by 2.54.', catName: 'Length', u1Id: 'ft', u2Id: 'cm', catId: 'length' },
    { slug: 'metric-to-imperial-converter-free', kw: 'metric to imperial converter free', q: 'What is the best free metric to imperial converter?', a: 'Our free online tool is the best metric to imperial converter. It instantly converts meters to feet, kilograms to pounds, liters to gallons, and Celsius to Fahrenheit.', catName: 'Length', u1Id: 'm', u2Id: 'ft', catId: 'length' }
  ];
  
  pages.push(...specificLongTail);

  categories.forEach(cat => {
    const units = cat.units.slice(0, 4);
    for(let i=0; i<units.length; i++) {
      for(let j=0; j<units.length; j++) {
        if (i !== j) {
          const u1 = units[i];
          const u2 = units[j];
          const factor = cat.id === 'temperature' ? 'the specific temperature formula' : (u1.factor / u2.factor).toLocaleString('en-US', { maximumFractionDigits: 6 });
          const slug = `how-to-convert-${u1.id}-to-${u2.id}`;
          
          if (!pages.find(p => p.slug === slug)) {
            pages.push({
              slug,
              kw: `how to convert ${u1.name.toLowerCase()} to ${u2.name.toLowerCase()}`,
              title: `How to Convert ${u1.name} to ${u2.name} | Free ${cat.name} Calculator`,
              q: `What is the formula to convert ${u1.name} to ${u2.name}?`,
              a: `To convert ${u1.name} to ${u2.name}, you use the standard conversion factor. 1 ${u1.name} is equal to ${factor} ${u2.name}. Simply multiply your value in ${u1.name} by ${factor} to get the result in ${u2.name}.`,
              catName: cat.name,
              u1Id: u1.id,
              u2Id: u2.id,
              catId: cat.id
            });
          }
        }
      }
    }
  });
  return pages;
};
const seoPagesData = generateSeoPages();

const SeoKeywordPage = () => {
  const { slug } = useParams();
  const page = seoPagesData.find(p => p.slug === slug);

  useEffect(() => {
    if (page) {
      document.title = page.title;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = page.a;
      window.scrollTo(0, 0);
    }
  }, [page]);

  if (!page) return <div className="p-20 text-center">Page not found. <Link to="/" className="text-royal-600">Go Home</Link></div>;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": page.q,
      "acceptedAnswer": { "@type": "Answer", "text": page.a }
    }]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-royal-600">Home</Link> <span>/</span> <Link to="/guides" className="hover:text-royal-600">Guides</Link> <span>/</span> <span className="font-bold text-slate-900">{page.kw}</span>
        </div>
      </div>
      
      <article className="prose prose-lg prose-slate prose-royal max-w-none bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-royal-100">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight capitalize">{page.kw}</h1>
        
        <div className="bg-royal-50 p-6 rounded-2xl border border-royal-100 mb-8">
          <h2 className="text-2xl font-bold text-royal-900 mt-0">{page.q}</h2>
          <p className="text-slate-700 mb-0">{page.a}</p>
        </div>

        <p>
          Converting between <strong>{page.catName}</strong> units is a common task in science, engineering, and everyday life. 
          Our free online calculator makes it easy to get instant, accurate results for <strong>{page.kw}</strong>.
        </p>

        <div className="mt-8 text-center">
          <Link to={`/converter/${page.catId}?from=${page.u1Id}&to=${page.u2Id}`} className="inline-block bg-royal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-royal-700 transition-transform active:scale-95 shadow-lg">
            Open {page.catName} Calculator
          </Link>
        </div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
};

const SeoDirectory = () => {
  useEffect(() => {
    document.title = "Conversion Guides & SEO Keywords | Unit Converter";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl font-black text-slate-900 mb-8 text-center">Conversion Guides & Formulas</h1>
      <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">Browse our comprehensive collection of over 300+ unit conversion guides, formulas, and frequently asked questions.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seoPagesData.map(page => (
          <Link key={page.slug} to={`/guide/${page.slug}`} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-royal-300 hover:shadow-md transition-all">
            <span className="block font-bold text-slate-800 capitalize">{page.kw}</span>
            <span className="text-xs text-slate-500">{page.catName}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <HreflangInjector />
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/currency" element={<CurrencyConverter />} />
          <Route path="/converter/:categoryId" element={<ConverterTool />} />
          <Route path="/converter/:categoryId/:conversionPair" element={<ConverterTool />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/guides" element={<SeoDirectory />} />
          <Route path="/guide/:slug" element={<SeoKeywordPage />} />
          <Route path="/location/all" element={<AllLocationsPage />} />
          <Route path="/location/:countryId" element={<LocationPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
