from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Transaction model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'category': self.category
        }

# Create the database tables (run only once or if needed)
with app.app_context():
    db.create_all()

# Route: Get all transactions
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([t.to_dict() for t in transactions])

# Route: Add a new transaction
@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    try:
        new_transaction = Transaction(
            description=data['description'],
            amount=data['amount'],
            category=data.get('category', 'Other')  # Default: 'Other'
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction added successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Main entry point
if __name__ == '__main__':
    app.run(debug=True)
