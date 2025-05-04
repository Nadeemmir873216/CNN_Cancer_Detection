import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

# Load the trained model
model = load_model('my_cnn_model.h5')

# Path to the image you want to predict
image_path = '0186.jpg'

def predict(image_path):
    # Load and preprocess the image
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=(150, 150))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, axis=0)  # Shape becomes (1, 150, 150, 3)
    img_array = img_array / 255.0  

    # Get prediction (returns a value between 0 and 1)
    prediction = model.predict(img_array)[0][0]

    # Convert to class label
    class_label = 1 if prediction > 0.5 else 0
    confidence = prediction if class_label == 1 else 1 - prediction

    return class_label, confidence

# Predict and print result
label, confidence = predict(image_path)
class_names = {0: "benign", 1: "malignant"}
print(f"Prediction: {class_names[label]} ({confidence*100:.2f}% confidence)")
