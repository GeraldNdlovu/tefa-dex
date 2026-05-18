import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import requests
import json
from datetime import datetime, timedelta
import time

class TEFAAIAgent:
    def __init__(self, rpc_url, webhook_url=None):
        self.rpc_url = rpc_url
        self.webhook_url = webhook_url
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.historical_data = []
        
    def fetch_pool_data(self, pool_address):
        """Fetch on-chain data for ML analysis"""
        # Query subgraph or direct RPC
        return {
            'swap_volume_1h': self.get_volume(pool_address, 3600),
            'swap_volume_24h': self.get_volume(pool_address, 86400),
            'unique_swappers_1h': self.get_unique_swappers(pool_address, 3600),
            'avg_swap_size': self.get_avg_swap_size(pool_address),
            'price_volatility': self.get_price_volatility(pool_address),
            'lp_removal_rate': self.get_lp_removal_rate(pool_address),
            'flash_loan_count': self.get_flash_loan_count(pool_address),
            'sandwich_attempts': self.get_sandwich_count(pool_address),
            'total_value_locked': self.get_tvl(pool_address),
            'lp_concentration': self.get_lp_concentration(pool_address),
        }
    
    def train_model(self, historical_data):
        """Train AI to recognize normal patterns"""
        df = pd.DataFrame(historical_data)
        features = ['swap_volume_1h', 'unique_swappers_1h', 'avg_swap_size', 
                   'price_volatility', 'lp_removal_rate']
        
        X = df[features].fillna(0)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_trained = True
        print("🤖 AI Model trained on historical data")
    
    def detect_anomalies(self, current_data):
        """Detect anomalous patterns"""
        if not self.is_trained:
            return []
        
        features = ['swap_volume_1h', 'unique_swappers_1h', 'avg_swap_size', 
                   'price_volatility', 'lp_removal_rate']
        
        X_current = np.array([[current_data[f] for f in features]])
        X_scaled = self.scaler.transform(X_current)
        
        prediction = self.model.predict(X_scaled)[0]
        anomaly_score = self.model.score_samples(X_scaled)[0]
        
        if prediction == -1:  # Anomaly detected
            return [{
                'type': 'ANOMALOUS_PATTERN',
                'severity': 'HIGH' if anomaly_score < -0.3 else 'MEDIUM',
                'details': f'Unusual activity detected (score: {anomaly_score:.2f})',
                'data': current_data
            }]
        return []
    
    def predict_attack(self, pool_address):
        """Predict potential attacks before they happen"""
        data = self.fetch_pool_data(pool_address)
        
        # Heuristic rules
        alerts = []
        
        # Attack pattern 1: Rapid LP removal
        if data['lp_removal_rate'] > 0.3:  # 30% removed in 1h
            alerts.append({
                'type': 'LP_EXIT_RUSH',
                'severity': 'HIGH',
                'details': f"{data['lp_removal_rate']*100}% LP removed in last hour",
                'prediction': 'Potential rug pull or market panic'
            })
        
        # Attack pattern 2: Flash loan accumulation
        if data['flash_loan_count'] > 5:
            alerts.append({
                'type': 'FLASH_LOAN_PREP',
                'severity': 'HIGH',
                'details': f"{data['flash_loan_count']} flash loans in last hour",
                'prediction': 'Price manipulation attack likely incoming'
            })
        
        # Attack pattern 3: Sandwich attempts increasing
        if data['sandwich_attempts'] > 3:
            alerts.append({
                'type': 'MEV_ATTACK_WAVE',
                'severity': 'MEDIUM',
                'details': f"{data['sandwich_attempts']} sandwich attempts detected",
                'prediction': 'MEV bots targeting your DEX'
            })
        
        # Attack pattern 4: Abnormal price volatility
        if data['price_volatility'] > 0.15:  # 15% swings
            alerts.append({
                'type': 'PRICE_MANIPULATION',
                'severity': 'CRITICAL',
                'details': f"{data['price_volatility']*100}% price volatility",
                'prediction': 'Oracle manipulation or low liquidity attack'
            })
        
        return alerts
    
    def send_notification(self, alerts):
        """Send alerts to your admin panel"""
        for alert in alerts:
            print(f"\n🤖 AI PREDICTION: {alert['type']}")
            print(f"   Severity: {alert['severity']}")
            print(f"   Details: {alert['details']}")
            print(f"   Prediction: {alert.get('prediction', 'Monitor closely')}")
            
            if self.webhook_url:
                requests.post(self.webhook_url, json={
                    'ai_alert': alert,
                    'timestamp': datetime.now().isoformat()
                })
    
    def run_continuous_monitoring(self, pool_addresses, interval=60):
        """Main monitoring loop"""
        print("🤖 TEFA AI Agent Started")
        print(f"   Monitoring pools: {len(pool_addresses)}")
        
        # Collect initial training data (7 days)
        print("📊 Collecting training data for 7 days...")
        # In production, fetch from database subgraph
        
        while True:
            for pool in pool_addresses:
                # Detect anomalies
                data = self.fetch_pool_data(pool)
                anomalies = self.detect_anomalies(data)
                
                # Predict attacks
                predictions = self.predict_attack(pool)
                
                # Send combined alerts
                all_alerts = anomalies + predictions
                if all_alerts:
                    self.send_notification(all_alerts)
            
            time.sleep(interval)

if __name__ == "__main__":
    agent = TEFAAIAgent(
        rpc_url="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
        webhook_url="https://discord.com/api/webhooks/YOUR_WEBHOOK"
    )
    agent.run_continuous_monitoring(["0xPool1", "0xPool2"])
