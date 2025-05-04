from flask import Flask, request, jsonify, render_template
import os
import numpy as np
from io import BytesIO
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

app = Flask(__name__, static_folder='static')

# Load your trained CNN model
model = load_model('my_cnn_model.h5')

# Class names
class_names = {0: "benign", 1: "malignant"}

@app.route('/')
def home():
    return render_template('index.html')

from io import BytesIO

@app.route('/predict_cancer', methods=['POST'])
def predict_cancer():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided.'}), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file.'}), 400

    try:
        # Read image and convert to a tensor
        img = tf.keras.preprocessing.image.load_img(BytesIO(file.read()), target_size=(150, 150))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, axis=0)  # Shape: (1, 150, 150, 3)
        img_array = img_array / 255.0

        prediction = model.predict(img_array)[0][0]
        class_label = 1 if prediction > 0.5 else 0
        confidence = prediction if class_label == 1 else 1 - prediction
        label_name = class_names[class_label]

        return jsonify({
            'label': label_name,
            'confidence': round(float(confidence), 4)
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({'error': 'Prediction could not be made'}), 500



if __name__ == '__main__':
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    app.run(debug=True)
