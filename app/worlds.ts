export type Confidence = 'measured' | 'inferred' | 'uncertain' | 'unknown' | 'illustrative';

export type World = {
  id: string;
  name: string;
  index: string;
  kind: string;
  tagline: string;
  story: string;
  color: string;
  accent: string;
  scale: number;
  orbitalOrder: number;
  radius: string;
  radiusEarth: number;
  mass: string;
  gravity: string;
  gravityEarth: number;
  temperature: string;
  day: string;
  year: string;
  distance: string;
  moons: string;
  pressure: string;
  atmosphere: string;
  surface: string;
  weather: string;
  oddity: string;
  visualLabel: string;
  visualNote: string;
  layers: { name: string; note: string; color: string; confidence: Confidence }[];
  facts: { label: string; value: string; confidence: Confidence }[];
};

export const worlds: World[] = [
  {
    id: 'sun', name: 'The Sun', index: '00', kind: 'G2V main-sequence star', tagline: 'The engine of every world',
    story: 'The Sun is not a place with a surface—it is a self-gravitating sphere of plasma, holding 99.86% of the Solar System’s mass. The light we see escapes from a churning layer called the photosphere; beneath it, pressure and temperature climb toward a core where hydrogen fuses into helium. Its gravity built the planets and keeps all eight in orbit.',
    color: '#ff9a32', accent: '#ffd27a', scale: 2.3, orbitalOrder: 0, radius: '696,340 km', radiusEarth: 109.2, mass: '333,000 × Earth', gravity: '274 m/s²', gravityEarth: 27.9, temperature: '≈5,500°C visible layer', day: '≈25–35 Earth days', year: 'Galactic orbit: ≈230 Myr', distance: '0 AU', moons: '8 planets in orbit', pressure: 'No solid surface',
    atmosphere: 'About 73% hydrogen and 25% helium by mass, with traces of heavier elements.', surface: 'No solid ground. The visible photosphere is only a thin luminous layer of plasma.', weather: 'Granulation, sunspots, prominences, flares, and coronal mass ejections driven by magnetic fields.', oddity: 'Its outer atmosphere, the corona, is far hotter than the visible surface.', visualLabel: 'SCIENTIFIC VISUALIZATION', visualNote: 'Procedural solar plasma treatment informed by spacecraft imagery; not a live image.',
    layers: [
      { name: 'Core', note: 'Hydrogen fusion; about 15 million °C', color: '#fff5c2', confidence: 'inferred' },
      { name: 'Radiative zone', note: 'Energy moves outward mainly as radiation', color: '#ffc34e', confidence: 'inferred' },
      { name: 'Convective zone', note: 'Hot plasma rises, cool plasma sinks', color: '#ee7020', confidence: 'inferred' },
      { name: 'Photosphere + atmosphere', note: 'The visible layer and extended corona', color: '#b62e0d', confidence: 'measured' },
    ],
    facts: [
      { label: 'Spectral class', value: 'G2V', confidence: 'measured' }, { label: 'System mass share', value: '99.86%', confidence: 'measured' }, { label: 'Core temperature', value: '≈15 million °C', confidence: 'inferred' },
    ],
  },
  {
    id: 'mercury', name: 'Mercury', index: '01', kind: 'Terrestrial planet', tagline: 'A metal heart beneath a scorched crust',
    story: 'Mercury is a small, airless rocky world with an oversized iron-rich core. Its battered surface looks superficially Moon-like, but the planet lives under a far harsher solar sky. With almost no atmosphere to move heat around, sunlit ground can be hot enough to melt lead while night and shadowed polar craters become brutally cold.',
    color: '#a89a87', accent: '#d4c5ae', scale: .48, orbitalOrder: 1, radius: '2,440 km', radiusEarth: .383, mass: '0.055 × Earth', gravity: '3.70 m/s²', gravityEarth: .378, temperature: '−180 to 430°C', day: '58.6 Earth days', year: '88 Earth days', distance: '0.39 AU', moons: '0', pressure: 'Near-vacuum', atmosphere: 'An extremely thin exosphere containing oxygen, sodium, hydrogen, helium, and potassium.', surface: 'Solid silicate crust, heavily cratered plains, cliffs, and volcanic deposits.', weather: 'No weather in the Earth sense. The solar wind and micrometeoroids continually alter the exosphere.', oddity: 'One solar day—noon to noon—lasts 176 Earth days, twice its year.', visualLabel: 'PROCEDURAL RECONSTRUCTION', visualNote: 'Stylized from the global appearance mapped by MESSENGER; colors are interpretive.',
    layers: [{ name: 'Iron-rich core', note: 'Exceptionally large, partly molten metallic core', color: '#cc7542', confidence: 'inferred' }, { name: 'Silicate mantle', note: 'Relatively thin rocky mantle', color: '#8f6f55', confidence: 'inferred' }, { name: 'Crust', note: 'Solid, impact-scarred surface', color: '#b8ab98', confidence: 'measured' }],
    facts: [{ label: 'Surface state', value: 'Solid', confidence: 'measured' }, { label: 'Polar water ice', value: 'Present in permanent shadow', confidence: 'measured' }, { label: 'Core extent', value: '≈85% of planetary radius', confidence: 'inferred' }],
  },
  {
    id: 'venus', name: 'Venus', index: '02', kind: 'Terrestrial planet', tagline: 'Earth-sized, transformed by atmosphere',
    story: 'Venus is almost Earth’s size, but its dense carbon-dioxide atmosphere has driven a runaway greenhouse climate. Beneath pale sulfuric-acid clouds lies a solid volcanic landscape under crushing pressure and heat hot enough to melt lead. Its cloud tops race around the planet while the ground rotates extremely slowly—and in the opposite direction from most planets.',
    color: '#d99b52', accent: '#f5d08b', scale: .95, orbitalOrder: 2, radius: '6,052 km', radiusEarth: .949, mass: '0.815 × Earth', gravity: '8.87 m/s²', gravityEarth: .905, temperature: '≈465°C surface', day: '243 Earth days', year: '224.7 Earth days', distance: '0.72 AU', moons: '0', pressure: '≈92 × Earth', atmosphere: 'About 96.5% carbon dioxide and 3.5% nitrogen, with sulfuric-acid cloud droplets.', surface: 'Solid basaltic terrain dominated by volcanic plains, highlands, and deformed crust.', weather: 'Fast high-altitude winds, thick global clouds, and possible lightning; little temperature variation at the surface.', oddity: 'A Venusian sidereal day is longer than its year, and the Sun would rise in the west.', visualLabel: 'SCIENTIFIC VISUALIZATION', visualNote: 'Cloud appearance is informed by ultraviolet spacecraft views and false-color mapping.',
    layers: [{ name: 'Iron core', note: 'Size and state are model-dependent', color: '#d26a3b', confidence: 'inferred' }, { name: 'Rocky mantle', note: 'Hot silicate mantle', color: '#9d5034', confidence: 'inferred' }, { name: 'Basaltic crust', note: 'Mapped indirectly through radar', color: '#c98249', confidence: 'measured' }, { name: 'Dense atmosphere', note: 'CO₂ envelope and sulfuric-acid clouds', color: '#f0c66e', confidence: 'measured' }],
    facts: [{ label: 'Surface pressure', value: '≈92 bar', confidence: 'measured' }, { label: 'Atmospheric CO₂', value: '≈96.5%', confidence: 'measured' }, { label: 'Active volcanism today', value: 'Strong evidence; rate unknown', confidence: 'uncertain' }],
  },
  {
    id: 'earth', name: 'Earth', index: '03', kind: 'Ocean-bearing terrestrial planet', tagline: 'The reference world',
    story: 'Earth is a differentiated rocky planet wrapped in a nitrogen–oxygen atmosphere and covered mostly by liquid water. A moving crust recycles material through plate tectonics; a metallic core powers a protective magnetic field. It is the only world known to host life—not because every region is gentle, but because liquid water, chemistry, energy, and long-term climate stability overlap here.',
    color: '#2f78c7', accent: '#76c9ff', scale: 1, orbitalOrder: 3, radius: '6,371 km', radiusEarth: 1, mass: '1.00 Earth', gravity: '9.81 m/s²', gravityEarth: 1, temperature: '≈15°C global mean', day: '23h 56m', year: '365.26 days', distance: '1.00 AU', moons: '1', pressure: '1 bar at sea level', atmosphere: 'About 78% nitrogen, 21% oxygen, plus argon, water vapor, carbon dioxide, and trace gases.', surface: 'Solid dynamic crust with continents, ocean basins, ice, sediments, and active plate tectonics.', weather: 'A water-driven climate with winds, storms, clouds, precipitation, and ocean circulation.', oddity: 'Earth’s biosphere has substantially altered the atmosphere, surface, and mineral record.', visualLabel: 'SATELLITE DATA COMPOSITE', visualNote: 'NASA Blue Marble surface mosaic rendered as a stylized globe; not a real-time Earth image.',
    layers: [{ name: 'Inner core', note: 'Solid iron–nickel alloy', color: '#f6df91', confidence: 'inferred' }, { name: 'Outer core', note: 'Liquid metal; generates the magnetic field', color: '#f19a3a', confidence: 'inferred' }, { name: 'Mantle', note: 'Slow-flowing silicate rock', color: '#bf5b2d', confidence: 'inferred' }, { name: 'Crust + oceans', note: 'Thin solid shell and liquid-water surface', color: '#347fc4', confidence: 'measured' }],
    facts: [{ label: 'Ocean coverage', value: '≈71%', confidence: 'measured' }, { label: 'Known life', value: 'Confirmed', confidence: 'measured' }, { label: 'Deep interior', value: 'Constrained by seismic models', confidence: 'inferred' }],
  },
  {
    id: 'mars', name: 'Mars', index: '04', kind: 'Cold desert terrestrial planet', tagline: 'A once-wetter world written in stone',
    story: 'Mars is a cold, dusty rocky world with a thin carbon-dioxide atmosphere and a surface rich in iron oxides—the source of its red color. Dry river valleys, lake beds, and water-altered minerals show that liquid water once moved across the surface. Today, water survives mostly as ice, while giant extinct volcanoes and a canyon system longer than the United States preserve its dramatic past.',
    color: '#b94e31', accent: '#e58b63', scale: .53, orbitalOrder: 4, radius: '3,390 km', radiusEarth: .532, mass: '0.107 × Earth', gravity: '3.71 m/s²', gravityEarth: .379, temperature: '≈−63°C global mean', day: '24h 37m', year: '687 Earth days', distance: '1.52 AU', moons: '2', pressure: '≈0.006 × Earth', atmosphere: 'About 95% carbon dioxide, with nitrogen, argon, and traces of oxygen and water vapor.', surface: 'Solid basaltic crust with dust, impact basins, volcanoes, canyons, dunes, and polar ice.', weather: 'Dust devils, thin clouds, frost, and regional to global dust storms.', oddity: 'Olympus Mons rises about 22 km above its surroundings—the largest known volcano in the Solar System.', visualLabel: 'PROCEDURAL RECONSTRUCTION', visualNote: 'Colors and terrain character are based on orbital and rover imagery; features are stylized.',
    layers: [{ name: 'Metallic core', note: 'Liquid iron alloy rich in lighter elements', color: '#c67248', confidence: 'inferred' }, { name: 'Silicate mantle', note: 'Mostly solid rocky mantle', color: '#914028', confidence: 'inferred' }, { name: 'Basaltic crust', note: 'Iron-rich rocks under oxidized dust', color: '#bd5333', confidence: 'measured' }],
    facts: [{ label: 'Ancient surface water', value: 'Established by landforms and minerals', confidence: 'measured' }, { label: 'Present subsurface brines', value: 'Uncertain', confidence: 'inferred' }, { label: 'Surface color', value: 'Iron-oxide dust', confidence: 'measured' }],
  },
  {
    id: 'jupiter', name: 'Jupiter', index: '05', kind: 'Gas giant', tagline: 'A world without a surface',
    story: 'Jupiter is the Solar System’s largest planet: mostly hydrogen and helium compressed into increasingly strange states. The visible bands are cloud tops, not solid ground. Descend and gas becomes hot, opaque fluid; deeper still, hydrogen is squeezed into an electrically conducting metallic form. There may be a diffuse heavy-element core, but no clean place where an explorer could land.',
    color: '#c28b63', accent: '#edc9a5', scale: 2, orbitalOrder: 5, radius: '69,911 km', radiusEarth: 10.97, mass: '317.8 × Earth', gravity: '24.79 m/s²', gravityEarth: 2.53, temperature: '≈−110°C at 1 bar', day: '9h 56m', year: '11.86 Earth years', distance: '5.20 AU', moons: '115 confirmed', pressure: 'No surface; rises with depth', atmosphere: 'Primarily hydrogen and helium, with water, methane, ammonia, and other trace compounds.', surface: 'No solid surface. The familiar face is a changing atmosphere above a deep fluid interior.', weather: 'Powerful jet streams, lightning, ammonia clouds, and storms including the centuries-old Great Red Spot.', oddity: 'It radiates more energy than it receives from the Sun as it slowly cools and contracts.', visualLabel: 'SCIENTIFIC VISUALIZATION', visualNote: 'Banding and storm forms are a stylized synthesis of Juno and Hubble observations.',
    layers: [{ name: 'Dilute core region', note: 'Heavy elements may be mixed through a broad region', color: '#8b5b46', confidence: 'inferred' }, { name: 'Metallic hydrogen', note: 'Conducting fluid under immense pressure', color: '#c76d52', confidence: 'inferred' }, { name: 'Molecular hydrogen', note: 'Deep hydrogen–helium fluid envelope', color: '#d9a47d', confidence: 'inferred' }, { name: 'Cloud atmosphere', note: 'Ammonia, water, and other cloud layers', color: '#f1d7b8', confidence: 'measured' }],
    facts: [{ label: 'Solid surface', value: 'None', confidence: 'measured' }, { label: 'Sharp core boundary', value: 'Unknown', confidence: 'unknown' }, { label: 'Great Red Spot', value: 'Observed storm', confidence: 'measured' }],
  },
  {
    id: 'saturn', name: 'Saturn', index: '06', kind: 'Ringed gas giant', tagline: 'An atmosphere encircled by ice',
    story: 'Saturn is a vast hydrogen–helium planet with no solid surface, surrounded by an astonishingly thin disk of countless ice-rich particles. The planet is less dense than water overall, though no ocean could hold it. Below the golden cloud tops, pressure turns gas into fluid and eventually metallic hydrogen around a probable heavy-element core.',
    color: '#d7ba7d', accent: '#f1daa4', scale: 1.75, orbitalOrder: 6, radius: '58,232 km', radiusEarth: 9.14, mass: '95.2 × Earth', gravity: '10.44 m/s²', gravityEarth: 1.065, temperature: '≈−140°C at 1 bar', day: '≈10h 42m', year: '29.45 Earth years', distance: '9.58 AU', moons: '293 confirmed', pressure: 'No surface; rises with depth', atmosphere: 'Mostly hydrogen and helium, with methane, ammonia, water vapor, and trace compounds.', surface: 'No solid ground. Cloud decks transition downward into a hot, dense fluid envelope.', weather: 'Fast zonal winds, enormous storms, and a persistent hexagonal jet stream at the north pole.', oddity: 'The main rings are hundreds of thousands of kilometers wide but often only tens of meters thick.', visualLabel: 'SCIENTIFIC VISUALIZATION', visualNote: 'Ring geometry and cloud colors are informed by Cassini imagery; particle detail is illustrative.',
    layers: [{ name: 'Probable core', note: 'Rock, ice, and metal; boundary may be diffuse', color: '#98694b', confidence: 'inferred' }, { name: 'Metallic hydrogen', note: 'Conductive deep fluid', color: '#bf7559', confidence: 'inferred' }, { name: 'Hydrogen–helium envelope', note: 'Molecular fluid transitioning to gas', color: '#d8ae75', confidence: 'inferred' }, { name: 'Cloud atmosphere', note: 'Hazy ammonia-cloud exterior', color: '#f1d8a3', confidence: 'measured' }],
    facts: [{ label: 'Solid surface', value: 'None', confidence: 'measured' }, { label: 'Ring composition', value: 'Mostly water ice', confidence: 'measured' }, { label: 'Core structure', value: 'Model-dependent', confidence: 'inferred' }],
  },
  {
    id: 'uranus', name: 'Uranus', index: '07', kind: 'Ice giant', tagline: 'A tipped world of high-pressure oceans',
    story: 'Uranus is an ice giant—not a ball of familiar ice, but a hydrogen–helium atmosphere wrapped around a hot, dense interior rich in water, ammonia, and methane under extreme pressure. Methane absorbs red light and helps create its cyan appearance. The entire planet rotates almost on its side, producing seasons unlike any other major world.',
    color: '#78c6cd', accent: '#b9eef0', scale: 1.22, orbitalOrder: 7, radius: '25,362 km', radiusEarth: 3.98, mass: '14.5 × Earth', gravity: '8.69 m/s²', gravityEarth: .886, temperature: '≈−195°C at 1 bar', day: '17h 14m retrograde', year: '84 Earth years', distance: '19.2 AU', moons: '29 known', pressure: 'No solid surface', atmosphere: 'Mostly hydrogen and helium with methane; deeper clouds likely include ammonia and water.', surface: 'No accessible solid surface. Gas grades into a compressed, hot volatile-rich fluid interior.', weather: 'Haze, methane-ice clouds, zonal winds, and storms that become more visible seasonally.', oddity: 'Its 98° axial tilt makes it roll around the Sun, with each pole facing decades of light then darkness.', visualLabel: 'SCIENTIFIC VISUALIZATION', visualNote: 'Color and faint banding are based on calibrated spacecraft/telescope views; ring visibility is enhanced.',
    layers: [{ name: 'Rocky core model', note: 'Small dense central region', color: '#7f695f', confidence: 'inferred' }, { name: 'Volatile-rich interior', note: 'Hot high-pressure water/ammonia/methane mixture—not conventional ice', color: '#4f8eb1', confidence: 'inferred' }, { name: 'H/He atmosphere', note: 'Hydrogen, helium, and methane envelope', color: '#8cd4da', confidence: 'measured' }],
    facts: [{ label: 'Axial tilt', value: '97.8°', confidence: 'measured' }, { label: 'Deep “ice” phase', value: 'Model-dependent high-pressure fluid', confidence: 'inferred' }, { label: 'Methane', value: 'Observed in atmosphere', confidence: 'measured' }],
  },
  {
    id: 'neptune', name: 'Neptune', index: '08', kind: 'Ice giant', tagline: 'The blue world with supersonic winds',
    story: 'Neptune is a remote ice giant whose blue atmosphere hides a hot, high-pressure interior rich in water, ammonia, and methane compounds. It has no solid surface to stand on. Despite receiving little sunlight, Neptune drives the fastest planetary winds measured in the Solar System and radiates substantially more heat than it absorbs.',
    color: '#315ecb', accent: '#7f9fff', scale: 1.2, orbitalOrder: 8, radius: '24,622 km', radiusEarth: 3.86, mass: '17.1 × Earth', gravity: '11.15 m/s²', gravityEarth: 1.14, temperature: '≈−200°C at 1 bar', day: '16h 6m', year: '164.8 Earth years', distance: '30.1 AU', moons: '16 known', pressure: 'No solid surface', atmosphere: 'Mostly hydrogen and helium with methane, plus hazes and deeper cloud-forming compounds.', surface: 'No solid surface. Its atmosphere deepens into dense fluid over a volatile-rich interior.', weather: 'Dark storms, bright methane-ice clouds, and winds that can exceed 2,000 km/h.', oddity: 'Its moon Triton orbits backward and is probably a captured Kuiper Belt object.', visualLabel: 'SCIENTIFIC VISUALIZATION', visualNote: 'Stylized from Voyager 2 and modern telescope observations; saturation is enhanced for clarity.',
    layers: [{ name: 'Rocky core model', note: 'Dense central material', color: '#6d676a', confidence: 'inferred' }, { name: 'Volatile-rich interior', note: 'Hot compressed mixture of water, ammonia, and methane', color: '#31539b', confidence: 'inferred' }, { name: 'H/He atmosphere', note: 'Hydrogen, helium, methane, and hazes', color: '#4673d7', confidence: 'measured' }],
    facts: [{ label: 'Maximum winds', value: '>2,000 km/h', confidence: 'measured' }, { label: 'Internal heat source', value: 'Observed energy imbalance; mechanism modeled', confidence: 'inferred' }, { label: 'Solid surface', value: 'None', confidence: 'measured' }],
  },
];

export const confidenceCopy: Record<Confidence, string> = {
  measured: 'Observed or strongly constrained by measurements',
  inferred: 'Supported by measurements and physical models',
  uncertain: 'Scientifically plausible, but current evidence is not decisive',
  unknown: 'Current observations do not tell us',
  illustrative: 'A scientifically informed visual interpretation',
};
