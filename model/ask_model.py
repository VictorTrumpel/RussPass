from langchain_elasticsearch import ElasticsearchStore
from langchain_community.embeddings.gigachat import GigaChatEmbeddings
import os
import sys
import json

embeddings = GigaChatEmbeddings(credentials="Njg2MjY3ZTgtZDMxZC00NzU2LTg0MzctMDkzMDFhYjI0NGVkOjFhNGZkYWNkLTVhNDMtNGI3MS1iNWVmLWMyOGQ4N2RjZTE1Mw==", verify_ssl_certs=False)

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test-basic",
  embedding=embeddings,
  es_user="elastic",
  es_password="changeme"
)

def ask_model(query_text):
  return db.similarity_search_with_score(query_text, 50)

file_path = os.path.join("model", "ask_data.txt")

user_prompt = sys.argv[1]

document_list = ask_model(user_prompt)

cards_collection = []

for doc in document_list:
  cards_collection.append(doc[0].metadata)

print(json.dumps(cards_collection))