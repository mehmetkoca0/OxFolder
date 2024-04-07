import os
import json

save_dir="./temp"
input_dir="."


# providing the (filename,page,chunk) and max number of nodes needed and threshold similarity value
# giving the "(filename,page,chunk)":similarity pair with descending order with similarity higher than threshold and number of pairs smaller than max
def filter_local(filename, page, chunk, max, threshold, path):
	def find(l,key,sim):
		for i in range(len(l)):
			if l[i][1]<=sim:
				return i
		return len(l)

	with open(path) as json_formatting:
		raw = json_formatting.read()
		raw = json.loads(raw)
		data = raw["('{}', {}, {})".format(filename, page, chunk)]['similarities']
	out = []
	for i in data.keys():
		sim = data[i]
		if sim>=threshold:
			out.insert(find(out,i,sim),(i,sim,raw[i]['text']))
	if not os.path.exists(save_dir):
		os.makedirs(save_dir)
	out = json.dumps(out[0:max])
	file = save_dir+'/'+"{}_{}_{}.json".format(filename,page,chunk)
	save = open(file,'w')
	save.write(out)
	save.close()
	return out

if __name__ == '__main__':
    print("hello!")
