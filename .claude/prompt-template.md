**Below is a template for the prompts to use across agents:**

Feature: Allow users to see their own posts in the social tab, as well as their username above those post.

Details:

- Should be designed like a gallery from Instagra, where there is a grid of images that correspond to each user post that the user themselves made.
- Above the gallery should be the user's username from the user context session.

Workflow:

1. planner: plan the feature, including the backend/frontend contract.
2. db-expert: implement the backend part of the plan. this includes how to fetch the posts that a user has made
3. frontend: implement the UI using the endpoints and data db-expert reports.
4. reviewer: review the diff and fix anything it flags before you finish.

Constraints:

- Match the existing theme (NC State red #bc1823, Anton SC font).
- No destructive DB changes; show me the migration before applying it.
- Stop and ask me if the plan changes the existing schema
