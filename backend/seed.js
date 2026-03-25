require('dotenv').config();
const mongoose = require('mongoose');
const Dish = require('./models/Dish');

const img = (q) => `https://images.unsplash.com/photo-${q}?w=400&q=70`;

const MENU_ITEMS = [
  // THALI
  { id: 't1', name: 'Regular Thali', description: 'Dal Fry, Mix Veg, 4 Butter Roti, Rice, Salad', price: 149, rating: 4.7, image: img('1626776876729-bab4369a5a54'), tags: ['thali'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 't2', name: 'Special Thali', description: 'Dal Fry, Matar Paneer, Kadhai Paneer, 4 Butter Roti, Rice, Papad, Salad, Dessert', price: 229, rating: 4.8, image: img('1546833999-b9f581a1996d'), tags: ['thali'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 't3', name: 'Swad Sadan Special Thali', description: 'Dal Handi, Mix Veg, Kadhai Paneer, Mushroom Masala, 4 Butter Roti, Rice, Salad, Dessert', price: 339, rating: 4.9, image: img('1585937421612-70a008356fbe'), tags: ['thali'], isPopular: true, isRecommended: true, isVeg: true },

  // STARTERS
  { id: 'st1', name: 'Honey Chilli Potato', description: 'Crispy fried potatoes tossed in sweet honey chilli sauce', price: 129, rating: 4.7, image: img('1626776876729-bab4369a5a54'), tags: ['starters'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'st2', name: 'Chilli Paneer', description: 'Paneer cubes tossed with bell peppers in spicy chilli sauce. Dry/Gravy', price: 169, rating: 4.8, image: img('1565557623262-b51c2513a641'), tags: ['starters'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'st3', name: 'Paneer 65', description: 'Spicy deep-fried paneer marinated with southern spices', price: 169, rating: 4.7, image: img('1631452180519-c014fe946bc0'), tags: ['starters'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'st4', name: 'Mushroom Chilli', description: 'Crunchy mushrooms tossed in spicy Indo-Chinese chilli sauce', price: 149, rating: 4.6, image: img('1504674900247-0877df9cc836'), tags: ['starters'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'st5', name: 'Hot Garlic Paneer', description: 'Paneer cubes sautéed with garlic, peppers and chilli flakes', price: 149, rating: 4.7, image: img('1618449840665-9ed506d73a34'), tags: ['starters'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'st6', name: 'Veg Manchurian', description: 'Deep-fried veg balls in tangy manchurian gravy. Dry/Gravy', price: 169, rating: 4.6, image: img('1603133872878-684f208fb84b'), tags: ['starters'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'st7', name: 'Corn Salt & Pepper', description: 'Golden fried corn kernels seasoned with salt, pepper and herbs', price: 149, rating: 4.5, image: img('1512058564366-18510be2db19'), tags: ['starters'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'st8', name: 'Paneer Hongkong', description: 'Crispy paneer tossed in spicy Hongkong-style sauce with veggies', price: 149, rating: 4.6, image: img('1569050467447-ce54b3bbc37d'), tags: ['starters'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'st9', name: 'Lemon Paneer', description: 'Tangy lemon-flavoured paneer bites with a zesty kick', price: 169, rating: 4.5, image: img('1547592180-85f173990554'), tags: ['starters'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'st10', name: 'Veg Crispy Corn', description: 'Crispy fried corn tossed with spices and scallions', price: 129, rating: 4.4, image: img('1555939594-58d7cb561ad1'), tags: ['starters'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'st11', name: 'Chilli Potato', description: 'Crispy potato fingers in a spicy chilli garlic sauce', price: 129, rating: 4.6, image: img('1568901346375-23c9450c58cd'), tags: ['starters'], isPopular: false, isRecommended: false, isVeg: true },

  // MAIN COURSE
  { id: 'mc1', name: 'Paneer Butter Masala', description: 'Soft paneer in rich tomato-butter-cream gravy', price: 209, rating: 4.9, image: img('1631452180519-c014fe946bc0'), tags: ['maincourse'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'mc2', name: 'Kadhai Paneer', description: 'Paneer & bell peppers in spicy kadhai masala', price: 209, rating: 4.8, image: img('1565557623262-b51c2513a641'), tags: ['maincourse'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'mc3', name: 'Paneer Lababdar', description: 'Paneer in a rich, creamy tomato-cashew gravy', price: 209, rating: 4.7, image: img('1618449840665-9ed506d73a34'), tags: ['maincourse'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'mc4', name: 'Paneer Shahi', description: 'Royal paneer curry with cream, nuts and saffron', price: 199, rating: 4.7, image: img('1585937421612-70a008356fbe'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc5', name: 'Paneer Palak', description: 'Fresh spinach gravy with soft paneer cubes', price: 199, rating: 4.6, image: img('1547592180-85f173990554'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc6', name: 'Paneer Malai Methi', description: 'Creamy fenugreek-flavoured paneer curry', price: 209, rating: 4.7, image: img('1546833999-b9f581a1996d'), tags: ['maincourse'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'mc7', name: 'Matar Paneer', description: 'Green peas and paneer in onion-tomato gravy', price: 179, rating: 4.6, image: img('1518779578993-ec3579fee39f'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc8', name: 'Mushroom Masala', description: 'Button mushrooms in a rich spiced onion-tomato gravy', price: 199, rating: 4.7, image: img('1504674900247-0877df9cc836'), tags: ['maincourse'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'mc9', name: 'Mushroom Kadhai', description: 'Mushrooms cooked kadhai-style with peppers and spices', price: 199, rating: 4.6, image: img('1555939594-58d7cb561ad1'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc10', name: 'Mix Veg', description: 'Seasonal mixed vegetables in a classic Indian gravy', price: 149, rating: 4.4, image: img('1574653853027-5382a3d23a15'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc11', name: 'Chana Masala', description: 'Chickpeas simmered in tangy spiced tomato gravy', price: 159, rating: 4.5, image: img('1596797038530-2c107229654b'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc12', name: 'Veg Kofta', description: 'Soft vegetable dumplings in rich creamy gravy', price: 179, rating: 4.6, image: img('1645177628172-a94c1f96debb'), tags: ['maincourse'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'mc13', name: 'Malai Kofta', description: 'Paneer-potato kofta in rich cashew-cream gravy', price: 249, rating: 4.8, image: img('1585937421612-70a008356fbe'), tags: ['maincourse'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'mc14', name: 'Soya Chap Masala', description: 'Soya chap pieces in a spiced buttery masala gravy', price: 199, rating: 4.5, image: img('1569050467447-ce54b3bbc37d'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc15', name: 'Jeera Aloo', description: 'Potatoes tempered with cumin seeds and green chillies', price: 119, rating: 4.3, image: img('1574071318508-1cdbab80d002'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc16', name: 'Matar Methi Malai', description: 'Peas and fenugreek in a creamy white gravy', price: 199, rating: 4.6, image: img('1556761223-4c4282c73f77'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mc17', name: 'Paneer Mushroom', description: 'Paneer and mushrooms together in a spiced gravy', price: 219, rating: 4.7, image: img('1473093295043-cdd812d0e601'), tags: ['maincourse'], isPopular: false, isRecommended: false, isVeg: true },

  // DAL
  { id: 'd1', name: 'Dal Makhani', description: 'Black lentils slow-cooked with butter, cream and spices', price: 199, rating: 4.9, image: img('1546833999-b9f581a1996d'), tags: ['dal'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'd2', name: 'Dal Tadka', description: 'Yellow lentils tempered with ghee, cumin and garlic', price: 99, rating: 4.7, image: img('1547592180-85f173990554'), tags: ['dal'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'd3', name: 'Dal Maharani', description: 'Royal mixed lentils with cream and rich buttery tadka', price: 179, rating: 4.8, image: img('1585937421612-70a008356fbe'), tags: ['dal'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'd4', name: 'Dal Handi', description: 'Slow-cooked dal in traditional clay pot for rustic flavour', price: 149, rating: 4.7, image: img('1631452180519-c014fe946bc0'), tags: ['dal'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'd5', name: 'Dal Fry', description: 'Toor dal fried with onion, tomato, garlic and coriander', price: 89, rating: 4.5, image: img('1555939594-58d7cb561ad1'), tags: ['dal'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'd6', name: 'Dal Punjabi', description: 'Robust Punjabi-style mixed dal with ghee tadka', price: 159, rating: 4.6, image: img('1518779578993-ec3579fee39f'), tags: ['dal'], isPopular: false, isRecommended: false, isVeg: true },

  // BREADS
  { id: 'b1', name: 'Butter Roti', description: 'Fresh whole wheat roti with butter', price: 15, rating: 4.5, image: img('1601050690597-df0568f70950'), tags: ['breads'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'b2', name: 'Butter Naan', description: 'Soft tandoori naan with butter', price: 40, rating: 4.7, image: img('1664462574881-7c4bb0e40b45'), tags: ['breads'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'b3', name: 'Garlic Naan', description: 'Naan topped with garlic, coriander and butter', price: 60, rating: 4.8, image: img('1574071318508-1cdbab80d002'), tags: ['breads'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'b4', name: 'Chur Chur Naan', description: 'Crispy layered naan crumbled for crunchy texture', price: 60, rating: 4.8, image: img('1555507036-ab1f4038808a'), tags: ['breads'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'b5', name: 'Laccha Paratha', description: 'Multi-layered flaky crispy paratha', price: 40, rating: 4.6, image: img('1565557623262-b51c2513a641'), tags: ['breads'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'b6', name: 'Stuffed Naan', description: 'Naan stuffed with spiced paneer & potato filling', price: 50, rating: 4.5, image: img('1585557041303-4d25a5a3e6fc'), tags: ['breads'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'b7', name: 'Missi Roti', description: 'Besan and wheat flour roti with fresh herbs', price: 30, rating: 4.4, image: img('1569050467447-ce54b3bbc37d'), tags: ['breads'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'b8', name: 'Paneer Paratha', description: 'Whole wheat paratha stuffed with spiced paneer', price: 70, rating: 4.7, image: img('1569050467447-ce54b3bbc37d'), tags: ['breads'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'b9', name: 'Stuffed Kulcha', description: 'Kulcha stuffed with spiced potato-paneer blend', price: 80, rating: 4.6, image: img('1585557041303-4d25a5a3e6fc'), tags: ['breads'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'b10', name: 'Aloo Paratha', description: 'Whole wheat paratha stuffed with spiced potato', price: 40, rating: 4.5, image: img('1565557623262-b51c2513a641'), tags: ['breads'], isPopular: false, isRecommended: false, isVeg: true },

  // RICE
  { id: 'r1', name: 'Veg Biryani', description: 'Fragrant basmati layered with veggies and saffron', price: 179, rating: 4.8, image: img('1563379091339-03b21ab4a4f8'), tags: ['rice'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'r2', name: 'Veg Dum Biryani', description: 'Slow dum-cooked biryani sealed for max flavour', price: 209, rating: 4.9, image: img('1596797038530-2c107229654b'), tags: ['rice'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'r3', name: 'Jeera Rice', description: 'Basmati rice tempered with cumin and ghee', price: 79, rating: 4.5, image: img('1574653853027-5382a3d23a15'), tags: ['rice'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'r4', name: 'Kashmiri Pulav', description: 'Sweet aromatic rice with dry fruits and saffron', price: 129, rating: 4.7, image: img('1645177628172-a94c1f96debb'), tags: ['rice'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'r5', name: 'Matar Pulav', description: 'Pulav cooked with green peas and whole spices', price: 99, rating: 4.4, image: img('1574653853027-5382a3d23a15'), tags: ['rice'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'r6', name: 'Veg Pulav', description: 'Fragrant rice cooked with seasonal vegetables', price: 109, rating: 4.5, image: img('1563379091339-03b21ab4a4f8'), tags: ['rice'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'r7', name: 'Steam Rice', description: 'Plain steamed basmati rice', price: 89, rating: 4.2, image: img('1516901408929-dbc0f3e3e7c1'), tags: ['rice'], isPopular: false, isRecommended: false, isVeg: true },

  // SALAD & RAITA
  { id: 's1', name: 'Green Salad', description: 'Fresh garden greens with lemon dressing', price: 59, rating: 4.3, image: img('1512621776951-a57141f2eefd'), tags: ['salad'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 's2', name: 'Masala Kachumber Salad', description: 'Onion, tomato, cucumber with chaat masala and lemon', price: 69, rating: 4.5, image: img('1512621776951-a57141f2eefd'), tags: ['salad'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 's3', name: 'Mix Raita', description: 'Creamy yoghurt with mixed veggies and cumin', price: 79, rating: 4.4, image: img('1567188040759-fb8a883dc6d8'), tags: ['salad'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 's4', name: 'Fruit Raita', description: 'Sweet raita with seasonal fruits and cardamom', price: 99, rating: 4.6, image: img('1490474504059-bf2db5ab2348'), tags: ['salad'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 's5', name: 'Pineapple Raita', description: 'Tangy-sweet raita with crushed pineapple chunks', price: 89, rating: 4.5, image: img('1490474504059-bf2db5ab2348'), tags: ['salad'], isPopular: false, isRecommended: false, isVeg: true },

  // SOUTH INDIAN
  { id: 'si1', name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling, sambar & chutney', price: 69, rating: 4.7, image: img('1589301760014-d929f3979dbc'), tags: ['southindian'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'si2', name: 'Paneer Masala Dosa', description: 'Extra large dosa with paneer bhurji filling', price: 109, rating: 4.8, image: img('1604908176997-125f25cc6f3d'), tags: ['southindian'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'si3', name: 'Plain Dosa', description: 'Thin crispy dosa served with sambar & chutney', price: 59, rating: 4.5, image: img('1589301760014-d929f3979dbc'), tags: ['southindian'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'si4', name: 'Onion Masala Dosa', description: 'Dosa with onion & potato masala filling', price: 89, rating: 4.6, image: img('1604908176997-125f25cc6f3d'), tags: ['southindian'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'si5', name: 'Idli Sambar', description: 'Soft steamed rice cakes with sambar and chutney', price: 39, rating: 4.5, image: img('1630383249896-424e482df921'), tags: ['southindian'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'si6', name: 'Paneer Uttapam', description: 'Thick rice pancake topped with paneer & onions', price: 119, rating: 4.6, image: img('1567337710282-00832b415979'), tags: ['southindian'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'si7', name: 'Pav Bhaji', description: 'Spiced mashed veggies with buttered pav buns', price: 59, rating: 4.8, image: img('1606491956689-2ea866880c84'), tags: ['southindian'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'si8', name: 'Masala Pav Bhaji', description: 'Extra spicy pav bhaji loaded with cheese', price: 79, rating: 4.7, image: img('1606491955644-0c4b84c5f22c'), tags: ['southindian'], isPopular: false, isRecommended: false, isVeg: true },

  // SOUPS
  { id: 'sp1', name: 'Tomato Soup', description: 'Classic creamy tomato soup with herbs', price: 89, rating: 4.5, image: img('1547592180-85f173990554'), tags: ['soups'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sp2', name: 'Veg Manchow Soup', description: 'Spicy Indo-Chinese soup topped with fried noodles', price: 89, rating: 4.6, image: img('1603133872878-684f208fb84b'), tags: ['soups'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'sp3', name: 'Hot & Sour Soup', description: 'Tangy and spicy soup with vegetables', price: 89, rating: 4.5, image: img('1555939594-58d7cb561ad1'), tags: ['soups'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sp4', name: 'Sweet Corn Soup', description: 'Creamy sweet corn soup with veggies', price: 89, rating: 4.4, image: img('1518779578993-ec3579fee39f'), tags: ['soups'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sp5', name: 'Lemon Coriander Soup', description: 'Fresh and light lemon-coriander flavoured clear soup', price: 99, rating: 4.6, image: img('1574653853027-5382a3d23a15'), tags: ['soups'], isPopular: false, isRecommended: true, isVeg: true },

  // NOODLES
  { id: 'n1', name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy sauce', price: 129, rating: 4.5, image: img('1612929633738-8fe44f7ec841'), tags: ['noodles'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'n2', name: 'Schezwan Noodles', description: 'Spicy schezwan-sauced stir-fried noodles', price: 129, rating: 4.7, image: img('1612929633738-8fe44f7ec841'), tags: ['noodles'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'n3', name: 'Chilli Garlic Noodles', description: 'Noodles tossed in fiery chilli garlic sauce', price: 129, rating: 4.6, image: img('1585664811087-47f65abbad64'), tags: ['noodles'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'n4', name: 'Singapore Noodles', description: 'Curried noodles with veggies, Singapore style', price: 149, rating: 4.6, image: img('1512058564366-18510be2db19'), tags: ['noodles'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'n5', name: 'Pan Fry Noodles', description: 'Crispy pan-fried noodles with vegetables', price: 129, rating: 4.5, image: img('1603133872878-684f208fb84b'), tags: ['noodles'], isPopular: false, isRecommended: false, isVeg: true },

  // CHINESE RICE
  { id: 'ch1', name: 'Veg Fried Rice', description: 'Wok-tossed rice with fresh veggies and soy sauce', price: 149, rating: 4.6, image: img('1603133872878-684f208fb84b'), tags: ['chinese'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'ch2', name: 'Schezwan Rice', description: 'Fiery schezwan-sauced fried rice', price: 149, rating: 4.7, image: img('1512058564366-18510be2db19'), tags: ['chinese'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'ch3', name: 'Veg Paneer Fried Rice', description: 'Fried rice loaded with paneer and veggies', price: 159, rating: 4.7, image: img('1546833998-877b37c2e5c6'), tags: ['chinese'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'ch4', name: 'Singapore Rice', description: 'Spiced curried fried rice, Singapore style', price: 179, rating: 4.6, image: img('1563379091339-03b21ab4a4f8'), tags: ['chinese'], isPopular: false, isRecommended: false, isVeg: true },

  // ROLLS
  { id: 'ro1', name: 'Veg Spring Roll', description: 'Crispy rolls filled with stir-fried vegetables', price: 119, rating: 4.5, image: img('1562802378-063ec186a863'), tags: ['chinese'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'ro2', name: 'Paneer Roll', description: 'Flaky roll with spiced paneer tikka and chutney', price: 149, rating: 4.7, image: img('1504674900247-0877df9cc836'), tags: ['chinese'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'ro3', name: 'Cheese Corn Roll', description: 'Crispy roll with melted cheese and sweet corn', price: 149, rating: 4.6, image: img('1530469912745-a215c6b256ea'), tags: ['chinese'], isPopular: false, isRecommended: false, isVeg: true },

  // MOMOS
  { id: 'm1', name: 'Veg Momo (Steam)', description: 'Soft steamed momos with Indian-spiced veg filling', price: 79, rating: 4.6, image: img('1534422298391-e4f8c172dddb'), tags: ['momos'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'm2', name: 'Paneer Corn Momo (Steam)', description: 'Steamed dumplings with creamy paneer & corn', price: 99, rating: 4.7, image: img('1625398407796-82650a8c135f'), tags: ['momos'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'm3', name: 'Peri Peri Momo', description: 'Steamed momos tossed in fiery peri-peri sauce', price: 109, rating: 4.8, image: img('1609501676725-7186f017a4b7'), tags: ['momos'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'm4', name: 'Tandoori Momo', description: 'Momos grilled with tandoori spices for charred finish', price: 149, rating: 4.7, image: img('1534422298391-e4f8c172dddb'), tags: ['momos'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'm5', name: 'Kurkure Momo', description: 'Crispy fried momos with crunchy coating', price: 169, rating: 4.8, image: img('1625398407796-82650a8c135f'), tags: ['momos'], isPopular: true, isRecommended: true, isVeg: true },

  // PIZZA
  { id: 'p1', name: 'Veg Farmhouse Pizza', description: 'Onion, tomato, capsicum, mushroom on tangy base', price: 210, rating: 4.6, image: img('1565299624946-b28f40a0ae38'), tags: ['pizza'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'p2', name: 'Makhani Paneer Pizza', description: 'Paneer on creamy makhani sauce base', price: 210, rating: 4.8, image: img('1574071318508-1cdbab80d002'), tags: ['pizza'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'p3', name: 'Spicy Mix Paneer Pizza', description: 'Loaded with paneer, peppers and cheese burst', price: 260, rating: 4.8, image: img('1571407970349-bc81e7e96d47'), tags: ['pizza'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'p4', name: 'SS Special Paneer Pizza', description: 'All toppings, cheese burst — our signature!', price: 280, rating: 4.9, image: img('1513104890138-7c749659a591'), tags: ['pizza'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'p5', name: 'Heavenly Harvest Pizza', description: 'Onion, capsicum, corn, paneer with cheese burst', price: 260, rating: 4.7, image: img('1520201163981-8cc95007dd2a'), tags: ['pizza'], isPopular: false, isRecommended: false, isVeg: true },

  // PASTA & MAGGI
  { id: 'pa1', name: 'Pink Sauce Pasta', description: 'Tomato + white sauce blend — smooth and creamy', price: 129, rating: 4.7, image: img('1621996346565-e3dbc646d9a9'), tags: ['pasta'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'pa2', name: 'White Sauce Pasta', description: 'Pasta in velvety béchamel with herbs and cheese', price: 119, rating: 4.6, image: img('1556761223-4c4282c73f77'), tags: ['pasta'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'pa3', name: 'Tandoori Pasta', description: 'Penne in tandoori-spiced sauce — Indian fusion', price: 159, rating: 4.7, image: img('1473093295043-cdd812d0e601'), tags: ['pasta'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'pa4', name: 'Red Sauce Pasta', description: 'Classic pasta in rich tomato basil sauce', price: 99, rating: 4.5, image: img('1621996346565-e3dbc646d9a9'), tags: ['pasta'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mg1', name: 'Cheese Maggi', description: 'Maggi with generous melted cheese topping', price: 109, rating: 4.7, image: img('1612929633738-8fe44f7ec841'), tags: ['pasta'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'mg2', name: 'Tandoori Maggi', description: 'Maggi with tandoori masala and veggies', price: 89, rating: 4.6, image: img('1585664811087-47f65abbad64'), tags: ['pasta'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mg3', name: 'Veg Maggi', description: 'Maggi with fresh seasonal vegetables', price: 69, rating: 4.4, image: img('1547592180-85f173990554'), tags: ['pasta'], isPopular: false, isRecommended: false, isVeg: true },

  // BURGERS
  { id: 'bg1', name: 'Aloo Tikki Burger', description: 'Crispy aloo tikki patty with fresh veggies', price: 49, rating: 4.3, image: img('1568901346375-23c9450c58cd'), tags: ['burgers'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'bg2', name: 'Cheese Burger', description: 'Juicy patty with melted cheese and veggies', price: 79, rating: 4.5, image: img('1568901346375-23c9450c58cd'), tags: ['burgers'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'bg3', name: 'Tandoori Burger', description: 'Tandoori-spiced patty with onion and sauce', price: 89, rating: 4.6, image: img('1530469912745-a215c6b256ea'), tags: ['burgers'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'bg4', name: 'Peri-Peri Burger', description: 'Burger with fiery peri-peri sauce and veggies', price: 99, rating: 4.6, image: img('1568901346375-23c9450c58cd'), tags: ['burgers'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'bg5', name: 'Paneer Burger', description: 'Grilled paneer patty with fresh toppings', price: 79, rating: 4.5, image: img('1530469912745-a215c6b256ea'), tags: ['burgers'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'bg6', name: 'Loaded Cheese Burger', description: 'Double cheese, loaded toppings, signature sauce', price: 149, rating: 4.8, image: img('1568901346375-23c9450c58cd'), tags: ['burgers'], isPopular: true, isRecommended: true, isVeg: true },

  // SANDWICH
  { id: 'sw1', name: 'Veg Sandwich', description: 'Classic grilled sandwich with fresh veggies', price: 79, rating: 4.4, image: img('1504674900247-0877df9cc836'), tags: ['sandwich'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sw2', name: 'Paneer Sandwich', description: 'Grilled sandwich with spiced paneer filling', price: 199, rating: 4.6, image: img('1530469912745-a215c6b256ea'), tags: ['sandwich'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'sw3', name: 'Cheese Sandwich', description: 'Toasted sandwich loaded with melted cheese', price: 99, rating: 4.5, image: img('1528735602780-2552fd46c7af'), tags: ['sandwich'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sw4', name: 'Mexican Sandwich', description: 'Spicy Mexican-style sandwich with jalapeños', price: 99, rating: 4.5, image: img('1504674900247-0877df9cc836'), tags: ['sandwich'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sw5', name: 'Loaded Cheese Sandwich', description: 'Triple cheese grilled with gourmet toppings', price: 129, rating: 4.7, image: img('1528735602780-2552fd46c7af'), tags: ['sandwich'], isPopular: true, isRecommended: true, isVeg: true },

  // FRENCH FRIES
  { id: 'ff1', name: 'Salted Fry', description: 'Classic golden crispy salted french fries', price: 79, rating: 4.3, image: img('1518779578993-ec3579fee39f'), tags: ['fries'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'ff2', name: 'Peri-Peri Fry', description: 'Fries seasoned with spicy peri-peri masala', price: 99, rating: 4.5, image: img('1518779578993-ec3579fee39f'), tags: ['fries'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'ff3', name: 'Cheese Fry', description: 'Fries smothered in melted cheese sauce', price: 119, rating: 4.7, image: img('1518779578993-ec3579fee39f'), tags: ['fries'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'ff4', name: 'Tandoori Fry', description: 'Fries tossed in tandoori spice blend', price: 139, rating: 4.6, image: img('1518779578993-ec3579fee39f'), tags: ['fries'], isPopular: false, isRecommended: false, isVeg: true },

  // SHAKES
  { id: 'sh1', name: 'Chocolate Shake', description: 'Rich chocolate milkshake with ice cream', price: 99, rating: 4.6, image: img('1461023058943-07fcbe16d735'), tags: ['shakes'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'sh2', name: 'Oreo Shake', description: 'Creamy Oreo cookie milkshake', price: 99, rating: 4.7, image: img('1461023058943-07fcbe16d735'), tags: ['shakes'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'sh3', name: 'Kit-Kat Shake', description: 'Kit-Kat blended milkshake with chocolate', price: 129, rating: 4.7, image: img('1461023058943-07fcbe16d735'), tags: ['shakes'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'sh4', name: 'Strawberry Shake', description: 'Fresh strawberry milkshake blended smooth', price: 119, rating: 4.5, image: img('1571091718767-18b5b1457add'), tags: ['shakes'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'sh5', name: 'Mango Shake', description: 'Sweet mango pulp milkshake', price: 89, rating: 4.6, image: img('1571091718767-18b5b1457add'), tags: ['shakes'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'sh6', name: 'Cold Coffee', description: 'Chilled blended coffee with ice cream', price: 89, rating: 4.7, image: img('1461023058943-07fcbe16d735'), tags: ['shakes'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'sh7', name: 'Brownie Shake', description: 'Decadent brownie chunks blended with ice cream', price: 129, rating: 4.8, image: img('1461023058943-07fcbe16d735'), tags: ['shakes'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'sh8', name: 'Black Current Shake', description: 'Tangy-sweet black current milkshake', price: 129, rating: 4.5, image: img('1571091718767-18b5b1457add'), tags: ['shakes'], isPopular: false, isRecommended: false, isVeg: true },

  // MOJITO
  { id: 'mj1', name: 'Virgin Mojito', description: 'Classic lime and mint refresher', price: 59, rating: 4.5, image: img('1490474504059-bf2db5ab2348'), tags: ['mojito'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'mj2', name: 'Mint Mojito', description: 'Extra minty fresh mojito', price: 69, rating: 4.5, image: img('1490474504059-bf2db5ab2348'), tags: ['mojito'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'mj3', name: 'Green Apple Mojito', description: 'Tangy green apple flavoured mojito', price: 79, rating: 4.6, image: img('1490474504059-bf2db5ab2348'), tags: ['mojito'], isPopular: false, isRecommended: true, isVeg: true },
  { id: 'mj4', name: 'Shirley Temple Mojito', description: 'Sweet grenadine mojito with lime and soda', price: 139, rating: 4.7, image: img('1490474504059-bf2db5ab2348'), tags: ['mojito'], isPopular: true, isRecommended: true, isVeg: true },
  { id: 'mj5', name: 'Orange Candy Mojito', description: 'Nostalgic orange candy flavoured chilled mojito', price: 99, rating: 4.6, image: img('1490474504059-bf2db5ab2348'), tags: ['mojito'], isPopular: true, isRecommended: false, isVeg: true },
  { id: 'mj6', name: 'Fruit Punch Mojito', description: 'Mixed fruit punch with lime & soda', price: 119, rating: 4.5, image: img('1490474504059-bf2db5ab2348'), tags: ['mojito'], isPopular: false, isRecommended: false, isVeg: true },

  // GARLIC BREAD
  { id: 'gb1', name: 'Garlic Bread', description: 'Crispy garlic bread with butter and herbs', price: 79, rating: 4.4, image: img('1574071318508-1cdbab80d002'), tags: ['sandwich'], isPopular: false, isRecommended: false, isVeg: true },
  { id: 'gb2', name: 'Cheese Garlic Bread', description: 'Garlic bread loaded with melted cheese', price: 119, rating: 4.7, image: img('1574071318508-1cdbab80d002'), tags: ['sandwich'], isPopular: true, isRecommended: true, isVeg: true },

  // SWEET LASSI
  { id: 'dr1', name: 'Sweet Lassi', description: 'Thick yoghurt with rose water and cardamom', price: 80, rating: 4.7, image: img('1571091718767-18b5b1457add'), tags: ['shakes'], isPopular: true, isRecommended: false, isVeg: true },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Starting Menu Seeding...');
    await Dish.deleteMany({});
    
    // Convert object data to mongo schema format (dropping local IDs)
    const dishes = MENU_ITEMS.map(item => ({
      name: item.name,
      description: item.description,
      price: item.price,
      rating: item.rating,
      image: item.image,
      tags: item.tags,
      isPopular: item.isPopular,
      isRecommended: item.isRecommended,
      isVeg: item.isVeg
    }));

    await Dish.insertMany(dishes);
    console.log(`Successfully migrated ${dishes.length} menu items into MongoDB!`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
