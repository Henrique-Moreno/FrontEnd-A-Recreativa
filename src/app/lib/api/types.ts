export interface ResourceObject<T = Record<string, unknown>> {
  type: string;
  id?: string;
  attributes?: T;
  relationships?: Record<string, Relationship>;
  links?: { self?: string; related?: string };
}

export interface Relationship {
  data: ResourceObject | ResourceObject[] | null;
  links?: { self?: string; related?: string };
}

export interface CreateResourceObject<T> {
  type: string;
  id: string;
  attributes: T;
  relationships?: Record<string, Relationship>;
  links?: { self?: string; related?: string };
}

export interface UserAttributes {
  email: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface DocumentAttributes {
  userId: number;
  filePath: string;
  fileType: 'original' | 'generated_pdf';
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface LessonPlanAttributes {
  userId: number;
  objectives: string;
  activities: string;
  assessment: string;
  originalDocumentId?: number | null;
  generatedDocumentId?: number | null;
  generatedDocumentFilePath?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface JSONAPIResponse<T> {
  data: ResourceObject<T> | ResourceObject<T>[];
  included?: ResourceObject<UserAttributes | DocumentAttributes | LessonPlanAttributes>[];
  errors?: APIError[];
  meta?: Record<string, unknown>;
  links?: {
    self?: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface CreateLessonPlanResponse {
  data: CreateResourceObject<LessonPlanAttributes>;
  included?: ResourceObject<UserAttributes | DocumentAttributes | LessonPlanAttributes>[];
  errors?: APIError[];
  meta?: Record<string, unknown>;
  links?: {
    self?: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface GetLessonPlanResponse {
  data: CreateResourceObject<LessonPlanAttributes>;
  included?: ResourceObject<UserAttributes | DocumentAttributes | LessonPlanAttributes>[];
  errors?: APIError[];
  meta?: Record<string, unknown>;
  links?: {
    self?: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface JSONAPIPaginatedResponse<T> extends JSONAPIResponse<T> {
  meta?: {
    total: number;
    page: number;
    perPage: number;
    [key: string]: unknown;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface APIError {
  status?: string;
  title?: string;
  detail?: string;
  source?: { pointer?: string; parameter?: string };
  message?: string;
}