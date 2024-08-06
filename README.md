# R4CK - Network Rack Visualization Tool

This application provides a visual representation of distribution frames racks, allowing users to configure and manage network components efficiently then connect them together correctly.

## Features

- Interactive rack visualization
- Component configuration
- Patching schedule management
- Issues tracking and resolution

## Known Issues

1. IP Telephones must have a separate patch panel as they are not RJ45.
2. Some components may not render correctly in certain browsers.
3. The identifier is not resetting the rack-specific counter of components when moving to another IDF.

## Getting Started

TODO: Add instructions for setting up and running the project here

## To-do

Standarize the following components:
Component -> # of ports
Switch -> 8 or 24 or 48
Patch Panel -> 24 or 48

Implement AUTO config that does the following:

FPP to be CALCULATED BY # of CORES

Configuration Template:
FPP1
CABLE MANAGER
PP1
PP2
CABLE MANAGER
SWITCH 48
CABLE MANAGER
PP3
PP4
CABLE MANAGER
SWITCH 48
CABLE MANAGER
PP5
CABLE MANAGER

Configuration Calculation
DIVIDE TOTAL DEVICES BY /24 FOR PP & CABLE MNGR AND /48 FOR SW

