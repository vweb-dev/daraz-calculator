# Daraz Calculator Pro

A comprehensive pricing calculator for Daraz marketplace sellers, optimized for Pakistani e-commerce businesses.

## 🚀 Features

- **Real-time Profit/Loss Display**: Shows profit/loss across all calculator sections
- **Bundle Calculator**: Optimize pricing for multi-piece sales
- **Competitor Analysis**: Compare pricing with market competitors
- **Website Mode**: Direct sales with COD and hosting cost calculations
- **Multi-language Support**: English and Urdu
- **Auto-save**: Draft saving with configurable intervals
- **Export/Import**: Backup and restore product data

## 🛠️ Optimizations Applied

### Code Compaction
- Combined `config.js` + `calculations.js` → `core.js`
- Combined `storage.js` + `notifications.js` → `utils.js`
- Reduced from 5 JS files to 3
- Minified CSS available as `app.min.css`

### Performance Enhancements
- Debounced input handling (300ms)
- Auto-save with 1-second intervals
- Efficient DOM manipulation
- GPU-accelerated animations

### User Experience
- Real-time profit/loss in bundle section
- Enhanced competitor analysis with "If Match" profit display
- Toast notifications instead of alerts
- Mobile-responsive design

## 🏃‍♂️ Running the Application

### Option 1: Node.js Server (Recommended)
```bash
node server.js
```
Then open http://localhost:8000

### Option 2: Python Server
```bash
python -m http.server 8000
```
Then open http://localhost:8000

## 📁 Project Structure

```
daraz-calculator/
├── index.html          # Main calculator interface
├── admin.html          # Admin settings panel
├── saved.html          # Saved products management
├── server.js           # Node.js development server
├── assets/
│   ├── css/
│   │   ├── app.css     # Main styles
│   │   └── app.min.css # Minified styles
│   └── js/
│       ├── core.js     # Config + calculations
│       ├── utils.js    # Storage + notifications
│       ├── public-app.js # Main app logic
│       ├── admin-app.js  # Admin panel logic
│       └── saved-app.js  # Saved products logic
└── README.md
```

## 🎯 Key Enhancements

1. **Real-time Profit/Loss Everywhere**: Added profit/loss display in bundle section and competitor analysis
2. **Bundle Section Improvements**: Shows current profit/loss alongside bundle scenarios
3. **Competitor Matching**: Added "If Match Competitor" profit calculation
4. **Code Optimization**: Reduced file count and improved maintainability
5. **Better Notifications**: Toast system with auto-dismiss and manual close

## 🔧 Configuration

Edit `assets/js/core.js` to modify:
- Default pricing assumptions
- Commission rates and fees
- Language translations
- Health thresholds

## 📊 Usage

1. Enter buying price and packaging cost
2. Set current selling price to see profit/loss
3. Use bundle calculator for multi-piece optimization
4. Compare with competitors
5. Save products for later reference

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 License

Powered by vweb.dev

---

**Version**: 1.1.0
**Last Optimized**: May 8, 2026