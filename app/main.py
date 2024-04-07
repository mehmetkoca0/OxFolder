"""
Based on https://github.com/Azure-Samples/msdocs-python-flask-webapp-quickstart/blob/main/app.py
"""

from flask import Flask, request, jsonify
from oxfolder import document_embedder, data_comm, graph
from werkzeug.utils import secure_filename
import requests, json, os

from db_comm import connect_with_connector, init_db

app = Flask(__name__)

embedder = document_embedder.Embedder()
embedder.change_input_dir("./oxfolder/documents")
embedder.change_save_dir("./oxfolder/saved_data")
app.config['UPLOAD_FOLDER']=embedder.input_dir
embedder.change_vals_file("./oxfolder/temp/embeddings_dict.json")
embedder.change_sims_file("./oxfolder/temp/processed_docs.json")

if not(os.path.exists("./oxfolder/temp")):
    os.makedirs("./oxfolder/temp")

g = graph.Graph(relevanceConstant=0.5)

# Initialise the database connection
db = connect_with_connector()
init_db(db)

@app.route('/')
def root():
    return "This is an embedder api for oxfolder"

# @app.route('/change_output_file/<name>')
# def change_output_file(name):
#     if name.split('.')[-1]=='json':
#         embedder.change_output_file(name)
#         return "Output file changed to %s" % embedder.output_file
#     else:
#         return "Fail to change output file"

# @app.route('/get_output_file')
# def get_output_file():
#     return embedder.output_file

# @app.route('/change_output_dir/<path:path>')
# def change_output_dir(path):
#     embedder.change_output_dir('./'+path+'/temp')
#     return "Ouput directory changed to %s" % embedder.output_dir

# @app.route('/get_output_dir')
# def get_output_dir():
#     return embedder.output_dir

# @app.route('/change_input_dir/<path:path>')
# def change_input_dir(path):
#     path='./'+path
#     embedder.change_input_dir(path)
#     if embedder.input_dir==path:
#         app.config['UPLOAD_FOLDER']=path
#         return "Input directory changed succesfully to %s" % embedder.input_dir
#     else:
#         return "Fail to change input directory"

# @app.route('/get_input_dir')
# def get_input_dir():
#     return embedder.input_dir

# @app.route('/change_save_dir/<path:path>')
# def change_save_dir(path):
#     path='./'+path
#     embedder.change_svae_dir(path)
#     if embedder.save_dir==path:
#         return "Save directory changed successfully to %s" % embedder.save_dir
#     else:
#         return "Fail to change save directory"

# @app.route('/get_save_dir')
# def get_save_dir():
#     return embedder.save_dir

@app.route('/change_model/<path:new_model>')
def change_model(new_model):
    embedder.change_model(new_model)
    if embedder.model_name==new_model:
        return "Model changed successfully to %s" % embedder.model_name
    else:
        return "Fail to change the model"

@app.route('/current_model')
def current_model():
    return embedder.model_name

@app.route('/update_embedding')
def update_embedding():
    embedder.update()
    graph_update(g.relevanceConstant)
    return embedder.all_sim

# @app.route('/get_status')
# # when embedder is updating/embedding, the status is 'updating', o/w 'static'
# # May be unnecessary, but prevent race condition in access from frontend
# def get_status():
#     return embedder.status


@app.route('/upload',methods=['GET','POST'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        print(request.files)
        types = ['pdf','txt']
        if f:
            if filename.split('.')[-1] in types:
                f.save(os.path.join(embedder.input_dir,secure_filename(f.filename)))
                return "File uploaded successfully"
            else:
                return "File type not suported"
        else:
            return "File not selected"
    else:
        return "Using POST request to upload"

@app.route('/remove_file',methods=['GET','POST'])
def remove_file():
    f = request.args('filename')
    os.remove(os.path.join(embedder.input_dir,f))
    embedder.update()
    graph_update(g.relevanceConstant)
    return embedder.all_sim


# returning value method
@app.route('/all_similarities')
def all_similarities():
    return embedder.all_sim

# # passing file method in binary read-only format (returning url through the parameter)
# @app.route('/all_similarities', methods=['GET'])
# def all_similarities():
#     frontend_url = request.args['url']
#     name = embedder.output_file
#     file = {'file': (name, open(name,'rb'))}
#     header = {'File-Name': name}
#     request.post(frontend_url, files=file)


@app.route('/get_similarity',methods=['GET','POST'])
# filter_local(filename, page, chunk, max, threshold, path)
# This requires a GET/POST request from frontend with parameters: {'filename', 'page', 'chunk', 'max', 'threshold'}
def get_similarity():
    args = request.args
    filename = args['filename']
    page = args['page']
    chunk = args['chunk']
    max_num = args['max']
    threshold = args['threshold']
    data = data_comm.filter_local(filename,page,chunk,max_num,threshold,'./oxfolder/temp')
    return data

@app.route('/add_file', methods=['POST'])
# adding new file to document
def add_file():
    if request.method == 'POST':
        f = request.files['file']
        print(len(request.files))
        types = ['pdf','txt']
        if f:
            if f.filename.split('.')[-1] in types:
                f.save(os.path.join(embedder.input_dir,secure_filename(f.filename)))
            else:
                return "File type not suported"
        else:
            return "File not selected"
        print(f.filename)
        embedder.add_file(os.path.join(embedder.input_dir,secure_filename(f.filename)))
        graph_update(g.relevanceConstant)
        return embedder.all_sim


# @app.route('/update_text_file',methods=['GET','POST'])
# # update the text entered and embed, by passing file through
# def update_text_file():
#     if request.method == 'POST':
#         f = request.files['file']
#         if f:
#             if f.filename == "text.txt":
#                 f.save(os.path.join(app.config['UPLOAD_FOLDER'],secure_filename(f.filename)))
#                 with open(f.filename) as file:
#                     text = file.read()
#                 embedder.text_input(text)
#                 embedder.add_file(os.path.join(self.input_dir,f.filename))
#                 return embedder.all_sim
#             else:
#                 return "File name not matched (need to be 'text.txt')"
#         else:
#             return "Doesn't get the file"



@app.route('/update_text', methods=['GET','POST'])
# update the text entered and embed, by passing text in parameter
def update_text():
    args = request.args
    text = args['text']
    embedder.text_input(text)
    embedder.set_num_snippets(embedder.num_snippets + 1)
    path = os.path.join(embedder.input_dir,'text' + str(embedder.num_snippets) + '.txt')
    file = open(path,'w')
    file.write(str(text))
    file.close()
    embedder.add_file(path)
    graph_update(g.relevanceConstant)
    return embedder.all_sim

# Warning: all the graph stuff can run after updating the embedder

@app.route('/update_graph', methods=['GET'])
# parameter: 'relevanceConstant' (similarity threshold)
def update_graph():
    new_relevanceConstant = request.args['relevanceConstant']
    graph_update(new_relevanceConstant)
    return g.toDict()

def graph_update(relevanceConstant):
    g.clean(relevanceConstant)
    for name in embedder.all_sim.keys():
        sim = embedder.all_sim[name]
        g.add_Node(name,sim['similarities'],sim['text'],sim['doc_label'],sim['page_num'],sim['chunk_num'])

@app.route('/get_relevance_const')
def get_relevance_const():
    return str(g.relevanceConstant)

@app.route('/get_graph')
def get_graph():
    return g.toDict()

@app.route('/get_partial_graph', methods = ['GET'])
# parameter: 'name' (filename, page, chunk)
def get_partial_graph():
    name = request.args['name']
    return g.nodes[name].toDict()


if __name__ == '__main__':
    app.run(host='0.0.0.0',port='3006')
