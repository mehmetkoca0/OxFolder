# Frontend API manual

All api is based on http request. The url is supposed to be the public IP address/domain (referred as `<pub_ip>`) of Azure server followed by the corresponding route.

So to invoke a function `func`, you should send http request to `<pub_ip>/func`. For js or html, recommend to use Ajax protocols. Most of the routes only need a `GET` request, some of which may need some parameters. Others require a `POST` request for passing files or security reasons. These will be commented in the document below

### root: `<pub_ip>`

return `This is an embedder api for oxfolder` all the time

### change embedding model: `<pub_ip>/change_model/<path:new_model>`

change the model used by llama index for embedding

return `Model changed successfully to <new_model>` on success and `Fail to change the model` on failure

by default, the model is `BAAI/bge-small-en-v1.5`

**Note:** need to call update_embedding to use the new model for embedding

### get current model: `<pub_ip>/current_model`

return current model name

### embedding and generate similarities: `<pub_ip>/update_embedding`

return the similarities like `all_similarities` on success or erroring on failure

### uploading files: `<pub_ip>/upload`

**This requires a POST request **with `files` term of the request being the file to be uploaded. (Can only upload one file at a time)

Supporting file format: pdf, txt

File name can't be `text.txt`

If uploaded, return `File uploaded successfully`

If type not matched, return `File type not supported`

If null in the `files` term, return `File not selected`

If not using POST, return `Using POST request to upload`

### remove file: `<pub_ip>/remove_file`

passing the file name through the `filename` argument term through either POST or GET request. The embedder will delete the file, re-embed the other files, update the graph, and return the new `all_similarities`.

### get all pairwise similarities: `<pub_ip>/all_similarities`

return all pairwise similarities as an object of object:

```
{
  'filename_page_chunk': {
    'similarity': {
      'filename_page_chunk': similarity as a float
    }
    'text' : original text as a string
    'doc_label' : original doc name
    'page_num' : page number
    'chunk_num' : chunk number
  }
}
```

### get some of the similarities: `<pub_ip>/get_similarity`

passing parameters through GET request

**parameters:**

`'filename'`: the name of the pdf/txt (with post fix)

`'page'`: the page number as an integer

`'chunk'`: the chunk number as an integer

`'max'`: the max number of related chunks in all files as an integer

`'threshold'`: the threshold value of similarity as a floating point value between 0 and 1

**returning value:**

an array (from list in python) of arrays (from 2-tuple in python), in descending order of similarities. The inner array is of length 2 corresponding to *name* and *similarity*

*name* is the composition of filename, page number, chunk number in a string, and *similarity* is a floating point number between 0 and 1. 

The length of the outer array is at most `'max'` and all with *similarity* all greater than `'threshold'`

### add new file to document and embed: `<pub_ip>/add_file`

**Note:** this is adding files into the document and embed using the old embedder

need to pass the file in GET request file

return the new embedding (containing text if text is entered) like `all_similarities`

### Add the text entered: `<pub_ip>/update_text`

request parameter `'text'` being the text enetered by the user

the embedding is saved in `/temp_text.json` under `output_dir` directory

return the similarities of the text to the files uploaded

### update graph: `<pub_ip>/update_graph`

**All graph operations should based on the updated embeddings and similarities**

passing a parameter `relevanceConstant` (has to clarify everytime) through GET and it will filter out all the edges with similarities below this value.

then, updating the graphs based on current output (in output file) and return the graph as:

**graph:** an object mapping name (triple of filenmae, page, chunk as a string) of nodes to node object

**node:** object

`doc_label`: original file name as a string

`page_num`: the page number of the chunk located in the file

`chunk_num`: the chunk number of the chunk in the page

`strongNeighbours`: an object (dictionary) mapping name of the neighbour of current node to the similarity between the two

`degree`: the degree of this node (=size of `strongNeighbours`)

`text`: the text of the current node (original text in pdf/txt)

### get current relevance constant: `<pub_ip>/get_relevance_const`

return current relevance constant of the graph obejct (0.5 as a default).

### get graph: `<pub_ip>/get_graph`

return the entire graph as a graph as `update_graph`

### get partial graph: `<pub_ip/get_partial_graph>`

passing `'name'` (doc_label, page, chunk triple as a string) as parameter in a GET request, indicating the node you want to return as the center of the partial graph

returning a subgraph of the entire graph centered in the node of `'name'`.

