import streamlit as st
import pandas as pd
import joblib

# Load the trained pipeline
@st.cache_resource
def load_pipeline():
    return joblib.load('dynamic_pricing_pipeline.pkl')

# Function to get user inputs dynamically based on features
def get_user_inputs():
    # Categorical inputs
    product = st.selectbox("Select Product", options=options_dict['Product'])
    product_brand = st.selectbox("Select Product Brand", options=options_dict['Product_Brand'])
    item_category = st.selectbox("Select Item Category", options=options_dict['Item_Category'])
    subcategory_1 = st.selectbox("Select Subcategory 1", options=options_dict['Subcategory_1'])
    subcategory_2 = st.selectbox("Select Subcategory 2", options=options_dict['Subcategory_2'])
    
    # Date input
    date = st.date_input("Select Date")
    
    # Numerical inputs
    item_rating = st.number_input("Enter Item Rating (0.0 - 5.0)", min_value=0.0, max_value=5.0, step=0.1)
    selling_price = st.number_input("Enter Selling Price (₹)", min_value=0.0, step=1.0)

    # Create DataFrame with user input
    user_input = pd.DataFrame({
        'Product': [product],  # Use the selected Product ID here
        'Product_Brand': [product_brand],
        'Item_Category': [item_category],
        'Subcategory_1': [subcategory_1],
        'Subcategory_2': [subcategory_2],
        'Item_Rating': [item_rating],
        'Date': [date.strftime('%d-%m-%Y')],
        'Selling_Price': [selling_price]
    })
    
    return user_input

# Main Streamlit App
def main():
    st.title("Pricelytics")
    st.markdown("### Predict the Optimal Selling Price")
    st.write("Enter product details to calculate the most competitive and profitable price.")

    # Load pipeline
    pipeline = load_pipeline()
    
    # Load example dataset to fetch unique values for categorical features
    dataset = pd.read_csv('Train.csv')
    
    # Get unique options for categorical features
    global options_dict
    options_dict = {
        'Product': dataset['Product'].dropna().unique(),
        'Product_Brand': dataset['Product_Brand'].dropna().unique(),
        'Item_Category': dataset['Item_Category'].dropna().unique(),
        'Subcategory_1': dataset['Subcategory_1'].dropna().unique(),
        'Subcategory_2': dataset['Subcategory_2'].dropna().unique(),
    }
    
    # Get user inputs
    user_inputs = get_user_inputs()
    
    # Predict price based on user inputs
    if st.button("Predict Price"):
        prediction = pipeline.predict(user_inputs)
        st.success(f"The predicted dynamic price is: ₹{prediction[0]:.2f}")

# Run the app
if __name__ == "__main__":
    main()
