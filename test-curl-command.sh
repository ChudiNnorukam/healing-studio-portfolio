#!/bin/bash

curl -X POST "YOUR_N8N_WEBHOOK_URL_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "inner child healing",
    "audience": "trauma survivors",
    "platforms": ["pinterest"],
    "contentTypes": ["quote", "infographic", "exercise"],
    "monthlyBudget": 50
  }'
