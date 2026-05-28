from django.http import JsonResponse
import pandas as pd
import json

def get_normalized_esg_data(request):
    unified_rows = []
    
    # 1. PROCESS FUEL (Assuming Kaggle Spend/PO dataset)
    try:
        fuel_df = pd.read_csv("fuel.csv")
        # Adapt these column names to match your downloaded Kaggle CSV
        for _, row in fuel_df.iterrows():
            unified_rows.append({
                "Date": "2024-05-01", # Replace with actual date parsing if available
                "Category": "Scope 1 (Fuel)",
                "Location": "Facility",
                "Value": 1500, # Replace with actual quantity column
                "Unit": "Liters"
            })
    except:
        pass # Skip if file not perfectly named for this demo

    # 2. PROCESS ELECTRICITY (Kaggle Utility Dataset)
    try:
        elec_df = pd.read_csv("electricity.csv").head(100) # Limit for speed
        for _, row in elec_df.iterrows():
            unified_rows.append({
                "Date": "2024-05-15",
                "Category": "Scope 2 (Electricity)",
                "Location": "Grid",
                "Value": 8500, 
                "Unit": "kWh"
            })
    except:
        pass

    # 3. PROCESS TRAVEL (Kaggle Flight Dataset)
    try:
        travel_df = pd.read_csv("travel.csv").head(100)
        for _, row in travel_df.iterrows():
            unified_rows.append({
                "Date": "2024-05-10",
                "Category": "Scope 3 (Travel)",
                "Location": "Corporate",
                "Value": 1200, 
                "Unit": "Km"
            })
    except:
        pass

    # For the sake of the demo, if files fail to load, provide fallback data
    if not unified_rows:
        unified_rows = [
            {"Date": "2024-05-01", "Category": "Scope 1 (Fuel)", "Location": "Pune HQ", "Value": 3500, "Unit": "Liters"},
            {"Date": "2024-05-15", "Category": "Scope 2 (Electricity)", "Location": "Mumbai Branch", "Value": 12000, "Unit": "kWh"},
            {"Date": "2024-05-20", "Category": "Scope 3 (Travel)", "Location": "Global", "Value": 450, "Unit": "Km"}
        ]

    return JsonResponse({"status": "success", "data": unified_rows})