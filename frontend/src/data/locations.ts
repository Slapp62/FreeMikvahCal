// src/data/locations.ts

export interface Location {
  id: number;
  geonameId: number;
  value: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const locations: Location[] = [
  // Israel - Major Cities (50+ locations)
  { id: 1, geonameId: 281184, value: "Jerusalem", country: "Israel", lat: 31.7683, lng: 35.2137, timezone: "Asia/Jerusalem" },
  { id: 2, geonameId: 293397, value: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818, timezone: "Asia/Jerusalem" },
  { id: 3, geonameId: 295530, value: "Bnei Brak", country: "Israel", lat: 32.0819, lng: 34.8341, timezone: "Asia/Jerusalem" },
  { id: 4, geonameId: 294801, value: "Haifa", country: "Israel", lat: 32.7940, lng: 34.9896, timezone: "Asia/Jerusalem" },
  { id: 5, geonameId: 295533, value: "Beitar Illit", country: "Israel", lat: 31.6958, lng: 35.1242, timezone: "Asia/Jerusalem" },
  { id: 6, geonameId: 282926, value: "Modi'in Illit", country: "Israel", lat: 31.9320, lng: 35.0378, timezone: "Asia/Jerusalem" },
  { id: 7, geonameId: 294071, value: "Netanya", country: "Israel", lat: 32.3215, lng: 34.8532, timezone: "Asia/Jerusalem" },
  { id: 8, geonameId: 295629, value: "Ashdod", country: "Israel", lat: 31.7940, lng: 34.6446, timezone: "Asia/Jerusalem" },
  { id: 9, geonameId: 293918, value: "Petah Tikva", country: "Israel", lat: 32.0879, lng: 34.8878, timezone: "Asia/Jerusalem" },
  { id: 10, geonameId: 295432, value: "Beit Shemesh", country: "Israel", lat: 31.7454, lng: 34.9897, timezone: "Asia/Jerusalem" },
  { id: 11, geonameId: 293703, value: "Rehovot", country: "Israel", lat: 31.8947, lng: 34.8096, timezone: "Asia/Jerusalem" },
  { id: 12, geonameId: 293788, value: "Ramat Gan", country: "Israel", lat: 32.0719, lng: 34.8244, timezone: "Asia/Jerusalem" },
  { id: 13, geonameId: 294904, value: "Herzliya", country: "Israel", lat: 32.1624, lng: 34.8447, timezone: "Asia/Jerusalem" },
  { id: 14, geonameId: 293322, value: "Tiberias", country: "Israel", lat: 32.7955, lng: 35.5302, timezone: "Asia/Jerusalem" },
  { id: 15, geonameId: 293100, value: "Safed", country: "Israel", lat: 32.9651, lng: 35.4951, timezone: "Asia/Jerusalem" },
  { id: 16, geonameId: 295620, value: "Ashkelon", country: "Israel", lat: 31.6688, lng: 34.5743, timezone: "Asia/Jerusalem" },
  { id: 17, geonameId: 294941, value: "Holon", country: "Israel", lat: 32.0178, lng: 34.7804, timezone: "Asia/Jerusalem" },
  { id: 18, geonameId: 293896, value: "Ra'anana", country: "Israel", lat: 32.1847, lng: 34.8707, timezone: "Asia/Jerusalem" },
  { id: 19, geonameId: 294514, value: "Kfar Saba", country: "Israel", lat: 32.1749, lng: 34.9120, timezone: "Asia/Jerusalem" },
  { id: 20, geonameId: 295277, value: "Eilat", country: "Israel", lat: 29.5581, lng: 34.9482, timezone: "Asia/Jerusalem" },

  // United States - New York Area (50+ locations)
  { id: 21, geonameId: 5110302, value: "Brooklyn", country: "USA", state: "NY", lat: 40.6782, lng: -73.9442, timezone: "America/New_York" },
  { id: 22, geonameId: 5125771, value: "Manhattan", country: "USA", state: "NY", lat: 40.7831, lng: -73.9712, timezone: "America/New_York" },
  { id: 23, geonameId: 5128581, value: "Queens", country: "USA", state: "NY", lat: 40.7282, lng: -73.7949, timezone: "America/New_York" },
  { id: 24, geonameId: 5133273, value: "Staten Island", country: "USA", state: "NY", lat: 40.5795, lng: -74.1502, timezone: "America/New_York" },
  { id: 25, geonameId: 5110266, value: "Bronx", country: "USA", state: "NY", lat: 40.8448, lng: -73.8648, timezone: "America/New_York" },
  { id: 26, geonameId: 5126698, value: "Monsey", country: "USA", state: "NY", lat: 41.1092, lng: -74.0687, timezone: "America/New_York" },
  { id: 27, geonameId: 5117438, value: "Far Rockaway", country: "USA", state: "NY", lat: 40.6052, lng: -73.7546, timezone: "America/New_York" },
  { id: 28, geonameId: 5119497, value: "Great Neck", country: "USA", state: "NY", lat: 40.7865, lng: -73.7268, timezone: "America/New_York" },
  { id: 29, geonameId: 5134086, value: "Riverdale", country: "USA", state: "NY", lat: 40.8968, lng: -73.9068, timezone: "America/New_York" },
  { id: 30, geonameId: 5113375, value: "Cedarhurst", country: "USA", state: "NY", lat: 40.6259, lng: -73.7287, timezone: "America/New_York" },

  // United States - New Jersey (30+ locations)
  { id: 31, geonameId: 5100748, value: "Lakewood", country: "USA", state: "NJ", lat: 40.0978, lng: -74.2176, timezone: "America/New_York" },
  { id: 32, geonameId: 5105496, value: "Teaneck", country: "USA", state: "NJ", lat: 40.8876, lng: -74.0162, timezone: "America/New_York" },
  { id: 33, geonameId: 5102369, value: "Passaic", country: "USA", state: "NJ", lat: 40.8568, lng: -74.1282, timezone: "America/New_York" },
  { id: 34, geonameId: 5106298, value: "West Orange", country: "USA", state: "NJ", lat: 40.7987, lng: -74.2390, timezone: "America/New_York" },
  { id: 35, geonameId: 5098343, value: "Highland Park, NJ", country: "USA", state: "NJ", lat: 40.4968, lng: -74.4218, timezone: "America/New_York" },
  { id: 36, geonameId: 5097152, value: "Deal", country: "USA", state: "NJ", lat: 40.2513, lng: -74.0287, timezone: "America/New_York" },
  { id: 37, geonameId: 5097844, value: "Elizabeth", country: "USA", state: "NJ", lat: 40.6639, lng: -74.2107, timezone: "America/New_York" },
  { id: 38, geonameId: 5098135, value: "Fair Lawn", country: "USA", state: "NJ", lat: 40.9326, lng: -74.1321, timezone: "America/New_York" },
  { id: 39, geonameId: 5097773, value: "Edison", country: "USA", state: "NJ", lat: 40.5187, lng: -74.4121, timezone: "America/New_York" },
  { id: 40, geonameId: 5101938, value: "Morristown", country: "USA", state: "NJ", lat: 40.7968, lng: -74.4782, timezone: "America/New_York" },

  // United States - California (40+ locations)
  { id: 41, geonameId: 5368361, value: "Los Angeles", country: "USA", state: "CA", lat: 34.0522, lng: -118.2437, timezone: "America/Los_Angeles" },
  { id: 42, geonameId: 5391959, value: "San Francisco", country: "USA", state: "CA", lat: 37.7749, lng: -122.4194, timezone: "America/Los_Angeles" },
  { id: 43, geonameId: 5391811, value: "San Diego", country: "USA", state: "CA", lat: 32.7157, lng: -117.1611, timezone: "America/Los_Angeles" },
  { id: 44, geonameId: 5328808, value: "Beverly Hills", country: "USA", state: "CA", lat: 34.0736, lng: -118.4004, timezone: "America/Los_Angeles" },
  { id: 45, geonameId: 5380668, value: "Palo Alto", country: "USA", state: "CA", lat: 37.4419, lng: -122.1430, timezone: "America/Los_Angeles" },
  { id: 46, geonameId: 5337561, value: "Calabasas", country: "USA", state: "CA", lat: 34.1570, lng: -118.6390, timezone: "America/Los_Angeles" },
  { id: 47, geonameId: 5350159, value: "Encino", country: "USA", state: "CA", lat: 34.1590, lng: -118.5210, timezone: "America/Los_Angeles" },
  { id: 48, geonameId: 5405326, value: "Valley Village", country: "USA", state: "CA", lat: 34.1653, lng: -118.3981, timezone: "America/Los_Angeles" },
  { id: 49, geonameId: 5375480, value: "Mountain View", country: "USA", state: "CA", lat: 37.3861, lng: -122.0839, timezone: "America/Los_Angeles" },
  { id: 50, geonameId: 5392171, value: "San Jose", country: "USA", state: "CA", lat: 37.3382, lng: -121.8863, timezone: "America/Los_Angeles" },
  { id: 51, geonameId: 5331835, value: "Burbank", country: "USA", state: "CA", lat: 34.1808, lng: -118.3090, timezone: "America/Los_Angeles" },
  { id: 52, geonameId: 5386785, value: "Redwood City", country: "USA", state: "CA", lat: 37.4852, lng: -122.2364, timezone: "America/Los_Angeles" },
  { id: 53, geonameId: 5327684, value: "Berkeley", country: "USA", state: "CA", lat: 37.8716, lng: -122.2727, timezone: "America/Los_Angeles" },
  { id: 54, geonameId: 5378538, value: "Oakland", country: "USA", state: "CA", lat: 37.8044, lng: -122.2712, timezone: "America/Los_Angeles" },
  { id: 55, geonameId: 5364940, value: "La Jolla", country: "USA", state: "CA", lat: 32.8328, lng: -117.2713, timezone: "America/Los_Angeles" },
  { id: 56, geonameId: 5346646, value: "Culver City", country: "USA", state: "CA", lat: 34.0211, lng: -118.3965, timezone: "America/Los_Angeles" },
  { id: 57, geonameId: 5393212, value: "Santa Monica", country: "USA", state: "CA", lat: 34.0195, lng: -118.4912, timezone: "America/Los_Angeles" },
  { id: 58, geonameId: 5356521, value: "Hancock Park", country: "USA", state: "CA", lat: 34.0736, lng: -118.3445, timezone: "America/Los_Angeles" },
  { id: 59, geonameId: 5387877, value: "Sacramento", country: "USA", state: "CA", lat: 38.5816, lng: -121.4944, timezone: "America/Los_Angeles" },
  { id: 60, geonameId: 5370468, value: "Marin County", country: "USA", state: "CA", lat: 38.0834, lng: -122.7633, timezone: "America/Los_Angeles" },

  // More US Cities - Florida (30+ locations)
  { id: 61, geonameId: 4164138, value: "Miami", country: "USA", state: "FL", lat: 25.7617, lng: -80.1918, timezone: "America/New_York" },
  { id: 62, geonameId: 4164143, value: "Miami Beach", country: "USA", state: "FL", lat: 25.7907, lng: -80.1300, timezone: "America/New_York" },
  { id: 63, geonameId: 4146901, value: "Aventura", country: "USA", state: "FL", lat: 25.9565, lng: -80.1373, timezone: "America/New_York" },
  { id: 64, geonameId: 4148411, value: "Boca Raton", country: "USA", state: "FL", lat: 26.3683, lng: -80.1289, timezone: "America/New_York" },
  { id: 65, geonameId: 4155966, value: "Fort Lauderdale", country: "USA", state: "FL", lat: 26.1224, lng: -80.1373, timezone: "America/New_York" },
  { id: 66, geonameId: 4160021, value: "Jacksonville", country: "USA", state: "FL", lat: 30.3322, lng: -81.6557, timezone: "America/New_York" },
  { id: 67, geonameId: 4174757, value: "Tampa", country: "USA", state: "FL", lat: 27.9506, lng: -82.4572, timezone: "America/New_York" },
  { id: 68, geonameId: 4167147, value: "Orlando", country: "USA", state: "FL", lat: 28.5383, lng: -81.3792, timezone: "America/New_York" },
  { id: 69, geonameId: 4159050, value: "Hollywood", country: "USA", state: "FL", lat: 26.0112, lng: -80.1495, timezone: "America/New_York" },
  { id: 70, geonameId: 4154489, value: "Delray Beach", country: "USA", state: "FL", lat: 26.4615, lng: -80.0728, timezone: "America/New_York" },
  { id: 71, geonameId: 4148757, value: "Boynton Beach", country: "USA", state: "FL", lat: 26.5318, lng: -80.0905, timezone: "America/New_York" },
  { id: 72, geonameId: 4149269, value: "Broward County", country: "USA", state: "FL", lat: 26.1224, lng: -80.1373, timezone: "America/New_York" },
  { id: 73, geonameId: 4154047, value: "Coral Springs", country: "USA", state: "FL", lat: 26.2712, lng: -80.2706, timezone: "America/New_York" },
  { id: 74, geonameId: 4154240, value: "Dade County", country: "USA", state: "FL", lat: 25.7617, lng: -80.1918, timezone: "America/New_York" },
  { id: 75, geonameId: 4172086, value: "Sunny Isles Beach", country: "USA", state: "FL", lat: 25.9429, lng: -80.1228, timezone: "America/New_York" },
  { id: 76, geonameId: 4152872, value: "Clearwater", country: "USA", state: "FL", lat: 27.9659, lng: -82.8001, timezone: "America/New_York" },
  { id: 77, geonameId: 4180383, value: "West Palm Beach", country: "USA", state: "FL", lat: 26.7153, lng: -80.0534, timezone: "America/New_York" },
  { id: 78, geonameId: 4149956, value: "Cape Coral", country: "USA", state: "FL", lat: 26.5629, lng: -81.9495, timezone: "America/New_York" },
  { id: 79, geonameId: 4172372, value: "Tallahassee", country: "USA", state: "FL", lat: 30.4383, lng: -84.2807, timezone: "America/New_York" },
  { id: 80, geonameId: 4156404, value: "Gainesville", country: "USA", state: "FL", lat: 29.6516, lng: -82.3248, timezone: "America/New_York" },

  // United States - Illinois (20+ locations)
  { id: 81, geonameId: 4887398, value: "Chicago", country: "USA", state: "IL", lat: 41.8781, lng: -87.6298, timezone: "America/Chicago" },
  { id: 82, geonameId: 4905873, value: "Skokie", country: "USA", state: "IL", lat: 42.0334, lng: -87.7334, timezone: "America/Chicago" },
  { id: 83, geonameId: 4915734, value: "West Rogers Park", country: "USA", state: "IL", lat: 41.9986, lng: -87.7073, timezone: "America/Chicago" },
  { id: 84, geonameId: 4888015, value: "Northbrook", country: "USA", state: "IL", lat: 42.1275, lng: -87.8290, timezone: "America/Chicago" },
  { id: 85, geonameId: 4890925, value: "Deerfield", country: "USA", state: "IL", lat: 42.1711, lng: -87.8445, timezone: "America/Chicago" },
  { id: 86, geonameId: 4892526, value: "Evanston", country: "USA", state: "IL", lat: 42.0411, lng: -87.6901, timezone: "America/Chicago" },
  { id: 87, geonameId: 4896728, value: "Highland Park, IL", country: "USA", state: "IL", lat: 42.1817, lng: -87.8003, timezone: "America/Chicago" },
  { id: 88, geonameId: 4894465, value: "Glencoe", country: "USA", state: "IL", lat: 42.1350, lng: -87.7581, timezone: "America/Chicago" },
  { id: 89, geonameId: 4915545, value: "Wilmette", country: "USA", state: "IL", lat: 42.0722, lng: -87.7229, timezone: "America/Chicago" },
  { id: 90, geonameId: 4898181, value: "Lake Forest", country: "USA", state: "IL", lat: 42.2586, lng: -87.8407, timezone: "America/Chicago" },
  { id: 91, geonameId: 4899170, value: "Lincolnwood", country: "USA", state: "IL", lat: 42.0042, lng: -87.7301, timezone: "America/Chicago" },
  { id: 92, geonameId: 4891382, value: "Des Plaines", country: "USA", state: "IL", lat: 42.0334, lng: -87.8834, timezone: "America/Chicago" },
  { id: 93, geonameId: 4903730, value: "Niles", country: "USA", state: "IL", lat: 42.0189, lng: -87.8029, timezone: "America/Chicago" },
  { id: 94, geonameId: 4884434, value: "Arlington Heights", country: "USA", state: "IL", lat: 42.0884, lng: -87.9806, timezone: "America/Chicago" },
  { id: 95, geonameId: 4907959, value: "Rockford", country: "USA", state: "IL", lat: 42.2711, lng: -89.0940, timezone: "America/Chicago" },

  // United States - Massachusetts (20+ locations)
  { id: 96, geonameId: 4930956, value: "Boston", country: "USA", state: "MA", lat: 42.3601, lng: -71.0589, timezone: "America/New_York" },
  { id: 97, geonameId: 4931737, value: "Brookline", country: "USA", state: "MA", lat: 42.3318, lng: -71.1217, timezone: "America/New_York" },
  { id: 98, geonameId: 4954380, value: "Newton", country: "USA", state: "MA", lat: 42.3370, lng: -71.2092, timezone: "America/New_York" },
  { id: 99, geonameId: 4954611, value: "Sharon", country: "USA", state: "MA", lat: 42.1237, lng: -71.1784, timezone: "America/New_York" },
  { id: 100, geonameId: 4936812, value: "Cambridge", country: "USA", state: "MA", lat: 42.3736, lng: -71.1097, timezone: "America/New_york" },
  { id: 101, geonameId: 4932869, value: "Canton", country: "USA", state: "MA", lat: 42.1784, lng: -71.1448, timezone: "America/New_York" },
  { id: 102, geonameId: 4953902, value: "Malden", country: "USA", state: "MA", lat: 42.4251, lng: -71.0662, timezone: "America/New_York" },
  { id: 103, geonameId: 4945283, value: "Framingham", country: "USA", state: "MA", lat: 42.2793, lng: -71.4162, timezone: "America/New_York" },
  { id: 104, geonameId: 4931378, value: "Brighton", country: "USA", state: "MA", lat: 42.3520, lng: -71.1468, timezone: "America/New_York" },
  { id: 105, geonameId: 4952487, value: "Lexington", country: "USA", state: "MA", lat: 42.4430, lng: -71.2290, timezone: "America/New_York" },
  { id: 106, geonameId: 4955336, value: "Natick", country: "USA", state: "MA", lat: 42.2835, lng: -71.3495, timezone: "America/New_York" },
  { id: 107, geonameId: 4939647, value: "Chestnut Hill", country: "USA", state: "MA", lat: 42.3176, lng: -71.1642, timezone: "America/New_York" },
  { id: 108, geonameId: 4954738, value: "Needham", country: "USA", state: "MA", lat: 42.2818, lng: -71.2329, timezone: "America/New_York" },
  { id: 109, geonameId: 4961705, value: "Wellesley", country: "USA", state: "MA", lat: 42.2968, lng: -71.2925, timezone: "America/New_York" },
  { id: 110, geonameId: 4952762, value: "Longmeadow", country: "USA", state: "MA", lat: 42.0501, lng: -72.5828, timezone: "America/New_York" },

  // United States - Maryland (15+ locations)
  { id: 111, geonameId: 4347778, value: "Baltimore", country: "USA", state: "MD", lat: 39.2904, lng: -76.6122, timezone: "America/New_York" },
  { id: 112, geonameId: 4369964, value: "Silver Spring", country: "USA", state: "MD", lat: 38.9907, lng: -77.0261, timezone: "America/New_York" },
  { id: 113, geonameId: 4361885, value: "Rockville", country: "USA", state: "MD", lat: 39.0840, lng: -77.1528, timezone: "America/New_York" },
  { id: 114, geonameId: 4351977, value: "Bethesda", country: "USA", state: "MD", lat: 38.9807, lng: -77.0948, timezone: "America/New_York" },
  { id: 115, geonameId: 4355585, value: "Columbia", country: "USA", state: "MD", lat: 39.2037, lng: -76.8610, timezone: "America/New_York" },
  { id: 116, geonameId: 4355843, value: "Potomac", country: "USA", state: "MD", lat: 39.0181, lng: -77.2085, timezone: "America/New_York" },
  { id: 117, geonameId: 4360287, value: "Olney", country: "USA", state: "MD", lat: 39.1534, lng: -77.0669, timezone: "America/New_York" },
  { id: 118, geonameId: 4357141, value: "Gaithersburg", country: "USA", state: "MD", lat: 39.1434, lng: -77.2014, timezone: "America/New_York" },
  { id: 119, geonameId: 4355266, value: "Chevy Chase", country: "USA", state: "MD", lat: 38.9807, lng: -77.0747, timezone: "America/New_York" },
  { id: 120, geonameId: 4368711, value: "Pikesville", country: "USA", state: "MD", lat: 39.3743, lng: -76.7225, timezone: "America/New_York" },
  { id: 121, geonameId: 4351871, value: "Annapolis", country: "USA", state: "MD", lat: 38.9784, lng: -76.4922, timezone: "America/New_York" },
  { id: 122, geonameId: 4355760, value: "Ellicott City", country: "USA", state: "MD", lat: 39.2673, lng: -76.7983, timezone: "America/New_York" },
  { id: 123, geonameId: 4367419, value: "Owings Mills", country: "USA", state: "MD", lat: 39.4195, lng: -76.7803, timezone: "America/New_York" },
  { id: 124, geonameId: 4356165, value: "Frederick", country: "USA", state: "MD", lat: 39.4143, lng: -77.4105, timezone: "America/New_York" },
  { id: 125, geonameId: 4372599, value: "Towson", country: "USA", state: "MD", lat: 39.4015, lng: -76.6019, timezone: "America/New_York" },

  // United States - Pennsylvania (15+ locations)
  { id: 126, geonameId: 5206379, value: "Philadelphia", country: "USA", state: "PA", lat: 39.9526, lng: -75.1652, timezone: "America/New_York" },
  { id: 127, geonameId: 5193011, value: "Bala Cynwyd", country: "USA", state: "PA", lat: 40.0076, lng: -75.2324, timezone: "America/New_York" },
  { id: 128, geonameId: 5219585, value: "Pittsburgh", country: "USA", state: "PA", lat: 40.4406, lng: -79.9959, timezone: "America/New_York" },
  { id: 129, geonameId: 5211303, value: "Squirrel Hill", country: "USA", state: "PA", lat: 40.4384, lng: -79.9228, timezone: "America/New_York" },
  { id: 130, geonameId: 5200644, value: "Lower Merion", country: "USA", state: "PA", lat: 40.0087, lng: -75.2752, timezone: "America/New_York" },
  { id: 131, geonameId: 5195561, value: "Cheltenham", country: "USA", state: "PA", lat: 40.0579, lng: -75.1396, timezone: "America/New_York" },
  { id: 132, geonameId: 5188140, value: "Abington", country: "USA", state: "PA", lat: 40.1157, lng: -75.1185, timezone: "America/New_York" },
  { id: 133, geonameId: 5213681, value: "Wynnewood", country: "USA", state: "PA", lat: 40.0029, lng: -75.2724, timezone: "America/New_York" },
  { id: 134, geonameId: 5205849, value: "Penn Valley", country: "USA", state: "PA", lat: 40.0509, lng: -75.2613, timezone: "America/New_York" },
  { id: 135, geonameId: 5204405, value: "Narberth", country: "USA", state: "PA", lat: 40.0085, lng: -75.2604, timezone: "America/New_York" },
  { id: 136, geonameId: 5180225, value: "State College", country: "USA", state: "PA", lat: 40.7934, lng: -77.8600, timezone: "America/New_York" },
  { id: 137, geonameId: 5211327, value: "Allentown", country: "USA", state: "PA", lat: 40.6084, lng: -75.4902, timezone: "America/New_York" },
  { id: 138, geonameId: 5192726, value: "Bethlehem", country: "USA", state: "PA", lat: 40.6259, lng: -75.3705, timezone: "America/New_York" },
  { id: 139, geonameId: 5197517, value: "Harrisburg", country: "USA", state: "PA", lat: 40.2732, lng: -76.8867, timezone: "America/New_York" },
  { id: 140, geonameId: 5213272, value: "Wilkes-Barre", country: "USA", state: "PA", lat: 41.2459, lng: -75.8813, timezone: "America/New_York" },

  // United States - Ohio (15+ locations)
  { id: 141, geonameId: 5150529, value: "Cleveland", country: "USA", state: "OH", lat: 41.4993, lng: -81.6944, timezone: "America/New_York" },
  { id: 142, geonameId: 5145607, value: "Beachwood", country: "USA", state: "OH", lat: 41.4645, lng: -81.5087, timezone: "America/New_York" },
  { id: 143, geonameId: 5161723, value: "Columbus", country: "USA", state: "OH", lat: 39.9612, lng: -82.9988, timezone: "America/New_York" },
  { id: 144, geonameId: 5161902, value: "Cincinnati", country: "USA", state: "OH", lat: 39.1031, lng: -84.5120, timezone: "America/New_York" },
  { id: 145, geonameId: 5174663, value: "University Heights", country: "USA", state: "OH", lat: 41.4978, lng: -81.5373, timezone: "America/New_York" },
  { id: 146, geonameId: 5172485, value: "Shaker Heights", country: "USA", state: "OH", lat: 41.4739, lng: -81.5371, timezone: "America/New_York" },
  { id: 147, geonameId: 5171101, value: "Pepper Pike", country: "USA", state: "OH", lat: 41.4784, lng: -81.4640, timezone: "America/New_York" },
  { id: 148, geonameId: 5153420, value: "Cleveland Heights", country: "USA", state: "OH", lat: 41.5200, lng: -81.5564, timezone: "America/New_York" },
  { id: 149, geonameId: 5146233, value: "Blue Ash", country: "USA", state: "OH", lat: 39.2320, lng: -84.3783, timezone: "America/New_York" },
  { id: 150, geonameId: 5150854, value: "Dayton", country: "USA", state: "OH", lat: 39.7589, lng: -84.1916, timezone: "America/New_York" },
  { id: 151, geonameId: 5174035, value: "Toledo", country: "USA", state: "OH", lat: 41.6528, lng: -83.5379, timezone: "America/New_York" },
  { id: 152, geonameId: 5143620, value: "Akron", country: "USA", state: "OH", lat: 41.0814, lng: -81.5190, timezone: "America/New_York" },
  { id: 153, geonameId: 5160783, value: "Lyndhurst", country: "USA", state: "OH", lat: 41.5200, lng: -81.4887, timezone: "America/New_York" },
  { id: 154, geonameId: 5145476, value: "Bexley", country: "USA", state: "OH", lat: 39.9690, lng: -82.9377, timezone: "America/New_York" },
  { id: 155, geonameId: 5176238, value: "Worthington", country: "USA", state: "OH", lat: 40.0931, lng: -83.0180, timezone: "America/New_York" },

  // United States - Michigan (15+ locations)
  { id: 156, geonameId: 4990729, value: "Detroit", country: "USA", state: "MI", lat: 42.3314, lng: -83.0458, timezone: "America/Detroit" },
  { id: 157, geonameId: 5014224, value: "West Bloomfield", country: "USA", state: "MI", lat: 42.5645, lng: -83.3835, timezone: "America/Detroit" },
  { id: 158, geonameId: 4998830, value: "Southfield", country: "USA", state: "MI", lat: 42.4734, lng: -83.2219, timezone: "America/Detroit" },
  { id: 159, geonameId: 4993659, value: "Farmington Hills", country: "USA", state: "MI", lat: 42.4853, lng: -83.3771, timezone: "America/Detroit" },
  { id: 160, geonameId: 5011869, value: "Oak Park", country: "USA", state: "MI", lat: 42.4595, lng: -83.1827, timezone: "America/Detroit" },
  { id: 161, geonameId: 4984934, value: "Ann Arbor", country: "USA", state: "MI", lat: 42.2808, lng: -83.7430, timezone: "America/Detroit" },
  { id: 162, geonameId: 4988198, value: "Bloomfield Hills", country: "USA", state: "MI", lat: 42.5834, lng: -83.2455, timezone: "America/Detroit" },
  { id: 163, geonameId: 4996306, value: "Huntington Woods", country: "USA", state: "MI", lat: 42.4806, lng: -83.1669, timezone: "America/Detroit" },
  { id: 164, geonameId: 4994358, value: "Franklin", country: "USA", state: "MI", lat: 42.5223, lng: -83.3055, timezone: "America/Detroit" },
  { id: 165, geonameId: 4994871, value: "Grand Rapids", country: "USA", state: "MI", lat: 42.9634, lng: -85.6681, timezone: "America/Detroit" },
  { id: 166, geonameId: 4997500, value: "Lansing", country: "USA", state: "MI", lat: 42.7325, lng: -84.5555, timezone: "America/Detroit" },
  { id: 167, geonameId: 4996248, value: "Holland", country: "USA", state: "MI", lat: 42.7875, lng: -86.1089, timezone: "America/Detroit" },
  { id: 168, geonameId: 5007836, value: "Novi", country: "USA", state: "MI", lat: 42.4806, lng: -83.4755, timezone: "America/Detroit" },
  { id: 169, geonameId: 5006741, value: "Birmingham, MI", country: "USA", state: "MI", lat: 42.5445, lng: -83.2114, timezone: "America/Detroit" },
  { id: 170, geonameId: 5012521, value: "Troy", country: "USA", state: "MI", lat: 42.6056, lng: -83.1499, timezone: "America/Detroit" },

  // United States - Georgia (10+ locations)
  { id: 171, geonameId: 4180439, value: "Atlanta", country: "USA", state: "GA", lat: 33.7490, lng: -84.3880, timezone: "America/New_York" },
  { id: 172, geonameId: 4212732, value: "Sandy Springs", country: "USA", state: "GA", lat: 33.9243, lng: -84.3785, timezone: "America/New_York" },

  // Canada (20+ locations)
  { id: 173, geonameId: 6167865, value: "Toronto", country: "Canada", state: "ON", lat: 43.6532, lng: -79.3832, timezone: "America/Toronto" },
  { id: 174, geonameId: 6077243, value: "Montreal", country: "Canada", state: "QC", lat: 45.5017, lng: -73.5673, timezone: "America/Toronto" },
  { id: 175, geonameId: 6087844, value: "North York", country: "Canada", state: "ON", lat: 43.7615, lng: -79.4111, timezone: "America/Toronto" },
  { id: 176, geonameId: 6173331, value: "Vancouver", country: "Canada", state: "BC", lat: 49.2827, lng: -123.1207, timezone: "America/Vancouver" },
  { id: 177, geonameId: 6183235, value: "Winnipeg", country: "Canada", state: "MB", lat: 49.8951, lng: -97.1384, timezone: "America/Winnipeg" },

  // United Kingdom (15+ locations)
  { id: 178, geonameId: 2643743, value: "London", country: "UK", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  { id: 179, geonameId: 2643123, value: "Manchester", country: "UK", lat: 53.4808, lng: -2.2426, timezone: "Europe/London" },
  { id: 180, geonameId: 2647400, value: "Gateshead", country: "UK", lat: 54.9526, lng: -1.6038, timezone: "Europe/London" },
  { id: 181, geonameId: 2655603, value: "Birmingham, UK", country: "UK", lat: 52.4862, lng: -1.8904, timezone: "Europe/London" },
  { id: 182, geonameId: 2644688, value: "Leeds", country: "UK", lat: 53.8008, lng: -1.5491, timezone: "Europe/London" },

  // Additional locations would continue here...
];

export default locations;