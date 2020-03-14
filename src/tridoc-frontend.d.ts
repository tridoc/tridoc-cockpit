interface tdError {
  statusCode: number;
  error: string;
  message: string;
}

interface tdTag {
  label: string
  parameter?: {
    type: 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';
  }
}

interface tdDocTag extends tdTag {
  parameter?: {
    type: 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';
    value: string;
  }
}

interface tdComment {
  text: string;
  created: string;
}

interface tdDoc {
  identifier: string;
  title?: string;
  created: string;
}

interface tdDocMeta {
  title?: string;
  created: string;
  tags?: tdTag[];
  comments?: tdComment[];
}

declare module '@tridoc/frontend' {
  export default class Server {
    constructor(url: string, username: string, password: string);
    addTag(id: string, label: string, type: string, value: string): Promise< tdError | { [key: string]: any} >;
    countDocuments(query: string, tagsQuery: string, notTagsQuery: string): Promise< tdError | number >;
    createTag(label: any, type: null | 'date' | 'decimal'): Promise< tdError | { [key: string]: any} >;
    deleteDocument(id: string): Promise< tdError | { [key: string]: any} >;
    deleteTag(label: string): Promise< tdError | { [key: string]: any} >;
    getDocuments(query: string, tagsQuery: string, notTagsQuery: string, limit: number | '', offset: number | ''): Promise< tdError | tdDoc[] >;
    getTags(): Promise< tdError | tdTag[] >;
    getTags(id: string): Promise< tdError | tdDocTag[] >;
    removeTag(id: string, label: string): Promise< tdError | { [key: string]: any} >;
    setDocumentTitle(id: string, title: string): Promise< tdError | { [key: string]: any} >;
    uploadFile(file: any): Promise< tdError | { [key: string]: any} >;
  }
}
