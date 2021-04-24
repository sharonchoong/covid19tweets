from os import listdir
import pandas as pd

## get files
final = pd.DataFrame()
for file in listdir("data"):
    if (file.endswith(".CSV") and "Coronavirus Tweets" in file):
        df = pd.read_csv("data/" + file)
        df = df[df.country_code.notnull()]
        counts = df.groupby(["country_code"]).size().reset_index(name='counts')
        date = file.replace(" Coronavirus Tweets.CSV","")
        print("Processing " + date + " data")
        final = final.append({'data': counts, 'date': date }
                             , ignore_index=True)
        
final.to_json("counts.json", orient="records")