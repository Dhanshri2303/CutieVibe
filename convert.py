import csv
import json

products = []

# CSV file read karein
with open('nyka_popular_brands_products_2022_10_16.csv', mode='r', encoding='utf-8') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for index, row in enumerate(csv_reader, start=1):
        products.append({
            "id": index,
            "brand": row.get('BrandName', ''),
            "name": row.get('Details', ''),
            "mrp": float(row.get('MRP', 0)) if row.get('MRP') else 0,
            "sellPrice": float(row.get('SellPrice', 0)) if row.get('SellPrice') else 0,
            "discount": row.get('Discount', ''),
            "category": row.get('Category', 'General'),
            "size": row.get('Sizes', ''),
            "image": "https://via.placeholder.com/200"
        })

# JSON file me save karein
with open('products.json', 'w', encoding='utf-8') as json_file:
    json.dump(products, json_file, indent=2, ensure_ascii=False)

print("Done! products.json file ban gayi hai.")