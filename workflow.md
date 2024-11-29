the work flow of a new chat created from "input" should follow this: 
1. message input 
2. display user message on the home page
3. create new chat
4. transit from home page to chat page: at this process, user message keep static, don't refresh the whole page, 
5. add this created new chat to chat list on the sidebar (remember don't create a new chat again)
6. use content and assistant contant storage process 


This updated version:
Follows the specified workflow steps exactly
Avoids storing messages multiple times
Only stores messages after chat creation is complete
Uses empty string instead of 'temp' for temporary IDs
Properly updates UI states before making database calls
Maintains message continuity during page transitions
Updates the sidebar chat list without creating duplicate chats
The key changes are:
Displaying messages immediately without storing
Creating chat before storing any messages
Only storing messages once with the correct chatId
Using batch updates to keep UI consistent
Proper error handling at each step
This should prevent the duplicate chat history storage issue while maintaining a smooth user experience.