#!/bin/bash

echo "🚀 Setting up TEFA DEX..."
echo ""

# Clone the repo
echo "📦 Cloning repository..."
git clone https://github.com/GeraldNdlovu/tefa-dex.git
cd tefa-dex

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..

# Create .env file
echo ""
echo "🔧 Creating .env file..."
cat > .env << 'ENV'
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_key
ENV

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your private key to .env file"
echo "2. Run: cd frontend && npm run dev"
echo "3. Open http://localhost:5173"
