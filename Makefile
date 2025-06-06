run-api:
	uv run uvicorn api.main:app --reload

run-app:
	cd jarvis && npm run dev