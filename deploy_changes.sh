#!/bin/bash

echo "Attempting git commit..."
git commit -m "feat: Integrate Netlify Function for SendGrid email and update form"

COMMIT_STATUS=$?
if [ $COMMIT_STATUS -eq 0 ]; then
    echo "Commit successful. Attempting git push..."
    git push
    PUSH_STATUS=$?
    if [ $PUSH_STATUS -eq 0 ]; then
        echo "Push successful. All changes deployed to GitHub."
    else
        echo "ERROR: Git push failed with exit code $PUSH_STATUS."
    fi
else
    echo "ERROR: Git commit failed with exit code $COMMIT_STATUS."
fi
