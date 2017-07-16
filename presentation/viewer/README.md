# Versions

## 0.7.0
- Add possibility to show GPScoordinates on google map.  

## 0.5.0
- A lot of refactoring
    - Now depends on the ioant npm packages
- Fixed bug where null or undefined values would show instead of default values
- Added more symbols for message types:
    - Mass  

## 0.4.0
- App now accommodates all message types
- Configuration feature for streams
    - Unconfigured streams will show a table
- DC chart improvements. Now supports bar and line type

## 0.3.0
- Add Gallery view functionality. Applied when data streams of type Image are loaded

## 0.2.5
- Add icons next to streams in the stream table.
- Add column field status that shows timestamp of the latest received message

## 0.2.0
- Add new menu option "System status"
- Now can display Status information about the broker


## 0.1.5
- Add options for filtering data and toggeling aggregation on and off
- Improved visualization by scaling y-axis based on current max and min value
- Fixed bug that caused application to crash when 0 values or error was returned from rest API

## 0.1.0 (Initial)
- Can list available streams
- Can view a single stream using D3 and DC js libraries
