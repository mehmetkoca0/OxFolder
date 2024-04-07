import time, os, json, shutil, copy, ast
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import numpy as np

# Modifiable - choose your favorite model
model_name = 'BAAI/bge-small-en-v1.5'
model_label = model_name.split('/')[-1]
input_dir = "./documents"
save_dir = "./saved_data"
sims_file = './temp/processed_docs.json'
vals_file = './temp/embeddings_dict.json'


embed_model = HuggingFaceEmbedding(model_name=model_name)



# Load all files and embed them
def save_embeddings(input_dir, save_dir, embed_model):
    doc_paths = []
    labels = []
    lengths = []
    
    # Grabs the files from the input folder
    for i in os.listdir(input_dir):
        if (os.path.isfile(input_dir + '/' + i) and (i.split('.')[-1] == 'pdf' or i.split('.')[-1] == 'txt')):
            doc_paths.append(i)
            label = '.'.join(i.split('.')[:-1]) #removes file extension
            labels.append(label)
    start_process = time.time()
    print('starting document processing')
    # Processes the files
    for i in range(len(doc_paths)):
        txt = False
        if(doc_paths[i].split('.')[-1] == 'txt'):
            txt = True
        print('processing ' + labels[i])
        doc_path = input_dir + '/' + doc_paths[i]
        path = save_dir + '/' + labels[i]
        if not(os.path.exists(path)):
            os.makedirs(path)
        reader = SimpleDirectoryReader(input_files=[doc_path])
        doc = reader.load_data()
        if(txt):
            lengths.append(1)
            out = open(path + '/page_1.txt', 'w')
        else:
            lengths.append(int(doc[-1].metadata['page_label']))
            for page in doc:
                out = open(path + '/page_' + page.metadata['page_label'] + '.txt', 'w')
                out.write(page.text)
                out.close()
        path = path + '/embeddings/' + model_label
        if not(os.path.exists(path)):
            os.makedirs(path)
        # Checks if the embedding has already been done previously
        # Loads if found, calculates if not
        try:
            storage_context = StorageContext.from_defaults(persist_dir=path)
            index = load_index_from_storage(embed_model=embed_model, storage_context=storage_context)
            print('loaded embedding of ' + labels[i])
        except:
            start = time.time()
            print('embedding ' + labels[i])
            index = VectorStoreIndex.from_documents(doc, embed_model=embed_model, show_progress=True)
            print('finished embedding after ' + str(time.time() - start))
            index.storage_context.persist(path)
    print('finished processing documents after ' + str(time.time() - start_process))
    return (labels, lengths)
    
        

# Takes the saved docs/vectors and packages them into a dictionary for further processing
def to_dict(save_dir, labels, lengths, output_file, to_file=True):
    out = {}
    for i in range(len(labels)):
        # Grabbing the saved docs/vectors
        get_docs = open('/'.join([save_dir, labels[i], 'embeddings',
                         model_label, 'docstore.json']))
        get_vectors = open('/'.join([save_dir, labels[i], 'embeddings',
                         model_label, 'default__vector_store.json']))
        docstore = json.loads(get_docs.read())["docstore/data"]
        vector_store = json.loads(get_vectors.read())['embedding_dict']
        get_docs.close()
        get_vectors.close()

        doc_json = {}

        for j in docstore.keys():
            data = docstore[j]['__data__']
            try:
                page_num = str(data['metadata']['page_label'])
            except:
                page_num = '1'
            text = data['text']
            embedding = vector_store[j]
            chunk = {}
            chunk['text'] = text
            chunk['embedding'] = embedding
            try:
                num_chunks = doc_json[page_num]['num_chunks']
                doc_json[page_num][str(num_chunks+1)] = chunk
                doc_json[page_num]['num_chunks'] = num_chunks + 1
            except:
                doc_json[page_num] = {'num_chunks': 0}
                doc_json[page_num]['1'] = chunk
                doc_json[page_num]['num_chunks'] = 1
        for j in doc_json.values():
            del j['num_chunks']
        out[labels[i]] = doc_json

    print('done converting')
    
    if to_file:
        open(output_file, 'w').write(json.dumps(out))
    else:
        return out

    

