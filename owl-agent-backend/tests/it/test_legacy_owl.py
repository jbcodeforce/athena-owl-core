import unittest
import sys,os
os.environ["CONFIG_FILE"] = "./tests/ut/config/config.yaml"
from dotenv import load_dotenv
load_dotenv()
sys.path.append('./src')
from athena.main import app
from athena.app_settings import  get_config
from athena.routers.dto_models import ConversationControl, ModelParameters
from fastapi.testclient import TestClient

"""
Test the app at the api level using FastAPI test client, and the configuration for integration tests.
Run from folder above tests.

pytest -s tests/it/test_app_api.py

Goals: 
* validate health and version paths
* address a general query to using the default prompt so it can validate reaching the selected LLM
"""
class TestAppApi(unittest.TestCase):
    
    @classmethod
    def setUpClass(self):
        self.client = TestClient(app)
        print("init test done")
       

    def build_ConversationControl(self):
        parameters= ModelParameters()
        parameters.prompt_ref="default_prompt"
        ctl = ConversationControl()
        ctl.callWithVectorStore = False
        ctl.callWithDecisionService = False
        ctl.modelParameters=parameters
        ctl.type="chat"
        return ctl
    
    def test_basic_general_chat_to_llm(self):
        ctl = self.build_ConversationControl()
        ctl.query="You are an expert in AI, can you answer this question: What is the value proposition of LangChain?"
        response=self.client.post(get_config().api_route + "/c/generic_chat", json= ctl.model_dump())
        print(f"--it--> {response.json()}")
        assert response
        assert response.status_code == 200
        
        
if __name__ == '__main__':
    unittest.main()