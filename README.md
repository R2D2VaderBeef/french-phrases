# french-phrases
Made to revise French phrases. Mess around with it and add any phrases you like to your own copies / forks. If you need help understanding how everything works, make an issue.

This was just a quick project and as such, has a lot of custom stuff hardcoded. I hope to one day make a similar complete flashcard-style webapp.

### Cool stuff in this project:
- Node.js server that can `git pull` itself when I access a certain URL with the correct token. Triggers `nodemon` to re-run after pulling the new files.
- My first time implementing HTTPS.
- A simple phrase revision website which validates and scores your input.
- Users can revise their own set of phrases, which can be saved from / loaded to local storage.
- A phrase-set submission system which is complete on the user's end. Admins still need to manually add the set to the JSON file though.