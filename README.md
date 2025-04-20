 # **Pricelytics** - Dynamic Price Prediction App

**Pricelytics** is an AI-powered dynamic pricing tool designed to predict optimal selling prices for products based on various factors like product brand, category, subcategory, item rating, and more. The app leverages a machine learning model built using Random Forest Regressor, trained on historical product data, to provide businesses with insights into competitive pricing strategies.

## **Project Overview**

This project aims to develop an intelligent dynamic pricing system for businesses in the e-commerce and retail industry. By analyzing key features such as product category, brand, item ratings, and historical pricing data, the system predicts optimal selling prices, which can maximize profitability while staying competitive in the market.

## **Problem Statement**

In today's competitive retail and e-commerce landscape, pricing products accurately is a critical factor for maximizing profits. Setting the right price involves considering various factors like product category, brand, customer ratings, and historical data. Manually determining the price can be inefficient, inconsistent, and prone to errors. The problem lies in automating this pricing decision based on multiple features to improve accuracy and profitability.

## **Why the Project Was Chosen**

The choice of this project stems from the importance of pricing in business strategy. Dynamic pricing has the potential to revolutionize industries like e-commerce, retail, and hospitality. By using AI to automate and optimize pricing decisions, businesses can achieve:
- Improved pricing strategies that reflect market demands.
- Better revenue optimization.
- Reduced dependency on manual price adjustments.
  
This project provides an opportunity to work with:
- Machine learning models like **Random Forest Regressor** for regression tasks.
- **Streamlit** for interactive web applications.
- Real-world business problems related to pricing and profitability.

## **Technologies Used**

- **Python 3.11/3.12**: Programming language.
- **Streamlit**: For building the interactive web application interface.
- **Pandas**: Data manipulation and analysis.
- **Scikit-learn**: For training and evaluating machine learning models.
- **Joblib**: For saving and loading trained models.
- **Matplotlib** and **Seaborn** (optional): For visualizations and analysis.
- **Jupyter Notebook**: For model training, experimentation, and evaluation.
  
## **How the Project Works**

1. **Data Collection**:
   The project uses a dataset that contains historical product details like:
   - Product ID
   - Brand
   - Item Category
   - Subcategories
   - Item Rating
   - Selling Price
   - Date of listing
  
2. **Model Training**:
   - The dataset is preprocessed to handle missing values and categorical features.
   - Numerical features are scaled, and categorical features are encoded.
   - A **Random Forest Regressor** model is trained to predict the selling price based on the above features.

3. **User Interface**:
   - The user interacts with a **Streamlit app**, where they input product details like the brand, category, item rating, and date.
   - The app provides a dynamic pricing prediction based on the trained model.

4. **Prediction**:
   - The model uses the input data to predict the optimal selling price for the product.
   - The prediction is displayed on the app, helping businesses decide the best price for their products.

5. **Output**:
   The user receives a predicted price that is optimal based on the input features and historical data. This price can be used to optimize the business's pricing strategy.

## **Setup and Installation**

### Prerequisites
- Python 3.11 or 3.12 (recommended)
- A code editor (like VS Code) and terminal access

[**Try Pricelytics Now**](https://pricelytics.streamlit.app/)
### Screenshot 1:
![Image description]("C:\Users\bhush\OneDrive\Pictures\Screenshots\Screenshot 2025-04-20 234444.png")

### Screenshot 2:
![Image description]("C:\Users\bhush\OneDrive\Pictures\Screenshots\Screenshot 2025-04-20 234459.png")
