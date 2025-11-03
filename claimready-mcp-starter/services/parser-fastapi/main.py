from fastapi import FastAPI
from pydantic import BaseModel
import os, json, boto3

app = FastAPI()

class ParseInput(BaseModel):
    id: str | None = None
    text: str | None = None
    s3Key: str | None = None

def fake_extract(text: str):
    # Minimal heuristic: detect 'granted'/'denied' lines
    issues = []
    for line in text.splitlines():
        lo = line.lower()
        if 'granted' in lo:
            issues.append({'name': line.strip(), 'decision': 'granted'})
        if 'denied' in lo:
            issues.append({'name': line.strip(), 'decision': 'denied'})
        if 'deferred' in lo:
            issues.append({'name': line.strip(), 'decision': 'deferred'})
    return {
        "issues": issues,
        "meta": {"engine": "fake-parser", "version": "0.0.1"}
    }

def fetch_text_from_s3(key: str) -> str:
    s3 = boto3.client(
        's3',
        endpoint_url=os.getenv('S3_ENDPOINT'),
        aws_access_key_id=os.getenv('S3_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('S3_SECRET_ACCESS_KEY'),
        region_name=os.getenv('S3_REGION', 'us-east-1')
    )
    bucket = os.getenv('S3_BUCKET')
    obj = s3.get_object(Bucket=bucket, Key=key)
    return obj['Body'].read().decode('utf-8', errors='ignore')

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/parse")
def parse(inp: ParseInput):
    text = inp.text
    if not text and inp.s3Key:
        text = fetch_text_from_s3(inp.s3Key)
    if not text:
        return {"success": False, "errors": ["no text or s3Key provided"]}
    data = fake_extract(text)
    return {"success": True, "data": data, "uploadId": inp.id}
