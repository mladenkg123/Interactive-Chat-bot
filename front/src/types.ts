/* eslint-disable @typescript-eslint/no-unused-vars */

type BaseResponse<T> = {
    data: T;
    status: number;
  };
  
  type Prompt = {
    prompt: string;
    conversation_id: string;
    prompt_id: string;
  };
  
  type Answer = {
    answer: string;
    prompt_id: string;
    conversation_id: string;
  };
  
  type Conversation = {
    conversation_id: string;
    user_id: string;
    last_accessed: Date;
    conversation_description: string;
  };
  
  type UserData = {
    user_id: string;
    remaining_prompts: number;
  };
  
  type Message = {
    sender: string;
    message: string;
  };
  
  type PromptResponse = BaseResponse<Prompt>;
  type AnswerResponse = BaseResponse<Answer>;
  type ConversationsResponse = BaseResponse<Conversation[]>;
  type ConversationResponse = BaseResponse<Conversation>;
  type UserDataResponse = BaseResponse<UserData>;