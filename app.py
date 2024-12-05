import streamlit as st
import pandas as pd
import joblib

# Load the trained pipeline
@st.cache_resource
def load_pipeline():
    return joblib.load('dynamic_pricing_pipeline.pkl')

# Function to get user inputs dynamically based on features
def get_user_inputs(features):
    inputs = {}
    for feature in features:
        if feature in categorical_features:
            selected_value = st.selectbox(f"Select {feature}", options=options_dict[feature])
            inputs[feature] = selected_value
        else:  # Numerical feature
            inputs[feature] = st.number_input(f"Enter {feature}", min_value=0.0, step=0.1, key=feature)
    return pd.DataFrame([inputs])

# Main Streamlit App
def main():
    st.title("Pricelytics")
    st.markdown("### Predict the Optimal Selling Price")
    st.write("Enter product details to calculate the most competitive and profitable price.")

    # Load pipeline
    pipeline = load_pipeline()
    
    # Define features (same as training)
    features = pipeline.named_steps['preprocessor'].transformers_
    global categorical_features, numeric_features
    categorical_features = features[1][2]
    numeric_features = features[0][2]

    # Load example dataset to fetch unique values for categorical features
    dataset = pd.read_csv('Train.csv')
    global options_dict
    options_dict = {feature: dataset[feature].dropna().unique() for feature in categorical_features}

    # Get user inputs
    user_inputs = get_user_inputs(categorical_features + numeric_features)
    
    # Predict price based on user inputs
    if st.button("Predict Price"):
        prediction = pipeline.predict(user_inputs)
        st.success(f"The predicted dynamic price is: ₹{prediction[0]:.2f}")

# Run the app
if __name__ == "__main__":
    main()
