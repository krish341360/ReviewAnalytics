from flask import Flask
from flask_cors import CORS
from routes.analyze import analyze_bp
from routes.compare import compare_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(analyze_bp)
app.register_blueprint(compare_bp)

if __name__ == "__main__":
    app.run(debug=True)