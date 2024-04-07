import numpy as np
from collections import deque


class Node:
    # similarities is a dictionary that keeps the similarities with the other nodes
    def __init__(self,name,text,doc_label,page,chunk):
        self.name=name
        self.strongNeighbours={} # {name:similarity}
        self.degree=0
        self.text=text
        self.doc_label=doc_label
        self.chunk=chunk
        self.page=page
    def add_Neighbour(self, name, similarity):
        self.strongNeighbours[name]=similarity
        self.degree = self.degree+1

    def toDict(self):
        d = {}
        d['strongNeighbours']=self.strongNeighbours
        d['degree']=self.degree
        d['text']=self.text
        d['doc_label']=self.doc_label
        d['page_num']=self.page
        d['chunk_num']=self.chunk
        return d



class Graph:
    def __init__(self, relevanceConstant=0.5):
        self.nodes={ } # key-value pair of name-node
        self.relevanceConstant = relevanceConstant

    def add_Node(self,name,similarities,text,doc_label,page,chunk):
        newNode= Node(name, text,doc_label,page,chunk)

        for node in self.nodes.values():
            relevance = similarities[node.name]
            if(relevance > self.relevanceConstant):
                node.add_Neighbour(newNode.name,relevance)
                newNode.add_Neighbour(node.name,relevance)
                self.nodes[node.name] = node

        self.nodes[name] = newNode

    def clean(self, relevanceConstant=0.5):
        self.nodes={}
        self.relevanceConstant = relevanceConstant

    def toDict(self):
        nodes = { }
        for name in self.nodes.keys():
            nodes[name]=self.nodes[name].toDict()
        return nodes


