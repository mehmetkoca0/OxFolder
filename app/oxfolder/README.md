# Document embedding:
1. Grab your list of documents and put it in a folder, designate a folder for data to be saved and specify folders in document_embedder.py
2. You can also specify which embedding model you'd like to use by changing it at the top. Embeddings can be found at https://huggingface.co/spaces/mteb/leaderboard.
3. Each document is read by SimpleDirectoryReader and split into pages, each of which is split into a few chunks
4. Each chunk has its embedding calculated and tagged with page numbers.
5. Embeddings, text, and relevant metadata are extracted into an intermediate dictionary for further processing
6. An array is made with the embedding of each chunk. Then, each node individually has its embedding premultiplied by the array to generate a vector of dot products
7. The dot product array is then (element-wise) divided by a vector of norms and the node's embedding's norm to get the cosine similarity
8. The cosine similarities of the node against every other node other than itself is then stored alongsite its label

Finished output is stored in processed_docs.json, and json_formatting.json gives an example of how the formatting will be.
