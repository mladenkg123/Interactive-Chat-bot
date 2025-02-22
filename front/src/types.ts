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
  username: string;
  role: string;
  answers_and_grades: {
    user_answer: string;
    bot_answer: string;
    grade: number;
  }[];
};

type Message = {
  sender: string;
  message: string;
};

type SQLList = {
  SQL_id: string;
  user_id: string;
  SQLList: string;
  active: boolean;
};

type Question = {
  questions: string[];
};

type QuestionsResponse = BaseResponse<Question>;
type PromptResponse = BaseResponse<Prompt>;
type AnswerResponse = BaseResponse<Answer>;
type ConversationsResponse = BaseResponse<Conversation[]>;
type SQLListsResponse = BaseResponse<SQLList[]>;
type SQLListResponse = BaseResponse<SQLList>;
type ConversationResponse = BaseResponse<Conversation>;
type UserDataResponse = BaseResponse<UserData>;