# takes in processed dictionary of embeddings and data
def calc_similarities(output_file, input_file, to_file=True):
    print("calculating similarity")
    start = time.time()
    data = json.load(open(input_file, 'r'))
    # N x V array, where N = # of chunks, V = vector size
    embeddings = []

    # N vector
    keys = []
    out = {}
    for i in data.keys():
        for j in data[i].keys():
            for k in data[i][j].keys():
                embeddings.append(data[i][j][k]['embedding'])
                keys.append((i, j, k))
    
    embeddings = np.array(embeddings)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=False)
    for i in data.keys():
        for j in data[i].keys():
            for k in data[i][j].keys():
                similarities = {}
                id_i = (i, j, k)
                out[str(id_i)] = {}
                text_i = data[i][j][k]['text']
                embed_i = np.array(data[i][j][k]['embedding'])
                dprod = np.dot(embeddings, embed_i)
                norm = np.linalg.norm(embed_i) * norms
                cos_sim = dprod / norm
                for l in range(len(keys)):
                    similarities[str(keys[l])] = cos_sim[l]
                del similarities[str((i, j, k))]
                out[str(id_i)]['similarities'] = similarities
                out[str(id_i)]['text'] = text_i
                out[str(id_i)]['doc_label'] = i
                out[str(id_i)]['page_num'] = int(j)
                out[str(id_i)]['chunk_num'] = int(k)
    print("finished calculating similarity after " + str(time.time() - start))
    out_json = json.dumps(out)
    if to_file:
        open(output_file, 'w').write(str(out_json))
        return out
    else:
        return out


# Requires that the input txt be given as a file, for ease of use with previous functions
# Give it the same save directory as your previous texts
# Results will be written into the given previously created files
def add_file(doc_path, save_dir, embed_model, prev_dict_file, prev_json_file):
    label = doc_path.split('/')
    if(len(label) == 1):
        doc_path = './' + doc_path
    label = '.'.join(label[-1].split('.')[:-1])
    print(label)
    doc_dir = os.path.dirname(doc_path) # Grabs the parent directory of the file
    print(doc_dir)
    (labels, lengths) = save_embeddings(doc_dir, save_dir, embed_model)
    new_data = to_dict(save_dir, labels, lengths, None, False)
    new_sims = {}
    prev_data = json.load(open(prev_dict_file, 'r'))
    prev_sims = json.load(open(prev_json_file, 'r'))
    
    
    for i in new_data.keys():
        for j in new_data[i].keys():
            for k in new_data[i][j].keys():
                for node in prev_sims.keys():
                    new_id = (i, j, k)
                    prevs = prev_sims[node]
                    prev_id = (str(prevs['doc_label']), str(prevs['page_num']), str(prevs['chunk_num']))
                    
                    new_embedding = np.array(new_data[i][j][k]['embedding'])
                    prev_embedding = np.array(prev_data[prev_id[0]][prev_id[1]][prev_id[2]]['embedding'])
                    dprod = np.dot(new_embedding, prev_embedding)
                    norm = np.linalg.norm(new_embedding)*np.linalg.norm(prev_embedding)
                    cos_sim = dprod / norm
                    
                    if not(node in new_sims):
                        new_sims[node] = {}
                        new_sims[node]['similarities'] = {}
                    new_sims[node]['similarities'][str(new_id)] = cos_sim
                    new_sims[node]['text'] = prev_sims[node]['text']
                    new_sims[node]['doc_label'] = str(prev_id[0])
                    new_sims[node]['page_num'] = int(prev_id[1])
                    new_sims[node]['chunk_num'] = int(prev_id[2])
                    

                    if not(str(new_id) in new_sims):
                        new_sims[str(new_id)] = {}
                        new_sims[str(new_id)]['similarities'] = {}
                    new_sims[str(new_id)]['similarities'][node] = cos_sim
                    new_sims[str(new_id)]['text'] = new_data[i][j][k]['text']
                    new_sims[str(new_id)]['doc_label'] = str(i)
                    new_sims[str(new_id)]['page_num'] = int(j)
                    new_sims[str(new_id)]['chunk_num'] = int(k)
                for a in new_data.keys():
                    for b in new_data[a].keys():
                        for c in new_data[a][b].keys():
                            prev_id = (i, j, k)
                            new_id = (a, b, c)
                            if(prev_id != new_id):
                                new_embedding = np.array(new_data[a][b][c]['embedding'])
                                prev_embedding = np.array(new_data[i][j][k]['embedding'])
                                dprod = np.dot(new_embedding, prev_embedding)
                                norm = np.linalg.norm(new_embedding)*np.linalg.norm(prev_embedding)
                                cos_sim = dprod / norm
                                if not(str(new_id) in new_sims):
                                    new_sims[str(new_id)] = {}
                                    new_sims[str(new_id)]['similarities'] = {}
                                    
                                new_sims[str(new_id)]['similarities'][str(prev_id)] = cos_sim
                                new_sims[str(new_id)]['text'] = new_data[a][b][c]['text']
                                new_sims[str(new_id)]['doc_label'] = str(a)
                                new_sims[str(new_id)]['page_num'] = int(b)
                                new_sims[str(new_id)]['chunk_num'] = int(c)
                                
                                
                    
    for i in new_data.keys():
        prev_data[i] = new_data[i]
    for i in new_sims.keys():
        for j in new_sims[i]['similarities'].keys():
            if not(i in prev_sims):
                prev_sims[i] = {}
                prev_sims[i]['similarities'] = {}
            prev_sims[i]['similarities'][j] = new_sims[i]['similarities'][j]
            prev_sims[i]['text'] = new_sims[i]['text']
            prev_sims[i]['doc_label'] = new_sims[i]['doc_label']
            prev_sims[i]['page_num'] = new_sims[i]['page_num']
            prev_sims[i]['chunk_num'] = new_sims[i]['chunk_num']  
        
    open(prev_dict_file, 'w').write(json.dumps(prev_data))
    open(prev_json_file, 'w').write(json.dumps(prev_sims))
    return prev_sims


