# Visualizing Covid-19 tweet data
A data visualization of the growth of interest in Twitter COVID-19 tweets over time by geography, in d3.js.  

Data is from Kaggle. Because of the amount of data, data was processed in Python ("server-side") before the visualization in client-side Javascript.

Country codes were converted from Alpha 2 codes to ISO 3166-1 numeric codes for the World Atlas TopoJSON using the Wiki page https://en.wikipedia.org/wiki/ISO_3166-1.  Kosovo had to be excluded as it had no numeric code.

Visualization can be viewed at https://sharonchoong.github.io/covid19tweets/

# Emotion classification
Emotion classification work can be found in the folder by the same name. Only English Tweets are used.  

Embeddings are from [Stanford's GloVe](https://nlp.stanford.edu/projects/glove/) -- the 6B tokens, 400K vocab, uncased, 300d word vectors. The model is a convolutional neural net trained on Google's [GoEmotions](https://github.com/google-research/google-research/tree/master/goemotions) corpus of labelled text. Prediction result plots are in matplotlib and seaborn.
