const express = require('express');
const { icons } = require('lucide');

const router = express.Router();

// Product catalog with categories
const PRODUCTS = [
  // Food & Beverages
  { id: 'coffee', name: 'Coffee', price: 2.50, icon: 'coffee', category: 'food' },
  { id: 'sandwich', name: 'Sandwich', price: 5.00, icon: 'sandwich', category: 'food' },
  { id: 'water', name: 'Water Bottle', price: 1.00, icon: 'droplets', category: 'food' },
  { id: 'snack', name: 'Snack Pack', price: 3.00, icon: 'popcorn', category: 'food' },
  { id: 'juice', name: 'Fresh Juice', price: 3.50, icon: 'bottle', category: 'food' },
  { id: 'salad', name: 'Salad Bowl', price: 6.00, icon: 'salad', category: 'food' },
  
  // Rwandan Local Foods
  { id: 'brochette', name: 'Brochette', price: 4.00, icon: 'chef-hat', category: 'rwandan' },
  { id: 'isombe', name: 'Isombe', price: 3.50, icon: 'leaf', category: 'rwandan' },
  { id: 'ubugari', name: 'Ubugari', price: 2.00, icon: 'rice', category: 'rwandan' },
  { id: 'sambaza', name: 'Sambaza (Fried)', price: 3.00, icon: 'fish', category: 'rwandan' },
  { id: 'akabenzi', name: 'Akabenzi (Pork)', price: 5.50, icon: 'bacon', category: 'rwandan' },
  { id: 'ikivuguto', name: 'Ikivuguto (Yogurt)', price: 1.50, icon: 'milk', category: 'rwandan' },
  { id: 'agatogo', name: 'Agatogo', price: 4.50, icon: 'pot', category: 'rwandan' },
  { id: 'urwagwa', name: 'Urwagwa (Banana Beer)', price: 2.50, icon: 'beer', category: 'rwandan' },
  
  // Snacks & Drinks
  { id: 'fanta', name: 'Fanta', price: 1.20, icon: 'wine', category: 'drinks' },
  { id: 'primus', name: 'Primus Beer', price: 2.00, icon: 'beer', category: 'drinks' },
  { id: 'mutzig', name: 'Mutzig Beer', price: 2.00, icon: 'beer', category: 'drinks' },
  { id: 'inyange-juice', name: 'Inyange Juice', price: 1.50, icon: 'bottle', category: 'drinks' },
  { id: 'chips', name: 'Chips', price: 2.50, icon: 'french-fries', category: 'food' },
  
  // Domain Registration Services
  { id: 'domain-com', name: '.com Domain', price: 12.00, icon: 'globe', category: 'domains' },
  { id: 'domain-net', name: '.net Domain', price: 11.00, icon: 'globe', category: 'domains' },
  { id: 'domain-org', name: '.org Domain', price: 10.00, icon: 'globe', category: 'domains' },
  { id: 'domain-io', name: '.io Domain', price: 35.00, icon: 'globe', category: 'domains' },
  { id: 'domain-dev', name: '.dev Domain', price: 15.00, icon: 'globe', category: 'domains' },
  { id: 'domain-app', name: '.app Domain', price: 18.00, icon: 'globe', category: 'domains' },
  { id: 'domain-ai', name: '.ai Domain', price: 80.00, icon: 'bot', category: 'domains' },
  { id: 'domain-xyz', name: '.xyz Domain', price: 8.00, icon: 'globe', category: 'domains' },
  { id: 'domain-co', name: '.co Domain', price: 25.00, icon: 'globe', category: 'domains' },
  { id: 'domain-rw', name: '.rw Domain', price: 20.00, icon: 'flag', category: 'domains' },
  
  // Digital Services
  { id: 'hosting-basic', name: 'Basic Hosting (1mo)', price: 5.00, icon: 'cloud', category: 'services' },
  { id: 'hosting-pro', name: 'Pro Hosting (1mo)', price: 15.00, icon: 'cloud', category: 'services' },
  { id: 'ssl-cert', name: 'SSL Certificate', price: 10.00, icon: 'lock', category: 'services' },
  { id: 'email-pro', name: 'Professional Email', price: 8.00, icon: 'mail', category: 'services' }
];

// Generate SVG icons using lucide
PRODUCTS.forEach(product => {
  if (icons[product.icon]) {
    product.iconSvg = icons[product.icon].toSvg({ width: 24, height: 24 });
  } else {
    product.iconSvg = '<svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="gray"/></svg>';
  }
});

router.get('/products', (req, res) => {
  res.json(PRODUCTS);
});

module.exports = { router, PRODUCTS };
