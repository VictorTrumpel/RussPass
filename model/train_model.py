from langchain_elasticsearch import ElasticsearchStore
from langchain_community.embeddings.gigachat import GigaChatEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv
import os
import json

client_secret = os.getenv("CLIENT_SECRET")

embeddings = GigaChatEmbeddings(credentials=client_secret, verify_ssl_certs=False)

script_dir = os.path.dirname(os.path.abspath(__file__))

with open(script_dir + '/train_dataset_all_cards.json', 'r') as file:
  json_data = json.load(file)

event_document_list = []

for event in json_data:
  event_document = Document(event['description'])
  event_document.metadata['objectId'] = event['objectId']
  event_document.metadata['objectType'] = event['objectType']
  event_document_list.append(event_document)
  print(event['objectId'])

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test-basic",
  embedding=embeddings,
  es_user="elastic",
  es_password="changeme"
)

ElasticsearchStore.from_documents(
  event_document_list,
  embeddings,
  es_url="http://localhost:9200",
  index_name="test-basic",
)