def remove_file(save_dir, doc_path, vals_file, sims_file):
    label = '.'.join(doc_path.split('/')[-1].split('.')[:-1])
    try:
        os.remove(doc_path)
        print('Removed file')
    except:
        print('Could not remove file')
    try:
        shutil.rmtree(os.path.join(save_dir, label))
        print('Removed saved embedding folder')
    except:
        print('Could not remove saved embedding folder')
    vals = json.loads(open(vals_file).read())
    if label in vals:
        del vals[label]
        open(vals_file, 'w').write(json.dumps(vals))
        print('Removed file from saved embedding dictionary')
    else:
        print('File not found in saved embedding dictionary')
    sims = json.loads(open(sims_file).read())
    new_sims = copy.deepcopy(sims)
    removed = []
    for i in sims.keys():
        if sims[i]['doc_label'] == label:
            removed.append(i)
            del new_sims[i]
    for i in new_sims.keys():
        for j in removed:
            del new_sims[i]['similarities'][j]
    open(sims_file, 'w').write(json.dumps(new_sims))
    print('Removed file\'s similarities from sims file, if any')
    return sims_file

class Embedder:
    def __init__(self, model_name=model_name, model_label=model_label, input_dir=input_dir, save_dir=save_dir, sims_file=sims_file, vals_file=vals_file):
        self.model_name = model_name
        self.model_label = model_label
        self.input_dir = input_dir
        self.save_dir = save_dir
        self.embed_model = HuggingFaceEmbedding(model_name=model_name)
        self.sims_file = sims_file
        self.vals_file = vals_file
        # self.output_dir = output_dir
        # self.status = 'static'
        self.all_sim = {}
        self.text = ""
        self.num_snippets = 0

    # sims_file stores calculated similarities with label; should have all info for node construction
    # vals_file stores data such as embeddings, used for calculatiions mostly within this file

    # not implemented yet, this is just a trait designed.
    # Need modification in to_dict and to_json functions.
    # def change_output_file(self,new_file):
    #     self.output_file = new_file

    # def change_output_dir(self,new_dir):
    #     if output_dir[-1]=='/':
    #         self.output_dir = new_dir[0,-1]
    #     else:
    #         self.output_dir = new_dir
    def set_num_snippets(self, num):
        self.num_snippets = num
        
    def change_vals_file(self, fname):
        self.vals_file = fname

    def change_sims_file(self, fname):
        self.sims_file = fname

    def change_model(self,new_name):
        self.model_name = new_name
        self.model_label = new_name.split('/')[-1]
        self.embed_model = HuggingFaceEmbedding(model_name=new_name)

    def change_save_dir(self, new_dir):
        self.save_dir = new_dir

    def change_input_dir(self, new_dir):
        self.input_dir = new_dir

    def add_file(self, new_file):
        self.all_sim = add_file(new_file, self.save_dir, self.embed_model, self.vals_file, self.sims_file)

    def remove_file(self, to_remove):
        remove_file(self.save_dir, to_remove, self.vals_file, self.sims_file)
    # Note: updating is more expensive than adding a new file,
    # as it will cause previously-calculated similarities to be done again.
    # Use if major changes occur such as changing the embedding model
    def update(self):
        # self.status='updating'
        (labels, lengths) = save_embeddings(self.input_dir, self.save_dir, self.embed_model)
        to_dict(self.save_dir, labels, lengths, self.vals_file)
        self.all_sim = calc_similarities(self.sims_file, self.vals_file, to_file=True)
        # self.status='static'

    def text_input(self, text):
        self.text = text


if __name__ == '__main__':
    print("hello!")
